import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbConnect } from '../../../lib/dbConnect';
import Product from '../../../lib/models/Product';
import ChatConversation from '../../../lib/models/ChatConversation';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

// Extract entities from user message
const extractEntities = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  // Sri Lankan crop names (matching your database)
  const crops = [
    'rice', 'strawberry', 'brinjal', 'wambatu', 'okra', 'bandakka', 
    'bitter gourd', 'karavila', 'snake gourd', 'pathola', 'bottle gourd', 
    'labu', 'ash plantain', 'alu kesel', 'winged bean', 'dambala', 
    'long beans', 'ma karal', 'ridge gourd', 'watakolu', 'green beans', 
    'bonchi', 'banana', 'kolikuttu', 'papaya', 'mango', 'karutha colomban', 
    'pineapple', 'mauritius', 'guava', 'brinjol'
  ];
  
  // Sri Lankan locations
  const locations = [
    'colombo', 'kandy', 'galle', 'jaffna', 'anuradhapura', 'polonnaruwa', 
    'kurunegala', 'ratnapura', 'badulla', 'hambantota', 'matara', 'kalutara', 
    'gampaha', 'kegalle', 'monaragala', 'puttalam', 'trincomalee', 'batticaloa', 
    'ampara', 'vavuniya', 'kilinochchi', 'mannar', 'mullaitivu'
  ];
  
  // Find the longest matching crop name (to handle cases like "green beans" vs "beans")
  // Skip product detection if this is clearly a service/feature inquiry
  let matchedProduct = null;
  let longestMatch = 0;
  
  const isServiceInquiry = lowerMessage.includes('tell me about') || lowerMessage.includes('explain') || 
                          lowerMessage.includes('how does') || lowerMessage.includes('feature') ||
                          lowerMessage.includes('service') || lowerMessage.includes('about the');
  
  if (!isServiceInquiry) {
    for (const crop of crops) {
      if (lowerMessage.includes(crop) && crop.length > longestMatch) {
        matchedProduct = crop;
        longestMatch = crop.length;
      }
    }
  }
  
  // Special handling for "different locations" - don't extract specific location
  let matchedLocation = null;
  if (!lowerMessage.includes('different location') && !lowerMessage.includes('various location')) {
    matchedLocation = locations.find(loc => lowerMessage.includes(loc)) || null;
  }
  
  const entities = {
    product: matchedProduct,
    location: matchedLocation,
    action: null as string | null,
  };
  
  console.log('Extracted entities:', entities, 'from message:', lowerMessage);
  console.log('Intent detection - service check:', lowerMessage.includes('tell me about'), 'action set to:', entities.action);
  
  // Determine intent/action with priority for service/feature requests
  if (lowerMessage.includes('overview') || 
      lowerMessage.includes('summary') || 
      (lowerMessage.includes('market') && lowerMessage.includes('price') && !lowerMessage.includes('about') && !lowerMessage.includes('tell me')) ||
      lowerMessage.includes('all price') ||
      lowerMessage.includes('current market') ||
      (lowerMessage.includes('give me') && lowerMessage.includes('price') && !lowerMessage.includes('feature'))) {
    entities.action = 'market_overview';
  } else if (lowerMessage.includes('service') || lowerMessage.includes('feature') || lowerMessage.includes('agrilink') ||
             lowerMessage.includes('tell me about') || lowerMessage.includes('explain') || lowerMessage.includes('how does') ||
             (lowerMessage.includes('about') && (lowerMessage.includes('alert') || lowerMessage.includes('forecast') || lowerMessage.includes('platform'))) ||
             lowerMessage.includes('what is agrilink') || lowerMessage.includes('capabilities')) {
    entities.action = 'service_info';
  } else if ((lowerMessage.includes('forecast') || lowerMessage.includes('predict') || lowerMessage.includes('future')) && 
             !lowerMessage.includes('about') && !lowerMessage.includes('tell me') && !lowerMessage.includes('feature')) {
    entities.action = 'forecast';
  } else if ((lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) && 
             !lowerMessage.includes('about') && !lowerMessage.includes('feature') && !lowerMessage.includes('tell me')) {
    entities.action = 'price_inquiry';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('where') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
    entities.action = 'market_info';
  } else if ((lowerMessage.includes('alert') || lowerMessage.includes('notify') || lowerMessage.includes('notification')) && 
             !lowerMessage.includes('about') && !lowerMessage.includes('feature') && !lowerMessage.includes('tell me')) {
    entities.action = 'alert_setup';
  } else if (lowerMessage.includes('help')) {
    entities.action = 'help';
  } else {
    entities.action = 'general';
  }
  
  return entities;
};

// Get products from your database
const getProductPrices = async (product?: string, location?: string) => {
  try {
    await dbConnect();
    
    console.log('Database query params:', { product, location });
    
    const query: any = {
      status: 'available',
      isActive: true
    };
    
    // Build product criteria
    const productCriteria: any[] = [];
    if (product) {
      productCriteria.push(
        { name: new RegExp(product, 'i') },
        { variety: new RegExp(product, 'i') }
      );
    }
    
    // Build location criteria
    const locationCriteria: any[] = [];
    if (location) {
      locationCriteria.push(
        { 'location.district': new RegExp(location, 'i') },
        { 'location.province': new RegExp(location, 'i') }
      );
    }
    
    // Apply criteria based on what's provided
    if (product && location) {
      // Both specified: must match product AND location
      query.$and = [
        { $or: productCriteria },
        { $or: locationCriteria }
      ];
    } else if (product) {
      // Only product specified
      query.$or = productCriteria;
    } else if (location) {
      // Only location specified
      query.$or = locationCriteria;
    }
    
    console.log('MongoDB query:', JSON.stringify(query, null, 2));
    
    const products = await Product.find(query)
      .populate('sellerId', 'name phone')
      .sort({ pricePerKg: 1 })
      .limit(10)
      .lean();
    
    console.log(`Found ${products.length} products:`, products.map(p => ({ name: p.name, variety: p.variety, location: p.location })));
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Market Overview Function
const getMarketOverview = async () => {
  try {
    console.log('Fetching comprehensive market overview...');
    
    // Get ALL products from database for complete overview
    const allProducts = await Product.find({})
      .populate('sellerId', 'name')
      .sort({ pricePerKg: 1 }) // Sort by price for better organization
      .lean();
    
    console.log(`Market overview: Found ${allProducts.length} total products in database`);
    return allProducts; // Return all products for comprehensive categorization
    
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return [];
  }
};

// AgriLink Service Information
const getServiceInfo = (query: string) => {
  const lowerQuery = query.toLowerCase();
  
  const services = {
    'price alerts': {
      description: 'Get instant SMS notifications when crop prices change in your area',
      features: ['Real-time price monitoring', 'Custom price thresholds', 'SMS notifications', 'Multiple crop tracking'],
      howToUse: 'Set up alerts in your dashboard by selecting crops and target prices'
    },
    'demand forecasting': {
      description: 'AI-powered predictions of future crop demand and pricing trends',
      features: ['Machine learning predictions', 'Historical data analysis', 'Market trend insights', 'Seasonal forecasting'],
      howToUse: 'Access forecasting tools in the customer dashboard'
    },
    'market connection': {
      description: 'Connect directly with farmers and sellers across Sri Lanka',
      features: ['Direct seller contact', 'Product listings', 'Location-based search', 'Quality verification'],
      howToUse: 'Browse products or search by location and crop type'
    },
    'price tracking': {
      description: 'Track real-time agricultural prices across Sri Lankan markets',
      features: ['Live market prices', 'Historical price data', 'Price comparisons', 'Market analytics'],
      howToUse: 'View current prices on the home page or ask me for specific crop prices'
    },
    'seller platform': {
      description: 'Platform for farmers to list and sell their products',
      features: ['Product listing', 'Inventory management', 'Order tracking', 'Payment processing'],
      howToUse: 'Register as a seller and start listing your products'
    }
  };
  
  // Find matching service with improved matching
  for (const [key, service] of Object.entries(services)) {
    const keyWords = key.split(' ');
    const hasAllKeyWords = keyWords.every(word => lowerQuery.includes(word));
    
    if (lowerQuery.includes(key) || lowerQuery.includes(key.replace(' ', '')) || hasAllKeyWords) {
      return service;
    }
  }
  
  // Additional specific matches for common variations
  if (lowerQuery.includes('price forecast') || lowerQuery.includes('demand predict') || lowerQuery.includes('forecast feature')) {
    return services['demand forecasting'];
  }
  if (lowerQuery.includes('price alert') || lowerQuery.includes('price notification') || lowerQuery.includes('alert feature')) {
    return services['price alerts'];
  }
  if (lowerQuery.includes('seller') || lowerQuery.includes('farmer platform') || lowerQuery.includes('sell products')) {
    return services['seller platform'];
  }
  if (lowerQuery.includes('market connect') || lowerQuery.includes('find seller') || lowerQuery.includes('connect farmer')) {
    return services['market connection'];
  }
  
  // Return general AgriLink info
  if (lowerQuery.includes('agrilink') || lowerQuery.includes('service') || lowerQuery.includes('feature')) {
    return {
      description: 'AgriLink is Sri Lanka\'s  agricultural price intelligence platform',
      features: [
        'Real-time crop price alerts via SMS',
        'AI-powered demand forecasting', 
        'Direct farmer-to-consumer marketplace',
        'Location-based market information',
        'Quality-verified product listings',
        'Multi-user dashboard (Customer, Seller, Admin)'
      ],
      howToUse: 'Register as a customer or seller to access all features'
    };
  }
  
  return null;
};

// Web search fallback function
const performWebSearch = async (query: string) => {
  try {
    return {
      hasResults: false,
      message: "I don't have specific information about that topic in my current database. For questions beyond crop prices and AgriLink services, I recommend consulting agricultural experts or checking official agricultural websites like the Department of Agriculture Sri Lanka."
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      hasResults: false,
      message: "I'm currently unable to search for additional information. Please try asking about crop prices or AgriLink services."
    };
  }
};

// Generate fallback response when AI is unavailable
// Product categorization mapping for Sri Lankan agricultural products
const categorizeProduct = (productName: string): string => {
  // Handle null/undefined product names
  if (!productName || typeof productName !== 'string') {
    return 'Other Products';
  }
  
  const name = productName.toLowerCase();
  
  // Vegetables
  if (name.includes('brinjal') || name.includes('brinjol') || name.includes('wambatu') || name.includes('eggplant') ||
      name.includes('cabbage') || name.includes('carrot') ||
      name.includes('beans') || name.includes('okra') || name.includes('bandakka') ||
      name.includes('tomato') || name.includes('onion') ||
      name.includes('potato') || name.includes('cucumber') ||
      name.includes('capsicum') || name.includes('pepper') ||
      name.includes('leeks') || name.includes('radish') ||
      name.includes('beetroot') || name.includes('lettuce') ||
      name.includes('snake gourd') || name.includes('pathola') ||
      name.includes('bottle gourd') || name.includes('labu') ||
      name.includes('bitter gourd') || name.includes('karavila') ||
      name.includes('ridge gourd') || name.includes('watakolu') ||
      name.includes('pumpkin') || name.includes('watakka') ||
      name.includes('luffa') || name.includes('wetakolu') ||
      name.includes('chili') || name.includes('miris')) {
    return 'Vegetables';
  }
  
  // Fruits
  if (name.includes('banana') || name.includes('kesel') || name.includes('plantain') ||
      name.includes('mango') || name.includes('amba') ||
      name.includes('pineapple') || name.includes('annasi') ||
      name.includes('papaya') || name.includes('papol') ||
      name.includes('coconut') || name.includes('pol') ||
      name.includes('orange') || name.includes('dodan') ||
      name.includes('lime') || name.includes('dehi') ||
      name.includes('avocado') || name.includes('apple') ||
      name.includes('grapes') || name.includes('watermelon') ||
      name.includes('strawberry') || name.includes('strawberries') ||
      name.includes('guava') || name.includes('pera')) {
    return 'Fruits';
  }
  
  // Legumes (moved here for winged bean)
  if (name.includes('dhal') || name.includes('parippu') ||
      name.includes('lentils') || name.includes('chickpea') ||
      name.includes('cowpea') || name.includes('mee karal') ||
      name.includes('green gram') || name.includes('mung') ||
      name.includes('winged bean') || name.includes('dambala')) {
    return 'Legumes';
  }
  
  // Rice & Grains
  if (name.includes('rice') || name.includes('batha') ||
      name.includes('paddy') || name.includes('wheat') ||
      name.includes('millet') || name.includes('kurakkan') ||
      name.includes('maize') || name.includes('corn')) {
    return 'Rice & Grains';
  }
  
  // Spices & Herbs
  if (name.includes('cinnamon') || name.includes('kurundu') ||
      name.includes('cardamom') || name.includes('enasal') ||
      name.includes('cloves') || name.includes('karabu nati') ||
      name.includes('pepper') || name.includes('gammiris') ||
      name.includes('turmeric') || name.includes('kaha') ||
      name.includes('ginger') || name.includes('inguru') ||
      name.includes('curry leaves') || name.includes('karapincha') ||
      name.includes('lemongrass') || name.includes('sera')) {
    return 'Spices & Herbs';
  }
  
  // Fish & Seafood
  if (name.includes('fish') || name.includes('malu') ||
      name.includes('tuna') || name.includes('kelawalla') ||
      name.includes('mackerel') || name.includes('kumbalawa') ||
      name.includes('sardine') || name.includes('salaya') ||
      name.includes('crab') || name.includes('kakkuluwa') ||
      name.includes('prawn') || name.includes('isso') ||
      name.includes('squid') || name.includes('dallo')) {
    return 'Fish & Seafood';
  }
  

  
  // Default fallback - use a more meaningful category name
  const firstWord = productName.split(' ')[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

const generateFallbackResponse = (userMessage: string, entities: any, productData: any[], serviceInfo: any) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Handle market overview requests
  if (entities.action === 'market_overview') {
    if (productData.length > 0) {
      let response = `📊 Current Market Overview:\n\n`;
      
      // Group products by proper categories
      const categories: { [key: string]: any[] } = {};
      productData.forEach((product: any) => {
        // Skip products without valid names
        if (!product || !product.name || typeof product.name !== 'string') {
          console.log('Skipping product with invalid name:', product);
          return;
        }
        
        const category = categorizeProduct(product.name);
        if (!categories[category]) categories[category] = [];
        categories[category].push(product);
      });
      
      Object.keys(categories).slice(0, 6).forEach(category => {
        response += `🏷️ ${category}:\n`;
        categories[category].slice(0, 3).forEach((product: any) => {
          const location = product.location ? `${product.location.district || 'Unknown'}` : 'Various locations';
          response += `  • ${product.name}${product.variety ? ` (${product.variety})` : ''} - Rs.${product.pricePerKg}/${product.unit} at ${location}\n`;
        });
        response += `\n`;
      });
      
      response += `💡 This overview shows current prices across different categories. For specific crop prices or detailed information, feel free to ask about any particular product!\n\n`;
      response += `📈 Visit our prices page for complete market data and trends.`;
      return response;
    } else {
      return `📊 Market Overview:\n\nI'm currently updating the market data. Please try again in a few moments, or:\n\n• Visit our prices page for live market rates\n• Ask about specific crops (e.g., "rice prices", "vegetable prices")\n• Contact our team for detailed market analysis\n\nWhat specific information can I help you find?`;
    }
  }

  // Handle price inquiries
  if (entities.action === 'price_inquiry' || entities.product) {
    if (productData.length > 0) {
      let response = `Here are the current prices I found:\n\n`;
      productData.slice(0, 5).forEach((product: any) => {
        const location = product.location ? `${product.location.district || 'Unknown'}, ${product.location.province || 'Sri Lanka'}` : 'Sri Lanka';
        response += `🌾 ${product.name}${product.variety ? ` (${product.variety})` : ''}\n`;
        response += `💰 Price: Rs.${product.pricePerKg}/${product.unit}\n`;
        response += `📍 Location: ${location}\n`;
        response += `📦 Available: ${product.availableQuantity}${product.unit}\n\n`;
      });
      return response + "For more detailed information, please visit our prices page or contact the sellers directly.";
    } else {
      return `I couldn't find specific price information for "${entities.product || 'that crop'}" right now. Please try:\n\n• Visit our prices page for current market rates\n• Contact our support team\n• Check back later as prices are updated regularly\n\nIs there anything else I can help you with?`;
    }
  }
  
  // Handle service information
  if (entities.action === 'service_info' || serviceInfo) {
    if (serviceInfo) {
      return `🌾 **${serviceInfo.description}**\n\n✨ **Key Features:**\n${serviceInfo.features.map((f: string) => `• ${f}`).join('\n')}\n\n� **How to use:** ${serviceInfo.howToUse}\n\n💡 **Need help getting started?** I can guide you through setting up any of these features, or you can explore them in your dashboard.\n\nWould you like to know about any other AgriLink services?`;
    } else {
      return `🌾 **AgriLink Services Overview:**\n\n🔔 **Price Alerts** - Get instant SMS notifications when crop prices change in your area\n📈 **Demand Forecasting** - AI-powered predictions of future crop demand and pricing trends\n🤝 **Market Connection** - Connect directly with farmers and sellers across Sri Lanka\n📊 **Price Tracking** - Track real-time agricultural prices across Sri Lankan markets\n🌱 **Seller Platform** - Platform for farmers to list and sell their products\n\n💡 **Ask me specifically about any service!** For example:\n• "Tell me about price alerts"\n• "How does demand forecasting work?"\n• "What is the seller platform?"\n\nWhich service interests you most?`;
    }
  }
  
  // Handle help requests
  if (entities.action === 'help' || lowerMessage.includes('help')) {
    return `👋 Welcome to AgriLink Assistant!\n\nI can help you with:\n\n🌾 Crop Prices - Ask about current prices for any Sri Lankan crop\n📊 Market Information - Get location-specific market data\n🔔 Service Information - Learn about AgriLink features\n📈 Forecasting - Understand our prediction tools\n\nTry asking:\n• "What is the current rice price?"\n• "Show me vegetable prices in Colombo"\n• "Tell me about price alerts"\n• "How does demand forecasting work?"\n\nWhat would you like to know?`;
  }
  
  // Default response
  return `Thank you for your question about "${userMessage}". While I'm having some technical difficulties with my AI system, I'm still here to help!\n\n🌾 I can provide current crop prices and market information\n📊 I can explain AgriLink services and features\n📍 I can help with location-specific queries\n\nPlease try asking:\n• Specific crop prices (e.g., "rice price", "vegetable prices")\n• About AgriLink services\n• For help with our platform features\n\nHow can I assist you today?`;
};

// Generate AI response using Gemini with context and fallback
const generateAIResponse = async (userMessage: string, entities: any, productData: any[], serviceInfo: any) => {
  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    console.warn('Gemini API key not found, using fallback response');
    return generateFallbackResponse(userMessage, entities, productData, serviceInfo);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let context = "You are AgriLink Assistant, an AI helper for Sri Lanka's leading agricultural price platform. ";
    context += "You help farmers, sellers, and consumers with crop prices, market information, and platform services. ";
    context += "Always provide accurate, helpful information in a friendly tone using Sri Lankan Rupees (Rs.) for prices. ";
    context += "Be conversational and helpful, like a knowledgeable agricultural advisor.\n\n";
    
    // Add product data to context
    if (productData.length > 0) {
      context += "CURRENT AVAILABLE PRODUCTS:\n";
      productData.forEach((product: any) => {
        const location = product.location ? `${product.location.district || 'Unknown'}, ${product.location.province || 'Sri Lanka'}` : 'Sri Lanka';
        context += `- ${product.name}${product.variety ? ` (${product.variety})` : ''}: Rs.${product.pricePerKg}/${product.unit}\n`;
        context += `  Quality: ${product.quality}, Available: ${product.availableQuantity}${product.unit}\n`;
        context += `  Location: ${location}\n`;
        if (product.description) context += `  Description: ${product.description}\n`;
        context += `  Harvest: ${new Date(product.harvestDate).toLocaleDateString()}\n\n`;
      });
    }
    
    // Add service information to context
    if (serviceInfo) {
      context += "AGRILINK SERVICE INFORMATION:\n";
      context += `Service: ${serviceInfo.description}\n`;
      context += `Features: ${serviceInfo.features.join(', ')}\n`;
      context += `How to use: ${serviceInfo.howToUse}\n\n`;
    }
    
    context += `USER QUESTION: ${userMessage}\n\n`;
    
    // Add specific guidance based on intent
    if (entities.action === 'market_overview') {
      context += "Provide a comprehensive market overview using the product data above. Show price ranges across different categories, highlight trends, and give insights about the current agricultural market in Sri Lanka. Group similar products together and provide a helpful summary.";
    } else if (entities.action === 'price_inquiry') {
      context += "Provide current prices from the product data above. If no specific product is found, suggest similar products or explain how to find current prices on AgriLink.";
    } else if (entities.action === 'service_info') {
      context += "Explain AgriLink services clearly and how they benefit Sri Lankan farmers and consumers.";
    } else if (entities.action === 'help') {
      context += "Provide a helpful overview of what you can assist with, including price queries, service information, and general agricultural guidance.";
    } else {
      context += "If you don't have specific information, suggest how they can find what they need through AgriLink or recommend contacting support.";
    }
    
    const result = await model.generateContent(context);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Provide detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    // Return fallback response instead of generic error
    console.log('Using fallback response due to AI service error');
    return generateFallbackResponse(userMessage, entities, productData, serviceInfo);
  }
};

// POST /api/chatbot-enhanced - Enhanced chatbot with all capabilities
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
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
    
    let productData: any[] = [];
    let serviceInfo: any = null;
    let webSearchResult: any = null;
    
    // Handle different types of queries with priority for explicit actions
    if (entities.action === 'market_overview') {
      productData = await getMarketOverview();
    } else if (entities.action === 'price_inquiry' || (entities.product && entities.action !== 'service_info' && entities.action !== 'help' && entities.action !== 'general')) {
      productData = await getProductPrices(entities.product || undefined, entities.location || undefined);
    }
    
    if (entities.action === 'service_info' || message.toLowerCase().includes('agrilink')) {
      serviceInfo = getServiceInfo(message);
    }
    
    // If no product data or service info found, try web search as fallback
    if (productData.length === 0 && !serviceInfo && entities.action === 'general') {
      webSearchResult = await performWebSearch(message);
    }
    
    // Generate AI response with context
    let botResponse = await generateAIResponse(message, entities, productData, serviceInfo);
    
    // Add web search result if available
    if (webSearchResult && !webSearchResult.hasResults) {
      botResponse += "\n\n" + webSearchResult.message;
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Save conversation to database
    try {
      await dbConnect();
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
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue with response even if database save fails
    }
    
    return NextResponse.json({
      success: true,
      data: {
        response: botResponse,
        timestamp: new Date(),
        entities,
        dataFound: {
          products: productData.length,
          hasServiceInfo: !!serviceInfo,
          searchPerformed: !!webSearchResult
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

// GET /api/chatbot-enhanced - Get conversation history
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
      data: conversations.reverse()
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}