# Admin Messaging System Documentation

## Overview

The Admin Messaging System provides a comprehensive interface for administrators to create, send, and manage different types of messages including SMS, emails, and push notifications to users.

## Features

### 📝 Message Creation
- **Multi-format Support**: Create SMS, emails, and push notifications
- **Recipient Targeting**: Send to all users, subscribers only, or specific contacts
- **Real-time Preview**: See how messages will appear before sending
- **Character Counting**: SMS character limits with real-time counting
- **Template System**: Save and reuse common message templates

### 📱 Quick SMS
- **Predefined Templates**: Ready-to-use templates for common scenarios
- **Character Optimization**: 160-character SMS limit enforcement
- **Bulk Sending**: Send to multiple recipients simultaneously
- **Cost Tracking**: Monitor SMS credit usage

### 📧 Email Campaigns
- **Rich Content**: HTML-formatted emails with professional templates
- **Subscriber Management**: Integrated with email subscription system
- **Bulk Processing**: Efficient batch sending to large subscriber lists
- **Unsubscribe Handling**: Automatic unsubscribe link inclusion

### 📋 Template Management
- **Save Templates**: Store frequently used messages for quick access
- **Categorization**: Organize templates by type and category
- **Template Library**: Browse and reuse existing templates
- **Quick Loading**: One-click template application

## Usage Guide

### Creating a New Message

1. **Navigate to Messages**: Go to Admin Dashboard → Messages
2. **Select Type**: Choose between SMS, Email, or Push Notification
3. **Choose Recipients**: Select target audience (all users, subscribers, or specific contact)
4. **Compose Message**: 
   - For SMS: Keep under 160 characters
   - For Email: Add subject line and detailed content
   - For Notifications: Brief, actionable content
5. **Preview**: Review message before sending
6. **Send**: Click send button and monitor progress

### Using Templates

1. **Access Templates Tab**: Click on "Templates" tab
2. **Browse Library**: View saved templates by type and category
3. **Load Template**: Click "Use Template" to load content
4. **Customize**: Modify template content as needed
5. **Send or Save**: Either send immediately or save as new template

### Quick SMS Actions

1. **Go to Quick SMS Tab**: Access pre-built SMS templates
2. **Select Template**: Choose from price alerts, weather warnings, or market updates
3. **Auto-populate**: Template content loads automatically
4. **Customize**: Modify message if needed
5. **Send**: Quick send to target audience

## API Endpoints

### Message Statistics
```
GET /api/messages/stats
```
Returns message sending statistics and SMS credits.

### Templates Management
```
GET /api/messages/templates     # Get all templates
POST /api/messages/templates    # Save new template
```

### Message Sending
```
POST /api/messages/send-sms     # Send SMS messages
POST /api/messages/send-email   # Send email messages
```

## Message Types & Guidelines

### 📱 SMS Messages
**Best Practices:**
- Keep under 160 characters
- Use clear, actionable language
- Include relevant emojis for visibility
- Add time-sensitive information first
- Include sender identification
- Provide opt-out instructions for marketing

**Templates:**
- Price Alerts: "🔔 [CROP] price: Rs.[PRICE]/kg in [LOCATION]. [CHANGE]% change."
- Weather Alerts: "🌧️ Weather Alert: [DESCRIPTION]. Secure crops immediately."
- Market Updates: "🛒 Market Update: High demand for [CROP]. Best prices at [LOCATIONS]."

### 📧 Email Messages
**Best Practices:**
- Use clear, descriptive subject lines
- Structure content with headers and bullet points
- Include call-to-action buttons
- Add unsubscribe links
- Use professional AgriLink branding
- Optimize for mobile viewing

**Content Types:**
- Weekly newsletters with market summaries
- Feature announcements and updates
- Educational content about farming practices
- Promotional offers and service updates

### 🔔 Push Notifications
**Best Practices:**
- Keep messages brief and actionable
- Use relevant icons and images
- Include deep links to app sections
- Time delivery for maximum engagement
- Personalize based on user preferences

## Technical Integration

### SMS Service Integration
The system supports integration with various SMS providers:

**MSpace (Sri Lanka)**
```javascript
const smsConfig = {
  apiUrl: 'https://tap.mspace.lk/tapsendsms/bulksms',
  username: process.env.MSPACE_USERNAME,
  password: process.env.MSPACE_PASSWORD,
  senderId: 'AGRILINK'
};
```

**Twilio (International)**
```javascript
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_PHONE_NUMBER
};
```

### Email Service Integration
Uses the existing email service with SMTP configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Database Integration
Message templates and history are stored in MongoDB:

```javascript
// Template Schema
{
  id: String,
  title: String,
  content: String,
  type: 'sms' | 'email' | 'notification',
  category: 'marketing' | 'alerts' | 'updates' | 'emergency',
  createdAt: Date,
  updatedAt: Date
}
```

## Security & Compliance

### Data Protection
- All message content is encrypted in transit
- Personal data handling follows privacy regulations
- Unsubscribe requests are processed automatically
- User preferences are respected

### Rate Limiting
- SMS sending is limited to prevent spam
- Email sending uses batch processing
- API endpoints have rate limiting enabled
- Monitoring alerts for unusual activity

### Access Control
- Admin authentication required
- Role-based permissions for different message types
- Audit logs for all message sending activities
- Approval workflows for sensitive communications

## Monitoring & Analytics

### Message Statistics
- Total messages sent (all time)
- Daily sending volume
- Active subscriber counts
- SMS credit balance
- Delivery success rates

### Performance Metrics
- Message delivery times
- Open rates (for emails)
- Click-through rates
- Unsubscribe rates
- User engagement metrics

## Troubleshooting

### Common Issues

**SMS Not Sending:**
1. Check SMS credit balance
2. Verify phone number format (+94XXXXXXXXX)
3. Confirm SMS provider configuration
4. Check API rate limits

**Email Delivery Issues:**
1. Verify SMTP credentials
2. Check email service quota
3. Review recipient list validity
4. Monitor spam scores

**Template Loading Errors:**
1. Check database connection
2. Verify template data format
3. Clear browser cache
4. Check API endpoint status

### Error Codes
- `400`: Invalid request data
- `401`: Authentication required
- `403`: Insufficient permissions
- `429`: Rate limit exceeded
- `500`: Server error

## Future Enhancements

### Planned Features
- [ ] Message scheduling for future delivery
- [ ] A/B testing for message optimization
- [ ] Advanced analytics and reporting
- [ ] WhatsApp business integration
- [ ] Voice message capabilities
- [ ] Multi-language support
- [ ] Automated message triggers
- [ ] Integration with CRM systems

### Integration Roadmap
- [ ] Connect with user behavior analytics
- [ ] Link with price monitoring system
- [ ] Integrate with weather services
- [ ] Connect with market demand forecasting
- [ ] Mobile app push notification system

## Support

For technical support or feature requests:
- Create issue in project repository
- Contact development team
- Check API documentation
- Review system logs for error details

The messaging system is designed to be scalable, reliable, and user-friendly, providing administrators with powerful tools to communicate effectively with AgriLink users across multiple channels.
