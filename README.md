# 🌾 AgriLink - Smart Agricultural Marketplace Platform

AgriLink is a comprehensive digital platform designed to revolutionize agricultural commerce in Sri Lanka. It provides real-time market prices, AI-powered demand forecasting, and seamless connectivity between farmers, sellers, and consumers.

## 📱 Screenshots

### 🏠 Home Page
<img width="1919" height="907" alt="Image" src="https://github.com/user-attachments/assets/5d5e716d-fa70-428d-9b3b-79debb8ad466" />
*Modern landing page with hero carousel showcasing agricultural imagery and key features*

### 📊 Market Prices Dashboard
<img width="1892" height="902" alt="Image" src="https://github.com/user-attachments/assets/e4400972-203a-48b0-9463-11694fe0633c" />
*Real-time agricultural commodity prices with filtering by category, location, and market type*

### 🤖 AI Demand Forecasting
<img width="1899" height="908" alt="Image" src="https://github.com/user-attachments/assets/edd3cc85-4e9c-4573-9d18-331239a5cc40" />
*AI-powered agricultural market intelligence with crop demand analysis and price predictions*

### 👨‍💼 Admin Panel
<img width="1905" height="902" alt="Image" src="https://github.com/user-attachments/assets/a1439916-072d-4f7c-98c3-28dbe176b7fa" />
*Comprehensive admin interface for managing users, campaigns, and market data*

### 👤 Customer Profile
<img width="1915" height="902" alt="Image" src="https://github.com/user-attachments/assets/5f339bee-04f8-4463-9ad3-4ed5a9518728" />
*User profile management with subscription preferences and price alerts*

### 📧 Email Campaign Management
*Newsletter and email campaign management system for market updates*

### 📱 Mobile Experience
![Mobile View](./screenshots/mobile-view.png)
*Responsive design optimized for mobile devices and tablets*

## ✨ Features

### 🏪 Core Marketplace Features
- **Real-time Price Tracking**: Live agricultural commodity prices from wholesale and retail markets
- **Market Intelligence**: AI-powered price forecasting and demand analysis
- **Multi-user Support**: Separate interfaces for farmers, sellers, consumers, and traders
- **Location-based Services**: District and province-wise market data
- **Category Management**: Organized by product categories (vegetables, fruits, grains, etc.)

### 🤖 AI & Analytics
- **Demand Forecasting**: Machine learning models for crop demand prediction
- **Price Trend Analysis**: Historical data analysis and future price projections
- **Market Insights**: AI-generated recommendations for farmers and traders
- **Real-time Analytics**: Live market condition monitoring

### 📱 Communication & Alerts
- **SMS Notifications**: Automated price alerts via SMS
- **Email Newsletters**: Weekly market digests and price updates
- **Push Notifications**: Real-time alerts for significant price changes
- **Chatbot Support**: AI-powered customer support in multiple languages

### 🛠️ Admin & Management
- **Content Management**: Admin panel for managing users, campaigns, and data
- **Analytics Dashboard**: Comprehensive business intelligence and reporting
- **Campaign Management**: Email marketing and customer engagement tools
- **User Management**: Registration, authentication, and profile management

## 🚀 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication
- **bcryptjs** - Password hashing and security

### AI & Machine Learning
- **Python FastAPI** - ML model serving
- **Pandas & NumPy** - Data processing and analysis
- **Scikit-learn** - Machine learning algorithms
- **Custom ML Models** - Price prediction and demand forecasting

### Communication Services
- **Nodemailer** - Email service integration
- **SMS Gateway** - SMS notification service
- **Newsletter System** - Automated email campaigns

### DevOps & Deployment
- **Vercel** - Frontend deployment and hosting
- **Netlify** - Alternative deployment option
- **MongoDB Atlas** - Cloud database hosting
- **Environment Configuration** - Secure config management

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud)
- **Python 3.8+** (for ML model)
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mSpace-dev/mspace-project.git
cd mspace-project/agrilink
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the agrilink directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agrilink
DB_NAME=Agrilink

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration
SMS_API_KEY=your-sms-gateway-api-key
SMS_API_URL=your-sms-provider-url

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_API_KEY=your-admin-api-key

# ML Model Configuration
ML_MODEL_URL=http://localhost:8000
```

### 4. Database Setup
Make sure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 5. Python ML Model Setup (Optional)
```bash
cd model
pip install -r requirements.txt
python main.py
```

### 6. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
agrilink/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin management APIs
│   │   │   ├── prices/        # Price data APIs
│   │   │   ├── alerts/        # Notification APIs
│   │   │   ├── email/         # Email service APIs
│   │   │   └── ...
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── customer/          # Customer portal pages
│   │   ├── prices/            # Market prices pages
│   │   ├── demandforecast/    # AI forecasting pages
│   │   └── ...
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility libraries
│   │   ├── dbConnect.ts       # Database connection
│   │   ├── emailService.ts    # Email functionality
│   │   ├── models/           # Database models
│   │   └── ...
│   └── scripts/              # Utility scripts
├── model/                     # Python ML models
│   ├── main.py               # FastAPI ML server
│   ├── generatedata.py       # Data generation
│   └── model.ipynb          # Jupyter notebook
├── public/                   # Static assets
│   ├── images/              # Application images
│   └── test-*.html          # API testing pages
├── screenshots/             # Application screenshots
└── ...
```

## 🔧 Configuration

### Email Setup
1. Configure your email provider (Gmail, Outlook, etc.)
2. Generate an app-specific password
3. Update the email configuration in `.env.local`

### SMS Integration
1. Sign up with an SMS gateway provider
2. Obtain API credentials
3. Configure SMS settings in the environment file

### Database Configuration
1. Set up MongoDB (local or Atlas)
2. Create database and configure connection string
3. The application will handle schema creation automatically

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Netlify Deployment
1. Build the application: `npm run build`
2. Deploy the `out` directory to Netlify
3. Configure environment variables

### Custom Server Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure reverse proxy (Nginx/Apache)

## 📊 API Documentation

### Price API Endpoints
- `GET /api/prices` - Fetch agricultural commodity prices
- `POST /api/prices` - Add new price data (admin)
- `GET /api/prices?category=vegetables` - Filter by category

### User Management
- `POST /api/customer/register` - Customer registration
- `POST /api/seller/register` - Seller registration
- `GET /api/customer/profile` - Get user profile

### Alerts & Notifications
- `POST /api/alerts` - Create price alerts
- `POST /api/sms/send` - Send SMS notifications
- `POST /api/email/send` - Send email notifications

### AI & Analytics
- `POST /api/demandforecast` - Get demand predictions
- `GET /api/analytics` - Market analytics data

## 🧪 Testing

### API Testing
Use the built-in API testing interface:
```
http://localhost:3000/api-test.html
```

### Running Tests
```bash
# Run development server
npm run dev

# Test API endpoints
npm run test-api

# Check email functionality
npm run test-email
```

## 👨‍💻 Development

### Code Style
- Use TypeScript for type safety
- Follow ESLint configurations
- Use Prettier for code formatting
- Follow Next.js best practices

### Adding New Features
1. Create API routes in `src/app/api/`
2. Add corresponding pages in `src/app/`
3. Update database models in `src/lib/models/`
4. Test functionality using the API test interface

### Database Schema
- **Users**: Customer and seller profiles
- **Prices**: Agricultural commodity pricing data
- **Alerts**: Price alert configurations
- **Newsletters**: Email subscription management
- **Analytics**: Usage and market data

## 🤝 Contributing

We welcome contributions to AgriLink! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Add proper TypeScript types for new functions
- Update documentation for new features
- Test your changes thoroughly
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: support@agrilink.lk
- **Documentation**: [docs.agrilink.lk](https://docs.agrilink.lk)
- **Issues**: [GitHub Issues](https://github.com/mSpace-dev/mspace-project/issues)

## 🏆 Acknowledgments

- Sri Lankan Department of Agriculture for market data partnership
- Local farmers and agricultural communities for feedback
- Open source community for the amazing tools and libraries
- Development team at mSpace for continuous innovation

## 🔮 Roadmap

### Upcoming Features
- **Mobile App**: Native iOS and Android applications
- **Blockchain Integration**: Supply chain transparency
- **IoT Integration**: Real-time field monitoring
- **Multi-language Support**: Sinhala and Tamil interfaces
- **Payment Gateway**: Direct farmer-to-consumer transactions
- **Weather Integration**: Weather-based price predictions

### Version History
- **v2.0** - AI-powered demand forecasting and enhanced UI
- **v1.5** - SMS alerts and mobile optimization
- **v1.0** - Initial release with basic price tracking

---

**Made with ❤️ for Sri Lankan Agriculture** 🇱🇰

![Footer](./screenshots/footer.png)
