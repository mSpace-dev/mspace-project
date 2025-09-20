import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Customer from '@/lib/models/Customer';
import Seller from '@/lib/models/Seller';
import Admin from '@/lib/models/Admin';
import crypto from 'crypto';
import { sendEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists in any of the collections
    let user = null;
    let userType = '';

    // Check customer collection
    user = await Customer.findOne({ email });
    if (user) {
      userType = 'customer';
    } else {
      // Check seller collection
      user = await Seller.findOne({ email });
      if (user) {
        userType = 'seller';
      } else {
        // Check admin collection
        user = await Admin.findOne({ email });
        if (user) {
          userType = 'admin';
        }
      }
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}&type=${userType}`;

    // Send email
    const emailTemplate = {
      subject: 'AgriLink - Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #16a34a; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to reset your password for your AgriLink account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This email was sent by AgriLink. If you have any questions, please contact our support team.
          </p>
        </div>
      `,
      text: `
        Hello ${user.name},
        
        You have requested to reset your password for your AgriLink account.
        
        Please visit the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email.
      `
    };

    await sendEmail(email, emailTemplate);

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
