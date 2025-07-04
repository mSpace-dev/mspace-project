# 🚀 AgriLink Deployment Guide

## Deployment Options

### 1. **Vercel (Recommended - Easiest)**
### 2. **Netlify**
### 3. **Railway**
### 4. **Digital Ocean**
### 5. **AWS/Google Cloud**
### 6. **Traditional VPS**

---

## 🎯 Option 1: Vercel Deployment (Recommended)

Vercel is the fastest and easiest way to deploy Next.js applications.

### Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (for database)

### Steps:

#### 1. Prepare Your Repository
```bash
# Make sure your code is committed to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Environment Variables Setup
Create these environment variables in Vercel:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agrilink

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
CRON_SECRET=your-secure-random-string

# Authentication (if using NextAuth)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app-name.vercel.app
```

#### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Click "Deploy"

#### 4. Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Get connection string
5. Add to Vercel environment variables

---

## 🎯 Option 2: Railway Deployment

Railway offers great Next.js support with built-in databases.

### Steps:

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login and Deploy
```bash
railway login
railway init
railway up
```

#### 3. Add Environment Variables
```bash
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
# ... add other variables
```

---

## 🎯 Option 3: Netlify Deployment

### Steps:

#### 1. Build Settings
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables
6. Deploy

---

## 🗄️ Database Setup Options

### Option A: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string

### Option B: Railway MongoDB
```bash
railway add mongodb
```

### Option C: PlanetScale (MySQL alternative)
```bash
npm install @planetscale/database
```

---

## 📧 Email Service Setup for Production

### Option A: SendGrid (Recommended for production)
```bash
npm install @sendgrid/mail
```

Environment variables:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Option B: Gmail (Development/Small scale)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

### Option C: Resend (Modern alternative)
```bash
npm install resend
```

---

## 🔧 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All environment variables documented
- [ ] Build command works: `npm run build`
- [ ] No console errors in production build
- [ ] All API routes tested
- [ ] Database connection tested

### 2. Environment Variables
- [ ] MONGODB_URI set
- [ ] SMTP credentials set
- [ ] NEXT_PUBLIC_BASE_URL set
- [ ] All secrets secured

### 3. Security
- [ ] No sensitive data in code
- [ ] Environment variables not committed
- [ ] CORS configured if needed
- [ ] Rate limiting considered

### 4. Performance
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Database queries optimized
- [ ] Caching strategy in place

---

## 🚀 Quick Deployment Commands

### Build and Test Locally
```bash
# Test production build locally
npm run build
npm run start

# Test email functionality
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"simple"}'
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add NEXT_PUBLIC_BASE_URL

# Redeploy with new env vars
vercel --prod
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add environment variables
railway variables set MONGODB_URI="your-uri"
```

---

## 🔗 Custom Domain Setup

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown
4. Wait for SSL certificate

### For Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS
4. Enable HTTPS

---

## 📊 Monitoring and Analytics

### Add to your app:
```bash
# Analytics
npm install @vercel/analytics

# Error tracking
npm install @sentry/nextjs

# Performance monitoring
npm install @vercel/speed-insights
```

---

## 🔄 Automated Deployments

### GitHub Actions (for any provider)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test # if you have tests
      # Add deployment step based on your provider
```

---

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**
   ```bash
   # Check build locally
   npm run build
   
   # Fix TypeScript errors
   npm run lint
   ```

2. **Environment Variables Not Working**
   - Ensure they're set in deployment platform
   - Restart deployment after adding variables
   - Check variable names (case sensitive)

3. **Database Connection Issues**
   - Verify connection string
   - Check IP whitelist in MongoDB Atlas
   - Test connection locally first

4. **Email Not Working**
   - Verify SMTP credentials
   - Check email service logs
   - Test with `/api/test-email` endpoint

---

## 📱 Mobile Responsiveness

Your app is already mobile-responsive with Tailwind CSS, but test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop browsers

---

Choose your preferred deployment method and follow the specific steps above. **Vercel is recommended** for Next.js applications as it provides the best developer experience and performance.
