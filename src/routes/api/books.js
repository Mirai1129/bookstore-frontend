const express = require('express');
const router = express.Router();

// TODO: 實作 books
router.get('/', (req, res) => {
    res.json({res: ""});
})

router.post('/', (req, res) => {
    console.log("");
})

router.get('/:bookId', (req, res) => {
    res.json({res: ""});
})

router.put('/:bookId', (req, res) => {
    console.log("");
})

router.delete('/:bookId', (req, res) => {
    console.log("");
})

module.exports = router
