// import liff from "/@line/liff";
import {getLiffId, API_ENDPOINTS} from "./config.js";

const SAMPLE_BOOKS = [
    {_id: "sample_1", image_url: "book1.png", title: "書名 A", author: "作者 A", price: 120, description: "這是書名 A 的詳細介紹..."},
    {_id: "sample_2", image_url: "book2.png", title: "書名 B", author: "作者 B", price: 250, description: "這本書的內容十分精彩！"},
    {_id: "sample_3", image_url: "book3.png", title: "書名 C", author: "作者 C", price: 80, description: "一本輕薄短小的入門書。"}
];

let allBooks = [];

// ===================================
// 🛒 加入購物車函式 (addToCart) - 保留
// ===================================
window.addToCart = async function(bookId) {
    if (!bookId) {
        alert("錯誤：無法識別書籍 ID");
        return;
    }

    try {
        // 從 allBooks 找到這本書的資料
        const book = allBooks.find(b => b._id === bookId);
        if (!book) {
            alert("錯誤：找不到該書籍資料");
            return;
        }

        const response = await fetch(API_ENDPOINTS.addToCart, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: bookId })
        });

        if (response.ok) {
            // 彈窗成功訊息
            alert(`已將《${book.title}》加入購物車！ 🛒`);
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


// ===================================
// 📘 書籍詳細彈窗處理 (Modal Handlers) - 新增
// ===================================

/**
 * 顯示書籍詳細資訊彈窗
 * @param {object} book - 單本書籍的資料物件
 */
function showBookModal(book) {
    const modal = document.getElementById("bookModal");
    if (!modal || !book) return;

    // 填充圖片和資訊
    // 這裡只處理單張圖片，因為您 HTML 中只有一個 #modalImg
    // 如果未來要處理多圖切換，需要更複雜的邏輯
    document.getElementById("modalImg").src = book.image_url || 'static/images/default_book.png';
    document.getElementById("modalImg").alt = `${book.title} 封面`;
    document.getElementById("modalTitle").innerText = book.title;
    document.getElementById("modalAuthor").innerText = `作者：${book.author}`;
    document.getElementById("modalPrice").innerText = `價格：NT$ ${book.price}`;

    // 檢查是否有 description 欄位
    const description = book.description || "本書無詳細描述。";
    document.getElementById("modalDescription").innerText = description;

    // 移除舊的購物車按鈕，因為我們要在彈窗中用一個新的
    const oldBtn = document.getElementById("modalAddToCartBtn");
    if(oldBtn) oldBtn.remove();

    // 在資訊下方動態添加一個購物車按鈕
    const addToCartBtn = document.createElement("button");
    addToCartBtn.id = "modalAddToCartBtn";
    addToCartBtn.className = "btn-add"; // 使用現有的樣式
    addToCartBtn.innerText = "加入購物車";
    // 點擊時呼叫 addToCart 並關閉彈窗
    addToCartBtn.onclick = () => {
        window.addToCart(book._id);
        closeBookModal();
    };

    // 將按鈕添加到 modal-content 的最後
    modal.querySelector(".modal-content").appendChild(addToCartBtn);

    modal.style.display = "flex"; // 顯示彈窗
}

/** 關閉書籍詳細資訊彈窗 */
function closeBookModal() {
    const modal = document.getElementById("bookModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// ===================================
// ⚙️ LIFF 與初始化函式 (init, main) - 保留並增加初始化 Modal 關閉
// ===================================
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

// 初始化彈窗事件監聽器
function initModalHandlers() {
    // 關閉按鈕
    document.getElementById("modalClose").onclick = closeBookModal;

    // 點擊彈窗背景時關閉 (防止點擊內容時關閉)
    const modal = document.getElementById("bookModal");
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeBookModal();
            }
        };
    }

    // 由於您的 HTML 中有重複的 #bookModal 結構，為確保單一功能，
    // 我只初始化一個 close 鈕和 modal 背景點擊事件。
    // *建議您在 index.html 移除重複的 #bookModal 結構*
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

        // 🚨 新增：初始化彈窗處理器
        initModalHandlers();

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

// ===================================
// 📚 書籍載入與渲染 (loadIndexBooks, renderIndexBooks) - 大幅修改 renderIndexBooks
// ===================================

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

/**
 * 渲染書籍列表，增加點擊卡片顯示彈窗的事件監聽
 */
function renderIndexBooks(filter = "") {
    const container = document.getElementById("bookList");
    if (!container) return;

    container.innerHTML = "";
    const q = filter.trim().toLowerCase();

    const books = allBooks.filter(b => {
        if (!q) return true;
        // 確保 title 和 author 存在再轉小寫
        const titleMatch = (b.title || '').toLowerCase().includes(q);
        const authorMatch = (b.author || '').toLowerCase().includes(q);
        return titleMatch || authorMatch;
    });

    if (!books.length) {
        container.innerHTML = "<p>找不到符合的書籍。</p>";
        return;
    }

    books.forEach(b => {
        const el = document.createElement("div");
        el.className = "book";

        // **🚨 移除這裡的 onclick，改為下面新增的事件監聽器**
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

        // **🚨 新增：為整個書籍卡片元素（非按鈕區塊）加上事件監聽器**
        el.addEventListener('click', (event) => {
            // 檢查點擊事件是否來自 '加入購物車' 按鈕
            if (event.target.classList.contains('btn-add')) {
                // 如果是，讓 addToCart 函式處理，不觸發 showBookModal
                return;
            }
            // 否則，顯示書籍詳細資訊彈窗
            showBookModal(b);
        });

        container.appendChild(el);
    });
}


async function main() {
    try {
        const liffIdString = await getLiffId();

        await liff.init({
            liffId: liffIdString,
            withLoginOnExternalBrowser: false
        });

        if (liff.isLoggedIn()) {
            await initIndexLiffApp();
        } else {
            liff.login();
        }

    } catch (error) {
        console.error("❌ LIFF 初始化錯誤:", error);
        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) loadingScreen.innerText = "LIFF 初始化失敗，請稍後再試。";
    }
}

main();