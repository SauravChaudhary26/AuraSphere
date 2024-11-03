const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routers
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');

// Load environment variables
dotenv.config();

// Connect to the database
require('./Models/db');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// Define routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
