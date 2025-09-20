import { getWebUrl } from './config.js';

// import {liff} from '@line/liff';

// 🔄 網址參數檢查，自動跳轉其他頁面
// window.onload = function () {
//     const params = new URLSearchParams(window.location.search);
//     const page = params.get("page");
//
//     if (page) {
//         const target = `${page}.html`;
//         if (target !== "bookForm.html") {
//             window.location.href = target;
//         }
//     }
// };


// LIFF 初始化與登入
async function initLIFF() {
    try {
        // LIFF 初始化
        await liff.init({ liffId: "2007363323-BlP5rZeJ" });

        // 檢查是否已登入
        if (!liff.isLoggedIn()) {
            // 如果未登入，執行登入並立即結束函式
            liff.login();
            return; // 這裡的 return 很重要，避免後續程式碼執行
        }

        // 如果已登入，執行後續邏輯
        const profile = await liff.getProfile();
        const userId = profile.userId;
        const displayName = profile.displayName;

        localStorage.setItem('user_id', userId);
        document.getElementById('lineName').innerText = displayName;

    } catch (err) {
        console.error("LIFF 初始化或登入失敗", err);
        alert("LINE 登入失敗，請重新整理");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initLIFF();
    await filterBooks();
});

document.getElementById('filterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    filterBooks();
});

function resetFilters() {
    document.getElementById('filterForm').reset();
    filterBooks();
}

async function filterBooks() {
    const title = document.getElementById('filterTitle').value.toLowerCase();
    const author = document.getElementById('filterAuthor').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const condition = document.getElementById('filterCondition').value;
    const is_sold = document.getElementById('filterSold').value;

    const response = await fetch(`${url}/api/books`);
    const books = await response.json();
    const tbody = document.querySelector('#booksTable tbody');
    tbody.innerHTML = '';

    books.filter(book => {
        return (
            (!title || book.title.toLowerCase().includes(title)) &&
            (!author || book.author.toLowerCase().includes(author)) &&
            book.price >= minPrice &&
            book.price <= maxPrice &&
            (!condition || book.condition === condition) &&
            (!is_sold || String(book.is_sold) === is_sold)
        );
    }).forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>$${book.price}</td>
          <td>${book.condition}</td>
          <td>${book.is_sold ? '✔️' : '❌'}</td>
          <td><img src="${book.image_url}" alt="書籍圖片"></td>
          <td><button onclick="addToCart('${book._id}')">加入購物車</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function addToCart(bookId) {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("請先登入 LINE");
        return;
    }

    console.log("Sending data to backend:", {userId, bookId, quantity: 1});

    try {
        const res = await fetch(`${url}/api/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId, bookId, quantity: 1})
        });

        const result = await res.json();
        console.log("Response from backend:", result);

        if (res.ok) {
            alert("已加入購物車！");
        } else {
            alert(result.message || "加入購物車失敗");
        }
    } catch (error) {
        console.error("錯誤：", error);
        alert("無法連接伺服器，請稍後再試");
    }
}