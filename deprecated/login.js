import liff from "/@line/liff";

import {getLiffId, getWebUrl} from '../src/pages/static/js/config.js';


async function checkLiffLogin() {
    try {
        let appLiffId = await getLiffId();
        await liff.init({
            liffId: appLiffId
        });

        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        // 若已登入，取得 LINE Profile
        const profile = await liff.getProfile();
        const userId = profile.userId;
        const displayName = profile.displayName;
        const email = liff.getDecodedIDToken().email || ''; // 若需要的話，可以從 ID Token 取得 email
        const lineLiffToken = liff.getIDToken();

        // render 頁面
        document.getElementById('status').innerText = `歡迎 ${displayName}，自動登入中...`;
        const url = await getWebUrl();

        // 呼叫後端 API，傳送 LINE 資訊進行登入
        const res = await fetch(`${url}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineLiffToken}`
            },
            body: JSON.stringify({
                lineId: userId,
                name: displayName,
                email: email
            })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        } else {
            document.getElementById('status').innerText = '❌ 登入失敗：' + data.message;
        }
    } catch (error) {
        console.error('LIFF 錯誤:', error);
        document.getElementById('status').innerText = '❌ 無法初始化 LINE 登入';
    }
}

// 初始化主功能
checkLiffLogin();