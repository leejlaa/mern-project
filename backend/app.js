const express = require('express');
const bodyParser = require('body-parser');
const places = require('./routes/places-routes');
const HttpError = require('./models/http-error');
const users = require('./routes/users-routes');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Serve static files
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// Handle OPTIONS preflight request
app.options('*', (req, res) => {
  res.sendStatus(200); // Respond OK to all OPTIONS requests
});

// Routes
app.use('/api/places', places);
app.use('/api/users', users);

// Handle 404 - Not Found
app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || 'An unknown error occurred' });
});

// MongoDB connection
mongoose.connect(
  `mongodb+srv://lejla:lejla2003doric@cluster0.frey9wn.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0`
)
.then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
