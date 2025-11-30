const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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
console.log('PORT from .env:', process.env.PORT);
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);

// Initialize Express app
const app = express();

// CORS configuration - Allow all origins for production
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

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
console.log('Using PORT:', PORT);
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  console.log(`CORS autorisé pour: localhost:5173, localhost:3000, *.vercel.app`);
});