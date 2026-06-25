// 問答檢索檢查：樣本問句要命中預期條目；完全無關問句要回退（null）。
// 跑法：node test_faq.js
const fs = require("fs");
const assert = require("assert");
const { matchFaq } = require("./match.js");

const faqs = JSON.parse(fs.readFileSync(__dirname + "/data/fire_faq.json", "utf8"));

const cases = [
  ["門把好燙怎麼辦", "faq_door_hot"],
  ["我要不要拿濕毛巾摀口鼻", "faq_wet_towel"],
  ["可以躲廁所嗎", "faq_bathroom"],
  ["搭電梯下樓可以嗎", "faq_elevator"],
  ["先收貴重的東西再跑", "faq_belongings"],
  ["到底要往上還是往下逃", "faq_direction"],
  ["緩降機要怎麼操作", "faq_descender"],
  ["打119要講什麼", "faq_call_119"],
];

for (const [q, expected] of cases) {
  const hit = matchFaq(q, faqs);
  assert(hit, `「${q}」應命中卻回退了`);
  assert.strictEqual(hit.id, expected, `「${q}」命中 ${hit.id}，預期 ${expected}`);
}

// 完全不相關問句要回退
assert.strictEqual(matchFaq("今天午餐吃什麼", faqs), null, "無關問句應回退 null");
assert.strictEqual(matchFaq("", faqs), null, "空字串應回退 null");

console.log(`OK  fire_faq.json：${cases.length} 個問句命中正確，無關問句正確回退。`);
