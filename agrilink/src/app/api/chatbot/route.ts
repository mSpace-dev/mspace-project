import { NextRequest, NextResponse } from 'next/server';

// Mock chatbot responses
const getBotResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('price') && lowerMessage.includes('rice')) {
    return 'Current rice prices in Colombo: Nadu Rs.85.50/kg, Samba Rs.92.00/kg. Prices increased by 2.5% today.';
  }
  
  if (lowerMessage.includes('price') && lowerMessage.includes('coconut')) {
    return 'Current coconut prices: King Coconut Rs.45.00/piece, Regular Coconut Rs.38.00/piece. Prices stable today.';
  }
  
  if (lowerMessage.includes('weather')) {
    return 'Weather forecast for this week: Partly cloudy with occasional showers. Good conditions for most crops. Harvest timing recommendations available.';
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('where')) {
    return 'Best markets near you: Pettah (Colombo), Gampaha Central, Kandy Central. Check our app for real-time availability.';
  }
  
  if (lowerMessage.includes('forecast') || lowerMessage.includes('predict')) {
    return 'Price forecasts show rice prices likely to increase 3-5% next week due to seasonal demand. Coconut prices expected to remain stable.';
  }
  
  if (lowerMessage.includes('alert') || lowerMessage.includes('notify')) {
    return 'To set price alerts, reply with: ALERT [CROP] [PRICE] [ABOVE/BELOW]. Example: ALERT RICE 90 ABOVE';
  }
  
  if (lowerMessage.includes('help')) {
    return 'AgriLink Bot Commands:\n• Price [crop] - Get current prices\n• Forecast [crop] - Get price predictions\n• Market [location] - Find nearby markets\n• Alert [crop] [price] [above/below] - Set price alerts\n• Weather - Get weather updates';
  }
  
  return 'Hello! I can help with crop prices, forecasts, markets, and alerts. Type "help" for commands or ask about specific crops.';
};

// POST /api/chatbot - Process chatbot message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userPhone, userId } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate bot response
    const botResponse = getBotResponse(message);

    // Log conversation (in production, save to database)
    const conversation = {
      id: `conv_${Date.now()}`,
      userId: userId || 'anonymous',
      userPhone: userPhone || null,
      userMessage: message,
      botResponse,
      timestamp: new Date().toISOString()
    };

    console.log('Chatbot conversation:', conversation);

    // If user has phone number, send SMS response
    if (userPhone) {
      // Here you would call your SMS service
      console.log(`Sending SMS response to ${userPhone}: ${botResponse}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        response: botResponse,
        conversationId: conversation.id,
        timestamp: conversation.timestamp
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userPhone = searchParams.get('userPhone');

    if (!userId && !userPhone) {
      return NextResponse.json(
        { success: false, error: 'User ID or phone number is required' },
        { status: 400 }
      );
    }

    // Mock conversation history
    const conversationHistory = [
      {
        id: 'conv_1',
        userMessage: 'What is the current rice price?',
        botResponse: 'Current rice prices in Colombo: Nadu Rs.85.50/kg, Samba Rs.92.00/kg.',
        timestamp: new Date(Date.now() - 60000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: conversationHistory
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}
