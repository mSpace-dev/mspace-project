# 🚨 Deployment Troubleshooting Guide

## Common 404 NOT_FOUND Errors and Solutions

### Error: `404: NOT_FOUND Code: NOT_FOUND ID: sin1::...`

This error typically occurs during Vercel deployment. Here are the solutions:

## ✅ Quick Fix Steps

### 1. **Remove vercel.json (if exists)**
```bash
# Delete vercel.json to let Vercel auto-detect
rm vercel.json
```

### 2. **Simplify next.config.ts**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
```

### 3. **Fix Root Page Redirect**
Update `src/app/page.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">AgriLink</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

### 4. **Test Build Locally**
```bash
npm run build
npm run start
```

### 5. **Redeploy**
```bash
git add .
git commit -m "Fix deployment issues"
git push origin main
# Or use Vercel CLI: vercel --prod
```

## 🔍 Other Common Issues

### **Environment Variables Missing**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add all required variables:
  ```
  MONGODB_URI=mongodb+srv://...
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
  ```

### **Build Failures**
```bash
# Check for TypeScript errors
npm run lint

# Check for dependency issues
npm install

# Clear cache and rebuild
rm -rf .next
npm run build
```

### **API Routes Not Working**
- Make sure API files are in `src/app/api/` directory
- Check that functions export `GET`, `POST`, etc.
- Verify environment variables are set

### **Database Connection Issues**
- Test MongoDB connection string locally
- Ensure IP whitelist includes `0.0.0.0/0` in MongoDB Atlas
- Check database user permissions

## 🚀 Alternative Deployment Methods

### **If Vercel continues to fail, try Railway:**

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Set environment variables:
```bash
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
railway variables set NEXT_PUBLIC_BASE_URL="https://your-app.railway.app"
```

### **Or try Netlify:**

1. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. Deploy via GitHub integration

## 🛠 Debug Commands

### **Check Build Output:**
```bash
npm run build 2>&1 | tee build.log
```

### **Test API Endpoints:**
```bash
# Test locally first
curl http://localhost:3000/api/health
curl http://localhost:3000/api/test-email -X GET
```

### **Check Environment Variables:**
```bash
# In your deployed app, create a debug API route
# src/app/api/debug/route.ts
export async function GET() {
  return Response.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasSmtpUser: !!process.env.SMTP_USER,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
  });
}
```

## 📞 Get Help

If issues persist:

1. **Check Vercel deployment logs:**
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Look for error messages

2. **Check browser console:**
   - Open browser dev tools
   - Look for JavaScript errors

3. **Test individual components:**
   - Visit `/home` directly
   - Test `/api/health` endpoint
   - Check `/api/test-email`

## ✅ Final Checklist

Before deploying:
- [ ] `npm run build` works locally
- [ ] All environment variables documented
- [ ] Database connection tested
- [ ] Email service configured
- [ ] No `vercel.json` file (let Vercel auto-detect)
- [ ] Simple `next.config.ts`
- [ ] Root page doesn't use server-side redirect

## 🎯 Success Indicators

Your deployment is successful when:
- [ ] Homepage loads at your domain
- [ ] Newsletter subscription works
- [ ] Email test endpoint responds
- [ ] Database queries work
- [ ] All pages are accessible

---

*If you're still having issues, share the specific error message and I'll help debug it further!*
