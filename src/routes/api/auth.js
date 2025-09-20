const express = require('express');
const router = express.Router();

// TODO: 實作 login 和 register
router.get('/login', (req, res) => {
    res.json({res: ""});
})

router.post('/register', (req, res) => {
    console.log("");
})

module.exports = router
