// import { liff } from "@line/liff";
import { getLiffId, getWebUrl } from "./config.js";

// 假資料示範（測試用）
const SAMPLE_BOOKS = [
    { _id: "b001", title: "書名A", author: "作者A", price: 250, image: "book1.jpg" },
    { _id: "b002", title: "書名B", author: "作者B", price: 320, image: "book2.jpg" },
    { _id: "b003", title: "書名C", author: "作者C", price: 180, image: "book3.jpg" }
];

const SAMPLE_CART = [
    { id: "b001", qty: 1 },
    { id: "b002", qty: 2 }
];

function findBookById(id) {
    return SAMPLE_BOOKS.find(b => b._id === id);
}

const liffIdString = await getLiffId();
const liffWebUrl = await getWebUrl();

// ---------- 購物車頁面渲染 ----------
function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    container.innerHTML = '';

    if (SAMPLE_CART.length === 0) {
        container.innerHTML = '<p>購物車是空的。</p>';
        return;
    }

    let total = 0;

    SAMPLE_CART.forEach(item => {
        const book = findBookById(item.id);
        if (!book) return;

        const sub = book.price * item.qty;
        total += sub;

        const div = document.createElement('div');
        div.className = 'book';
        // 橫向排列卡片
        div.innerHTML = `
            <div style="display:flex; gap:12px; align-items:center;">
                <img src="${book.image}" alt="${book.title} 封面" style="width:90px; height:120px; object-fit:cover; border-radius:6px;">
                <div style="flex:1;">
                    <h4 style="margin:0">${book.title}</h4>
                    <p style="margin:6px 0 0 0;"><small>作者：${book.author}</small></p>
                    <p style="margin:6px 0 0 0;"><small>單價：NT$ ${book.price} × ${item.qty} = NT$ ${sub}</small></p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // 顯示小計（簡單文字）
    const subtotal = document.createElement('div');
    subtotal.style.marginTop = '12px';
    subtotal.style.fontWeight = '600';
    subtotal.innerHTML = `總計：NT$ ${total}`;
    container.appendChild(subtotal);
}

// ---------- 初始化 LIFF ----------
async function initCartLiffApp() {
    try {
        const profile = await liff.getProfile();
        document.getElementById("user-picture").src = profile.pictureUrl;
        document.getElementById("user-name").innerText = profile.displayName;
        document.getElementById("user-id").innerText = profile.userId;
    } catch (err) {
        console.error("取得使用者資料失敗:", err);
    }
}

// ---------- 主程式 ----------
async function main() {
    try {
        await liff.init({ liffId: liffIdString, withLoginOnExternalBrowser: false });
        if (!liff.isLoggedIn()) {
            liff.login({ redirectUri: `${liffWebUrl}/cart` });
        } else {
            await initCartLiffApp();
            renderCart(); // 渲染購物車
        }
    } catch (err) {
        console.error("LIFF 初始化失敗:", err);
        const container = document.getElementById('cartItems');
        if (container) container.innerText = "LIFF 初始化失敗，請稍後再試。";
    }
}

main();
