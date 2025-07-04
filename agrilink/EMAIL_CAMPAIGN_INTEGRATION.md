# 📧 Email Campaign Feature - Integrated with AgriLink

## 🚀 Setup Instructions

You're absolutely right! The admin functionality should be integrated into the main AgriLink project, not run separately. Here's how to use the new email campaign feature:

### ✅ **Already Integrated Features**

The email campaign functionality has been added to your existing AgriLink admin dashboard. No need for a separate admin project!

### 🔧 **Setup Steps**

1. **Environment Variables** (if not already configured)
   ```bash
   # Add to your existing .env.local file in the agrilink folder
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_business_email@gmail.com  # Your Gmail account (business or personal)
   SMTP_PASS=your_16_character_app_password  # NOT your regular Gmail password!
   SMTP_FROM=AgriLink <your_business_email@gmail.com>  # Display name for emails
   ```

   **📧 Setting Up Gmail App Password:**
   1. Go to your Google Account settings: https://myaccount.google.com/
   2. Navigate to **Security** → **2-Step Verification** (enable if not already)
   3. Go to **Security** → **App passwords**
   4. Generate a new app password for "Mail"
   5. Use this 16-character password (not your regular password) for `SMTP_PASS`

2. **Start AgriLink** (as usual)
   ```bash
   cd agrilink
   npm run dev
   ```

3. **Access Email Campaign**
   - Login to admin: `http://localhost:3000/admin`
   - Look for the new "Email Campaign" section on the dashboard
   - Click "Send Email Campaign" button

### 📧 **How to Use Email Campaign**

1. **Access Admin Dashboard**: Navigate to `/admin` and login
2. **Find Email Campaign Section**: New section added to the admin dashboard
3. **Click "Send Email Campaign"**: Opens the email composition interface
4. **Compose Your Email**:
   - Enter an engaging subject line
   - Write your message about offers, new services, platform updates
   - Preview your email before sending
5. **Send to All Subscribers**: Click send to deliver to all active subscribers

### ✨ **Features Available**

✅ **Integrated Admin Dashboard**: No separate application needed
✅ **Subscriber Statistics**: See active, inactive, and recent subscribers
✅ **Custom Email Composition**: Write personalized subjects and messages
✅ **Professional Templates**: AgriLink branded email templates
✅ **Bulk Email Delivery**: Automatically sends to all active subscribers
✅ **Batch Processing**: Reliable delivery in batches of 50
✅ **Real-time Feedback**: Progress updates and confirmations
✅ **Email Preview**: See exactly how emails will look

### 🎯 **Email Campaign Use Cases**

- **🌟 Special Offers**: "Summer Sale - 20% off all premium features!"
- **📢 New Services**: "Introducing AI-powered crop recommendations"
- **📊 Platform Updates**: "New dashboard features now available"
- **🌾 Seasonal Tips**: "Best practices for monsoon farming"
- **📱 App Updates**: "New mobile app features released"

### 🔒 **Security & Best Practices**

- All email credentials stored securely in environment variables
- Batch processing prevents spam detection
- Professional email templates maintain brand consistency
- Unsubscribe links included in all emails
- Error handling and delivery confirmation

### 📊 **API Endpoints Added**

- `POST /api/email/send-campaign` - Send bulk emails
- `GET /api/email/stats` - Get subscriber statistics

### 🛠 **Troubleshooting**

**If you see "No subscribers found":**
- Ensure MongoDB connection is working
- Check that you have subscribers in the EmailSubscription collection

**If emails fail to send:**
- Verify SMTP credentials in .env.local
- For Gmail: Use App Password, not regular password
- Check firewall settings for port 587

### 🎉 **Ready to Use!**

The email campaign feature is now fully integrated into your AgriLink admin dashboard. Simply run your AgriLink project as usual and access the new email campaign functionality through the admin interface.

No need for separate installations or running multiple projects - everything works together seamlessly!
