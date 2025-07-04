# 🚀 AgriLink Admin Creation Methods

## ✅ **Available Admin Creation Tools**

### 🔄 **Automatic Database Insertion Tools**

#### **1. Auto Admin Creator** (`auto-admin-creator.js`)
**Automatically creates predefined admin accounts and saves to database**

```bash
node auto-admin-creator.js
```

**Features:**
- ✅ **Direct database insertion**
- ✅ **No manual copying required**
- ✅ **Creates 3 predefined accounts**
- ✅ **Checks for existing accounts**
- ✅ **Shows login credentials**

**Created Accounts:**
1. **Sandali Jayawardhana** - `sandali@agrilink.lk` / `SandaliAdmin2025!` (super_admin)
2. **System Administrator** - `admin@agrilink.lk` / `AgriLinkAdmin2025!` (admin)
3. **Support Manager** - `support@agrilink.lk` / `SupportAdmin2025!` (admin)

#### **2. Interactive Auto Admin** (`interactive-auto-admin.js`)
**Interactive tool with automatic database saving**

```bash
node interactive-auto-admin.js
```

**Features:**
- ✅ **Direct database insertion**
- ✅ **Custom admin details**
- ✅ **Role selection**
- ✅ **Real-time feedback**
- ✅ **Create multiple admins**

---

### 📋 **Manual Creation Tools** (Generate documents for manual insertion)

#### **3. Interactive Creator** (`interactive-admin-creator.js`)
```bash
node interactive-admin-creator.js
```

#### **4. Simple Hash Tool** (`hash-password.js`)
```bash
node hash-password.js "YourPassword"
```

#### **5. Batch Creator** (`batch-admin-creator.js`)
```bash
node batch-admin-creator.js
```

#### **6. Custom Creator** (`custom-admin-creator.js`)
```bash
node custom-admin-creator.js
```

---

## 🎯 **Recommended Usage**

### **For Quick Setup:**
```bash
node auto-admin-creator.js
```
**✨ Creates 3 ready-to-use admin accounts instantly!**

### **For Custom Admin:**
```bash
node interactive-auto-admin.js
```
**✨ Create your own admin with chosen credentials!**

---

## 📊 **Comparison Table**

| Tool | Database Insert | Custom Details | Multiple Admins | Ease of Use |
|------|----------------|----------------|-----------------|-------------|
| `auto-admin-creator.js` | ✅ Auto | ❌ Predefined | ✅ 3 accounts | ⭐⭐⭐⭐⭐ |
| `interactive-auto-admin.js` | ✅ Auto | ✅ Custom | ✅ Multiple | ⭐⭐⭐⭐ |
| `interactive-admin-creator.js` | ❌ Manual | ✅ Custom | ✅ Multiple | ⭐⭐⭐ |
| `hash-password.js` | ❌ Manual | ✅ Custom | ❌ Single | ⭐⭐ |
| `batch-admin-creator.js` | ❌ Manual | ❌ Predefined | ✅ 3 accounts | ⭐⭐ |
| `custom-admin-creator.js` | ❌ Manual | ✅ Edit file | ✅ Multiple | ⭐⭐ |

---

## 🔑 **Ready-to-Use Admin Accounts**

After running `auto-admin-creator.js`, you can immediately login with:

### **Super Admin (Full Access):**
- **Email:** `sandali@agrilink.lk`
- **Password:** `SandaliAdmin2025!`
- **Dashboard:** http://localhost:3001/admin

### **Regular Admin (Limited Access):**
- **Email:** `admin@agrilink.lk`
- **Password:** `AgriLinkAdmin2025!`

### **Support Admin:**
- **Email:** `support@agrilink.lk`
- **Password:** `SupportAdmin2025!`

---

## 🧪 **Testing the System**

### **1. Create Admins:**
```bash
node auto-admin-creator.js
```

### **2. Test Login:**
```bash
# API Test
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sandali@agrilink.lk","password":"SandaliAdmin2025!"}'
```

### **3. Web Login:**
1. Go to: http://localhost:3001/login
2. Use any of the created credentials
3. Verify admin dashboard access

---

## 🛡️ **Security Features**

- ✅ **bcryptjs password hashing** (12 salt rounds)
- ✅ **JWT token authentication**
- ✅ **Role-based permissions**
- ✅ **Duplicate email prevention**
- ✅ **Secure database storage**

---

## 🔧 **Troubleshooting**

### **Database Connection Issues:**
```bash
# Check MongoDB connection string in .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### **"Admin already exists" Error:**
- Use different email address
- Or delete existing admin from database
- Or skip creation if admin already exists

### **Login Fails:**
- Verify password is exactly as entered
- Check email case sensitivity
- Ensure `isActive: true` in database
- Test with API first before web interface

---

## 🎉 **Success Indicators**

✅ **Admin creation successful when you see:**
- "Admin created successfully!" message
- Database ID displayed
- Login credentials shown
- No error messages

✅ **Login working when:**
- API returns JWT tokens
- Web login redirects to admin dashboard
- No authentication errors

---

## 📈 **Next Steps**

After successful admin creation:
1. **Change default passwords** in production
2. **Test all admin functions** in dashboard
3. **Set up additional security** (2FA, etc.)
4. **Create backup admin accounts**
5. **Document admin procedures**

**🚀 Your AgriLink admin system is now fully operational!**
