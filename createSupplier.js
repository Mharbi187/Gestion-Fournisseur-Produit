const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createSupplier() {
  try {
    await mongoose.connect('mongodb://localhost:27017/backend-libraries');
    
    const hashedPassword = await bcrypt.hash('Fournisseur123!', 12);
    
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'fournisseur@livrini.com' },
      { 
        $set: { 
          mdp: hashedPassword, 
          role: 'fournisseur',
          nom: 'Supplier',
          prenom: 'LIVRINI',
          adresse: 'Sfax, Tunisia',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('\n========================================');
    console.log('    SUPPLIER (FOURNISSEUR) CREDENTIALS');
    console.log('========================================');
    console.log('  Email:    fournisseur@livrini.com');
    console.log('  Password: Fournisseur123!');
    console.log('========================================\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createSupplier();
