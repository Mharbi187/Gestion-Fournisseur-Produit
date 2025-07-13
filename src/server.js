const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

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

// Start server
const PORT = process.env.PORT || 3000; // Fallback port if not defined
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});