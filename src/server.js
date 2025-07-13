const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const produitRoutes = require('./routes/produits');
const commandeRoutes = require('./routes/commandes');
const livraisonRoutes = require('./routes/livraisons');
const alerteStockRoutes = require('./routes/alertes_stock');
const categorieRoutes = require('./routes/categories');
const ligneCommandeRoutes = require('./routes/ligne_commande');
const rapportRoutes = require('./routes/rapports');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json()); // Parse JSON request bodies

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});