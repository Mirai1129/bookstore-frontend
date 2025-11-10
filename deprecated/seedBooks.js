const mongoose = require('mongoose');
const Book = require('./models/Book'); // ← 改這裡
require('dotenv').config({ path: './.env' });

// 連線到 MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Database connection error:', err));

async function seed() {
  try {
    const books = [
      {
        title: "Node.js 入門",
        author: "林萱",
        price: 300,
        condition: "全新",
        description: "一本教你 Node.js 的書",
        seller_id: new mongoose.Types.ObjectId(),
        image_url: "https://via.placeholder.com/100x140",
      },
      {
        title: "MongoDB 實戰",
        author: "李大仁",
        price: 350,
        condition: "9成新",
        description: "從零開始學 MongoDB",
        seller_id: new mongoose.Types.ObjectId(),
        image_url: "https://via.placeholder.com/100x140",
      },
      {
        title: "前端設計入門",
        author: "王小明",
        price: 280,
        condition: "全新",
        description: "HTML + CSS + JS 基礎",
        seller_id: new mongoose.Types.ObjectId(),
        image_url: "https://via.placeholder.com/100x140",
      },
    ];

    await Book.insertMany(books);
    console.log("✅ 測試書籍已新增完成！");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
