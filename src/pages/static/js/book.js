// 🟢 book.js (已加入 編輯/刪除 功能 - 基於您上傳的 HTML)
import { getLiffId, getWebUrl } from "./config.js";

// (保留您原本的 AI_SERVER_URL 設定 - Wi-Fi 或 127.0.0.1)
const AI_SERVER_URL = "http://127.0.0.1:8000";

/**
 * 步驟 1: 初始化 LIFF (不變)
 */
async function initBookLiffApp() {
  const profile = await liff.getProfile();
  // 檢查元素是否存在再更新
  const userPic = document.getElementById("user-picture");
  const userName = document.getElementById("user-name");
  const userIdElem = document.getElementById("user-id");
  if(userPic) userPic.src = profile.pictureUrl;
  if(userName) userName.innerText = profile.displayName;
  if (userIdElem) userIdElem.innerText = profile.userId;

  try {
    const authRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line_userId: profile.userId, // 前端傳送 line_userId
        username: profile.displayName,
      }),
    });
    if (!authRes.ok) {
      const errData = await authRes.json();
      console.error("後端使用者註冊/登入失敗:", errData.error);
      alert(`無法同步使用者資料：${errData.error}`);
      return false;
    }
    const authData = await authRes.json();
    console.log("使用者登入/註冊成功:", authData.message);
    return true;
  } catch (err) {
    console.error("❌ 呼叫 Auth API 失敗:", err);
    alert("無法連線至使用者認證伺服器。");
    return false;
  }
}

/**
 * 載入書籍清單
 * [ 🟢 已修改 ]：按鈕加入 data-id 和 class
 */
async function loadBooks() {
  const container = document.getElementById('myBooksList');
  if (!container) {
    console.error("找不到 'myBooksList' 容器");
    return;
  }
  try {
    const response = await fetch("/api/book"); // 取得書單 API
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const books = await response.json();
    container.innerHTML = ""; // 清空現有列表
    if (!books.length) {
      container.innerHTML = "<p>目前沒有上架的書籍。</p>";
      return;
    }
    books.forEach((b) => {
      if (!b || !b._id) {
          console.error("錯誤：收到的書籍資料缺少 _id:", b);
          return; // 跳過這筆錯誤資料
      }
      const el = document.createElement('div');
      el.className = 'book'; // 您原本的 class
      // 🔽🔽🔽 [ 🟢 修改點：確認按鈕有 class 和 data-id ] 🔽🔽🔽
      // 加入 class="edit-btn" 和 class="delete-btn" 以便 JS 識別
      el.innerHTML = `
        <img src="${b.image_url || 'static/images/default_book.png'}" alt="${b.title || '書籍封面'}" />
        <h4>${b.title || '未知書名'}</h4>
        <p><small>作者：${b.author || '未知作者'}</small></p>
        <p>AI書況預測: ${b.condition || '尚未預測'}</p>
        <div class="row">
          <div>NT$ ${b.price || '?'}</div>
          <div>
            <button class="edit-btn" data-id="${b._id}">編輯</button>
            <button class="delete-btn" data-id="${b._id}">刪除</button>
          </div>
        </div>
      `;
      // 🔼🔼🔼 [ 🟢 修改點 ] 🔼🔼🔼
      container.appendChild(el);
    });
  } catch (err) {
    console.error("❌ 無法載入書籍資料：", err);
    container.innerHTML = "<p>無法載入書籍資料，請稍後再試。</p>";
  }
}

// [ 🟢 新增的函式 (刪除) ]
async function deleteBook(id) {
  if (!id) {
      console.error("刪除錯誤：未提供 ID");
      return alert("刪除時發生錯誤");
  }
  if (!confirm('您確定要刪除這本書嗎？此動作無法復原。')) {
    return;
  }
  try {
    const res = await fetch(`/api/book/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('書籍刪除成功！');
      loadBooks();
    } else {
      const err = await res.json();
      console.error('刪除失敗:', err);
      alert(`刪除失敗： ${err.error || '未知錯誤'}`);
    }
  } catch (err) {
    console.error('❌ 刪除時發生錯誤:', err);
    alert('刪除時發生錯誤');
  }
}

// [ 🟢 新增的函式 (開啟編輯) ]
async function openEditModal(id) {
  if (!id) {
      console.error("編輯錯誤：未提供 ID");
      return alert("開啟編輯時發生錯誤");
  }
  try {
    // 1. 取得資料
    const res = await fetch(`/api/book/${id}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`無法取得書籍資料： ${errorData.error || res.statusText}`);
    }
    const book = await res.json();

    // 2. 填入表單 (使用編輯 Modal 的 ID)
    const editBookIdInput = document.getElementById('editBookId');
    const editBookTitleInput = document.getElementById('editBookTitle');
    const editBookAuthorInput = document.getElementById('editBookAuthor');
    const editBookPriceInput = document.getElementById('editBookPrice');
    const editBookConditionInput = document.getElementById('editBookCondition');

    // 增加檢查確保元素存在
    if (editBookIdInput) editBookIdInput.value = book._id; else console.error("HTML 錯誤: 找不到 'editBookId'");
    if (editBookTitleInput) editBookTitleInput.value = book.title || ''; else console.error("HTML 錯誤: 找不到 'editBookTitle'");
    if (editBookAuthorInput) editBookAuthorInput.value = book.author || ''; else console.error("HTML 錯誤: 找不到 'editBookAuthor'");
    if (editBookPriceInput) editBookPriceInput.value = book.price || ''; else console.error("HTML 錯誤: 找不到 'editBookPrice'");
    if (editBookConditionInput) editBookConditionInput.value = book.condition || ''; else console.error("HTML 錯誤: 找不到 'editBookCondition'");

    // 3. 顯示 Modal (使用編輯 Modal 的 ID)
    const editModal = document.getElementById('editModalOverlay');
    if (editModal) editModal.style.display = 'flex'; else console.error("HTML 錯誤: 找不到 'editModalOverlay'");

  } catch (err) {
    console.error('❌ 開啟編輯時發生錯誤:', err);
    alert(`開啟編輯時發生錯誤: ${err.message}`);
  }
}

/**
 * 步驟 2: 上架書籍 (沿用您原本的邏輯，加上更詳細的錯誤處理)
 */
const uploadBtn = document.getElementById("uploadBtn");
if (uploadBtn) {
    uploadBtn.addEventListener("click", async () => {
      // 從「新增視窗」獲取資料
      const titleInput = document.getElementById("bookTitle");
      const authorInput = document.getElementById("bookAuthor");
      const priceInput = document.getElementById("bookPrice");
      const frontInput = document.getElementById("bookFrontInput");
      const spineInput = document.getElementById("bookSpineInput");
      const backInput = document.getElementById("bookBackInput");
      const userIdElem = document.getElementById("user-id");
      const resultDiv = document.getElementById("result");

      // 檢查元素是否存在
      if (!titleInput || !authorInput || !priceInput || !frontInput || !spineInput || !backInput || !userIdElem) {
          console.error("HTML 錯誤：找不到上架表單的某些元素");
          return alert("發生錯誤，無法上架");
      }

      const title = titleInput.value.trim();
      const author = authorInput.value.trim();
      const priceStr = priceInput.value.trim();
      const price = Number(priceStr);
      const front = frontInput.files[0];
      const spine = spineInput.files[0];
      const back = backInput.files[0];
      const userId = userIdElem.innerText;

      // 驗證
      if (!title || !author || !priceStr) return alert("請填寫書籍資料！");
      if (isNaN(price) || price <= 0) return alert("價格請輸入正確數字！");
      if (!front && !spine && !back) return alert("請至少上架一張圖片！");
      if (!userId) return alert("無法取得使用者資訊！");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("price", price);
      formData.append("seller_id", userId);
      if (front) formData.append("front", front);
      if (spine) formData.append("spine", spine);
      if (back) formData.append("back", back);

      if (resultDiv) resultDiv.innerHTML = "📊 AI 分析中...";

      try {
        // 呼叫 AI
        const aiRes = await fetch(`${AI_SERVER_URL}/predict`, {
          method: "POST",
          body: formData
        });
        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            throw new Error(`AI 伺服器錯誤 (${aiRes.status}): ${errorText.substring(0, 100)}`); // 截斷過長錯誤
        }
        const aiData = await aiRes.json();
        if (aiData.error) {
            throw new Error(`AI 分析失敗：${aiData.error}`);
        }

        const condition = aiData.condition || aiData.desc || "無法辨識";
        const imageUrlFromAI = aiData.image_url || 'static/images/default_book.png';

        if (resultDiv) {
          resultDiv.innerHTML = `
            <h3>📘 分析結果：</h3>
            ${aiData.level ? `<p><b>等級：</b> ${aiData.level}</p>` : ""}
            ${aiData.score ? `<p><b>分數：</b> ${aiData.score} / 3.0</p>` : ""}
            <p><b>詳細描述：</b> ${aiData.desc || condition}</p>
          `;
        }

        // 準備存到主資料庫的資料
        const bookData = {
          title: title,
          author: author,
          price: price,
          seller_id: userId,
          condition: condition,
          image_url: imageUrlFromAI
        };

        // 呼叫主程式 API 儲存
        const saveRes = await fetch("/api/book", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData)
        });

        if (saveRes.ok) {
          alert("書籍上架成功！");
          loadBooks(); // 重新載入列表
          const addModal = document.getElementById('modalOverlay');
          if(addModal) addModal.style.display = 'none'; // 關閉「新增」視窗
          // 清空「新增」視窗的欄位
          titleInput.value = "";
          authorInput.value = "";
          priceInput.value = "";
          frontInput.value = null;
          spineInput.value = null;
          backInput.value = null;
          if (resultDiv) resultDiv.innerHTML = "";
        } else {
          const errData = await saveRes.json();
          throw new Error(`上架失敗： ${errData.error || saveRes.statusText}`);
        }
      } catch (err) {
        console.error("❌ AI預測或上架失敗：", err);
        if (resultDiv) resultDiv.innerHTML = `<p style='color:red;'>錯誤: ${err.message}</p>`;
        alert(`發生錯誤: ${err.message}`);
      }
    });
} else {
    console.error("HTML 錯誤: 找不到 'uploadBtn' 按鈕");
}


// [ 🟢 新增的監聽 (儲存編輯) ]
const saveEditBtn = document.getElementById('saveEditBtn');
if (saveEditBtn) {
    saveEditBtn.addEventListener('click', async () => {
      // 從「編輯視窗」讀取資料
      const idInput = document.getElementById('editBookId');
      const titleInput = document.getElementById('editBookTitle');
      const authorInput = document.getElementById('editBookAuthor');
      const priceInput = document.getElementById('editBookPrice');
      const conditionInput = document.getElementById('editBookCondition');

      // 檢查元素
      if (!idInput || !titleInput || !authorInput || !priceInput || !conditionInput) {
          console.error("HTML 錯誤: 找不到編輯表單的某些元素");
          return alert("儲存時發生錯誤");
      }

      const id = idInput.value;
      const updatedData = {
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        price: Number(priceInput.value),
        condition: conditionInput.value.trim(),
      };

      if (!id) return alert('錯誤：找不到書籍 ID');
      if (!updatedData.title || !updatedData.author || isNaN(updatedData.price) || updatedData.price <= 0) {
        return alert('請填寫有效的書名、作者和價格');
      }

      // 呼叫 PUT API
      try {
        const res = await fetch(`/api/book/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
        if (res.ok) {
          alert('更新成功！');
          const editModal = document.getElementById('editModalOverlay');
          if (editModal) editModal.style.display = 'none'; // 關閉編輯視窗
          loadBooks(); // 重新載入
        } else {
          const err = await res.json();
          throw new Error(`更新失敗： ${err.error || res.statusText}`);
        }
      } catch (err) {
        console.error('❌ 更新時發生錯誤:', err);
        alert(`更新時發生錯誤: ${err.message}`);
      }
    });
} else {
    // 這個錯誤應該由 book.html 裡的 script 捕捉
    // console.error("找不到 'saveEditBtn' 按鈕");
}

// [ 🟢 新增的監聽 (事件委派) ]
const myBooksListContainer = document.getElementById('myBooksList');
if (myBooksListContainer) {
    myBooksListContainer.addEventListener('click', (event) => {
      const target = event.target;

      // 使用 .closest() 查找觸發事件的按鈕
      const deleteButton = target.closest('.delete-btn');
      if (deleteButton) {
        const bookId = deleteButton.dataset.id; // 從 data-id 取得 ID
        if (bookId) {
            deleteBook(bookId);
        } else {
            console.error("找不到 book ID (data-id 屬性遺失或為空)");
        }
        return; // 已處理，結束
      }

      const editButton = target.closest('.edit-btn');
      if (editButton) {
        const bookId = editButton.dataset.id; // 從 data-id 取得 ID
        if (bookId) {
            openEditModal(bookId);
        } else {
            console.error("找不到 book ID (data-id 屬性遺失或為空)");
        }
        return; // 已處理，結束
      }
    });
} else {
    console.error("找不到 'myBooksList' 容器");
}

/**
 * 步驟 3: 初始化 LIFF (主函式) (不變)
 */
async function main() {
  const liffIdString = await getLiffId();
  const liffUrl = await getWebUrl();
  await liff
    .init({ liffId: liffIdString, withLoginOnExternalBrowser: false })
    .then(async () => {
      if (liff.isLoggedIn()) {
        const isUserSynced = await initBookLiffApp();
        if (isUserSynced) {
          await loadBooks();
        } else {
          const btnAdd = document.getElementById('btnAdd');
          if (btnAdd) btnAdd.disabled = true;
          console.error("使用者資料同步失敗，無法使用上架功能。");
        }
      } else {
        liff.login({ redirectUri: `${liffUrl}/book` });
      }
    })
    .catch((err) => {
      console.error("❌ LIFF 初始化錯誤:", err);
      const container = document.getElementById("myBooksList");
      if (container) container.innerText = "Liff 壞了。";
    });
}

// 執行
main();