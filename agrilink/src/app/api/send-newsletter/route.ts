import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import NewsletterMessage from '@/lib/models/NewsletterMessage';
import EmailSubscription from '@/lib/models/EmailSubscription';
import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Email credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
    throw new Error('Email credentials not configured');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Function to send newsletter to subscribers
async function sendNewsletterToSubscribers(messageId: string) {
  try {
    // Get the newsletter message
    const message = await NewsletterMessage.findById(messageId);
    if (!message || !message.isActive) {
      throw new Error('Newsletter message not found or inactive');
    }

    // Get target subscribers based on audience settings
    let subscriberQuery: any = { isActive: true };

    if (!message.targetAudience.allSubscribers) {
      // Build query based on specific preferences
      const orConditions = [];
      
      if (message.targetAudience.priceAlertsOnly) {
        orConditions.push({ 'preferences.priceAlerts': true });
      }
      if (message.targetAudience.marketNewsOnly) {
        orConditions.push({ 'preferences.marketNews': true });
      }
      if (message.targetAudience.weeklyDigestOnly) {
        orConditions.push({ 'preferences.weeklyDigest': true });
      }

      if (orConditions.length > 0) {
        subscriberQuery.$or = orConditions;
      }
    }

    const subscribers = await EmailSubscription.find(subscriberQuery);
    console.log(`Found ${subscribers.length} target subscribers for message: ${message.title}`);

    if (subscribers.length === 0) {
      return { success: true, sentCount: 0, message: 'No target subscribers found' };
    }

    const transporter = createTransporter();
    let sentCount = 0;
    let failedCount = 0;
    const failedEmails: string[] = [];

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/newsletter?token=${subscriber.unsubscribeToken}`;
          
          // Add unsubscribe link to the HTML content
          const htmlWithUnsubscribe = message.htmlContent + `
            <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                You received this email because you're subscribed to AgriLink newsletter.<br>
                <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="color: #6b7280; text-decoration: underline;">Visit AgriLink</a>
              </p>
            </div>
          `;

          await transporter.sendMail({
            from: `"AgriLink Sri Lanka" <${process.env.SMTP_USER}>`,
            to: subscriber.email,
            subject: message.emailSubject,
            html: htmlWithUnsubscribe,
            text: message.content + `\n\nUnsubscribe: ${unsubscribeUrl}`,
          });

          // Update last email sent date
          await EmailSubscription.findByIdAndUpdate(subscriber._id, {
            lastEmailSent: new Date()
          });

          sentCount++;
          console.log(`Email sent successfully to: ${subscriber.email}`);
          
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          failedCount++;
          failedEmails.push(subscriber.email);
        }
      });

      // Wait for current batch to complete before starting next batch
      await Promise.all(emailPromises);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update the newsletter message with send statistics
    await NewsletterMessage.findByIdAndUpdate(messageId, {
      sentDate: new Date(),
      sentToCount: sentCount
    });

    console.log(`Newsletter sending completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return {
      success: true,
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined
    };

  } catch (error) {
    console.error('Error sending newsletter:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { messageId, sendToAll = false } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Send newsletter to subscribers
    const result = await sendNewsletterToSubscribers(messageId);

    return NextResponse.json({
      message: 'Newsletter sent successfully',
      ...result
    });

  } catch (error) {
    console.error('Error in send newsletter API:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sending status or get newsletter statistics
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (messageId) {
      // Get specific message statistics
      const message = await NewsletterMessage.findById(messageId);
      if (!message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        messageId: message._id,
        title: message.title,
        sentDate: message.sentDate,
        sentToCount: message.sentToCount,
        messageType: message.messageType,
        priority: message.priority
      });
    }

    // Get overall newsletter statistics
    const totalMessages = await NewsletterMessage.countDocuments();
    const sentMessages = await NewsletterMessage.countDocuments({ sentDate: { $exists: true } });
    const totalSubscribers = await EmailSubscription.countDocuments({ isActive: true });
    
    const recentSentMessages = await NewsletterMessage.find({ sentDate: { $exists: true } })
      .sort({ sentDate: -1 })
      .limit(5)
      .select('title sentDate sentToCount messageType priority');

    return NextResponse.json({
      statistics: {
        totalMessages,
        sentMessages,
        totalSubscribers,
        pendingMessages: totalMessages - sentMessages
      },
      recentSent: recentSentMessages
    });

  } catch (error) {
    console.error('Error getting newsletter statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get newsletter statistics' },
      { status: 500 }
    );
  }
}
