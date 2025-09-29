// custom-admin-creator.js - Customizable Admin Creator
// Edit the admin accounts below with your desired details

const bcrypt = require('bcryptjs');

console.log('🎯 AgriLink Custom Admin Creator');
console.log('=================================\n');

// 📝 EDIT THESE ADMIN ACCOUNTS WITH YOUR DESIRED DETAILS:
const adminAccounts = [
  {
    name: "Your Name Here",                    // ⬅️ Change this
    email: "youremail@agrilink.lk",           // ⬅️ Change this
    password: "YourChosenPassword123!",        // ⬅️ Change this
    phone: "+94771234567",                     // ⬅️ Change this
    role: "super_admin"
  },
  {
    name: "Second Admin Name",                 // ⬅️ Change this
    email: "admin2@agrilink.lk",              // ⬅️ Change this
    password: "SecondAdminPassword456!",       // ⬅️ Change this
    phone: "+94771234568",                     // ⬅️ Change this
    role: "admin"
  }
  // Add more admin accounts here if needed
];

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createCustomAdmins() {
  console.log('🔄 Generating hashed passwords for your custom admin accounts...\n');
  
  const mongoDocuments = [];
  
  for (let i = 0; i < adminAccounts.length; i++) {
    const admin = adminAccounts[i];
    
    console.log(`📝 Processing ${admin.name}...`);
    
    try {
      const hashedPassword = await hashPassword(admin.password);
      
      const mongoDocument = {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        phone: admin.phone,
        role: admin.role,
        permissions: admin.role === "super_admin" ? [
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mongoDocuments.push(mongoDocument);
      console.log(`✅ ${admin.name} - Generated successfully`);
      
    } catch (error) {
      console.error(`❌ Error processing ${admin.name}:`, error);
    }
  }
  
  console.log('\n🎉 All custom admin accounts generated successfully!');
  console.log('===================================================\n');
  
  console.log('📋 MongoDB Documents (Insert these into "admins" collection):');
  console.log('============================================================');
  
  mongoDocuments.forEach((doc, index) => {
    console.log(`\n--- Admin ${index + 1}: ${doc.name} ---`);
    console.log(JSON.stringify(doc, null, 2));
  });
  
  console.log('\n📊 Your Custom Login Credentials:');
  console.log('=================================');
  adminAccounts.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
    console.log(`   Role: ${admin.role}\n`);
  });
  
  console.log('🚀 Instructions:');
  console.log('================');
  console.log('1. Copy each MongoDB document above');
  console.log('2. Insert them into your MongoDB "admins" collection');
  console.log('3. Test login with your custom credentials');
  console.log('4. Go to: http://localhost:3001/login');
  
  console.log('\n💡 To create different admins:');
  console.log('==============================');
  console.log('1. Edit the adminAccounts array at the top of this file');
  console.log('2. Change names, emails, passwords, and phones');
  console.log('3. Run: node custom-admin-creator.js');
}

// Start custom creation
createCustomAdmins();
