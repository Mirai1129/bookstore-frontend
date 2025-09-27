const express = require('express');
const router = express.Router();

const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require("../../models/User");
// TODO: 實作 login 和 register

// 您的 LINE Channel ID 和 Secret
const CHANNEL_ID = process.env.CHANNEL_ID;
// 您的 JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { lineLiffToken } = req.body;

    if (!lineLiffToken) {
        return res.status(400).json({ success: false, message: 'Missing LINE LIFF token.' });
    }

    try {
        // Step 1: 驗證 LINE LIFF ID Token
        const verifyRes = await axios.post('https://api.line.me/oauth2/v2.1/verify', null, {
            params: {
                id_token: lineLiffToken,
                client_id: CHANNEL_ID
            }
        });

        const lineProfile = verifyRes.data;
        // sub 就是 Line User ID
        const lineId = lineProfile.sub;
        const name = lineProfile.name;
        const email = lineProfile.email; // 注意：需要 LIFF scope 中有 email 權限

        // 在此步驟，我們已確認 Token 有效，且 lineId 是真實的。
        // 您可以忽略前端傳送的 lineId, name, email，而改用從 LINE 驗證服務取得的資料，這樣更安全。

        // Step 2: 檢查使用者是否存在於您的資料庫
        // 舉例：使用您的 ORM 或資料庫查詢
        // const user = await User.findOne({ lineId: lineId });
        let user = { lineId: lineId, name: name, email: email }; // 假設這是在資料庫中找到或建立的使用者物件

        // TODO: create user in database
        // if (!user) {
        //     // 如果使用者不存在，則建立新帳號
        //     user = await User.create({ lineId, name, email });
        //     console.log('New user created:', user);
        // }

        // Step 3: 產生您自己的 JWT
        // JWT Payload 應該包含使用者在您系統中的識別資訊
        const payload = {
            userId: user.lineId, // 使用 LINE ID 作為識別
            // 您也可以加入其他資訊，例如 user.role 等
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Step 4: 回傳成功狀態與 token
        res.status(200).json({ success: true, token, message: 'Login successful.' });

    } catch (error) {
        // 處理 Token 驗證失敗或其他錯誤
        if (error.response && error.response.status === 400) {
            // LINE 伺服器回傳 400，通常是 Token 無效或過期
            console.error('LINE token verification failed:', error.response.data);
            return res.status(401).json({ success: false, message: 'Invalid or expired LINE token.' });
        }

        console.error('Login internal error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.post('/register', (req, res) => {
    console.log("");
})

module.exports = router
