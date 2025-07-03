# AgriLink Customer Authentication System

## Overview
This implementation provides a complete customer authentication system for the AgriLink project, including user registration, login, and dashboard functionality.

## Features Implemented

### 1. Home Page Updates
- Added Customer Portal and Seller Portal buttons
- Modern, responsive design with AgriLink branding
- Clear navigation between different user types

### 2. Customer Registration & Login
- Complete registration form with validation
- Secure password hashing using bcryptjs
- MongoDB integration for data storage
- Form validation and error handling
- Success/error messaging

### 3. Customer Dashboard
- Protected route (requires authentication)
- Profile information display
- Quick action buttons for key features
- Price alerts summary
- Recent activity tracking
- Logout functionality

### 4. Database Integration
- MongoDB connection setup
- Customer schema with comprehensive fields
- Secure password storage
- Data validation and indexing

## Project Structure

```
src/
├── app/
│   ├── home/
│   │   └── page.tsx                 # Updated home page with portal buttons
│   ├── customer/
│   │   ├── page.tsx                 # Customer login/register page
│   │   └── dashboard/
│   │       └── page.tsx             # Customer dashboard
│   ├── seller/
│   │   └── page.tsx                 # Seller portal (placeholder)
│   └── api/
│       └── customer/
│           ├── register/
│           │   └── route.ts         # Customer registration API
│           └── login/
│               └── route.ts         # Customer login API
└── lib/
    ├── dbConnect.ts                 # MongoDB connection
    └── models/
        └── Customer.ts              # Customer model schema
```

## Implementation Steps

### Step 1: Set Up Database
1. Install MongoDB locally or use MongoDB Atlas
2. Update the `.env.local` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/agrilink
   ```

### Step 2: Install Dependencies
```bash
npm install mongoose bcryptjs next-auth @types/bcryptjs
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Test the Application
1. Visit `http://localhost:3001`
2. Click "Customer Portal" from the home page
3. Test registration with sample data
4. Test login with registered credentials
5. Explore the customer dashboard

## API Endpoints

### Customer Registration
- **POST** `/api/customer/register`
- **Body**: `{ name, email, password, phone, district, province }`
- **Response**: Customer object (without password)

### Customer Login
- **POST** `/api/customer/login`
- **Body**: `{ email, password }`
- **Response**: Customer object (without password)

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds of 12
2. **Input Validation**: Server-side validation for all required fields
3. **Error Handling**: Comprehensive error handling and user feedback
4. **Protected Routes**: Dashboard requires authentication
5. **Data Sanitization**: Mongoose schema validation and sanitization

## Customer Data Model

```typescript
interface ICustomer {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  district: string;
  province: string;
  priceAlerts: {
    crop: string;
    maxPrice: number;
    minPrice: number;
    isActive: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

## User Flow

1. **Home Page**: User chooses between Customer or Seller portal
2. **Customer Page**: New users register, existing users login
3. **Registration**: User fills form with personal and location details
4. **Login**: User enters email and password
5. **Dashboard**: Authenticated users access their personalized dashboard

## Future Enhancements

1. **Email Verification**: Add email verification for new registrations
2. **Password Reset**: Implement forgot password functionality
3. **Session Management**: Add proper session handling with NextAuth
4. **Profile Updates**: Allow users to update their profile information
5. **Price Alerts**: Implement actual price alert functionality
6. **SMS Integration**: Connect with mSpace API for SMS notifications

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: bcryptjs for password hashing
- **Styling**: Tailwind CSS for responsive design

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/agrilink

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Other API Keys (add as needed)
# OPENAI_API_KEY=your-openai-key
# MSPACE_API_KEY=your-mspace-key
```

## Error Handling

The application includes comprehensive error handling:
- Client-side form validation
- Server-side data validation
- Database connection error handling
- User-friendly error messages
- Loading states and success notifications

## Responsive Design

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes and orientations

This implementation provides a solid foundation for the AgriLink customer authentication system and can be extended with additional features as needed.
