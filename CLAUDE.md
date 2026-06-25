# Laura-Compass 蘿拉避難羅盤

災難當下，一步步帶使用者避難的**離線 PWA**。純靜態（HTML + vanilla JS + JSON），無框架、無後端、無付費 API。設計核心：極簡操作、決策樹引導、應變存檔、離線可用。

## 架構

- `index.html` — app shell（求救條 + `#app` 容器）
- `app.js` — 引擎：首頁、決策樹渲染、存檔、離線問答對話。改像素狗要同步蘿拉設計系統。
- `match.js` — 問答檢索（瀏覽器與 node 共用，故獨立成檔）
- `style.css` — 蘿拉設計系統 + 危機調整（大字、大鈕、高對比）
- `data/<場景>.json` — 決策樹；`data/<場景>_faq.json` — 離線問答庫
- `sw.js` — Service Worker 離線快取
- `test_tree.js` / `test_faq.js` — `node` 跑的最小驗證

## 資料來源紀律（最重要）

避難內容是保命資訊，**一律引用官方來源**（內政部消防署 消防防災館優先），每個節點/問答條目都要填 `source`，**絕不可憑記憶或訓練知識亂寫**。新增前先上網查證現行官方版本（觀念會更新，如「濕毛巾摀口鼻」已被「濃煙關門」取代）。

## 新增一個災難場景（模版化擴展）

一次做一個場景、做深做通。步驟：

1. `data/<場景>.json`：決策樹。節點格式見下。
2. `data/<場景>_faq.json`：問答庫。條目 `{ id, q, keywords[], a, source }`，`keywords` 是會出現在使用者問句裡的詞。
3. `app.js` 的 `SCENARIOS` 補一行：`<場景>: "./data/<場景>.json"`。
4. `renderHome()` 把該場景按鈕從 disabled 改成可點（`data-go="<場景>"`）。
5. `sw.js` 的 `ASSETS` 加兩個新 JSON，並把 `CACHE` 版本號 +1。
6. 補測試案例，跑 `node test_tree.js && node test_faq.js`。

### 決策樹節點格式

```json
"節點id": {
  "headline": "這一步最重要的一句話（大字顯示）",
  "tone": "danger | warn | go | safe | shelter",
  "actions": ["可打勾的行動1", "行動2"],
  "question": "狀況分支提問（終點節點留空字串）",
  "options": [ { "label": "狀況選項", "next": "下一個節點id" } ]
}
```
終點節點 `options` 留空陣列 `[]`。`start` 指向起始節點 id。

## 改檔後

動到 `app.js`/`style.css`/`data/*` 任何快取資產，把 `sw.js` 的 `CACHE` 版本號 +1，否則使用者拿到舊快取。

## 視覺

套蘿拉設計系統（`~/.claude/laura-design-system.md`）：鈴鐺金、粉圓字體、像素狗。本工具是「使用者 ↔ 蘿拉」一對一，狗放對話頭像與 logo。危機調整：字大、按鈕大、求救條常駐、警示用紅。
