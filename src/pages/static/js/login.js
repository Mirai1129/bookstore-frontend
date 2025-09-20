// import liff from "/@line/liff";

import {getLiffId, getWebUrl} from './config.js';


async function main() {
    try {
        const appLiffId = await getLiffId();
        // 初始化 LIFF SDK
        await liff.init({
            liffId: appLiffId
        });

        if (!liff.isLoggedIn()) {
            // 若使用者尚未登入，則導向至登入畫面
            liff.login();
            return;
        }

        // 若已登入，取得 LINE Profile
        const profile = await liff.getProfile();
        const userId = profile.userId;
        const displayName = profile.displayName;
        const email = liff.getDecodedIDToken().email || ''; // 若需要的話，可以從 ID Token 取得 email

        document.getElementById('status').innerText = `歡迎 ${displayName}，自動登入中...`;
        const url = await getWebUrl();

        // 呼叫後端 API，傳送 LINE 資訊進行登入
        const res = await fetch(`${url}/api/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                lineId: userId,
                name: displayName,
                email: email
            })
        });

        const data = await res.json();
        console.log(data);

        if (data.success) {
            // 登入成功，儲存 token 並導向首頁
            localStorage.setItem('token', data.token);
            window.location.href = 'bookForm.html'; // 成功後導向首頁
        } else {
            // 登入失敗，顯示錯誤訊息
            document.getElementById('status').innerText = '❌ 登入失敗：' + data.message;
        }
    } catch (error) {
        console.error('LIFF 錯誤:', error);
        document.getElementById('status').innerText = '❌ 無法初始化 LINE 登入';
    }
}

// 初始化主功能
main();