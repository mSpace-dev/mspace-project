# 🔑 Admin Password Creation Guide

## For New Admins: How to Create Your Own Password

### 🚀 **Method 1: Interactive Creation (Recommended)**

1. **Run the interactive creator:**
   ```bash
   node interactive-admin-creator.js
   ```

2. **Follow the prompts:**
   ```
   👤 Admin Name: [Enter your name]
   📧 Email Address: [Enter your email]
   🔐 Password: [Enter YOUR chosen password]
   📱 Phone Number: [Enter your phone]
   ```

3. **Copy the generated MongoDB document**

4. **Insert into MongoDB "admins" collection**

5. **Login with your chosen credentials**

---

### 🔧 **Method 2: Simple Password Hasher**

1. **Run with your chosen password:**
   ```bash
   node hash-password.js "YourChosenPassword123!"
   ```

2. **Copy the MongoDB document (update name/email as needed)**

3. **Insert into MongoDB**

---

### ✏️ **Method 3: Edit Custom Creator**

1. **Open `custom-admin-creator.js` file**

2. **Edit the adminAccounts array:**
   ```javascript
   const adminAccounts = [
     {
       name: "Your Actual Name",
       email: "your.email@agrilink.lk", 
       password: "YourChosenPassword123!",  // ⬅️ Your password here
       phone: "+94771234567",
       role: "super_admin"
     }
   ];
   ```

3. **Run the creator:**
   ```bash
   node custom-admin-creator.js
   ```

---

## 🔐 **Password Requirements**

### **Recommended Password Format:**
- **Minimum 8 characters**
- **Include uppercase letters** (A-Z)
- **Include lowercase letters** (a-z) 
- **Include numbers** (0-9)
- **Include special characters** (!@#$%^&*)

### **Good Examples:**
- `MySecurePass2025!`
- `AdminPower123@`
- `SecureLogin456#`
- `StrongAuth789$`

### **Avoid:**
- Simple passwords like `password123`
- Personal info like birthdays
- Common words like `admin` or `test`

---

## 📋 **Complete Process Summary**

### **Step 1: Choose Your Method**
Pick from Interactive, Simple, or Custom creator

### **Step 2: Create Hashed Password** 
Run the chosen tool with your password

### **Step 3: MongoDB Insertion**
```
1. Open MongoDB Compass/Atlas
2. Navigate to AgriLink database
3. Go to "admins" collection
4. Insert the generated document
```

### **Step 4: Test Login**
```
1. Go to: http://localhost:3001/login
2. Email: [your chosen email]
3. Password: [your chosen password] 
4. Click "Sign In"
```

---

## ✅ **Verification**

After insertion, you should be able to login with:
- **Your chosen email address**
- **Your chosen plain text password** (NOT the hashed version)

The system will automatically hash your login password and compare it with the stored hash.

---

## 🆘 **Need Help?**

If you have issues:
1. Verify your MongoDB document was inserted correctly
2. Check that `isActive: true` in the document
3. Ensure you're using the plain password, not the hash
4. Try the interactive creator for the simplest experience
