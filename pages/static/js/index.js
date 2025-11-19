// import liff from "/@line/liff";
import {getLiffId, API_ENDPOINTS} from "./config.js";

const SAMPLE_BOOKS = [
    {_id: "sample_1", image_url: "book1.png", title: "書名 A", author: "作者 A", price: 120},
    {_id: "sample_2", image_url: "book2.png", title: "書名 B", author: "作者 B", price: 250},
    {_id: "sample_3", image_url: "book3.png", title: "書名 C", author: "作者 C", price: 80}
];

let allBooks = [];

window.addToCart = async function(bookId) {
    if (!bookId) {
        alert("錯誤：無法識別書籍 ID");
        return;
    }

    try {
        const response = await fetch(API_ENDPOINTS.addToCart, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: bookId })
        });

        if (response.ok) {
            alert("已加入購物車！ 🛒");
        } else {
            if (response.status === 401) {
                alert("您尚未登入，無法加入購物車。\n請重新整理頁面或重新登入。");
            } else {
                const errData = await response.json();
                alert(`加入失敗：${errData.detail || "未知錯誤"}`);
            }
        }
    } catch (err) {
        console.error("加入購物車發生錯誤:", err);
        alert("網路錯誤，無法加入購物車。");
    }
};


function hideWelcomeAfterTimeout() {
    const el = document.getElementById('welcomeOverlay');
    if (!el) return;
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

async function syncUserProfile(profile) {
    try {
        const response = await fetch(API_ENDPOINTS.syncProfile, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                line_id: profile.userId,
                name: profile.displayName
            })
        });
        if (response.ok) {
            console.log('✅ 用戶資料同步成功');
        } else {
            console.error(`❌ 同步失敗 (HTTP ${response.status}):`, response.statusText);
        }
    } catch (err) {
        console.error("❌ 用戶資料同步失敗 (Network Error):", err);
    }
}

async function initIndexLiffApp() {
    try {
        const profile = await liff.getProfile();
        document.getElementById("user-picture").src = profile.pictureUrl;
        document.getElementById("user-name").innerText = profile.displayName;
        document.getElementById("user-id").innerText = profile.userId;

        await syncUserProfile(profile);

        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) loadingScreen.style.display = "none";

        const mainContent = document.getElementById("main-content");
        if (mainContent) mainContent.style.display = "block";

        hideWelcomeAfterTimeout();
        await loadIndexBooks();

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

async function loadIndexBooks() {
    try {
        const response = await fetch(API_ENDPOINTS.books);
        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.status}`);
        }
        const books = await response.json();
        allBooks = books;
        renderIndexBooks();
    } catch (err) {
        console.error("❌ 無法載入書籍資料：", err);
        allBooks = SAMPLE_BOOKS;
        renderIndexBooks();
    }
}

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
      <img src="${b.image_url || 'static/images/default_book.png'}" alt="${b.title} 封面" />
      <h4>${b.title}</h4>
      <p><small>作者：${b.author}</small></p>
      <div class="row">
        <div>NT$ ${b.price}</div>
        <div>
          <button class="btn-add" onclick="window.addToCart('${b._id}')">加入購物車</button>
        </div>
      </div>
    `;
        container.appendChild(el);
    });
}

async function main() {
    const liffIdString = await getLiffId();
    await liff.init({liffId: liffIdString, withLoginOnExternalBrowser: false})
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