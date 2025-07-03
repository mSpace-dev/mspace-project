import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    // Try different email service configurations
    const emailConfig: EmailConfig = {
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    // Configure based on service provider
    if (process.env.EMAIL_SERVICE === 'gmail') {
      emailConfig.service = 'gmail';
    } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
      emailConfig.host = 'smtp.sendgrid.net';
      emailConfig.port = 587;
      emailConfig.secure = false;
    } else if (process.env.EMAIL_HOST) {
      emailConfig.host = process.env.EMAIL_HOST;
      emailConfig.port = parseInt(process.env.EMAIL_PORT || '587');
      emailConfig.secure = process.env.EMAIL_SECURE === 'true';
    } else {
      // Default SMTP configuration
      emailConfig.host = 'smtp.gmail.com';
      emailConfig.port = 587;
      emailConfig.secure = false;
    }

    return nodemailer.createTransport(emailConfig);
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Verify transporter connection
      await this.transporter.verify();

      const mailOptions = {
        from: `AgriLink <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown email error' 
      };
    }
  }

  async sendBulkEmails(emails: string[], subject: string, html: string): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const promises = batch.map(async (email) => {
        const result = await this.sendEmail({
          to: email,
          subject,
          html
        });
        
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`${email}: ${result.error}`);
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // Test email configuration
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }
}

export const emailService = new EmailService();