require('dotenv').config({path: '../.env'});

// imports
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// initial app
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('pages'));


// Routes settings
const apiRoutes = require('./routes/api');
const apiAuthRoutes = require('./routes/api/auth');
const apiBooksRoutes = require('./routes/api/books');
const apiCartRoutes = require('./routes/api/cart');


app.use('/api', apiRoutes);
app.use('/api/auth', apiAuthRoutes);
app.use('/api/book', apiBooksRoutes);
app.use('/api/cart', apiCartRoutes);
app.use(express.static('pages'));


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/templates', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/templates', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/templates', 'register.html'));
})


// connect to mongodb
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ Database connection error:', err));


// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
