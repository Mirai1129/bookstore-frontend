const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// initial app
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('pages'));


// Routes settings
const apiRoutes = require('../src/routes/api/indexRoutes');
const apiAuthRoutes = require('./auth');
const apiBooksRoutes = require('./books');
const apiCartRoutes = require('./cart');


app.use('/api', apiRoutes);
app.use('/api/auth', apiAuthRoutes);
app.use('/api/book', apiBooksRoutes);
app.use('/api/cart', apiCartRoutes);
app.use(express.static('pages'));


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/templates', 'index.html'));
});

app.get('/book', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/templates', 'book.html'));
})

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/templates', 'cart.html'));
})


// connect to mongodb
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ Database connection error:', err));


// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
