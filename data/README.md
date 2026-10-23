# data/

放置由 `tools/export.py` 產生的快照。**檔案不存在時，前端顯示空狀態**（寫清楚缺什麼、
要去哪一步補），並不會報錯、也不會拿假數據墊。

| 檔案 | 來源 | 產生方式 |
|---|---|---|
| `news.json` | A1 `news-main/data/news.sqlite3` | `python tools/export.py news --db "<path>/news.sqlite3" --limit 24 --per-source 2 --out data/news.json` |
| `political.json` | A2 `political-monitor` 的 PostgreSQL | 用 A2 venv 跑 `tools/export_political.py --out data/political.json --password "<PQ_DB_PASSWORD>"` |
| `backtests.json` | A3 `ndxbots` 回測輸出的 `curve.csv` | `python tools/export.py backtest --curve "<path>/curve.csv" --out data/backtests.json` |

前端啟動時會 `fetch('./data/news.json')`、`./data/political.json`、`./data/backtests.json`；
讀到就當真數據顯示，讀不到就顯示空狀態。

目前 `news.json` 裡面是 2026-10-23 實跑採集的 **24 條真實新聞，來自 16 個來源**。
`political.json` 是 **2 位人物（拉加德、特朗普）+ 3 條真實公開記錄**（拉加德 IMFC 聲明、
特朗普兩條 Truth Social）。全部都是真實數據，不是假造。

政要監控頁的資料優先順序：**實時後端 → political.json 快照 → 空狀態**。
所以 GitHub Pages 上（連不到本機後端）會自動讀快照，標示「A2 快照」。

**限制**

- 這是**快照**，不是即時。要更新就再採集一次、再匯出、再 commit。
- `file://` 直接開 `index.html` 時，瀏覽器會阻擋 `fetch`，兩個檔案都讀不到。
  走 `http(s)`（本機伺服器或 GitHub Pages）才會載入。
- 匯出腳本只讀不寫來源檔案；`--report` 模式會印出資料庫結構，先跑一次再匯出比較穩。
- `--per-source` 一定要設。披露易一次能丟幾百條公告，不設上限整頁會被它吃光。

## 另一條路：本機 API

不想每次手動匯出，可以直接跑：

```bash
python tools/api_server.py --news-db "<...>/news.sqlite3" --curve "<...>/curve.csv"
```

它會在同一個網址同時提供前端與動態的 `/data/*.json`（每次請求重讀來源），
所以 `data/` 裡不需要放任何檔案，前端會直接拿到真數據，按刷新就是最新。
