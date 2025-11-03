const express = require('express');
const router = express.Router();
const Book = require('../../models/Book');
const User = require('../../models/User');

// 取得所有書籍 (不變)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().populate('seller_id', 'username'); 
    res.json(books);
  } catch (err) {
    console.error('❌ 無法取得書籍資料:', err);
    res.status(500).json({ error: '伺服器錯誤，無法取得書籍資料' });
  }
});

// 🔽🔽🔽 [ 🟢 修正 / (POST) 新增書籍路由 ] 🔽🔽🔽
router.post('/', async (req, res) => {
  try {
    // [ 🟢 修正點 ]：從 req.body 解構出 image_url
    const { title, author, price, condition, seller_id, image_url } = req.body;

    if (!title || !author || !price || !seller_id) {
      return res.status(400).json({ error: '請提供完整書籍資料' });
    }

    // [ 🟢 修正點 ]：
    // 查詢資料庫時，使用 Model 定義的 'lineId'
    // (seller_id 變數的值是 "U...")
    const seller = await User.findOne({ lineId: seller_id }); 
    
    if (!seller) {
      // 如果 'auth' 步驟正確，這裡就不會出錯
      return res.status(400).json({ error: '找不到對應賣家' });
    }

    const newBook = new Book({
      title,
      author,
      price: Number(price),
      condition: condition || '尚未預測',
      seller_id: seller._id, // 這裡正確，使用 MongoDB 的 _id
      
      // [ 🟢 修正點 ]：
      // 使用從前端傳來的 image_url，如果沒有，才使用預設值
      image_url: image_url || 'static/images/default_book.png'
    });

    await newBook.save();
    res.json({ message: '書籍新增成功', book: newBook });
  } catch (err) {
    console.error('❌ 新增書籍失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，新增失敗' });
  }
});
// 🔼🔼🔼 [ 🟢 修正 / (POST) 新增書籍路由 ] 🔼🔼🔼


// 查詢單一本書 (不變)
router.get('/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ error: '找不到該書籍' });
    res.json(book);
  } catch (err) {
    console.error('❌ 查詢書籍失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，查詢失敗' });
  }
});

// 更新書籍 (不變)
router.put('/:bookId', async (req, res) => {
  try {
    const { title, author, price, condition } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (price) updateData.price = Number(price);
    if (condition) updateData.condition = condition;

    const updated = await Book.findByIdAndUpdate(req.params.bookId, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: '找不到該書籍' });
    res.json(updated);
  } catch (err) {
    console.error('❌ 更新書籍失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，更新失敗' });
  }
});

// 刪除書籍 (不變)
router.delete('/:bookId', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.bookId);
    if (!deleted) return res.status(404).json({ error: '找不到該書籍' });
    res.json({ message: '書籍刪除成功' });
  } catch (err) {
    console.error('❌ 刪除書籍失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，刪除失敗' });
  }
});

module.exports = router;