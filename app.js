const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const errorHandler = require('./utils/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Session middleware
app.use(require('express-session')({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await require('./models/User').findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Initialize Passport strategies
require('./config/oauth')();

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/media', require('./routes/media'));
app.use('/api/publish', require('./routes/publish'));
app.use('/api/public', require('./routes/public'));

// Base route
app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to Portfolium API' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;