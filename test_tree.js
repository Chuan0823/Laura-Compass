// 決策樹完整性檢查：每個 option.next 都指向存在的節點、無孤兒節點、有終點。
// 跑法：node test_tree.js
const fs = require("fs");
const assert = require("assert");

const tree = JSON.parse(fs.readFileSync(__dirname + "/data/fire.json", "utf8"));
const ids = Object.keys(tree.nodes);

// start 存在
assert(tree.nodes[tree.start], `start 節點 ${tree.start} 不存在`);

// 每個 option.next 指向存在的節點
let hasTerminal = false;
for (const id of ids) {
  const node = tree.nodes[id];
  assert(node.headline, `${id} 缺 headline`);
  assert(Array.isArray(node.actions), `${id} 的 actions 不是陣列`);
  assert(Array.isArray(node.options), `${id} 的 options 不是陣列`);
  if (node.options.length === 0) hasTerminal = true;
  for (const opt of node.options) {
    assert(opt.label, `${id} 有選項缺 label`);
    assert(tree.nodes[opt.next], `${id} 的選項指向不存在的節點 ${opt.next}`);
  }
}
assert(hasTerminal, "決策樹沒有任何終點節點");

// 無孤兒節點（除 start 外，每個節點都被某個 option 指到）
const reached = new Set([tree.start]);
for (const id of ids) for (const opt of tree.nodes[id].options) reached.add(opt.next);
for (const id of ids) assert(reached.has(id), `孤兒節點：${id} 沒有任何路徑到得了`);

console.log(`OK  fire.json：${ids.length} 個節點，連結完整、無孤兒、有終點。`);
