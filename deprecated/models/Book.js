const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        required: true
    }, // 不加 enum，因為你用的是自訂書況
    description: {
        type: String
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 圖片欄位
    front: {
        type: String
    },
    spine: {
        type: String
    },
    back: {
        type: String
    },
    // 原本封面 fallback
    image_url: {
        type: String
    },
    is_sold: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);
