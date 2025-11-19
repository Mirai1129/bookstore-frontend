const express = require('express');
const router = express.Router();

const bookRoutes = require('./bookRoutes');
const cartRoutes = require('./cartRoutes');
const configRoutes = require('./configRoutes');
const userRoutes = require('./userRoutes');


router.use(bookRoutes);
router.use(configRoutes);
router.use(userRoutes);
router.use(cartRoutes);


module.exports = router;