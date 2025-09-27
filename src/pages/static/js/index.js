// import {liff} from "@line/liff";
import {getLiffId} from "./config.js";

const liffIdString = await getLiffId();

async function initIndexLiffApp() {
    try {
        const profile = await liff.getProfile();
        // 更新畫面上的使用者資訊
        document.getElementById("user-picture").src = profile.pictureUrl;
        document.getElementById("user-name").innerText = profile.displayName;
        document.getElementById("user-id").innerText = profile.userId;

        // 隱藏讀取畫面，顯示主內容
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("main-content").style.display = "block";

    } catch (error) {
        console.error("Failed to get profile:", error);
    }
}

async function main() {
    await liff.init({
        liffId: liffIdString,
        withLoginOnExternalBrowser: false
        }
    ).then(async () => {
        if (liff.isLoggedIn()) {
            await initIndexLiffApp();
        } else {
            liff.login();
        }
    }).catch(error => {
        console.error(error);
        document.getElementById("loading-screen").innerText = "LIFF 初始化失敗，請稍後再試。";
    })
}

main();
