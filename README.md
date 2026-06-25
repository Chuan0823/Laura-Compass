# Laura-Compass 蘿拉避難羅盤

災難當下，一步步帶你避難的**離線手機 App（PWA）**。火災為首發場景，內容來自內政部消防署 消防防災館。

> 這是引導工具，**不能取代 119／110**。緊急請先撥打電話求救。

## 功能

- 🔥 **決策樹引導**：依現場狀況選擇，一步步給下一個保命行動
- ✅ **應變存檔**：自動記住你走到哪、勾了哪些行動、狀態備註，可「繼續上一次的應變」
- 💬 **離線問蘿拉**：打字問避難問題，用消防署資料離線回答，完全不需網路
- 📴 **離線可用**：安裝後飛航模式也能開

## 本機預覽

```bash
cd Laura-Compass
python3 -m http.server 8000
# 瀏覽器開 http://localhost:8000
```

## 測試

```bash
node test_tree.js   # 決策樹連結完整性
node test_faq.js    # 問答檢索正確性
```

## 部署到手機（GitHub Pages，免費、自帶 HTTPS）

> PWA 安裝需要 HTTPS，GitHub Pages 直接提供。詳細步驟蘿拉會帶你做。

1. 在 GitHub 建一個 repo，把整個資料夾推上去。
2. repo → Settings → Pages → Source 選 `main` 分支、`/ (root)`。
3. 等 1–2 分鐘，拿到網址 `https://<帳號>.github.io/<repo>/`。
4. 手機瀏覽器開該網址 → 分享 → 「加入主畫面」，就變成 App。

## 新增其他災難場景

見 `CLAUDE.md`。一次做一個場景、做深做通；新增 = 加一份決策樹 JSON + 問答 JSON + 首頁一顆按鈕。
