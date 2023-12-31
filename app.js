
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoute');
const eventRoutes = require('./routes/eventRoute');
const transactionRoutes = require('./routes/transactionRoute');
const ticketRoutes = require('./routes/ticketRoutes');
const { blockIPs } = require('./middlewares/ipFilter');

app.use(blockIPs);
// Define the rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 500,                  // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply the rate limiter to all routes
app.use(apiLimiter);

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define routes
app.use('/api/ticket', ticketRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/event', eventRoutes);
app.use('/api', userRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; // Export the Express app

