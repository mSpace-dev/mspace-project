import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbConnect } from '../../../lib/dbConnect';
import Price from '../../../lib/models/Price';
import Product from '../../../lib/models/Product';
import ChatConversation from '../../../lib/models/ChatConversation';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Extract entities from user message
const extractEntities = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  // Common Sri Lankan crops
  const crops = ['rice', 'coconut', 'potato', 'onion', 'tomato', 'carrot', 'cabbage', 'beans', 'pumpkin', 'brinjal', 'okra', 'mango', 'banana', 'papaya', 'pineapple', 'avocado', 'spices', 'cinnamon', 'pepper', 'cardamom', 'cloves'];
  
  // Sri Lankan locations
  const locations = ['colombo', 'kandy', 'galle', 'jaffna', 'anuradhapura', 'polonnaruwa', 'kurunegala', 'ratnapura', 'badulla', 'hambantota', 'matara', 'kalutara', 'gampaha', 'kegalle', 'monaragala', 'puttalam', 'trincomalee', 'batticaloa', 'ampara', 'vavuniya', 'kilinochchi', 'mannar', 'mullaitivu'];
  
  const entities = {
    product: crops.find(crop => lowerMessage.includes(crop)) || null,
    location: locations.find(loc => lowerMessage.includes(loc)) || null,
    action: null as string | null,
  };
  
  // Determine intent/action
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
    entities.action = 'price_inquiry';
  } else if (lowerMessage.includes('forecast') || lowerMessage.includes('predict') || lowerMessage.includes('future')) {
    entities.action = 'forecast';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('where') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
    entities.action = 'market_info';
  } else if (lowerMessage.includes('alert') || lowerMessage.includes('notify') || lowerMessage.includes('notification')) {
    entities.action = 'alert_setup';
  } else if (lowerMessage.includes('weather')) {
    entities.action = 'weather';
  } else {
    entities.action = 'general';
  }
  
  return entities;
};

// Get current price data from database
const getCurrentPrices = async (product?: string, location?: string) => {
  try {
    await dbConnect();
    
    const query: any = {
      date: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      },
      verified: true
    };
    
    if (product) {
      query.$or = [
        { productName: new RegExp(product, 'i') },
        { variety: new RegExp(product, 'i') }
      ];
    }
    
    if (location) {
      query.$or = [
        ...(query.$or || []),
        { 'location.district': new RegExp(location, 'i') },
        { 'location.province': new RegExp(location, 'i') },
        { market: new RegExp(location, 'i') }
      ];
    }
    
    const prices = await Price.find(query)
      .sort({ date: -1 })
      .limit(10)
      .lean();
    
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
};

// Get product availability from sellers
const getProductAvailability = async (product?: string, location?: string) => {
  try {
    await dbConnect();
    
    const query: any = {
      status: 'available',
      isActive: true,
      availableQuantity: { $gt: 0 }
    };
    
    if (product) {
      query.$or = [
        { name: new RegExp(product, 'i') },
        { variety: new RegExp(product, 'i') }
      ];
    }
    
    if (location) {
      query.$or = [
        ...(query.$or || []),
        { 'location.district': new RegExp(location, 'i') },
        { 'location.province': new RegExp(location, 'i') }
      ];
    }
    
    const products = await Product.find(query)
      .populate('sellerId', 'name phone')
      .sort({ pricePerKg: 1 })
      .limit(5)
      .lean();
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Generate AI response using Gemini with context
const generateAIResponse = async (userMessage: string, entities: any, priceData: any[], productData: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Build context from database data
    let context = "You are an AI assistant for AgriLink, a Sri Lankan agricultural price platform. ";
    context += "You help farmers, sellers, and consumers with current crop prices, market information, and agricultural insights. ";
    context += "Always provide accurate, helpful information in a friendly tone. ";
    context += "Use Sri Lankan Rupees (Rs.) for prices and mention specific locations when available.\n\n";
    
    // Add current price data to context
    if (priceData.length > 0) {
      context += "CURRENT PRICE DATA:\n";
      priceData.forEach((price: any) => {
        context += `- ${price.productName}${price.variety ? ` (${price.variety})` : ''}: Rs.${price.pricePerKg}/${price.unit} at ${price.market}, ${price.location.district} (${new Date(price.date).toLocaleDateString()})\n`;
      });
      context += "\n";
    }
    
    // Add product availability data to context
    if (productData.length > 0) {
      context += "AVAILABLE PRODUCTS:\n";
      productData.forEach((product: any) => {
        context += `- ${product.name}${product.variety ? ` (${product.variety})` : ''}: Rs.${product.pricePerKg}/${product.unit}, ${product.availableQuantity}${product.unit} available in ${product.location.district}\n`;
      });
      context += "\n";
    }
    
    context += `USER MESSAGE: ${userMessage}\n\n`;
    context += "Please provide a helpful response based on the available data. If asking about prices, use the current price data. ";
    context += "If asking about availability, mention the available products. ";
    context += "If no specific data is available, provide general guidance and suggest how they can get more information through AgriLink.";
    
    const result = await model.generateContent(context);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble processing your request right now. Please try asking about specific crop prices or market information, and I'll do my best to help you.";
  }
};

// POST /api/chatbot - Process chatbot message with database integration
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    await dbConnect();
    
    const body = await request.json();
    const { message, userPhone, userId, sessionId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Extract entities from user message
    const entities = extractEntities(message);
    
    // Get relevant data from database
    const [priceData, productData] = await Promise.all([
      getCurrentPrices(entities.product, entities.location),
      getProductAvailability(entities.product, entities.location)
    ]);
    
    // Generate AI response with context
    const botResponse = await generateAIResponse(message, entities, priceData, productData);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Save conversation to database
    const conversation = new ChatConversation({
      userId: userId || undefined,
      userPhone: userPhone || undefined,
      userMessage: message,
      botResponse,
      intent: entities.action,
      entities: {
        product: entities.product,
        location: entities.location,
        action: entities.action,
      },
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date(),
      responseTime,
    });
    
    await conversation.save();

    // If user has phone number, log for SMS service integration
    if (userPhone) {
      console.log(`SMS notification queued for ${userPhone}: ${botResponse.slice(0, 100)}...`);
    }

    return NextResponse.json({
      success: true,
      data: {
        response: botResponse,
        conversationId: conversation._id,
        timestamp: conversation.timestamp,
        entities,
        dataFound: {
          prices: priceData.length,
          products: productData.length
        }
      }
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET /api/chatbot - Get conversation history
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userPhone = searchParams.get('userPhone');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (userId) query.userId = userId;
    if (userPhone) query.userPhone = userPhone;
    if (sessionId) query.sessionId = sessionId;

    const conversations = await ChatConversation.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: conversations.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}
