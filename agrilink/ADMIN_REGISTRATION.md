# 🚀 AgriLink Admin Registration

Simple tools for creating admin accounts with automatic database insertion.

## 📋 **Quick Start**

### **Method 1: Create Predefined Admins (Recommended)**
```bash
node auto-admin-creator.js
```
**✨ Instantly creates 3 ready-to-use admin accounts:**
- `sandali@agrilink.lk` / `SandaliAdmin2025!` (super_admin)
- `admin@agrilink.lk` / `AgriLinkAdmin2025!` (admin) 
- `support@agrilink.lk` / `SupportAdmin2025!` (admin)

### **Method 2: Create Custom Admin**
```bash
node interactive-auto-admin.js
```
**✨ Interactive tool to create custom admin with your chosen details**

## 🔑 **Ready to Login**

After running either tool, go to: **http://localhost:3001/login**

Use any of the created email/password combinations to access the admin dashboard.

## 🛡️ **Security Features**
- ✅ Automatic password hashing (bcryptjs)
- ✅ JWT token authentication  
- ✅ Role-based permissions
- ✅ Duplicate prevention
- ✅ Direct database insertion

## 🔧 **Troubleshooting**

**Database connection issues:**
- Check MongoDB connection in `.env.local`
- Ensure MongoDB server is running

**"Admin already exists":**
- Use different email address
- Or skip if admin already exists

That's it! Simple, secure, and automatic. 🎯
