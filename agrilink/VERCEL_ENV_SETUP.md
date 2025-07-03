# 🌍 Vercel Environment Variables Configuration Guide

## 📋 How to Add Environment Variables in Vercel

### Step 1: Access Environment Variables
1. Go to your Vercel project dashboard
2. Click on your project name
3. Go to **Settings** tab
4. Click **Environment Variables** from the sidebar

### Step 2: Add Each Variable

For each environment variable below, click **"Add New"** and enter:

---

## 🗄️ DATABASE VARIABLES (REQUIRED)

### Variable 1: Database Connection
```
Name: MONGODB_URI
Value: mongodb+srv://agrilink_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agrilink
Environment: Production, Preview, Development
```

**⚠️ IMPORTANT:** Replace `YOUR_PASSWORD` and `cluster0.xxxxx` with your actual MongoDB Atlas details.

---

## 🚀 APPLICATION VARIABLES (REQUIRED)

### Variable 2: Base URL
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://your-app-name.vercel.app
Environment: Production, Preview, Development
```

**⚠️ IMPORTANT:** Replace `your-app-name` with your actual Vercel app name.

### Variable 3: Node Environment
```
Name: NODE_ENV
Value: production
Environment: Production
```

---

## 📧 EMAIL VARIABLES (OPTIONAL - Add Later)

### Variable 4: Email Service
```
Name: EMAIL_SERVICE
Value: gmail
Environment: Production, Preview, Development
```

### Variable 5: Email User
```
Name: EMAIL_USER
Value: your-email@gmail.com
Environment: Production, Preview, Development
```

### Variable 6: Email Password
```
Name: EMAIL_PASS
Value: your-16-character-app-password
Environment: Production, Preview, Development
```

### Variable 7: Email Host
```
Name: EMAIL_HOST
Value: smtp.gmail.com
Environment: Production, Preview, Development
```

### Variable 8: Email Port
```
Name: EMAIL_PORT
Value: 587
Environment: Production, Preview, Development
```

---

## 🔐 SECURITY VARIABLES (RECOMMENDED)

### Variable 9: Cron Secret
```
Name: CRON_SECRET
Value: [generate-random-32-character-string]
Environment: Production, Preview, Development
```

### Variable 10: NextAuth Secret (if using authentication)
```
Name: NEXTAUTH_SECRET
Value: [generate-random-32-character-string]
Environment: Production, Preview, Development
```

### Variable 11: NextAuth URL (if using authentication)
```
Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
Environment: Production, Preview, Development
```

---

## 🎯 MINIMAL SETUP (START HERE)

**If you want to deploy quickly, start with just these 2 variables:**

1. `MONGODB_URI` - Your MongoDB connection string
2. `NEXT_PUBLIC_BASE_URL` - Your Vercel app URL

**You can add the email and security variables later!**

---

## 🔧 How to Generate Secure Random Strings

### Option 1: Online Generator
Visit: https://www.uuidgenerator.net/ and generate a UUID

### Option 2: Use Node.js (in terminal)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 3: Use OpenSSL
```bash
openssl rand -hex 32
```

---

## 📝 Environment Variables Checklist

- [ ] MONGODB_URI (Required)
- [ ] NEXT_PUBLIC_BASE_URL (Required)
- [ ] NODE_ENV (Recommended)
- [ ] EMAIL_USER (Optional)
- [ ] EMAIL_PASS (Optional)
- [ ] EMAIL_SERVICE (Optional)
- [ ] EMAIL_HOST (Optional)
- [ ] EMAIL_PORT (Optional)
- [ ] CRON_SECRET (Recommended)
- [ ] NEXTAUTH_SECRET (If using auth)
- [ ] NEXTAUTH_URL (If using auth)

---

## 🚀 After Adding Variables

1. Click **"Save"** for each variable
2. Go back to **Deployments** tab
3. Click **"Redeploy"** to apply the new environment variables
4. Wait for deployment to complete
5. Test your application!

---

## 🆘 Need Help?

If you get stuck, refer to:
- Vercel Docs: https://vercel.com/docs/projects/environment-variables
- MongoDB Atlas: https://cloud.mongodb.com
- Gmail App Passwords: https://myaccount.google.com/apppasswords
