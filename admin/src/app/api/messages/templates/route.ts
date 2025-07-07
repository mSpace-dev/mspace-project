import { NextRequest, NextResponse } from 'next/server';

// Mock templates data
let templates = [
  {
    id: 'template_1',
    title: 'Weekly Price Update',
    content: 'This week\'s agricultural prices: Rice Rs.85/kg, Coconut Rs.45/nut, Vegetables showing 5% increase. Check app for detailed market analysis.',
    type: 'email',
    category: 'updates',
    createdAt: new Date().toISOString()
  },
  {
    id: 'template_2',
    title: 'Price Alert - Rice',
    content: '🔔 Rice price alert: Rs.90/kg in Colombo market. 7% increase from yesterday. Good time to sell if you have stock.',
    type: 'sms',
    category: 'alerts',
    createdAt: new Date().toISOString()
  },
  {
    id: 'template_3',
    title: 'New Feature Announcement',
    content: 'Exciting news! We\'ve launched a new demand forecasting feature. Predict market demand for your crops up to 30 days ahead. Try it now in the AgriLink app!',
    type: 'notification',
    category: 'marketing',
    createdAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Templates GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, category } = await request.json();

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    const newTemplate = {
      id: `template_${Date.now()}`,
      title,
      content,
      type,
      category: category || 'marketing',
      createdAt: new Date().toISOString()
    };

    templates.push(newTemplate);

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template saved successfully'
    });
  } catch (error) {
    console.error('Templates POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    );
  }
}
