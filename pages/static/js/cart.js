import {getLiffId, getWebUrl, API_ENDPOINTS} from "./config.js";

async function main() {
    const liffId = await getLiffId();
    const webUrl = await getWebUrl();

    await liff.init({liffId: liffId, withLoginOnExternalBrowser: false});

    if (!liff.isLoggedIn()) {
        liff.login({redirectUri: `${webUrl}/cart`});
        return;
    }

    const profile = await liff.getProfile();
    document.getElementById("user-picture").src = profile.pictureUrl;
    document.getElementById("user-name").innerText = profile.displayName;

    await loadCart();
}

async function loadCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '載入中...';

    try {
        const res = await fetch(API_ENDPOINTS.myCart);
        if (!res.ok) throw new Error("無法取得購物車");

        const cartData = await res.json();
        const items = cartData.items || [];

        if (items.length === 0) {
            container.innerHTML = '<p>購物車是空的。</p>';
            return;
        }

        container.innerHTML = '';
        let total = 0;

        for (const item of items) {
            const bookRes = await fetch(API_ENDPOINTS.bookById(item.book_id));

            if (bookRes.ok) {
                const book = await bookRes.json();
                const subtotal = book.price * item.quantity;
                total += subtotal;

                const div = document.createElement('div');
                div.className = 'book';
                div.innerHTML = `
                    <div style="display:flex; gap:10px; align-items:center;">
                        <img src="${book.image_url || 'static/images/default_book.png'}" style="width:80px; height:100px; object-fit:cover;">
                        <div>
                            <h4>${book.title}</h4>
                            <p>單價：$${book.price} x ${item.quantity}</p>
                            <p>小計：$${subtotal}</p>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            }
        }

        const totalDiv = document.createElement('div');
        totalDiv.style.marginTop = '20px';
        totalDiv.style.textAlign = 'right';
        totalDiv.innerHTML = `<h3>總金額：$${total}</h3>`;
        container.appendChild(totalDiv);

    } catch (err) {
        console.error(err);
        container.innerHTML = '載入失敗';
    }
}

main();