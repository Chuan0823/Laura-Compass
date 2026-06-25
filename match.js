// 離線問答檢索：比對每個條目的 keywords 是否出現在使用者問句裡，命中數最高者勝。
// 中文不切詞，純 substring 比對。瀏覽器與 node 共用同一份邏輯。
// ponytail: 關鍵字 substring 比對，FAQ 量小時足夠；條目暴增到排序失準再考慮 TF-IDF。
function matchFaq(query, faqs) {
  query = (query || "").trim();
  if (!query) return null;
  let best = null,
    bestScore = 0;
  for (const f of faqs) {
    let score = 0;
    for (const k of f.keywords) if (query.indexOf(k) !== -1) score++;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return bestScore > 0 ? best : null;
}

if (typeof module !== "undefined" && module.exports) module.exports = { matchFaq };
