# AgriLink Role-Based Login System

## Overview
The AgriLink platform now features a comprehensive role-based login system that redirects users to appropriate dashboards based on their role.

## Login Flow
1. Users click "Log In" from the homepage or navigation menu
2. They are directed to `/login` - a universal login page
3. The system attempts login in this order:
   - Admin login
   - Seller login  
   - Customer login
4. Upon successful login, users are redirected to their role-specific dashboard:
   - **Admins** → `/admin`
   - **Sellers** → `/seller/dashboard`
   - **Customers** → `/customer/dashboard`

## Default Admin Account
A default admin account has been created for testing:
- **Email:** admin@agrilink.com
- **Password:** admin123
- **Role:** super_admin
- **Permissions:** All permissions enabled

## Admin Registration
Admins can register automatically using the provided registration tools:

### � **Automatic Admin Registration Tools:**
```bash
# Instant setup - creates 3 predefined admin accounts
node auto-admin-creator.js

# Custom admin registration - interactive setup
node interactive-auto-admin.js
```

### 📋 **Automatic Features:**
- ✅ **Direct database insertion** - No manual copying required
- ✅ **Password hashing** - Secure bcryptjs encryption
- ✅ **Duplicate prevention** - Checks for existing accounts
- ✅ **Immediate login** - Ready to use instantly
- ✅ **Role assignment** - Super admin or regular admin

### 🔑 **Ready-to-Use Accounts:**
After running `auto-admin-creator.js`:
- **Super Admin:** `sandali@agrilink.lk` / `SandaliAdmin2025!`
- **System Admin:** `admin@agrilink.lk` / `AgriLinkAdmin2025!`
- **Support Admin:** `support@agrilink.lk` / `SupportAdmin2025!`

See `ADMIN_REGISTRATION_GUIDE.md` for detailed instructions.

## Registration Flow
- **Customer Registration:** `/customer` - Registration only (no login toggle)
- **Seller Registration:** `/seller` - Registration only (no login toggle)
- **Admin Creation:** Manual creation via API endpoint only

## API Endpoints

### Admin Authentication
- **Login:** `POST /api/admin/login`
  - **Body:** `{"email": "admin@agrilink.com", "password": "admin123"}`
  - **Response:** Returns admin data, access token, and refresh token

- **Token Refresh:** `POST /api/admin/refresh`
  - **Body:** `{"refreshToken": "jwt_refresh_token"}`
  - **Response:** Returns new access token

- **Profile:** `GET /api/admin/profile`
  - **Headers:** `Authorization: Bearer <access_token>`
  - **Response:** Returns admin profile data

### Admin Management
- **Create Admin:** `POST /api/admin/create`
  - **Headers:** `x-api-key: admin-creation-key-123`
  - **Body:** Admin user data

- **Default Admin:** `GET /api/admin/create`
  - **Headers:** `x-api-key: admin-creation-key-123`
  - **Response:** Creates default admin account

## File Structure
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx           # Universal login page
│   ├── admin/
│   │   └── page.tsx           # Admin dashboard
│   ├── customer/
│   │   ├── page.tsx           # Customer registration only
│   │   └── dashboard/
│   │       └── page.tsx       # Customer dashboard
│   ├── seller/
│   │   ├── page.tsx           # Seller registration only
│   │   └── dashboard/
│   │       └── page.tsx       # Seller dashboard
│   ├── api/
│   │   └── admin/
│   │       ├── login/
│   │       │   └── route.ts   # Admin login API
│   │       └── create/
│   │           └── route.ts   # Admin creation API
│   ├── home/
│   │   └── page.tsx           # Updated homepage with login link
│   └── components/
│       └── Navigation.tsx     # Updated navigation with login link
└── lib/
    └── models/
        └── Admin.ts           # Admin Mongoose model
```

## Testing the System

1. **Start the development server:**
   ```bash
   cd agrilink
   npm run dev
   ```

2. **Access the homepage:**
   ```
   http://localhost:3001/home
   ```

3. **Click "Log In" and test with:**
   - Admin: admin@agrilink.com / admin123
   - Test seller/customer accounts (if any exist)

4. **Verify redirections work correctly**

## Security Features
- **Password Hashing:** Passwords are securely hashed using bcryptjs with salt rounds
- **JWT Authentication:** 
  - Access tokens (24h expiration) for API authentication
  - Refresh tokens (7d expiration) for seamless token renewal
  - Secure token storage in localStorage
  - Automatic token refresh on API calls
- **Role-Based Access Control:** Admin permissions system with granular controls
- **API Key Protection:** Admin creation requires API key authentication
- **Protected Routes:** All admin API endpoints require valid JWT tokens
- **Session Management:** Proper logout with token cleanup
- **Error Handling:** Comprehensive error handling for authentication failures

## JWT Token Structure
```json
{
  "adminId": "user_id",
  "email": "admin@agrilink.com", 
  "role": "super_admin",
  "permissions": ["manage_users", "view_analytics", ...],
  "iss": "agrilink-admin",
  "aud": "agrilink-app",
  "exp": 1625097600
}
```

## Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Database
MONGODB_URI=your-mongodb-connection-string
```

## Next Steps
- ✅ **JWT Tokens:** Implemented for secure authentication
- ✅ **Password Hashing:** Secure bcryptjs implementation  
- ✅ **Token Refresh:** Automatic token renewal system
- ✅ **Protected Routes:** JWT middleware for API security
- **Session Expiration:** Add client-side session timeout handling
- **Password Reset:** Email-based password reset functionality
- **Admin Management UI:** Interface for managing admin users
- **Audit Logging:** Track admin actions and login history
- **Two-Factor Authentication:** Add 2FA for enhanced security
- **Rate Limiting:** Implement API rate limiting for security
