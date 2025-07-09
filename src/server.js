const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
dotenv.config();
const app = express();
app.user(express.json());
connectDB();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Backend opérationnel'));
app.use('/api/users', userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${process.env.PORT}`);
});


