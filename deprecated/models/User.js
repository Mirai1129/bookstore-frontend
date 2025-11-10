const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,  // 因為 Line 登入可自動生成
        trim: true
    },
    name: {
        type: String,
        required: false,  // 可選
        trim: true
    },
    email: {
        type: String,
        required: false,  // Line 登入可能沒有
        trim: true
    },
    password: {
        type: String,
        required: false  // Line 登入用不到密碼
    },
    lineId: {
        type: String,
        required: false,
        unique: true,
        sparse: true  // 避免唯一值索引衝突
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
