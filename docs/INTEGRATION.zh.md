# PrismQuant 總前端 · 整合說明

**交付物**：`index.html`（單檔，約 137 KB，零依賴、零建置、不連外網；簡 / 繁 / 英 三語）
**狀態**：可直接示範；「政要監控」已按 `FRONTEND_INTEGRATION.md` 的契約接上後端，其餘模組為標註清楚的示例數據。

---

## 一、三種跑法，選一種

### A. 最快：雙擊 `index.html`
直接看介面。因為是 `file://` 開啟，瀏覽器會把跨域請求當成 `null` 來源，
政要監控連不到本機 API，會自動退回示例數據並在頁面標示「示例數據」。
**用途**：給老師看版面、10/29 wireframe review、自己截圖寫報告。

### B. 要看真數據：雙擊 `start-frontend.cmd`
它會在同一個資料夾起一個本機靜態伺服器（`http://localhost:5173`），
再自動開瀏覽器並把後端地址指向 `http://127.0.0.1:8000`。

前提：政要監控的 FastAPI 已經在跑：

```powershell
cd "…\political-monitor"
.\.venv\Scripts\python.exe -X utf8 -m app
```

並且後端 `.env` 要放行這個來源（不設就只會退回示例數據）：

```dotenv
PQ_CORS_ORIGINS='["http://localhost:5173"]'
```

改完只需重啟 API，不用重啟排程器。

### C. 正式整合：掛在 FastAPI 底下（建議最終形態）
把 `index.html` 複製到後端專案，例如 `political-monitor/web/index.html`，
然後在 `app/main.py` 的 `create_app()` 裡、`return application` 之前加一行：

```python
from fastapi.staticfiles import StaticFiles
from app.core.config import PROJECT_ROOT

application.mount(
    "/app",
    StaticFiles(directory=PROJECT_ROOT / "web", html=True),
    name="app",
)
```

之後開 `http://127.0.0.1:8000/app/` 就是總前端，**同源、不需要 CORS**，
登入、重新整理、深層連結都不會出問題。原本的 `/monitor/` 獨立頁保留不動。

---

## 二、後端地址怎麼設定

優先次序（程式內已處理）：

1. 網址參數 `?api=http://127.0.0.1:8000`（會寫進 localStorage）
2. 右上角 ⚙ 手動填寫（存在該瀏覽器，不寫入檔案）
3. 沒設定時：`file://` 用 `http://127.0.0.1:8000`，其他情況用同源

位址必須是純 origin（`http://host:port`），不接受帶路徑或參數的網址。

---

## 三、哪些是真的，哪些是示例

| 模組 | 資料來源 | 說明 |
|---|---|---|
| 政要監控 | **真後端** | `/health`、`/api/v1/system-status`、`/api/v1/people`、`/api/v1/public-records`、`/api/v1/public-records/{id}`。游標分頁、`order=published_desc`、切換人物時取消舊請求、404/422/503 分級提示都按契約實作。 |
| 晨報 / 新聞 / 策略 / 風控 / 對話 / 持倉 / 學院 | 示例數據 | 數值由固定種子生成，內部自洽（淨值曲線、回撤、年化、Sharpe 都由同一條序列算出），但**不是真實回測**。頁面上以「示例數據」標示。 |

沒有接上的原因：A1（news）目前是 Streamlit 應用、A3（ndxbots）是 CLI，
兩者都還沒有 HTTP 介面；A4、A5 也還沒有可呼叫的服務。
等它們各自開出 `/api/...`，把 `D` 物件換成 `fetch` 即可，畫面不用改。

**逐項驗證過的**：`/health` 連通、人物清單、內容清單（含 `person_id` 篩選與
`cursor` 續頁）、內容詳情（正文保留換行）、系統狀態列、斷線時退回示例數據。
測試時用的是按同一份契約寫的本機 stub（`src/stub_api.py`，只作驗證用），
**沒有在他人的 PostgreSQL 上實跑過**——這一項要等後端資料庫起來才算完成。

---

## 四、頁面與需求對照

| 頁面 | 對應企劃書 | 主要內容 |
|---|---|---|
| 晨報 | 3.2 / F-07、Table 8 的示範路徑 | 五代理狀態、四張意圖、風控摘要、分歧意見、隔夜時間線 |
| 新聞情報 | F-03 | 事件簇、去重率、情緒與主題標籤、來源、處理管線、已知限制 |
| 政要監控 | F-04 | 人物、公開發言、正文、歸屬標籤、採集狀態（真 API） |
| 策略與回測 | F-02 | 淨值曲線、回撤、月度收益、策略家族表、參數、收益歸因 |
| 風控閘門 | F-06 | 閘門鏈路、六條限額與使用率、否決紀錄、一鍵暫停／緊急平倉 |
| 代理對話 | F-07 | A5 對話、證據鏈、本次 run 資訊、引用來源 |
| 持倉與績效 | F-09 | 持倉、盈虧、市場暴露、按代理的收益貢獻 |
| 學院 | 3.5 in scope | 四篇教育內容 |
| 登入 | 3.5 in scope | 訂閱方案、配額、示範帳戶 |

---

## 五、已知取捨

- **字體**：全部用系統字體（Windows 上是 Microsoft YaHei / Georgia），
  不載入任何外部字型或 CDN，離線可用，也不會在示範場地斷網時掉字。
- **語言**：介面三語，右上角 `简 / 繁 / EN`，登入頁右上角也有一個。
  繁體不是另外寫一份文案，而是用 OpenCC（s2hk）產生的對照表即時轉換：
  294 個單字 + 64 個詞組（處理「干預 / 幹」「平臺 / 平台」「複製 / 復制」這類一對多），
  共 5.7 KB。好處是資料內容（新聞標題、發言正文、學院文章）也一起轉，
  不會出現「介面繁體、內容簡體」的破綻。轉換只作用在文字節點與 placeholder，不會碰程式碼。
  預設語言會記在瀏覽器；網址加 `?lang=hant` 或 `?lang=en` 可直接指定。
- **圖表**：手寫 SVG，沒有 Chart.js。好處是零依賴、載入快、樣式完全可控；
  代價是沒有縮放與 tooltip 互動。
- **登入**：純前端展示，任意密碼可進入，不做任何驗證。
  進入時只寫一個 `sessionStorage` 標記；若瀏覽器封鎖儲存（例如嵌在沙箱 iframe 的預覽面板裡），
  程式會吞掉錯誤照樣進入，不會卡在登入頁。

---

## 六、檔案

```
.
├── index.html              ← 全部東西都在這裡（由 src/ 生成，不要直接改）
├── manifest.webmanifest    ← PWA 設定
├── sw.js                   ← service worker（network-first）
├── icon.svg                ← App 圖示（用 SVG，保持在純文字檔）
├── start-frontend.cmd      ← 本機預覽用
├── README.md               ← GitHub 主說明（英文）
├── docs/
│   ├── INTEGRATION.zh.md   ← 本文件
│   └── DESIGN.zh.md        ← 給報告／wireframe review 用
├── screenshots/            ← 18 張截圖（桌面、手機、三語）
└── src/                    ← 拆檔原始碼
    ├── build.py            ← 把 p*.html / p*.js 合成 index.html
    ├── p0_hant.js          ← 繁簡對照表（OpenCC s2hk 生成）
    ├── p1_head.html        ← head + 設計 token + 全部 CSS
    ├── p2_body.html        ← 靜態外殼 + 登入頁
    ├── p3_data.js          ← 字典、輔助函式、示例數據
    ├── p4a / p4b / p4c     ← 各頁面
    ├── p5_boot.js          ← 路由、API client、事件、啟動
    └── stub_api.py         ← 契約測試用的本機 stub
```

## 七、推上 GitHub

`index.html` 本身就能跑，但要 PWA 生效必須走 http(s)（`file://` 不能註冊 service worker）。
最省事是 GitHub Pages：把這個資料夾推上去，Settings → Pages 選 `main / root`，
網址就是 `https://<你的帳號>.github.io/<repo>/`。

三件要注意的事：

1. **`src/` 要不要推？** 要。`index.html` 是從 `src/p*.{html,js}` 生成的，
   只推成品以後就改不動了。`.gitignore` 已經排除截圖快取與暫存檔。
2. **service worker 會快取舊版**。改了東西後如果沒生效，是 SW 的問題：
   在網址後面加 `?nosw=1`，或在 DevTools → Application → Service Workers 按 Unregister。
   正式發版時把 `sw.js` 裡的 `CACHE` 版本號改一下。
3. **不要推 `.env`、資料庫密碼、API key**。這個前端沒有任何密鑰，但同一個 repo
   如果放後端程式就會有，記得加 `.gitignore`。
