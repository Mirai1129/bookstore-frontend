const express = require('express');
const router = express.Router();

const bookRoutes = require('./bookRoutes');
const configRoutes = require('./configRoutes');
const userRoutes = require('./userRoutes');


router.use(bookRoutes);
router.use(configRoutes);
router.use(userRoutes);


module.exports = router;