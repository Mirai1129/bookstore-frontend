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
    }, // 不加 enum，因為你用的是像 "90%" 這樣的自訂內容
    description: {
        type: String
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 參照 User 模型
        required: true
    },
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
