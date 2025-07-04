// interactive-auto-admin.js - Interactive Admin Creator with Auto Database Save
// Usage: node interactive-auto-admin.js

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const readline = require('readline');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sandali:Sandali6254560@mspace.bhha4ao.mongodb.net/Agrilink?retryWrites=true&w=majority&appName=mSpace';

// Admin Schema (inline definition)
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function dbConnect() {
  try {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AgriLink Interactive Auto Admin Creator');
console.log('==========================================');
console.log('✨ This tool will create admin accounts and save them directly to the database!\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdminInDatabase(adminData) {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      return { 
        success: false, 
        error: `Admin with email ${adminData.email} already exists in database` 
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create admin document
    const admin = new Admin({
      name: adminData.name,
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      phone: adminData.phone,
      role: adminData.role || "admin",
      permissions: (adminData.role === "super_admin") ? [
        "manage_users",
        "manage_products",
        "manage_prices", 
        "view_analytics",
        "send_notifications",
        "manage_settings",
        "manage_admins"
      ] : [
        "manage_users",
        "view_analytics",
        "send_notifications",
        "manage_settings"
      ],
      isActive: true
    });

    // Save to database
    const savedAdmin = await admin.save();
    
    return {
      success: true,
      admin: savedAdmin,
      credentials: {
        email: adminData.email,
        password: adminData.password
      }
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createInteractiveAdmin() {
  try {
    console.log('📝 Please provide the admin details:\n');
    
    const name = await askQuestion('👤 Admin Name: ');
    const email = await askQuestion('📧 Email Address: ');
    const password = await askQuestion('🔐 Password: ');
    const phone = await askQuestion('📱 Phone Number: ');
    
    console.log('\n👑 Role Selection:');
    console.log('1. super_admin (Full access to everything)');
    console.log('2. admin (Limited permissions)');
    const roleChoice = await askQuestion('Select role (1 or 2): ');
    
    const role = roleChoice === '1' ? 'super_admin' : 'admin';
    
    console.log('\n🔗 Connecting to database...');
    await dbConnect();
    console.log('✅ Database connected!');
    
    console.log('\n🔄 Creating admin account in database...');
    
    const adminData = {
      name: name || "Admin User",
      email: email || "admin@agrilink.lk",
      password: password || "DefaultPassword123!",
      phone: phone || "+94771234567",
      role: role
    };
    
    const result = await createAdminInDatabase(adminData);
    
    if (result.success) {
      console.log('\n🎉 Admin Account Created Successfully!');
      console.log('====================================');
      
      console.log('\n📊 Admin Details:');
      console.log('=================');
      console.log(`👤 Name: ${result.admin.name}`);
      console.log(`📧 Email: ${result.admin.email}`);
      console.log(`📱 Phone: ${result.admin.phone}`);
      console.log(`👑 Role: ${result.admin.role}`);
      console.log(`🆔 Database ID: ${result.admin._id}`);
      console.log(`📅 Created: ${result.admin.createdAt}`);
      
      console.log('\n🔑 Login Credentials:');
      console.log('====================');
      console.log(`📧 Email: ${result.credentials.email}`);
      console.log(`🔐 Password: ${result.credentials.password}`);
      
      console.log('\n🔐 Permissions:');
      console.log('===============');
      result.admin.permissions.forEach((permission, index) => {
        console.log(`${index + 1}. ${permission.replace(/_/g, ' ').toUpperCase()}`);
      });
      
      console.log('\n🚀 Ready to Use!');
      console.log('================');
      console.log('1. Go to: http://localhost:3001/login');
      console.log(`2. Email: ${result.credentials.email}`);
      console.log(`3. Password: ${result.credentials.password}`);
      console.log('4. Click "Sign In"');
      console.log('5. You will be redirected to the admin dashboard!');
      
      console.log('\n✅ Admin account is now active in the database!');
      
    } else {
      console.log('\n❌ Failed to Create Admin Account');
      console.log('=================================');
      console.log(`Error: ${result.error}`);
      
      if (result.error.includes('already exists')) {
        console.log('\n💡 Suggestion: Try with a different email address');
      }
    }
    
    const createAnother = await askQuestion('\n❓ Create another admin? (y/n): ');
    if (createAnother.toLowerCase() === 'y' || createAnother.toLowerCase() === 'yes') {
      console.log('\n' + '='.repeat(60) + '\n');
      await createInteractiveAdmin();
    } else {
      console.log('\n🎉 Admin creation complete! 🚀');
    }
    
  } catch (error) {
    console.error('\n❌ Error during admin creation:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('===================');
    console.log('1. Check MongoDB connection');
    console.log('2. Verify .env.local configuration');
    console.log('3. Ensure database is accessible');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    }
    rl.close();
  }
}

// Start interactive admin creation
createInteractiveAdmin();
