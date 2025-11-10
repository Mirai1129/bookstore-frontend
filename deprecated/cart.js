const express = require('express');
const router = express.Router();

// TODO: 實作 cart
router.get('/', (req, res) => {
    res.json({res: ""});
})

router.post('/', (req, res) => {
    console.log("");
})

router.put('/', (req, res) => {
    console.log("");
})

router.delete('/', (req, res) => {
    console.log("");
})

router.get('/:userId', (req, res) => {
    res.json({res: ""});
})

router.post('/checkout', (req, res) => {
    console.log("");
})



module.exports = router
