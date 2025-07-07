import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { sendEmail, EmailTemplate } from '@/lib/emailService';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  contactType: string;
}

// Contact model schema (we'll store contact messages in the database)
interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  contactType: string;
  status: 'new' | 'read' | 'responded';
  createdAt: Date;
  respondedAt?: Date;
  adminNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Contact form submission received');
    
    const body: ContactFormData = await request.json();
    const { name, email, phone, subject, message, contactType } = body;

    // Validation
    if (!name || !email || !subject || !message || !contactType) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required information.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Store the contact message in database (if you want to implement this later)
    const contactData: ContactMessage = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      contactType,
      status: 'new',
      createdAt: new Date()
    };

    console.log('Contact data prepared:', { ...contactData, message: 'Message content hidden for privacy' });

    // Send email notification to admin
    try {
      // Email to admin
      const adminEmailTemplate: EmailTemplate = {
        subject: `[AgriLink Contact] ${contactType.charAt(0).toUpperCase() + contactType.slice(1)}: ${subject}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin-bottom: 10px;">New Contact Form Submission</h1>
            <p style="color: #666; font-size: 16px;">AgriLink Contact Form</p>
          </div>
          
          <div style="background: #f8fffe; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
            <h2 style="color: #16a34a; margin-top: 0;">Contact Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 120px;">Contact Type:</td>
                <td style="padding: 8px 0; color: #666;">${contactType.charAt(0).toUpperCase() + contactType.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td>
                <td style="padding: 8px 0; color: #666;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 8px 0; color: #666;"><a href="mailto:${email}" style="color: #16a34a; text-decoration: none;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td>
                <td style="padding: 8px 0; color: #666;"><a href="tel:${phone}" style="color: #16a34a; text-decoration: none;">${phone}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Subject:</td>
                <td style="padding: 8px 0; color: #666;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0; text-center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              This message was sent via the AgriLink contact form on ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <a href="mailto:${email}?subject=Re: ${subject}" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reply to ${name}
            </a>
          </div>
        </div>
        `,
        text: `
New Contact Form Submission - AgriLink

Contact Type: ${contactType.charAt(0).toUpperCase() + contactType.slice(1)}
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

Submitted on: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}
        `
      };

      // Send email to admin
      const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'info@agrilink.lk';
      await sendEmail(adminEmail, adminEmailTemplate);

      console.log('Admin notification email sent successfully');

      // Send confirmation email to user
      const userEmailTemplate: EmailTemplate = {
        subject: `Thank you for contacting AgriLink - ${subject}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; margin-bottom: 10px;">Thank You for Contacting AgriLink! 🌾</h1>
            <p style="color: #666; font-size: 16px;">We've received your message and will get back to you soon</p>
          </div>
          
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
            <h2 style="color: #16a34a; margin-top: 0;">Your Message Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 120px;">Contact Type:</td>
                <td style="padding: 8px 0; color: #666;">${contactType.charAt(0).toUpperCase() + contactType.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Subject:</td>
                <td style="padding: 8px 0; color: #666;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Submitted:</td>
                <td style="padding: 8px 0; color: #666;">${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li><strong>General Inquiries:</strong> We'll respond within 24 hours during business hours</li>
              <li><strong>Technical Support:</strong> Our team will investigate and provide assistance within 24-48 hours</li>
              <li><strong>Partnership Inquiries:</strong> Our business development team will contact you within 2-3 business days</li>
              <li><strong>Other Inquiries:</strong> We'll direct your message to the appropriate team for a prompt response</li>
            </ul>
          </div>
          
          <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Need Immediate Assistance?</h3>
            <p style="color: #666; margin-bottom: 15px;">For urgent matters, you can reach us directly:</p>
            <p style="color: #666; margin: 5px 0;">📞 Phone: +94 11 234 5678</p>
            <p style="color: #666; margin: 5px 0;">📧 Email: support@agrilink.lk</p>
            <p style="color: #666; margin: 5px 0;">🕒 Business Hours: Monday - Friday, 8:00 AM - 6:00 PM (Sri Lanka Time)</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; margin-bottom: 20px;">Stay connected with AgriLink:</p>
            <div style="margin-bottom: 20px;">
              <a href="#" style="color: #16a34a; text-decoration: none; margin: 0 10px;">Website</a>
              <a href="#" style="color: #16a34a; text-decoration: none; margin: 0 10px;">Facebook</a>
              <a href="#" style="color: #16a34a; text-decoration: none; margin: 0 10px;">LinkedIn</a>
            </div>
            <p style="color: #999; font-size: 12px;">
              This is an automated confirmation email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
        `,
        text: `
Thank you for contacting AgriLink!

We've received your message about "${subject}" and will get back to you soon.

Contact Type: ${contactType.charAt(0).toUpperCase() + contactType.slice(1)}
Submitted: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}

What happens next?
- General Inquiries: We'll respond within 24 hours during business hours
- Technical Support: Our team will investigate and provide assistance within 24-48 hours
- Partnership Inquiries: Our business development team will contact you within 2-3 business days
- Other Inquiries: We'll direct your message to the appropriate team for a prompt response

For urgent matters, contact us directly:
Phone: +94 11 234 5678
Email: support@agrilink.lk
Business Hours: Monday - Friday, 8:00 AM - 6:00 PM (Sri Lanka Time)

Best regards,
The AgriLink Team
        `
      };

      await sendEmail(email, userEmailTemplate);

      console.log('User confirmation email sent successfully');

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire request if email fails
      // The form submission is still successful
    }

    // TODO: Save to database (implement later if needed)
    // await ContactMessage.create(contactData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}

// Handle GET requests (not typically used for contact forms, but good practice)
export async function GET() {
  return NextResponse.json(
    { message: 'Contact API endpoint is working. Use POST to submit contact form.' },
    { status: 200 }
  );
}
