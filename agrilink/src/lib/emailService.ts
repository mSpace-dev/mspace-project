import nodemailer from 'nodemailer';
import EmailSubscription from '@/lib/models/EmailSubscription';
import { dbConnect } from '@/lib/dbConnect';

// Email configuration
const createTransporter = () => {
  console.log('Creating email transporter with config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? 'Set' : 'Not set',
    pass: process.env.SMTP_PASS ? 'Set' : 'Not set'
  });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Email credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
    throw new Error('Email credentials not configured');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Enable debug logging
    logger: true, // Enable logging
  });
};

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  welcome: (unsubscribeToken: string): EmailTemplate => ({
    subject: 'Welcome to AgriLink Newsletter! 🌾',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; margin-bottom: 10px;">Welcome to AgriLink! 🌾</h1>
          <p style="color: #666; font-size: 16px;">Thank you for subscribing to our newsletter</p>
        </div>
        
        <div style="background: #f8fffe; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
          <h2 style="color: #16a34a; margin-top: 0;">What to Expect:</h2>
          <ul style="color: #333; line-height: 1.6;">
            <li>📊 Real-time agricultural price updates</li>
            <li>📈 Market trends and forecasts</li>
            <li>🌱 Farming tips and best practices</li>
            <li>📱 SMS alert notifications for price changes</li>
            <li>🤖 AI-powered market insights</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/prices" 
             style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Live Prices
          </a>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            You can manage your preferences or unsubscribe at any time by 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter?token=${unsubscribeToken}" style="color: #16a34a;">clicking here</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">
            © 2025 AgriLink. Made with ❤️ for Sri Lankan agriculture.
          </p>
        </div>
      </div>
    `,
    text: `
      Welcome to AgriLink Newsletter! 🌾
      
      Thank you for subscribing to our newsletter.
      
      What to Expect:
      - Real-time agricultural price updates
      - Market trends and forecasts  
      - Farming tips and best practices
      - SMS alert notifications for price changes
      - AI-powered market insights
      
      View live prices at: ${process.env.NEXT_PUBLIC_BASE_URL}/prices
      
      You can unsubscribe at any time: ${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter?token=${unsubscribeToken}
      
      © 2025 AgriLink. Made with ❤️ for Sri Lankan agriculture.
    `
  }),

  priceAlert: (priceData: any): EmailTemplate => ({
    subject: `🔔 Price Alert: ${priceData.product} prices updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin-bottom: 10px;">🔔 Price Alert</h1>
          <p style="color: #666; font-size: 16px;">${priceData.product} prices have been updated</p>
        </div>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h2 style="color: #dc2626; margin-top: 0;">${priceData.product}</h2>
          <p style="font-size: 18px; margin: 10px 0;"><strong>Current Price:</strong> Rs. ${priceData.price}/kg</p>
          <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${priceData.location}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          ${priceData.change ? `<p style="color: ${priceData.change > 0 ? '#dc2626' : '#16a34a'}; font-weight: bold;">
            ${priceData.change > 0 ? '📈' : '📉'} ${priceData.change > 0 ? '+' : ''}${priceData.change}% from yesterday
          </p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/prices" 
             style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View All Prices
          </a>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Manage your price alerts at <a href="${process.env.NEXT_PUBLIC_BASE_URL}/customer/dashboard" style="color: #16a34a;">your dashboard</a>
          </p>
        </div>
      </div>
    `,
    text: `
      🔔 Price Alert: ${priceData.product} prices updated
      
      ${priceData.product}
      Current Price: Rs. ${priceData.price}/kg
      Location: ${priceData.location}
      Date: ${new Date().toLocaleDateString()}
      ${priceData.change ? `Change: ${priceData.change > 0 ? '+' : ''}${priceData.change}% from yesterday` : ''}
      
      View all prices: ${process.env.NEXT_PUBLIC_BASE_URL}/prices
      Manage alerts: ${process.env.NEXT_PUBLIC_BASE_URL}/customer/dashboard
    `
  }),

  weeklyDigest: (marketData: any): EmailTemplate => ({
    subject: '📊 Weekly Market Digest - Agricultural Price Summary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; margin-bottom: 10px;">📊 Weekly Market Digest</h1>
          <p style="color: #666; font-size: 16px;">Your weekly agricultural market summary</p>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
          <h2 style="color: #16a34a; margin-top: 0;">This Week's Highlights</h2>
          <ul style="color: #333; line-height: 1.6;">
            <li>🌾 Rice prices stabilized at Rs. 180-200/kg</li>
            <li>🥕 Vegetable prices decreased by 15% on average</li>
            <li>🍌 Fruit exports increased, affecting local prices</li>
            <li>📈 Next week forecast shows potential price increases in leafy vegetables</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/prices" 
             style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Detailed Report
          </a>
        </div>
      </div>
    `,
    text: `
      📊 Weekly Market Digest
      
      This Week's Highlights:
      - Rice prices stabilized at Rs. 180-200/kg
      - Vegetable prices decreased by 15% on average  
      - Fruit exports increased, affecting local prices
      - Next week forecast shows potential price increases in leafy vegetables
      
      View detailed report: ${process.env.NEXT_PUBLIC_BASE_URL}/prices
    `
  })
};

export async function sendEmail(to: string | string[], template: EmailTemplate): Promise<boolean> {
  try {
    console.log('Attempting to send email to:', to);
    
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP server connection verified');
    
    const mailOptions = {
      from: `"AgriLink" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        console.error('Email authentication failed. Please check your SMTP_USER and SMTP_PASS credentials.');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('Cannot connect to SMTP server. Please check your internet connection and SMTP settings.');
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('SMTP host not found. Please check your SMTP_HOST setting.');
      }
    }
    
    return false;
  }
}

export async function sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<boolean> {
  const template = emailTemplates.welcome(unsubscribeToken);
  return await sendEmail(email, template);
}

export async function sendPriceAlert(email: string, priceData: any): Promise<boolean> {
  const template = emailTemplates.priceAlert(priceData);
  return await sendEmail(email, template);
}

export async function sendBulkNotification(template: EmailTemplate, preferences?: { [key: string]: boolean }): Promise<number> {
  try {
    await dbConnect();
    
    // Get all active subscribers
    let query: any = { isActive: true };
    
    // Filter by preferences if specified
    if (preferences) {
      Object.keys(preferences).forEach(pref => {
        if (preferences[pref]) {
          query[`preferences.${pref}`] = true;
        }
      });
    }
    
    const subscribers = await EmailSubscription.find(query).select('email');
    
    if (subscribers.length === 0) {
      console.log('No subscribers found for bulk notification');
      return 0;
    }

    const emails = subscribers.map(sub => sub.email);
    const batchSize = 50; // Send in batches to avoid rate limits
    let successCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const success = await sendEmail(batch, template);
      if (success) {
        successCount += batch.length;
      }
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Bulk notification sent to ${successCount}/${emails.length} subscribers`);
    return successCount;
  } catch (error) {
    console.error('Failed to send bulk notification:', error);
    return 0;
  }
}

export async function sendWeeklyDigest(): Promise<number> {
  const marketData = {}; // You can fetch real market data here
  const template = emailTemplates.weeklyDigest(marketData);
  return await sendBulkNotification(template, { weeklyDigest: true });
}

export const createCustomEmailTemplate = (subject: string, message: string): EmailTemplate => ({
  subject,
  text: message,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin-bottom: 10px;">AgriLink 🌾</h1>
        <p style="color: #666; font-size: 16px;">Message from AgriLink Team</p>
      </div>
      
      <div style="background: #f8fffe; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
        <div style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          Thank you for being a part of the AgriLink community!
        </p>
        <p style="color: #666; font-size: 12px;">
          If you no longer wish to receive these emails, you can 
          <a href="{{unsubscribeUrl}}" style="color: #16a34a; text-decoration: none;">unsubscribe here</a>.
        </p>
      </div>
    </div>
  `
});

export async function sendBulkCustomEmail(subject: string, message: string, sentBy?: string): Promise<{ successCount: number; recipientEmails: string[] }> {
  try {
    await dbConnect();
    
    // Get all active subscribers
    const subscribers = await EmailSubscription.find({ isActive: true }).select('email');
    
    if (subscribers.length === 0) {
      console.log('No subscribers found for bulk notification');
      return { successCount: 0, recipientEmails: [] };
    }

    const emails = subscribers.map((sub: any) => sub.email);
    const template = createCustomEmailTemplate(subject, message);
    const batchSize = 50; // Send in batches to avoid rate limits
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const success = await sendEmail(batch, template);
      if (success) {
        successCount += batch.length;
      } else {
        errorCount += batch.length;
      }
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Save campaign history to database
    try {
      const EmailCampaign = (await import('@/lib/models/EmailCampaign')).default;
      
      const campaignStatus = errorCount === 0 ? 'sent' : 
                           successCount === 0 ? 'failed' : 'partial';

      await EmailCampaign.create({
        subject,
        message,
        sentAt: new Date(),
        sentToCount: successCount,
        sentBy: sentBy || 'Admin',
        recipientEmails: emails,
        status: campaignStatus,
        errorCount,
        campaignType: 'manual'
      });

      console.log(`Campaign saved to database: ${successCount}/${emails.length} successful sends`);
    } catch (saveError) {
      console.error('Failed to save campaign to database:', saveError);
      // Don't fail the email sending if database save fails
    }

    console.log(`Bulk custom email sent to ${successCount}/${emails.length} subscribers`);
    return { successCount, recipientEmails: emails };
  } catch (error) {
    console.error('Failed to send bulk custom email:', error);
    return { successCount: 0, recipientEmails: [] };
  }
}
