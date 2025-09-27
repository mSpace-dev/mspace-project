# AgriLink - Agricultural Marketplace

A comprehensive agricultural marketplace platform built with microservices architecture, connecting farmers and buyers in Sri Lanka.

## 🏗️ Architecture Overview

This project follows a microservices architecture with separate frontend and backend services:

```
agrilink-monorepo/
├── frontend/                 # Frontend applications
│   ├── apps/
│   │   ├── web/             # Main customer-facing web app
│   │   └── admin/           # Admin dashboard
│   └── packages/
│       ├── ui/              # Shared UI components
│       ├── types/           # TypeScript type definitions
│       └── utils/           # Shared utilities
├── backend/                 # Backend microservices
│   ├── services/
│   │   ├── auth-service/    # Authentication & user management
│   │   ├── product-service/ # Product catalog & inventory
│   │   ├── order-service/   # Order processing & fulfillment
│   │   └── notification-service/ # Email, SMS, push notifications
│   └── shared/
│       ├── database/        # Database models & migrations
│       ├── types/           # Shared TypeScript types
│       └── utils/           # Common utilities
└── docker-compose.yml       # Container orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mspace-project
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Supabase database**
   - Run the SQL scripts in `supabase_database_setup.sql`
   - Run the Google OAuth update in `supabase_google_oauth_update.sql`

5. **Start development servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Web app on :3000
   npm run dev:admin     # Admin on :3001
   npm run dev:backend   # All backend services
   ```

## 🎯 Services Overview

### Frontend Services

#### Web App (`frontend/apps/web`)
- **Port**: 3000
- **Purpose**: Main customer-facing application
- **Features**: Product browsing, ordering, user profiles
- **Tech Stack**: Next.js 14, React, Tailwind CSS

#### Admin Dashboard (`frontend/apps/admin`)
- **Port**: 3001
- **Purpose**: Administrative interface
- **Features**: User management, analytics, system configuration
- **Tech Stack**: Next.js 14, React, Tailwind CSS

### Backend Services

#### Auth Service (`backend/services/auth-service`)
- **Port**: 4001
- **Purpose**: User authentication and authorization
- **Features**: Google OAuth, JWT tokens, user profiles
- **Endpoints**: `/auth/*`

#### Product Service (`backend/services/product-service`)
- **Port**: 4002
- **Purpose**: Product catalog and inventory management
- **Features**: CRUD operations, image uploads, categories
- **Endpoints**: `/products/*`

#### Order Service (`backend/services/order-service`)
- **Port**: 4003
- **Purpose**: Order processing and fulfillment
- **Features**: Order creation, status tracking, payment integration
- **Endpoints**: `/orders/*`

#### Notification Service (`backend/services/notification-service`)
- **Port**: 4004
- **Purpose**: Communication and notifications
- **Features**: Email, SMS, push notifications
- **Endpoints**: `/notifications/*`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                    # Start all services
npm run dev:frontend          # Start web app only
npm run dev:admin             # Start admin dashboard only
npm run dev:backend           # Start all backend services

# Building
npm run build                 # Build all services
npm run build:frontend        # Build frontend only
npm run build:backend         # Build backend only

# Installation
npm run install:all           # Install all dependencies
npm run install:frontend      # Install frontend dependencies
npm run install:backend       # Install backend dependencies
```

### Individual Service Development

```bash
# Frontend
cd frontend/apps/web
npm run dev

# Backend
cd backend/services/auth-service
npm run dev
```

## 🐳 Docker Deployment

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Key Directories

### Frontend Structure
```
frontend/apps/web/src/
├── app/                     # Next.js app router pages
│   ├── auth/               # Authentication pages
│   ├── customer/           # Customer dashboard
│   ├── seller/             # Seller dashboard
│   └── api/                # API routes
├── components/             # React components
│   ├── auth/               # Auth components
│   ├── customer/           # Customer components
│   └── ui/                 # UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configs
└── types/                  # TypeScript types
```

### Backend Structure
```
backend/services/auth-service/src/
├── controllers/            # Request handlers
├── middleware/             # Express middleware
├── routes/                 # API routes
├── services/               # Business logic
├── models/                 # Data models
├── utils/                  # Utilities
└── index.ts                # Entry point
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
```

## 🗄️ Database

The project uses Supabase (PostgreSQL) with the following main tables:

- `customers` - Customer profiles
- `sellers` - Seller/farmer profiles  
- `admins` - Admin users
- `products` - Product catalog
- `orders` - Order management
- `email_subscriptions` - Newsletter subscriptions
- `delivery_persons` - Delivery personnel

## 🚀 Deployment

### Production Build

```bash
# Build all services
npm run build

# Start production servers
npm run start
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signin` - User sign in
- `POST /auth/signup` - User registration
- `POST /auth/signout` - User sign out
- `GET /auth/profile` - Get user profile

### Product Endpoints
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Order Endpoints
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `GET /orders/:id` - Get order details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**AgriLink** - Connecting farmers and buyers across Sri Lanka 🌾