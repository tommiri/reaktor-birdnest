require('dotenv').config();

// Get port and database URI from .env
let PORT = process.env.PORT;
let MONGODB_URI = process.env.MONGODB_URI;

module.exports = {
  MONGODB_URI,
  PORT,
};
