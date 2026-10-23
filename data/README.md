# data/

放置由 `tools/export.py` 產生的快照。**兩個檔案都不存在時，前端自動使用示例數據**，
不會報錯。

| 檔案 | 來源 | 產生方式 |
|---|---|---|
| `news.json` | A1 `news-main/data/news.sqlite3` | `python tools/export.py news --db "<path>/news.sqlite3" --out data/news.json` |
| `backtests.json` | A3 `ndxbots` 回測輸出的 `curve.csv` | `python tools/export.py backtest --curve "<path>/curve.csv" --out data/backtests.json` |

前端在啟動時會嘗試 `fetch('./data/news.json')` 與 `./data/backtests.json`；
讀到就用，讀不到就用 `D` 裡的示例數據，並在頁首標示「示例數據」。
有快照時，新聞頁會顯示「A1 数据快照」、策略頁會顯示「A3 真实回测」，並附生成時間。

**限制**

- 這是**快照**，不是即時。要重新整理就再跑一次匯出、再 commit。
- `file://` 直接開 `index.html` 時，瀏覽器會阻擋 `fetch`，所以只能用示例數據。
  走 `http(s)`（本機伺服器或 GitHub Pages）才會載入快照。
- 匯出腳本只讀不寫來源檔案；`--report` 模式會印出資料庫結構，先跑一次再匯出比較穩。
