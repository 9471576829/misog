// budgetbloom-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./backend/routes/auth'); // Import authentication routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Use authentication routes
app.use('/api/auth', authRoutes);

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('BudgetBloom Backend is running!');
});

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb+srv://ankapriya27:Ankapriya27@cluster0.wosimoc.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
   