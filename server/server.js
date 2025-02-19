const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');


const app = express();
const PORT = process.env.PORT 
const URL = process.env.MONGO_URL;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(URL)
  .then(() => {
    console.log('VELIXA Database connected');
  })
  .catch((err) => {
    console.error('Database connection failed', err);
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ "message": "VELIXA's SERVER" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});