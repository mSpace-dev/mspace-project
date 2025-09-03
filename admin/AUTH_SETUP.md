# AgriLink Admin Authentication Setup

## Features
- ✅ Attractive login and signup pages
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Password hashing with bcrypt
- ✅ Protected routes with middleware
- ✅ Token refresh functionality
- ✅ Admin role-based permissions

## Setup Instructions

### 1. Environment Variables
Update your `.env.local` file with the following:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2025-agrilink-admin
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-2025-agrilink-admin

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
```

### 2. Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins: `http://localhost:3001`
6. Add redirect URI: `http://localhost:3001/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

### 3. Database Setup
The authentication system will automatically create the `admins` collection with the following structure:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String (hashed),
  role: String, // 'admin'
  permissions: Array,
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date,
  profileImage: String,
  department: String,
  authProvider: String, // 'local' or 'google'
  googleId: String
}
```

### 4. Default Admin Account
After setup, you can create your first admin account by:
1. Going to `/signup` page
2. Creating an account with your email
3. Or using Google OAuth (if configured)

### 5. API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/signup` - Create new admin account
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/google` - Google OAuth login

#### Protected Routes
All admin routes are automatically protected by middleware:
- `/` - Dashboard
- `/send-sms` - SMS composer
- `/email-campaign` - Email campaigns
- `/users` - User management
- `/analytics` - Analytics dashboard

### 6. Usage

#### Login Flow
1. User visits `/login`
2. Enters credentials or clicks Google login
3. On success, redirected to dashboard with JWT tokens stored
4. Tokens are automatically refreshed when expired

#### Signup Flow
1. User visits `/signup`
2. Fills registration form
3. Account created with default admin permissions
4. Automatically logged in after signup

#### Google OAuth Flow
1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. On success, account created/linked automatically
4. Redirected to dashboard

### 7. Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with expiration
- Refresh token rotation
- Protected routes with middleware
- CORS protection
- Input validation

### 8. Permissions System
Default admin permissions include:
- `manage_users` - User management
- `manage_products` - Product management
- `manage_orders` - Order management
- `view_analytics` - Analytics access
- `manage_content` - Content management
- `send_notifications` - SMS/Email notifications

## Troubleshooting

### Common Issues
1. **"Module not found: jsonwebtoken"** - Run `npm install jsonwebtoken @types/jsonwebtoken`
2. **"Module not found: bcryptjs"** - Run `npm install bcryptjs @types/bcryptjs`
3. **Google OAuth not working** - Check Google Cloud Console configuration
4. **Tokens expiring too quickly** - Adjust JWT expiration times in environment variables

### Development
- Start dev server: `npm run dev`
- Login page: `http://localhost:3001/login`
- Signup page: `http://localhost:3001/signup`
- Dashboard: `http://localhost:3001/` (protected)

## Production Deployment
1. Update all secrets in environment variables
2. Set `NODE_ENV=production`
3. Configure proper CORS origins
4. Set up HTTPS
5. Use strong, unique JWT secrets
6. Configure Google OAuth for production domain
