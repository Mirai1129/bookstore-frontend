import { getLiffId } from "./config.js";

// 假資料備援（若後端無法取得資料，可暫時使用）
const SAMPLE_BOOKS = [
  { image_url: "book1.png", title: "書名 A", author: "作者 A", price: 120 },
  { image_url: "book2.png", title: "書名 B", author: "作者 B", price: 250 },
  { image_url: "book3.png", title: "書名 C", author: "作者 C", price: 80 }
];

let allBooks = []; // 用於存放抓到的書籍資料

// ---------- 首頁歡迎彈窗（3 秒關閉） ----------
function hideWelcomeAfterTimeout() {
  const el = document.getElementById('welcomeOverlay');
  if (!el) return;
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

async function initIndexLiffApp() {
  try {
    const profile = await liff.getProfile();

    // 更新使用者資訊
    document.getElementById("user-picture").src = profile.pictureUrl;
    document.getElementById("user-name").innerText = profile.displayName;
    document.getElementById("user-id").innerText = profile.userId;

    // 隱藏讀取畫面
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) loadingScreen.style.display = "none";

    // 顯示主內容
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.style.display = "block";

    // 顯示首頁歡迎遮罩
    hideWelcomeAfterTimeout();

    // 載入書籍
    await loadIndexBooks();

    // 綁定搜尋事件
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", () => renderIndexBooks(searchInput.value));
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") renderIndexBooks(searchInput.value);
      });
    }
  } catch (error) {
    console.error("❌ 無法取得使用者資訊:", error);
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) loadingScreen.innerText = "LIFF 初始化失敗，請稍後再試。";
  }
}

// 🟢 從後端抓書籍資料
async function loadIndexBooks() {
  try {
    const response = await fetch("/api/book");
    const books = await response.json();
    allBooks = books.length ? books : SAMPLE_BOOKS; // 若沒資料，用假資料
    renderIndexBooks();
  } catch (err) {
    console.error("❌ 無法載入書籍資料：", err);
    allBooks = SAMPLE_BOOKS;
    renderIndexBooks();
  }
}

// 渲染首頁書籍卡片
function renderIndexBooks(filter = "") {
  const container = document.getElementById("bookList");
  if (!container) return;

  container.innerHTML = "";

  const q = filter.trim().toLowerCase();

  const books = allBooks.filter(b => {
    if (!q) return true;
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  });

  if (!books.length) {
    container.innerHTML = "<p>找不到符合的書籍。</p>";
    return;
  }

  books.forEach(b => {
    const el = document.createElement("div");
    el.className = "book";
    el.innerHTML = `
      <img src="${b.image_url || 'default_book.png'}" alt="${b.title} 封面" />
      <h4>${b.title}</h4>
      <p><small>作者：${b.author}</small></p>
      <div class="row">
        <div>NT$ ${b.price}</div>
        <div>
          <button class="btn-add" onclick="alert('示範：加入購物車')">加入購物車</button>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
}

async function main() {
  const liffIdString = await getLiffId();

  await liff.init({ liffId: liffIdString, withLoginOnExternalBrowser: false })
    .then(async () => {
      if (liff.isLoggedIn()) {
        await initIndexLiffApp();
      } else {
        liff.login();
      }
    })
    .catch(error => {
      console.error("❌ LIFF 初始化錯誤:", error);
      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) loadingScreen.innerText = "LIFF 初始化失敗，請稍後再試。";
    });
}

main();
