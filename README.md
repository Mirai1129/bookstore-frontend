## 怎麼跑這個專案

1. 設定專案
    在專案最外層新增一個 `.env` 的檔案，並設定底下的變數
    ```shell
    # url settings
    WEB_URL=<localhost || 其他網址>
    MONGODB_URL=<你的 Mongodb 連線網址>
    
    # config settings
    JWT_SECRET=<你的 jwt 密鑰>
    PORT=5000 # 或是其他你設定的
    
    # ids
    LIFF_ID=<你的 liff id>
    ```

2. 啟動專案

    ```shell
    npm install
    cd ./src/
    node server.js
    ```


