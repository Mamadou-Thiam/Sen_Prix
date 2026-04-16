if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: __dirname + '/.env' });
}

if (!process.env.JWT_SECRET) {
  console.error('ERREUR: JWT_SECRET non défini');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const marketRoutes = require('./routes/markets');
const alertRoutes = require('./routes/alerts');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const priceRoutes = require('./routes/prices');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/prices', priceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SénPrix API est en ligne' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
