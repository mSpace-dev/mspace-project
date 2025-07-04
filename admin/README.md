# ⚠️ DEPRECATED: Admin Folder

## 🚨 **IMPORTANT NOTICE**

This separate admin folder is **NO LONGER NEEDED** and should be **IGNORED**.

### ✅ **Use AgriLink Project Instead**

All admin functionality, including the email campaign feature, has been **integrated into the main AgriLink project**.

**Correct way to access admin features:**

1. **Run AgriLink project only:**
   ```bash
   cd ../agrilink
   npm run dev
   ```

2. **Access admin dashboard:**
   - URL: `http://localhost:3002/admin`
   - Login with your admin credentials
   - All features including email campaigns are available there

### 🗑️ **This Folder Can Be Deleted**

This separate admin folder was created during development but is no longer needed. You can safely delete this entire `admin/` folder.

### 📧 **Email Campaign Feature**

The email campaign functionality is now available at:
- **Admin Dashboard**: `/admin` in the AgriLink project
- **Email Campaign**: `/admin/email-campaign` in the AgriLink project

All dependencies, API routes, and functionality are integrated into the main AgriLink project for better maintainability and consistency.
