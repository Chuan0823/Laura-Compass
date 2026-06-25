"use strict";

// ---- 蘿拉像素狗（取自蘿拉設計系統，改像素時所有工具同步）----
function dogSVG(size) {
  size = size || 26;
  var h = Math.round(size * 1.5);
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24"',
    ' width="' + size + '" height="' + h + '"',
    ' class="dog-avatar" style="image-rendering:pixelated;shape-rendering:crispEdges;display:block">',
    '<rect x="4" y="0" width="2" height="2" fill="#2A2622"/>',
    '<rect x="3" y="2" width="3" height="6" fill="#2A2622"/>',
    '<rect x="10" y="0" width="2" height="2" fill="#2A2622"/>',
    '<rect x="10" y="2" width="3" height="6" fill="#2A2622"/>',
    '<rect x="2" y="6" width="12" height="10" fill="#2A2622"/>',
    '<rect x="3" y="8" width="4" height="3" fill="#9B9088"/>',
    '<rect x="9" y="8" width="4" height="3" fill="#9B9088"/>',
    '<rect x="4" y="9" width="2" height="2" fill="#7B3A3A"/>',
    '<rect x="5" y="9" width="1" height="1" fill="#FFFFFF"/>',
    '<rect x="10" y="9" width="2" height="2" fill="#7B3A3A"/>',
    '<rect x="11" y="9" width="1" height="1" fill="#FFFFFF"/>',
    '<rect x="4" y="11" width="8" height="4" fill="#9B9088"/>',
    '<rect x="7" y="11" width="2" height="1" fill="#2A2622"/>',
    '<rect x="6" y="13" width="4" height="2" fill="#E87A8E"/>',
    '<rect x="5" y="15" width="6" height="1" fill="#9B9088"/>',
    '<rect x="2" y="16" width="12" height="2" fill="#E86A8A"/>',
    '<rect x="3" y="18" width="10" height="5" fill="#2A2622"/>',
    '<g class="dog-bell" style="transform-box:fill-box;transform-origin:50% 0%">',
    '<rect x="7" y="17" width="2" height="1" fill="#B5860B"/>',
    '<rect x="7" y="18" width="2" height="1" fill="#E0A81E"/>',
    '<rect x="6" y="19" width="4" height="1" fill="#E0A81E"/>',
    '<rect x="6" y="20" width="4" height="1" fill="#E0A81E"/>',
    '<rect x="7" y="21" width="2" height="1" fill="#E0A81E"/>',
    '<rect x="7" y="18" width="1" height="1" fill="#F7D873"/>',
    '<rect x="6" y="19" width="1" height="1" fill="#F7D873"/>',
    '<rect x="9" y="19" width="1" height="1" fill="#A06A0E"/>',
    '<rect x="7" y="20" width="2" height="1" fill="#3A2A0A"/>',
    '</g></svg>'
  ].join("");
}

// ---- 資料與狀態 ----
var TREE = null;
var FAQ = null;
var SCENARIOS = { fire: "./data/fire.json" }; // 之後加場景：補一行
var SAVE_KEY = "compass_save";
var app = document.getElementById("app");
var chatLog = []; // { role, text, src }

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
}
function writeSave(s) { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); }
function clearSave() { localStorage.removeItem(SAVE_KEY); }

function fmtTime(iso) {
  var d = new Date(iso), p = function (n) { return ("0" + n).slice(-2); };
  return (d.getMonth() + 1) + "/" + d.getDate() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

// ---- 載入場景樹 ----
async function ensureTree(disaster) {
  if (TREE && TREE.id === disaster) return TREE;
  var res = await fetch(SCENARIOS[disaster]);
  TREE = await res.json();
  return TREE;
}
async function ensureFaq(disaster) {
  if (FAQ) return FAQ;
  var res = await fetch("./data/" + disaster + "_faq.json");
  FAQ = await res.json();
  return FAQ;
}

// ---- 首頁 ----
function renderHome() {
  var save = loadSave();
  var html = '<div class="logo">' + dogSVG(28) +
    '<div><div>Laura-Compass</div><div class="sub">蘿拉避難羅盤</div></div></div>';

  if (save) {
    html += '<button class="resume-card" id="resumeBtn">' +
      '<div class="label">繼續上一次的應變 →</div>' +
      '<div><strong>' + esc(scenarioTitle(save.disaster)) + '</strong></div>' +
      '<div class="meta">' + fmtTime(save.startedAt) + ' 開始・' + countDone(save) + ' 項已完成</div>' +
      '</button>' +
      '<button class="btn btn-ghost" id="clearBtn">這場結束了，清除存檔</button>';
  }

  html += '<div class="section-title">選擇災難類型</div>';
  html += '<button class="btn scenario-btn btn-primary" data-go="fire"><span class="emoji">🔥</span>火災</button>';
  html += '<button class="btn scenario-btn disabled" disabled><span class="emoji">⏳</span>地震・空襲・急救（陸續加入）</button>';
  html += '<button class="btn" id="askHome">問蘿拉避難問題</button>';

  html += '<div class="home-foot">這是引導工具，<strong>不能取代 119／110</strong>。緊急狀況請先撥打電話求救。<br>避難內容來源：內政部消防署 消防防災館。</div>';

  app.innerHTML = html;
  if (save) {
    document.getElementById("resumeBtn").onclick = function () { resume(save); };
    document.getElementById("clearBtn").onclick = function () {
      if (confirm("確定清除這場應變的存檔？")) { clearSave(); renderHome(); }
    };
  }
  app.querySelector('[data-go="fire"]').onclick = function () { startScenario("fire"); };
  document.getElementById("askHome").onclick = function () { openChat("fire", "home"); };
}

function scenarioTitle(d) { return d === "fire" ? "火災" : d; }
function countDone(save) {
  var n = 0, done = save.done || {};
  for (var k in done) n += done[k].length;
  return n;
}

// ---- 開始 / 繼續場景 ----
async function startScenario(disaster) {
  await ensureTree(disaster);
  var save = {
    disaster: disaster,
    startedAt: new Date().toISOString(),
    currentNode: TREE.start,
    history: [],
    done: {},
    notes: ""
  };
  writeSave(save);
  renderNode();
}
async function resume(save) {
  await ensureTree(save.disaster);
  renderNode();
}

// ---- 決策節點 ----
function renderNode() {
  var save = loadSave();
  var node = TREE.nodes[save.currentNode];
  var done = save.done[save.currentNode] || [];
  var terminal = node.options.length === 0;

  var html = '<div class="node-top">' +
    '<button class="btn btn-ghost" id="homeBtn" style="width:auto;margin:0;padding:6px 12px;min-height:auto">← 首頁</button>' +
    '<span class="crumbs">' + esc(TREE.icon + " " + TREE.title) + '</span></div>';

  html += '<div class="tone-' + (node.tone || "warn") + '">';
  html += '<h1 class="headline">' + esc(node.headline) + '</h1>';

  html += '<ul class="actions">';
  node.actions.forEach(function (a, i) {
    var checked = done.indexOf(i) !== -1;
    html += '<li><label><input type="checkbox" data-act="' + i + '"' + (checked ? " checked" : "") +
      '><span class="' + (checked ? "done" : "") + '">' + esc(a) + '</span></label></li>';
  });
  html += '</ul>';

  if (terminal) {
    html += '<div class="end-banner">這是目前這條路的最後一步。狀況有變，隨時回來重新選；過程都幫你存著了。</div>';
  } else {
    if (node.question) html += '<p class="question">' + esc(node.question) + '</p>';
    node.options.forEach(function (o, i) {
      html += '<button class="btn" data-opt="' + i + '">' + esc(o.label) + '</button>';
    });
  }

  html += '<div class="notes-wrap"><label for="notes">當前狀態備註（成員受傷、資源狀況…）</label>' +
    '<textarea class="notes" id="notes" placeholder="例：家人一人受傷，已退回臥室">' + esc(save.notes || "") + '</textarea></div>';

  html += '<p class="source">資料來源：' + esc(TREE.source) + '</p>';

  html += '<div class="nav-row">';
  if (save.history.length) html += '<button class="btn" id="backBtn">← 上一步</button>';
  html += '<button class="btn" id="homeBtn2">回首頁</button></div>';
  html += '</div>';

  html += '<button class="ask-fab" id="askFab">' + dogSVG(22) + ' 問蘿拉</button>';

  app.innerHTML = html;

  // 行動打勾
  app.querySelectorAll('input[data-act]').forEach(function (cb) {
    cb.onchange = function () { toggleAction(parseInt(cb.dataset.act, 10)); };
  });
  // 選項
  app.querySelectorAll('button[data-opt]').forEach(function (b) {
    b.onclick = function () { chooseOption(parseInt(b.dataset.opt, 10)); };
  });
  // 備註
  var ta = document.getElementById("notes");
  ta.oninput = function () { var s = loadSave(); s.notes = ta.value; writeSave(s); };
  // 導覽
  document.getElementById("homeBtn").onclick = renderHome;
  document.getElementById("homeBtn2").onclick = renderHome;
  if (document.getElementById("backBtn")) document.getElementById("backBtn").onclick = goBack;
  document.getElementById("askFab").onclick = function () { openChat(save.disaster, "node"); };

  window.scrollTo(0, 0);
}

function toggleAction(i) {
  var save = loadSave();
  var arr = save.done[save.currentNode] || [];
  var pos = arr.indexOf(i);
  if (pos === -1) arr.push(i); else arr.splice(pos, 1);
  save.done[save.currentNode] = arr;
  writeSave(save);
  renderNode();
}
function chooseOption(i) {
  var save = loadSave();
  var node = TREE.nodes[save.currentNode];
  save.history.push(save.currentNode);
  save.currentNode = node.options[i].next;
  writeSave(save);
  renderNode();
}
function goBack() {
  var save = loadSave();
  if (!save.history.length) return;
  save.currentNode = save.history.pop();
  writeSave(save);
  renderNode();
}

// ---- 離線問答對話 ----
async function openChat(disaster, origin) {
  await ensureFaq(disaster);
  renderChat(origin);
}
function renderChat(origin) {
  var html = '<div class="chat-head">' +
    '<button class="btn btn-ghost" id="chatBack" style="width:auto;margin:0;padding:6px 12px;min-height:auto">← 返回</button>' +
    '<div class="logo" style="margin:0;font-size:18px">問蘿拉</div></div>';
  html += '<p class="chat-hint">打字問我火災避難問題，我用消防署資料離線回你。</p>';
  html += '<div class="chat-log" id="chatLog"></div>';
  html += '<div class="chat-input-row"><input id="chatInput" placeholder="例：門把好燙怎麼辦" autocomplete="off">' +
    '<button id="chatSend">送出</button></div>';
  app.innerHTML = html;

  document.getElementById("chatBack").onclick = function () {
    if (origin === "node" && loadSave()) renderNode(); else renderHome();
  };
  var input = document.getElementById("chatInput");
  document.getElementById("chatSend").onclick = sendChat;
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") sendChat(); });
  paintChat();
  if (!chatLog.length) input.focus();
}

function paintChat() {
  var box = document.getElementById("chatLog");
  if (!box) return;
  if (!chatLog.length) {
    box.innerHTML = '<div style="text-align:center">' + dogSVG(56).replace('class="dog-avatar"', 'class="dog-avatar empty-dog"') +
      '<p class="chat-hint">（豎耳）想問什麼，我在。</p></div>';
    return;
  }
  box.innerHTML = chatLog.map(function (m) {
    if (m.role === "user") return '<div class="bubble user">' + esc(m.text) + "</div>";
    var src = m.src ? '<span class="src">— ' + esc(m.src) + "</span>" : "";
    return '<div class="laura-row">' + dogSVG(26) +
      '<div class="bubble laura">' + esc(m.text) + src + "</div></div>";
  }).join("");
  box.scrollTop = box.scrollHeight;
}

function sendChat() {
  var input = document.getElementById("chatInput");
  var q = input.value.trim();
  if (!q) return;
  chatLog.push({ role: "user", text: q });
  var hit = matchFaq(q, FAQ);
  if (hit) {
    chatLog.push({ role: "laura", text: hit.a, src: hit.source });
  } else {
    chatLog.push({
      role: "laura",
      text: "這題我沒有預先準備好的答案。緊急請先撥 119；或回到引導，我帶你一步步走。",
      src: ""
    });
  }
  input.value = "";
  paintChat();
  input.focus();
}

// ---- 啟動 ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("./sw.js").catch(function () {}); });
}
renderHome();
