const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

// Connect to database (commented out for demo without MongoDB)
// connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// View routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Accueil',
    message: 'Bienvenue sur la plateforme de multi-billeterie'
  });
});

app.get('/auth/login', (req, res) => {
  res.render('login', { title: 'Connexion' });
});

app.get('/auth/register', (req, res) => {
  res.render('register', { title: 'Inscription' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Tableau de bord' });
});

app.get('/events', (req, res) => {
  res.render('events', { title: 'Événements' });
});

app.get('/providers', (req, res) => {
  res.render('providers', { title: 'Prestataires' });
});

app.get('/tickets', (req, res) => {
  res.render('tickets', { title: 'Mes tickets' });
});

app.get('/profile', (req, res) => {
  res.render('profile', { title: 'Mon profil' });
});

app.get('/admin', (req, res) => {
  res.render('admin', { title: 'Administration Prestataire' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).render('404', {
    title: 'Page non trouvée',
    url: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Application disponible sur: http://localhost:${PORT}`);
});

module.exports = app;