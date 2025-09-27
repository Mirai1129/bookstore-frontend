// import {liff} from "@line/liff";
import {getLiffId, getWebUrl} from "./config.js";

const liffIdString = await getLiffId();
const liffWebUrl = await getWebUrl();

async function initCartLiffApp() {
    await liff.getProfile()
        .then(async (profile) => {
            document.getElementById("user-picture").src = profile.pictureUrl;
            document.getElementById("user-name").innerText = profile.displayName;
            document.getElementById("user-id").innerText = profile.userId;
        });
}

async function main() {
    await liff.init({
        liffId: liffIdString,
        withLoginOnExternalBrowser: false
    }).then(async () => {
        if (liff.is)
        if (liff.isLoggedIn()) {
            await initCartLiffApp();
        } else {
            liff.login({redirectUri: `${liffWebUrl}/cart`});
        }
    }).catch(error => {
        console.error(error);
        document.getElementById("book").innerText = "Liff 壞了。";
    });
}

main();