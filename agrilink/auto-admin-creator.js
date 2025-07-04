// auto-admin-creator.js - Automatic Admin Creator with Database Insertion
// Usage: node auto-admin-creator.js

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sandali:Sandali6254560@mspace.bhha4ao.mongodb.net/Agrilink?retryWrites=true&w=majority&appName=mSpace';

// Admin Schema (inline definition)
const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin',
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_products',
      'manage_prices',
      'view_analytics',
      'send_notifications',
      'manage_settings',
      'manage_admins'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

console.log('🚀 AgriLink Automatic Admin Creator');
console.log('===================================\n');

// Admin accounts to create automatically
const adminAccounts = [
  {
    name: "Sandali Jayawardhana",
    email: "sandali@agrilink.lk",
    password: "SandaliAdmin2025!",
    phone: "+94771234567",
    role: "super_admin"
  },
  {
    name: "System Administrator", 
    email: "admin@agrilink.lk",
    password: "AgriLinkAdmin2025!",
    phone: "+94771234568", 
    role: "admin"
  },
  {
    name: "Support Manager",
    email: "support@agrilink.lk", 
    password: "SupportAdmin2025!",
    phone: "+94771234569",
    role: "admin"
  }
];

async function createAdminInDatabase(adminData) {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`⚠️  Admin with email ${adminData.email} already exists. Skipping...`);
      return null;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create admin document
    const admin = new Admin({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      phone: adminData.phone,
      role: adminData.role,
      permissions: adminData.role === "super_admin" ? [
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
    console.error(`❌ Error creating admin ${adminData.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function dbConnect() {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function autoCreateAdmins() {
  try {
    console.log('🔗 Connecting to database...');
    await dbConnect();

    console.log('🔄 Creating admin accounts in database...\n');
    
    const results = [];
    
    for (const adminData of adminAccounts) {
      console.log(`📝 Creating ${adminData.name}...`);
      
      const result = await createAdminInDatabase(adminData);
      
      if (result && result.success) {
        console.log(`✅ ${adminData.name} created successfully!`);
        results.push(result);
      } else if (result && !result.success) {
        console.log(`❌ Failed to create ${adminData.name}: ${result.error}`);
      }
    }

    console.log('\n🎉 Admin creation process completed!');
    console.log('===================================\n');

    if (results.length > 0) {
      console.log('📊 Successfully Created Admin Accounts:');
      console.log('=======================================');
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.admin.name}`);
        console.log(`   📧 Email: ${result.credentials.email}`);
        console.log(`   🔐 Password: ${result.credentials.password}`);
        console.log(`   👤 Role: ${result.admin.role}`);
        console.log(`   📱 Phone: ${result.admin.phone}`);
        console.log(`   🆔 Database ID: ${result.admin._id}\n`);
      });

      console.log('🚀 Ready to Login!');
      console.log('==================');
      console.log('1. Go to: http://localhost:3001/login');
      console.log('2. Use any of the email/password combinations above');
      console.log('3. You will be redirected to the admin dashboard');
      
      console.log('\n✨ All admin accounts are now active in the database!');
    } else {
      console.log('⚠️  No new admin accounts were created.');
      console.log('This might be because they already exist in the database.');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('===================');
    console.log('1. Check your MongoDB connection string in .env.local');
    console.log('2. Ensure MongoDB server is running');
    console.log('3. Verify network connectivity');
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    }
    process.exit(0);
  }
}

// Start automatic admin creation
autoCreateAdmins();
