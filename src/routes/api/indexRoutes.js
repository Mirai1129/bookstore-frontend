const express = require('express');
const router = express.Router();

const bookRoutes = require('./bookRoutes');
const cartRoutes = require('./cartRoutes');
const configRoutes = require('./configRoutes');
const uploadRoutes = require('./uploadRoutes');
const userRoutes = require('./userRoutes');



router.use('/books', bookRoutes);
router.use(configRoutes);
router.use(userRoutes);
router.use('/cart', cartRoutes);
router.use('/upload', uploadRoutes);


module.exports = router;