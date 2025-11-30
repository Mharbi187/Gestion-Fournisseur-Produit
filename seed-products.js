const mongoose = require('mongoose');
require('dotenv').config();

const Produit = require('./src/models/Produit');
const Categorie = require('./src/models/Categorie');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backend-libraries';

// Valid working Unsplash images for each category
const productData = {
  Electronique: [
    {
      nom: 'iPhone 15 Pro Max',
      description: 'Le dernier smartphone Apple avec puce A17 Pro, écran Super Retina XDR 6.7 pouces, et système de caméra professionnelle.',
      prix: 4599,
      quantiteStock: 25,
      imageURL: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'MacBook Pro M3',
      description: 'Ordinateur portable Apple avec puce M3, 16 Go RAM, écran Liquid Retina XDR 14 pouces.',
      prix: 6999,
      quantiteStock: 15,
      imageURL: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Samsung Galaxy S24 Ultra',
      description: 'Smartphone Android premium avec S Pen, caméra 200MP et écran AMOLED 6.8 pouces.',
      prix: 3899,
      quantiteStock: 30,
      imageURL: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Sony WH-1000XM5',
      description: 'Casque audio sans fil premium avec réduction de bruit active et 30h d\'autonomie.',
      prix: 899,
      quantiteStock: 50,
      imageURL: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'iPad Pro 12.9"',
      description: 'Tablette Apple avec puce M2, écran Liquid Retina XDR, compatible Apple Pencil.',
      prix: 3499,
      quantiteStock: 20,
      imageURL: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Apple Watch Ultra 2',
      description: 'Montre connectée robuste avec GPS, boussole et autonomie jusqu\'à 36 heures.',
      prix: 2799,
      quantiteStock: 35,
      imageURL: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'DJI Mini 4 Pro',
      description: 'Drone compact avec caméra 4K, détection d\'obstacles et 34 min de vol.',
      prix: 2599,
      quantiteStock: 12,
      imageURL: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'PlayStation 5',
      description: 'Console de jeu nouvelle génération avec SSD ultra-rapide et ray tracing.',
      prix: 1699,
      quantiteStock: 8,
      imageURL: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    }
  ],
  Vêtement: [
    {
      nom: 'Veste en Cuir Premium',
      description: 'Veste en cuir véritable, coupe moderne, doublure intérieure confortable.',
      prix: 599,
      quantiteStock: 40,
      imageURL: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Sneakers Nike Air Max',
      description: 'Chaussures de sport confortables avec technologie Air Max pour un amorti optimal.',
      prix: 449,
      quantiteStock: 60,
      imageURL: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Jean Slim Fit',
      description: 'Jean denim de qualité supérieure, coupe slim moderne et confortable.',
      prix: 189,
      quantiteStock: 80,
      imageURL: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Chemise Business',
      description: 'Chemise élégante en coton égyptien, parfaite pour le bureau.',
      prix: 159,
      quantiteStock: 55,
      imageURL: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Montre Classique',
      description: 'Montre élégante avec bracelet en cuir et cadran minimaliste.',
      prix: 299,
      quantiteStock: 45,
      imageURL: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Sac à Dos Urbain',
      description: 'Sac à dos moderne avec compartiment laptop et design waterproof.',
      prix: 249,
      quantiteStock: 70,
      imageURL: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Pull en Cachemire',
      description: 'Pull doux et chaud en cachemire 100% naturel, coupe regular.',
      prix: 399,
      quantiteStock: 25,
      imageURL: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Lunettes de Soleil',
      description: 'Lunettes de soleil polarisées avec protection UV400 et monture légère.',
      prix: 179,
      quantiteStock: 90,
      imageURL: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    }
  ],
  Alimentation: [
    {
      nom: 'Café Arabica Premium',
      description: 'Café en grains 100% Arabica, torréfaction artisanale, notes de chocolat.',
      prix: 45,
      quantiteStock: 200,
      imageURL: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Huile d\'Olive Extra Vierge',
      description: 'Huile d\'olive tunisienne première pression à froid, 1L.',
      prix: 35,
      quantiteStock: 150,
      imageURL: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Miel Bio de Montagne',
      description: 'Miel naturel bio récolté dans les montagnes tunisiennes, 500g.',
      prix: 55,
      quantiteStock: 100,
      imageURL: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Dattes Deglet Nour',
      description: 'Dattes premium de Tozeur, naturellement sucrées, 1kg.',
      prix: 28,
      quantiteStock: 180,
      imageURL: 'https://images.unsplash.com/photo-1593904308268-b1e256b909f8?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Thé Vert Bio',
      description: 'Thé vert bio de qualité supérieure, riche en antioxydants.',
      prix: 22,
      quantiteStock: 120,
      imageURL: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Chocolat Noir 85%',
      description: 'Chocolat noir artisanal 85% cacao, origine Équateur.',
      prix: 18,
      quantiteStock: 200,
      imageURL: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Amandes Grillées',
      description: 'Amandes méditerranéennes grillées et légèrement salées, 500g.',
      prix: 32,
      quantiteStock: 90,
      imageURL: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Harissa Traditionnelle',
      description: 'Harissa tunisienne traditionnelle aux piments séchés, 200g.',
      prix: 12,
      quantiteStock: 250,
      imageURL: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    }
  ],
  Meuble: [
    {
      nom: 'Canapé Scandinave 3 Places',
      description: 'Canapé moderne en tissu avec pieds en bois massif, confort optimal.',
      prix: 1899,
      quantiteStock: 10,
      imageURL: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Bureau en Bois Massif',
      description: 'Bureau élégant en chêne massif avec tiroirs de rangement.',
      prix: 799,
      quantiteStock: 15,
      imageURL: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Chaise Design Ergonomique',
      description: 'Chaise de bureau ergonomique avec support lombaire réglable.',
      prix: 499,
      quantiteStock: 30,
      imageURL: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Table Basse Moderne',
      description: 'Table basse en verre trempé et acier inoxydable.',
      prix: 349,
      quantiteStock: 20,
      imageURL: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Étagère Murale',
      description: 'Étagère flottante en bois avec fixations invisibles.',
      prix: 129,
      quantiteStock: 50,
      imageURL: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Lampe de Bureau LED',
      description: 'Lampe LED avec variateur d\'intensité et bras articulé.',
      prix: 89,
      quantiteStock: 60,
      imageURL: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Lit King Size',
      description: 'Lit en bois avec tête de lit capitonnée, 180x200cm.',
      prix: 2499,
      quantiteStock: 8,
      imageURL: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Miroir Décoratif',
      description: 'Grand miroir rond avec cadre doré, diamètre 80cm.',
      prix: 199,
      quantiteStock: 25,
      imageURL: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    }
  ],
  Fitness: [
    {
      nom: 'Tapis de Yoga Premium',
      description: 'Tapis de yoga antidérapant 6mm, matériaux écologiques.',
      prix: 79,
      quantiteStock: 100,
      imageURL: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Haltères Réglables',
      description: 'Paire d\'haltères réglables de 2.5kg à 24kg chacun.',
      prix: 399,
      quantiteStock: 25,
      imageURL: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Vélo d\'Appartement',
      description: 'Vélo spinning avec écran LCD et résistance magnétique.',
      prix: 899,
      quantiteStock: 12,
      imageURL: 'https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Bandes de Résistance',
      description: 'Set de 5 bandes élastiques avec différentes résistances.',
      prix: 45,
      quantiteStock: 150,
      imageURL: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Corde à Sauter Pro',
      description: 'Corde à sauter avec compteur digital et poignées ergonomiques.',
      prix: 35,
      quantiteStock: 80,
      imageURL: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Kettlebell 16kg',
      description: 'Kettlebell en fonte avec revêtement vinyle antidérapant.',
      prix: 89,
      quantiteStock: 40,
      imageURL: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Tapis de Course',
      description: 'Tapis de course pliable avec inclinaison et programmes intégrés.',
      prix: 1299,
      quantiteStock: 8,
      imageURL: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    },
    {
      nom: 'Gourde Sport 1L',
      description: 'Gourde isotherme en acier inoxydable, garde froid 24h.',
      prix: 29,
      quantiteStock: 200,
      imageURL: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
      statutProduit: 'Disponible'
    }
  ]
};

// Category images
const categoryImages = {
  Electronique: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=500&fit=crop',
  Vêtement: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop',
  Alimentation: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=500&h=500&fit=crop',
  Meuble: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
  Fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop'
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop problematic index if exists
    try {
      await mongoose.connection.collection('categories').dropIndex('nomCategorie_1');
      console.log('🗑️  Dropped old index');
    } catch (e) {
      // Index doesn't exist, continue
    }

    // Find or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ role: 'fournisseur' });
    }
    if (!admin) {
      admin = await User.findOne();
    }
    
    if (!admin) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    
    console.log(`📝 Using user: ${admin.email} as creator`);

    // Clear existing products
    await Produit.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Create or update categories
    const categoryMap = {};
    for (const [type, image] of Object.entries(categoryImages)) {
      let category = await Categorie.findOne({ type });
      if (!category) {
        category = await Categorie.create({
          nom: type,
          description: `Catégorie ${type} - Découvrez notre sélection de produits ${type.toLowerCase()}`,
          type,
          image,
          createdBy: admin._id
        });
        console.log(`✅ Created category: ${type}`);
      } else {
        category.image = image;
        await category.save();
        console.log(`📝 Updated category: ${type}`);
      }
      categoryMap[type] = category._id;
    }

    // Create products
    let totalProducts = 0;
    for (const [categoryType, products] of Object.entries(productData)) {
      const categoryId = categoryMap[categoryType];
      if (!categoryId) {
        console.log(`⚠️  Category not found: ${categoryType}`);
        continue;
      }

      for (const product of products) {
        await Produit.create({
          ...product,
          categorie: categoryId,
          fournisseur: admin._id
        });
        totalProducts++;
      }
      console.log(`✅ Added ${products.length} products to ${categoryType}`);
    }

    console.log(`\n🎉 Successfully seeded ${totalProducts} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
