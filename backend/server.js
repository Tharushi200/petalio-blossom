require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { connectDB } = require('./src/config/database');

// Import all models (registers associations)
require('./src/models/index');

// Import Routes
const authRoutes             = require('./src/routes/authRoutes');
const userRoutes             = require('./src/routes/userRoutes');
const flowerRoutes           = require('./src/routes/flowerRoutes');
const orderRoutes            = require('./src/routes/orderRoutes');
const inventoryRoutes        = require('./src/routes/inventoryRoutes');
const supplierCapacityRoutes = require('./src/routes/supplierCapacityRoutes');
const forecastRoutes         = require('./src/routes/forecastRoutes');

// ─── App Setup ────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🌸 Petalio Blossom API is running!', timestamp: new Date() });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/users',             userRoutes);
app.use('/api/flowers',           flowerRoutes);
app.use('/api/orders',            orderRoutes);
app.use('/api/inventory',         inventoryRoutes);
app.use('/api/supplier-capacity', supplierCapacityRoutes);
app.use('/api/forecasts',         forecastRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Petalio Blossom Backend running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`🔑 Health:   http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
