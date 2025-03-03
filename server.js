// Load environment variables first
require('dotenv').config();

// Import app after environment variables are loaded
const app = require('./app');

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});