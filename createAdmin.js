const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/backend-libraries');
    
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    // Try to update existing admin or create new one
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@livrini.com' },
      { 
        $set: { 
          mdp: hashedPassword, 
          role: 'admin',
          nom: 'Admin',
          prenom: 'LIVRINI',
          adresse: 'Tunis, Tunisia',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('\n========================================');
    console.log('    ADMIN CREDENTIALS');
    console.log('========================================');
    console.log('  Email:    admin@livrini.com');
    console.log('  Password: Admin123!');
    console.log('========================================\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
