const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');
const produitRoutes = require('./src/routes/produitRoutes');
const commandeRoutes = require('./src/routes/commandeRoutes');
const livraisonRoutes = require('./src/routes/livraisonRoutes');
const alerteStockRoutes = require('./src/routes/alerteStockRoutes');
const categorieRoutes = require('./src/routes/categorieRoutes');
const ligneCommandeRoutes = require('./src/routes/ligneCommandeRoutes');
const rapportRoutes = require('./src/routes/rapportRoutes');

// Load environment variables
dotenv.config();
console.log('PORT from .env:', process.env.PORT); // Debug log
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI); // Debug log

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Define routes
app.get('/', (req, res) => res.send('Backend opérationnel'));
app.use('/api/users', userRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/livraisons', livraisonRoutes);
app.use('/api/alertes-stock', alerteStockRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/ligne-commande', ligneCommandeRoutes);
app.use('/api/rapports', rapportRoutes);

// Start server
const PORT = process.env.PORT || 5000;
console.log('Using PORT:', PORT); // Debug log
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});