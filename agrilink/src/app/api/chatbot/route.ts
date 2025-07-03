import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getBotResponse(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an agricultural assistant for Sri Lanka. Answer concisely and factually.' },
        { role: 'user', content: message }
      ],
      max_tokens: 100,
    });
    return completion.choices[0].message.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Sorry, there was an error generating a response.';
  }
}

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

    // Generate bot response using OpenAI
    const botResponse = await getBotResponse(message);

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
