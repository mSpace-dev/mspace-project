import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import EmailSubscription, { IEmailSubscription } from '@/lib/models/EmailSubscription';
import { sendWelcomeEmail } from '@/lib/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, preferences } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await EmailSubscription.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscriptionDate = new Date();
        if (preferences) {
          existingSubscription.preferences = { ...existingSubscription.preferences, ...preferences };
        }
        await existingSubscription.save();
        
        return NextResponse.json({
          message: 'Successfully reactivated your subscription!',
          subscription: {
            email: existingSubscription.email,
            isActive: existingSubscription.isActive,
            preferences: existingSubscription.preferences
          }
        });
      }
    }

    // Generate unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Create new subscription
    const defaultPreferences = {
      priceAlerts: true,
      weeklyDigest: true,
      marketNews: true,
      forecastUpdates: true,
      ...preferences
    };

    const newSubscription = new EmailSubscription({
      email,
      preferences: defaultPreferences,
      unsubscribeToken,
      subscriptionDate: new Date(),
      isActive: true
    });

    await newSubscription.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(email, unsubscribeToken);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      message: 'Successfully subscribed to AgriLink newsletter!',
      subscription: {
        email: newSubscription.email,
        isActive: newSubscription.isActive,
        preferences: newSubscription.preferences
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Subscription error:', error);
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process subscription. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (token) {
      // Handle unsubscribe
      const subscription = await EmailSubscription.findOne({ unsubscribeToken: token });
      
      if (!subscription) {
        return NextResponse.json(
          { error: 'Invalid unsubscribe token' },
          { status: 404 }
        );
      }

      subscription.isActive = false;
      await subscription.save();

      return NextResponse.json({
        message: 'Successfully unsubscribed from AgriLink newsletter'
      });
    }

    if (email) {
      // Check subscription status
      const subscription = await EmailSubscription.findOne({ email });
      
      return NextResponse.json({
        subscribed: !!subscription?.isActive,
        preferences: subscription?.preferences || null
      });
    }

    // Get all active subscriptions (admin only - you might want to add auth)
    const subscriptions = await EmailSubscription.find({ isActive: true })
      .select('email subscriptionDate preferences')
      .sort({ subscriptionDate: -1 });

    return NextResponse.json({
      total: subscriptions.length,
      subscriptions
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const subscription = await EmailSubscription.findOne({ email });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Email not found in our subscription list' },
        { status: 404 }
      );
    }

    subscription.isActive = false;
    await subscription.save();

    return NextResponse.json({
      message: 'Successfully unsubscribed from AgriLink newsletter'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    );
  }
}
