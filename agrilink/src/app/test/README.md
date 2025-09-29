# AgriLink Test Suite

This folder contains all testing functionality for the AgriLink agricultural platform. All test-related files are organized here for easy identification and management.

## 📁 Folder Structure

```
/test/
├── api/                    # API testing endpoints
│   ├── route.ts           # Main test API overview
│   ├── database/          # Database connection tests
│   ├── email/             # Email service tests
│   └── environment/       # Environment variable checks
├── subscriber/            # Newsletter subscription testing
│   └── page.tsx          # Test subscriber page
├── page.tsx              # Main test dashboard
└── README.md             # This file
```

## 🧪 Available Tests

### 1. **Test Dashboard** (`/test`)
- Comprehensive testing interface
- Visual status indicators
- Run individual or all tests
- Quick access to all testing features

### 2. **Environment Test** (`/test/api/environment`)
- Checks all required environment variables
- Validates configuration completeness
- Provides setup recommendations
- Runtime system checks

### 3. **Database Test** (`/test/api/database`)
- Tests MongoDB connection
- Verifies read/write operations
- Shows database statistics
- Connection health monitoring

### 4. **Email Test** (`/test/api/email`)
- Tests SMTP configuration
- Sends various email types (simple, welcome, alerts, newsletter)
- Verifies email delivery
- Email template testing

### 5. **Subscriber Test** (`/test/subscriber`)
- Adds test email subscribers
- Tests newsletter functionality
- Useful for email campaign testing

## 🚀 How to Use

### Access the Test Dashboard
Visit: `http://localhost:3000/test`

### Run Individual Tests
- **Environment**: `GET /test/api/environment`
- **Database**: `GET /test/api/database`
- **Email**: `POST /test/api/email` with email data
- **API Overview**: `GET /test/api`

### Example API Usage

```bash
# Check environment variables
curl http://localhost:3000/test/api/environment

# Test database connection
curl http://localhost:3000/test/api/database

# Send test email
curl -X POST http://localhost:3000/test/api/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "simple"}'
```

## 📋 Test Checklist

Before deployment, ensure all tests pass:

- [ ] ✅ Environment variables configured
- [ ] ✅ Database connection working
- [ ] ✅ Email service functional
- [ ] ✅ All APIs responding correctly
- [ ] ✅ Newsletter subscription working

## 🔧 Development Workflow

1. **During Development**:
   - Use `/test` dashboard for quick checks
   - Run tests after making changes
   - Verify functionality before commits

2. **Before Deployment**:
   - Run full test suite
   - Check environment configuration
   - Verify all services are working

3. **Troubleshooting**:
   - Check test results for error details
   - Use individual test endpoints to isolate issues
   - Review environment variable configuration

## 🛡️ Security Notes

- Test endpoints should be removed or protected in production
- Don't expose sensitive configuration data
- Use environment-specific test configurations
- Regularly update test data and credentials

## 📊 Test Results

Test results include:
- ✅ Success/failure status
- 📝 Detailed messages
- 📈 Performance metrics
- 🔍 Debug information
- 💡 Recommendations

## 🤝 Contributing

When adding new features:
1. Add corresponding test endpoints
2. Update test dashboard if needed
3. Document new test procedures
4. Ensure tests cover edge cases

---

**Note**: This centralized test structure makes it easy to verify that all AgriLink systems are functioning correctly during development and deployment.
