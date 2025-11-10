// eslint-disable-next-line import/order
const express = require('express');

const router = express.Router();
const multer = require('multer');

const bookController = require('../../controllers/bookController');
const upload = multer()

router.get('/books', bookController.getAllBooks);

router.get('/books/me', bookController.getMyBooks);

router.post('/books', bookController.createBook);

router.post('/predict', upload.any(), bookController.predictCondition)

router.route('/books/:id')
    .get(bookController.getBookById)
    .patch(bookController.updateBook)
    .delete(bookController.deleteBook);

module.exports = router;