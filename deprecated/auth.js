const express = require('express');
const router = express.Router();

const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require("./models/User");

// 您的 LINE Channel ID 和 Secret
const CHANNEL_ID = process.env.CHANNEL_ID;
// 您的 JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

// (您的 /login 路由保持不變)
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
        const lineId = lineProfile.sub;
        const name = lineProfile.name;
        const email = lineProfile.email; 

        let user = { lineId: lineId, name: name, email: email }; 

        // Step 3: 產生您自己的 JWT
        const payload = {
            userId: user.lineId, 
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Step 4: 回傳成功狀態與 token
        res.status(200).json({ success: true, token, message: 'Login successful.' });

    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error('LINE token verification failed:', error.response.data);
            return res.status(401).json({ success: false, message: 'Invalid or expired LINE token.' });
        }

        console.error('Login internal error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// 🔽🔽🔽 [ 🟢 修正 /register 路由 ] 🔽🔽🔽
router.post('/register', async (req, res) => {
  try {
    const { line_userId, username } = req.body; // 從前端接收 line_userId (這OK)

    if (!line_userId || !username) {
      return res.status(400).json({ error: '缺少 line_userId 或 username' });
    }
    
    // 🟢 修正：
    // 查詢資料庫時，使用 Model 定義的 'lineId'
    let user = await User.findOne({ lineId: line_userId });

    if (user) {
      // 找到了，更新名字並回傳
      user.username = username; // 確保名字是最新
      await user.save();
      res.json({ message: '使用者登入成功', user: user });
    } else {
      // 找不到，建立新使用者
      const newUser = new User({
        lineId: line_userId, // 🟢 修正：儲存到 'lineId' 欄位
        username: username,
      });
      await newUser.save();
      res.json({ message: '使用者註冊成功', user: newUser });
    }
  } catch (err) {
    console.error('❌ 註冊失敗:', err);
    res.status(500).json({ error: '伺服器註冊錯誤' });
  }
});

module.exports = router;