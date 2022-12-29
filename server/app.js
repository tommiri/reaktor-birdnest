const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const config = require('./utils/config');
const logger = require('./utils/logger');

const app = express();
app.use(cors());
app.use(express.static('dist'));

logger.info('Connecting to', config.MONGODB_URI);

// Connecting to MongoDB database
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB!');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

module.exports = app;
