// import {liff} from "@line/liff"
import {getLiffId, getWebUrl} from "./config.js";

const liffIdString = await getLiffId();
const liffUrl = await getWebUrl();

async function initBookLiffApp() {
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
        if (liff.isLoggedIn()) {
            await initBookLiffApp();
        } else {
            liff.login({redirectUri: `${liffUrl}/book`});
        }
    }).catch(error => {
        console.error(error);
        document.getElementById("book").innerText = "Liff 壞了。";
    });
}

main();