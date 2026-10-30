(() => {
const $ = s => document.querySelector(s);
const COLS = 6, ROWS = 8, N = COLS * ROWS;
const CH = SPECIES.chicken.breeds;
const rnd = a => a[Math.floor(Math.random() * a.length)];
const NAMES = ["Henrietta","Nugget","Beyoncé","Clucky","Omelette","Peggy","Dolly","Kale","Scramble","Pickles","Mabel","Waffles"];

/* ---------- ART ---------- */
let pid = 0;
function henSVG(breed) {
  const a = CH[breed].art, id = "p" + (pid++);
  let defs = "", fill = a.body;
  if (a.pattern === "barred") { defs = `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="8" height="8" fill="#eee"/><rect width="8" height="3.5" fill="#333"/></pattern>`; fill = `url(#${id})`; }
  if (a.pattern === "laced") { defs = `<pattern id="${id}" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="#f6f6f6"/><path d="M0 9 Q5 1 10 9" fill="none" stroke="#2b2b2b" stroke-width="2"/></pattern>`; fill = `url(#${id})`; }
  const cs = a.combSize || 1;
  const comb = cs < 0.8 ? `<ellipse cx="72" cy="18" rx="${9*cs+3}" ry="4" fill="${a.comb}"/>`
    : [62,70,78].map((x,i)=>`<circle cx="${x}" cy="${18-(i==1?3:0)*cs}" r="${5.5*cs}" fill="${a.comb}"/>`).join("");
  return `<svg viewBox="0 0 100 95"><defs>${defs}</defs>
  <path d="M28 52 Q8 20 18 18 Q26 30 34 40Z" fill="${a.wing}"/>
  <line x1="44" y1="76" x2="40" y2="90" stroke="${a.legs}" stroke-width="4" stroke-linecap="round"/><line x1="58" y1="76" x2="60" y2="90" stroke="${a.legs}" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="50" cy="56" rx="31" ry="24" fill="${fill}" stroke="#0002"/>
  <ellipse cx="44" cy="58" rx="16" ry="11" fill="${a.wing}" opacity=".9"/>
  ${a.hackle ? `<ellipse cx="68" cy="42" rx="12" ry="14" fill="${a.hackle}"/>` : ""}
  ${comb}
  <circle cx="72" cy="32" r="13" fill="${a.pattern ? (a.pattern=="barred"?"#ddd":"#f6f6f6") : a.body}" stroke="#0002"/>
  ${a.muffs ? `<ellipse cx="74" cy="42" rx="10" ry="6" fill="#7a5233"/>` : `<ellipse cx="79" cy="43" rx="3.5" ry="5" fill="${a.comb}"/>`}
  <path d="M84 30 L95 34 L84 37Z" fill="${a.beak}"/>
  <circle cx="76" cy="29" r="3.4" fill="#fff"/><circle cx="77" cy="29" r="2" fill="${a.eye||"#222"}"/>
  </svg>`;
}
function eggSVG(color, speck) {
  const f = EGG_COLORS[color].fill;
  const sp = speck ? [[12,14],[20,22],[9,26],[17,10],[22,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.3" fill="#3a1d10"/>`).join("") : "";
  return `<svg viewBox="0 0 32 40"><path d="M16 2 C26 2 30 18 30 26 C30 34 24 38 16 38 C8 38 2 34 2 26 C2 18 6 2 16 2Z" fill="${f}" stroke="#0003"/><ellipse cx="11" cy="14" rx="3" ry="5" fill="#fff" opacity=".45"/>${sp}</svg>`;
}
const ART = {
  coop: l => `<svg viewBox="0 0 100 100"><rect x="14" y="44" width="72" height="46" fill="#c0392b" stroke="#7b1f16" stroke-width="3"/><path d="M6 48 L50 12 L94 48Z" fill="#6d4c41"/><rect x="40" y="62" width="20" height="28" fill="${l?"#5d4037":"#2b1a10"}"/><path d="M38 90 L62 90 L72 99 L28 99Z" fill="#a1887f"/>${l?`<rect x="43" y="70" width="14" height="11" rx="2" fill="#ffd54f"/><path d="M45 70 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#ffd54f" stroke-width="2.5"/>`:""}<circle cx="27" cy="58" r="5" fill="#ffe082"/></svg>`,
  run: () => `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#d9bb86"/><path d="M0 0 L100 100 M25 0 L100 75 M50 0 L100 50 M75 0 L100 25 M0 25 L75 100 M0 50 L50 100 M0 75 L25 100 M100 0 L0 100 M75 0 L0 75 M50 0 L0 50 M25 0 L0 25 M100 25 L25 100 M100 50 L50 100 M100 75 L75 100" stroke="#8d8d8d" stroke-width="1.5" opacity=".6"/></svg>`,
  feeder: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="82" rx="32" ry="9" fill="#9e9e9e"/><ellipse cx="50" cy="80" rx="26" ry="6" fill="#f2c14e"/><rect x="36" y="26" width="28" height="52" rx="4" fill="#b0bec5" stroke="#607d8b" stroke-width="2"/><ellipse cx="50" cy="26" rx="16" ry="5" fill="#90a4ae"/></svg>`,
  waterer: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="84" rx="30" ry="8" fill="#c62828"/><ellipse cx="50" cy="82" rx="24" ry="5" fill="#4fc3f7"/><path d="M32 80 L34 34 Q50 20 66 34 L68 80Z" fill="#e3f2fd" stroke="#90caf9" stroke-width="2"/><rect x="34" y="50" width="32" height="28" fill="#81d4fa" opacity=".7"/><rect x="46" y="18" width="8" height="10" fill="#c62828"/></svg>`,
  nest: () => `<svg viewBox="0 0 100 100"><rect x="14" y="40" width="72" height="50" fill="#a1683a" stroke="#6d4421" stroke-width="3"/><path d="M18 46 Q30 36 40 46 Q50 34 60 46 Q72 36 82 46" stroke="#f4d03f" stroke-width="7" fill="none"/><rect x="14" y="30" width="72" height="10" fill="#8d5a2b"/></svg>`,
  fence: () => `<svg viewBox="0 0 100 100"><rect y="34" width="100" height="9" fill="#8d6e63"/><rect y="62" width="100" height="9" fill="#8d6e63"/>${[10,40,70].map(x=>`<path d="M${x} 90 V24 L${x+10} 14 L${x+20} 24 V90Z" fill="#bcaaa4" stroke="#6d4c41" stroke-width="2"/>`).join("")}</svg>`,
  tree: () => `<svg viewBox="0 0 100 100"><rect x="44" y="56" width="12" height="36" fill="#6d4c41"/><circle cx="50" cy="42" r="30" fill="#388e3c"/><circle cx="36" cy="34" r="16" fill="#43a047"/><circle cx="62" cy="30" r="14" fill="#4caf50"/></svg>`,
  hand: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">👆</text></svg>`,
  bulldoze: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">🧹</text></svg>`
};
const guySVG = `<svg viewBox="0 0 60 72"><circle cx="30" cy="9" r="6" fill="#5d4037"/><circle cx="30" cy="22" r="13" fill="#f1c7a0"/><path d="M17 18 Q30 4 43 18 Q30 12 17 18Z" fill="#5d4037"/><rect x="18" y="18" width="10" height="6" rx="2" fill="#111"/><rect x="32" y="18" width="10" height="6" rx="2" fill="#111"/><line x1="28" y1="21" x2="32" y2="21" stroke="#111" stroke-width="1.5"/><path d="M25 29 Q30 32 35 29" stroke="#8a4a2a" stroke-width="1.6" fill="none"/><path d="M12 72 V46 Q30 34 48 46 V72Z" fill="#7e57c2"/><path d="M20 38 Q30 46 40 38 L40 44 Q30 50 20 44Z" fill="#ff7043"/><rect x="44" y="48" width="10" height="14" rx="2" fill="#fff" stroke="#795548"/><rect x="44" y="52" width="10" height="4" fill="#8d6e63"/></svg>`;

/* ---------- CONFIG ---------- */
const ITEMS = {
  hand:    { name: "Tap", cost: 0 },
  coop:    { name: "Coop", cost: 30, max: 1, joke: "I bought a coop! Wait, the chickens sleep in it? Like a tiny hotel?", tip: "Hens roost in a coop at night. Lock it after dark to keep predators out." },
  feeder:  { name: "Feeder", cost: 10, joke: "Tried feeding them avocado toast. Nope. Layer feed it is.", tip: "Laying hens need layer feed every day. Tap a feeder to refill it (2🪙)." },
  waterer: { name: "Water", cost: 8, joke: "They don't want my sparkling water? Rude.", tip: "Fresh water is a must. No water, no eggs. Tap to refill (free)." },
  nest:    { name: "Nest box", cost: 8, joke: "It's a cozy little box for laying. Very Scandinavian.", tip: "Hens like a dark, comfy nest box to lay in. Without one they hide eggs in the grass." },
  run:     { name: "Run", cost: 6, joke: "A covered run! It's like a gated community for birds.", tip: "A covered run gives hens outdoor space and protects them from hawks." },
  fence:   { name: "Fence", cost: 3, joke: "Fences! Like a velvet rope, but for raccoons.", tip: "Fencing keeps out ground predators like raccoons and foxes." },
  tree:    { name: "Shade tree", cost: 12, joke: "I planted a tree. I am basically a farmer now.", tip: "Hens need shade on hot days, and trees give cover from hawks." },
  bulldoze:{ name: "Remove", cost: 0 }
};
const WEATHER = [["☀️","Sunny"],["☀️","Sunny"],["🔥","Hot"],["🌧️","Rain"],["❄️","Cold"],["⛅","Cloudy"]];
const QUIZ = [
  ["Do hens need a rooster to lay eggs?", ["Yes","No"], 1, "Nope! Hens lay without a rooster. You only need one for fertile eggs that can hatch into chicks."],
  ["What color eggs does the all-black Ayam Cemani lay?", ["Black","Cream"], 1, "Cream! Black feathers, black skin, totally normal eggs."],
  ["Roughly how often can a good laying hen lay?", ["About once a day","Once a week"], 0, "A good layer can lay about one egg a day in her prime, less in winter."],
  ["Does egg shell color change how it tastes?", ["Yes","No"], 1, "No. Shell color comes from the breed. Taste comes from diet and freshness."]
];

/* ---------- STATE ---------- */
let S;
function fresh(breed = "leghorn") {
  S = { coins: 60, day: 1, hour: 7, grid: Array(N).fill(null), hens: [], basket: [], ground: [], locked: false,
    weather: WEATHER[0], speed: 1, collection: {}, said: {}, unlocked: { leghorn: true }, premium: {}, quizI: 0, lifetime: 0 };
  addHen(breed, true);
}
function addHen(breed, free) {
  const b = CH[breed]; const used = S.hens.map(h => h.name);
  const name = NAMES.find(n => !used.includes(n)) || "Hen " + (S.hens.length + 1);
  S.hens.push({ id: Math.random(), breed, name, health: 90, happy: 80, egg: rnd(b.eggs), x: 40 + Math.random() * 30, y: 40 + Math.random() * 30, flip: false });
}
const tilesOf = t => S.grid.map((g, i) => g && g.type === t ? i : -1).filter(i => i >= 0);
const has = t => tilesOf(t).length > 0;
const isNight = () => S.hour >= 20 || S.hour < 6;

/* ---------- UI helpers ---------- */
let bubbleTimer;
function say(text, tip) { $("#bubbleText").innerHTML = text; $("#bubble").classList.toggle("tip", !!tip); }
function sayOnce(key, text, tip) { if (S.said[key]) return; S.said[key] = 1; say(text, tip); }
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 2200); }
function floatAt(i, text) {
  const el = document.createElement("div"); el.className = "float"; el.textContent = text;
  el.style.left = ((i % COLS) / COLS * 100 + 3) + "%"; el.style.top = (Math.floor(i / COLS) / ROWS * 100) + "%";
  $("#fx").appendChild(el); setTimeout(() => el.remove(), 1300);
}
function modal(html) { $("#modalCard").innerHTML = html; $("#modal").classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
window.closeModal = closeModal;

/* ---------- RENDER ---------- */
let tool = "hand";
function renderTools() {
  $("#tools").innerHTML = Object.entries(ITEMS).map(([k, v]) =>
    `<button class="tool ${tool === k ? "sel" : ""}" data-t="${k}">${ART[k] ? ART[k](false) : ""}${v.name}<small>${v.cost ? v.cost + "🪙" : "&nbsp;"}</small></button>`).join("");
}
function renderGrid() {
  $("#grid").innerHTML = S.grid.map((g, i) => {
    let inner = g ? ART[g.type](g.type === "coop" && S.locked) : "";
    if (g && g.type === "coop" && S.locked && S.hens.length) inner += `<div style="position:absolute;top:-4px;right:2px;font-size:15px">💤</div>`;
    if (g && g.type === "feeder") inner += `<div class="lvl feed"><i style="width:${g.lvl}%"></i></div>`;
    if (g && g.type === "waterer") inner += `<div class="lvl"><i style="width:${g.lvl}%"></i></div>`;
    S.ground.filter(e => e.tile === i).forEach((e, k) => inner += `<div class="egg-drop" style="margin-left:${k*12}%" data-egg="${S.ground.indexOf(e)}">${eggSVG(e.color, CH[e.breed].speckled)}</div>`);
    return `<div class="tile" data-i="${i}">${inner}</div>`;
  }).join("");
}
function renderHens() {
  $("#hens").innerHTML = S.hens.map(h => {
    const mood = h.health < 35 ? "🤒" : h.happy < 35 ? "😤" : h.happy > 75 ? "💛" : "";
    const inside = S.locked && has("coop");
    return `<div class="hen ${h.flip ? "flip" : ""}" data-h="${h.id}" style="${inside ? "opacity:0;pointer-events:none;" : ""}left:${h.x}%;top:${h.y}%"><span class="mood">${mood}</span>${henSVG(h.breed)}</div>`;
  }).join("");
  $("#henbar").innerHTML = S.hens.map(h => `<div class="hencard">${henSVG(h.breed)}<div><b>${h.name}</b> <span style="opacity:.6">${CH[h.breed].name}</span>
   <div class="bar"><i style="width:${h.health}%;background:#e57373"></i></div><div class="bar"><i style="width:${h.happy}%;background:#ffca28"></i></div></div></div>`).join("") || `<div class="hencard">No hens yet. Visit the 🛒 Shop!</div>`;
}
function renderHUD() {
  $("#coins").textContent = S.coins; $("#day").textContent = S.day;
  $("#clock").textContent = `${(S.hour % 12) || 12}:00 ${S.hour < 12 ? "am" : "pm"}`;
  $("#clockIcon").textContent = isNight() ? "🌙" : "☀️";
  $("#weather").textContent = S.weather.join(" ");
  $("#basketN").textContent = S.basket.length;
  const lb = $("#lockBtn"); lb.textContent = S.locked ? "🔒 Locked" : "🔓 Coop open"; lb.classList.toggle("locked", S.locked);
  $("#speedBtn").textContent = S.speed ? `▶︎ ${S.speed}x` : "⏸ Paused";
  $("#night").style.opacity = isNight() ? 0.75 : (S.hour === 6 || S.hour === 19) ? 0.3 : 0;
  $("#sky").innerHTML = S.weather[1] === "Rain" ? `<div class="rain"></div>` : "";
}
function renderAll() { renderHUD(); renderGrid(); renderHens(); }

/* ---------- HEN MOVEMENT ---------- */
function tilePos(i) { return { x: (i % COLS) / COLS * 100 + 1, y: Math.floor(i / COLS) / ROWS * 100 + 1 }; }
function wander() {
  const coop = tilesOf("coop")[0];
  const runs = tilesOf("run");
  S.hens.forEach(h => {
    let p;
    if ((isNight() || S.locked) && coop !== undefined) p = tilePos(coop), p.x += Math.random() * 6, p.y += Math.random() * 4;
    else {
      const spots = runs.length && Math.random() < 0.7 ? runs : [...Array(N).keys()].filter(i => !S.grid[i] || S.grid[i].type === "run");
      p = tilePos(rnd(spots)); p.x += Math.random() * 4; p.y += Math.random() * 4;
    }
    h.flip = p.x < h.x; h.x = p.x; h.y = p.y;
  });
  renderHens();
}

/* ---------- SIMULATION ---------- */
function predator(emoji, i, msg) {
  const el = document.createElement("div"); el.className = "predator"; el.textContent = emoji;
  const p = tilePos(i ?? 0); el.style.left = "-15%"; el.style.top = p.y + "%";
  $("#fx").appendChild(el); requestAnimationFrame(() => { el.style.left = p.x + "%"; });
  setTimeout(() => { el.style.left = "110%"; }, 1700); setTimeout(() => el.remove(), 3300);
  toast(msg);
}
function hurt(h, n) { h.health = Math.max(0, h.health - n); h.happy = Math.max(0, h.happy - n / 2); }
function tick() {
  S.hour = (S.hour + 1) % 24;
  if (S.hour === 0) newDay();
  const feeders = tilesOf("feeder").map(i => S.grid[i]), waters = tilesOf("waterer").map(i => S.grid[i]);
  const day = !isNight(), w = S.weather[1];
  const totalFeed = feeders.reduce((a, f) => a + f.lvl, 0), totalWater = waters.reduce((a, f) => a + f.lvl, 0);
  if (day) {
    feeders.forEach(f => f.lvl = Math.max(0, f.lvl - 1.5 * S.hens.length / feeders.length));
    waters.forEach(f => f.lvl = Math.max(0, f.lvl - (w === "Hot" ? 4 : 2) * S.hens.length / waters.length));
  }
  S.hens.forEach(h => {
    let d = 1;
    if (day && totalFeed <= 0) { d -= 3; h.health -= 1; sayOnce("nofeed", "Why are they yelling at me? 😰 <i>Tip: the feeder is empty. Tap it to refill.</i>", 1); }
    if (day && totalWater <= 0) { d -= 3; h.health -= 2; sayOnce("nowater", "They keep staring at me. Thirsty? <i>Tip: hens need fresh water all day.</i>", 1); }
    if (day && w === "Hot" && !has("tree")) { d -= 3; h.health -= 1; sayOnce("hot", "They're panting with their beaks open! <i>Tip: on hot days hens need shade and water.</i>", 1); }
    if (w === "Cold" && !has("coop")) { h.health -= 2; d -= 2; }
    if (w === "Rain" && !has("coop")) d -= 1;
    if (day && S.locked && S.hour > 7 && S.hour < 19) { d -= 3; sayOnce("stuck", "The hens are banging on the door. Oh. It's daytime. <i>Tip: unlock the coop in the morning.</i>", 1); }
    if (has("coop") && totalFeed > 0 && totalWater > 0 && d > 0) h.health = Math.min(100, h.health + 1);
    h.happy = Math.max(0, Math.min(100, h.happy + d));
    h.health = Math.max(0, Math.min(100, h.health));
  });
  if (S.hour === 8) layEggs();
  if (S.hour === 13) hawkCheck();
  if (S.hour === 20 && !S.locked) say(has("coop") ? "The hens just... went to bed by themselves? At 8pm? Icons. <i>Tip: lock the coop at night!</i>" : "It's dark and my hens have nowhere to sleep. <i>Tip: build a coop.</i>", 1);
  if (S.hour === 23) raccoonCheck();
  if (S.hour === 6 && S.locked) say("Morning! Time to unlock the coop and let the ladies out.", 1);
  S.hens = S.hens.filter(h => {
    if (h.health > 0) return true;
    modal(`<h2>😢 ${h.name} has retired</h2><p>She's gone to live on Farmer Joan's farm, where someone knows what they're doing.</p><p>Keep food, water, shade, and a locked coop to keep hens healthy.</p><button class="buy big" onclick="closeModal()">I'll do better</button>`);
    return false;
  });
  renderAll();
}
function newDay() {
  S.day++; S.weather = rnd(WEATHER);
  if (S.weather[1] === "Cold") sayOnce("cold", "It's freezing! Do chickens wear sweaters? <i>Tip: a draft-free coop keeps hens warm. No sweaters needed.</i>", 1);
}
function layEggs() {
  const nests = tilesOf("nest");
  S.hens.forEach(h => {
    const ok = h.health > 40 && h.happy > 35 && !(S.locked && !has("nest"));
    const rate = CH[h.breed].layRate * (S.weather[1] === "Cold" ? 0.6 : 1);
    if (!ok || Math.random() > rate) return;
    let tile = nests.length ? rnd(nests) : rnd([...Array(N).keys()].filter(i => !S.grid[i]));
    S.ground.push({ tile, color: h.egg, breed: h.breed, hen: h.name });
    if (!nests.length) sayOnce("hidden", "I found an egg... in a bush?! <i>Tip: give them a nest box so they lay where you can find them.</i>", 1);
  });
  if (S.ground.length) sayOnce("rooster", "WAIT. We got eggs but I don't have a rooster?! <i>Fact: hens lay eggs without a rooster. Roosters only matter if you want chicks.</i>", 1);
}
function hawkCheck() {
  if (!S.hens.length || S.locked) return;
  let p = 0.12; if (has("run")) p *= 0.35; if (has("tree")) p *= 0.6;
  if (Math.random() < p) { const h = rnd(S.hens); hurt(h, 30); predator("🦅", 3, `A hawk swooped at ${h.name}!`); say("A HAWK?! In my backyard? <i>Tip: a covered run and trees give hens cover from hawks.</i>", 1); }
}
function raccoonCheck() {
  if (!S.hens.length) return;
  const coop = tilesOf("coop")[0];
  if (coop !== undefined && S.locked) { predator("🦝", coop, "A raccoon tried the coop door. Locked. Nice!"); sayOnce("foiled", "Ha! The raccoon rattled the door and left. Locking up works!", 1); return; }
  const fence = Math.min(1, tilesOf("fence").length / 12);
  if (Math.random() < 0.55 * (1 - fence)) {
    const h = rnd(S.hens); hurt(h, 45); const stolen = S.ground.length; S.ground = [];
    predator("🦝", coop ?? 20, `A raccoon got into the yard! ${h.name} is hurt${stolen ? " and eggs are gone" : ""}.`);
    say("Is that a big cat with a mask?? <i>Tip: raccoons hunt at night. Lock the coop and add fencing.</i>", 1);
  }
}

/* ---------- INPUT ---------- */
$("#tools").addEventListener("click", e => { const b = e.target.closest(".tool"); if (!b) return; tool = b.dataset.t; renderTools(); if (ITEMS[tool].tip) say(`${ITEMS[tool].name}: ${ITEMS[tool].tip}`, 1); });
$("#grid").addEventListener("click", e => {
  const eg = e.target.closest("[data-egg]");
  if (eg) return collect(+eg.dataset.egg);
  const t = e.target.closest(".tile"); if (!t) return; const i = +t.dataset.i, g = S.grid[i];
  if (tool === "hand") {
    if (g && g.type === "feeder") { if (S.coins < 2) return toast("Not enough coins"); S.coins -= 2; g.lvl = 100; floatAt(i, "-2🪙 feed"); }
    else if (g && g.type === "waterer") { g.lvl = 100; floatAt(i, "💧 full"); }
    else if (g && g.type === "coop") return toggleLock();
    return renderAll();
  }
  if (tool === "bulldoze") { if (g) { S.coins += Math.floor(ITEMS[g.type].cost / 2); S.grid[i] = null; floatAt(i, "removed"); renderAll(); } return; }
  if (g) return toast("Something's already there");
  const it = ITEMS[tool];
  if (it.max && tilesOf(tool).length >= it.max) return toast("One coop is plenty for now");
  if (S.coins < it.cost) return toast("Not enough coins. Sell some eggs!");
  S.coins -= it.cost; S.grid[i] = { type: tool, lvl: 100 }; floatAt(i, `-${it.cost}🪙`);
  if (!S.said["built_" + tool]) { S.said["built_" + tool] = 1; say(`${it.joke} <i>${it.tip}</i>`, 1); }
  renderAll(); wander();
});
function collect(k) {
  const e = S.ground.splice(k, 1)[0]; S.basket.push(e); S.lifetime++;
  S.collection[e.color] = (S.collection[e.color] || 0) + 1; floatAt(e.tile, "+1 🥚");
  renderAll();
  if (S.collection[e.color] === 1 && e.color !== "white" && e.color !== "brown") setTimeout(() => shareCard(e), 400);
}
function toggleLock() {
  if (!has("coop")) return toast("Build a coop first!");
  S.locked = !S.locked;
  if (S.locked && !isNight()) sayOnce("daylock", "Locked them in for safety! ...During the day. They look annoyed.", 1);
  renderAll(); wander();
}
$("#lockBtn").onclick = toggleLock;
$("#speedBtn").onclick = () => { S.speed = { 1: 2, 2: 4, 4: 0, 0: 1 }[S.speed]; renderHUD(); loop(); };
$("#hens").addEventListener("click", e => { const el = e.target.closest(".hen"); if (!el) return; const h = S.hens.find(x => x.id == el.dataset.h);
  say(`<b>${h.name}</b> the ${CH[h.breed].name}: ${CH[h.breed].blurb} <i>${CH[h.breed].fact}</i>`, 1); });

/* ---------- SELL / SHOP / SHARE ---------- */
function counts(list) { const c = {}; list.forEach(e => c[e.color] = (c[e.color] || 0) + 1); return c; }
$("#sellBtn").onclick = () => {
  const c = counts(S.basket); const total = S.basket.reduce((a, e) => a + EGG_COLORS[e.color].value, 0);
  modal(`<h2>💰 Farmers market</h2><p>Brayden set up a folding table outside his apartment. Fancy colors sell for more.</p>
   ${Object.keys(c).map(k => `<div class="row">${eggSVG(k)}<div class="t"><b>${EGG_COLORS[k].label}</b> × ${c[k]}<br>${EGG_COLORS[k].value}🪙 each</div></div>`).join("") || "<p><i>Your basket is empty. Tap eggs in the yard to collect them.</i></p>"}
   <button class="buy big" ${total ? "" : "disabled"} onclick="sellAll()">Sell all for ${total}🪙</button>
   <button class="buy big" onclick="shareCard()">📸 Share my egg rainbow</button>
   <button class="act big" onclick="closeModal()">Close</button>`);
};
window.sellAll = () => { const t = S.basket.reduce((a, e) => a + EGG_COLORS[e.color].value, 0); S.coins += t; S.basket = []; closeModal(); toast(`Sold! +${t}🪙`); renderAll(); };
let shopTab = "hens";
function shop() {
  const tabs = `<div class="tabs">${[["hens","🐔 Hens"],["premium","⭐ Extras"],["quiz","❓ Quiz"]].map(([k,l])=>`<button class="${shopTab===k?"on":""}" onclick="shopTab('${k}')">${l}</button>`).join("")}</div>`;
  let body = "";
  if (shopTab === "hens") {
    body = Object.entries(CH).map(([k, b]) => `<div class="row">${henSVG(k)}<div class="t"><b>${b.name}</b> lays ${b.eggs.map(c => EGG_COLORS[c].label.toLowerCase()).join(" or ")}<br>${b.blurb}</div>
      <button class="buy" ${S.coins < b.price ? "disabled" : ""} onclick="buyHen('${k}')">${b.price ? b.price + "🪙" : "Free"}</button></div>`).join("")
      + Object.values(SPECIES).filter(s => s.comingSoon).map(s => `<div class="row" style="opacity:.6"><span style="font-size:36px">${s.icon}</span><div class="t"><b>${s.name} 🔒</b><br>${s.teaser}</div></div>`).join("");
  } else if (shopTab === "premium") {
    const P = [["twin","🏡 Twin with a real farm hen","Your hen is paired with a real hen on a small farm. Her real laying drives your eggs, plus weekly photos.","$4.99/mo"],
      ["pack","🌈 Rare breed pack","Unlock every breed instantly, including Marans and Ayam Cemani.","$2.99"],
      ["disco","🪩 Disco coop skin","Cosmetic only. Hens remain unimpressed.","$0.99"],
      ["realeggs","📦 Real eggs from the farm","Order a dozen real eggs from the farm, for pickup or local delivery.","$7/dozen"]];
    body = `<span class="demo">DEMO: no real payments. Buttons just show how it would work.</span>` + P.map(([k,t,d,p]) => `<div class="row"><div class="t"><b>${t}</b><br>${d}</div><button class="buy real" onclick="mockPay('${t}','${p}')">${S.premium[k]?"✓":p}</button></div>`).join("");
  } else {
    const q = QUIZ[S.quizI % QUIZ.length];
    body = `<p><b>City Slicker Quiz:</b> ${q[0]}</p>${q[1].map((o,i)=>`<button class="buy big" onclick="answer(${i})">${o}</button>`).join("")}<p id="qa"></p>`;
  }
  modal(`<h2>🛒 Coop Shop</h2><p>🪙 ${S.coins} coins</p>${tabs}${body}<button class="act big" onclick="closeModal()">Close</button>`);
}
window.shopTab = k => { shopTab = k; shop(); };
window.buyHen = k => { const b = CH[k]; if (S.coins < b.price) return; if (S.hens.length >= 6) return toast("Coop is full (6 hens max)"); S.coins -= b.price; addHen(k); closeModal(); toast(`Welcome, ${S.hens.at(-1).name} the ${b.name}!`); say(`New hen! ${b.fact}`, 1); renderAll(); wander(); };
window.mockPay = (t, p) => modal(`<h2>Demo checkout</h2><p><b>${t}</b> · ${p}</p><p class="demo">This is a prototype. No payment is taken.</p><button class="buy big" onclick="shopTab('premium')">Back to shop</button>`);
window.answer = i => { const q = QUIZ[S.quizI % QUIZ.length]; const right = i === q[2]; if (right) S.coins += 3;
  document.getElementById("qa").innerHTML = `${right ? "✅ Correct! +3🪙" : "❌ Not quite."} ${q[3]}<br><button class="buy big" onclick="nextQ()">Next question</button>`; renderHUD(); };
window.nextQ = () => { S.quizI++; shop(); };
$("#shopBtn").onclick = shop;
window.shareCard = e => {
  const c = Object.keys(S.collection);
  const headline = e ? `My hen ${e.hen} laid a ${EGG_COLORS[e.color].label.toLowerCase()} egg!` : `My Coop City egg rainbow`;
  const henB = e ? e.breed : (S.hens[0] || { breed: "leghorn" }).breed;
  const fun = e && e.breed === "ayam" ? "Plot twist: the all-black hen lays CREAM eggs. 🖤🥚" : e ? CH[e.breed].fact : `${S.lifetime} eggs collected so far.`;
  modal(`<div class="share"><div style="width:110px;margin:0 auto">${henSVG(henB)}</div><h3>${headline}</h3>
   <div class="eggrow">${(e ? [e.color] : c).map(k => eggSVG(k, k === "chocolate")).join("")}</div><p>${fun}</p><p style="font-size:12px">🐔 Coop City · Day ${S.day}</p></div>
   <button class="buy big" onclick="navigator.clipboard&&navigator.clipboard.writeText('${headline.replace(/'/g,"")} #CoopCity');toast('Copied! (demo)')">📤 Share</button>
   <button class="act big" onclick="closeModal()">Back to the yard</button>`);
};
window.toast = toast;

/* ---------- START ---------- */
function title() {
  modal(`<div class="title"><h1>Coop City</h1><div class="sub">A chicken sim for people who've never met a chicken.</div>
   <div style="width:90px;margin:10px auto">${guySVG}</div>
   <p>"Hi, I'm Brayden. I moved to a house with a yard and got a hen. I have no idea what I'm doing."</p>
   <p><b>Pick your first hen:</b></p>
   ${["leghorn","barred"].map(k=>`<div class="row">${henSVG(k)}<div class="t"><b>${CH[k].name}</b><br>${CH[k].blurb}</div><button class="buy" onclick="start('${k}')">Adopt</button></div>`).join("")}
   <p style="font-size:12px;opacity:.7">More breeds unlock as you sell eggs. Egg laying is simulated demo data.</p></div>`);
}
window.start = k => { fresh(k); closeModal(); renderTools(); renderAll(); wander(); say("OK. Step one: where does a chicken... live? <i>Tip: pick the Coop tool below and tap the yard.</i>", 1); loop(); };
let timer, wtimer;
function loop() { clearInterval(timer); if (S.speed) timer = setInterval(tick, 1400 / S.speed); clearInterval(wtimer); wtimer = setInterval(wander, 2600); }
$("#guyArt").innerHTML = guySVG;

// Demo states for screenshots: ?demo=yard|night|shop|share
const demo = new URLSearchParams(location.search).get("demo");
fresh("leghorn"); renderTools();
if (!demo) { renderAll(); say("Welcome to Coop City!"); title(); }
else {
  S.coins = 48; S.day = 4; S.speed = 0;
  const put = (t, i) => S.grid[i] = { type: t, lvl: t === "feeder" ? 70 : t === "waterer" ? 45 : 100 };
  put("coop", 7); put("nest", 8); put("feeder", 13); put("waterer", 14); put("tree", 10);
  [19,20,21,25,26,27].forEach(i => put("run", i)); [0,1,2,3,4,5,6,12,18,24,30,36,37,38,39].forEach(i => put("fence", i));
  addHen("easter"); addHen("marans"); addHen("ayam");
  S.hens[1].egg = "blue";
  S.ground = [{ tile: 8, color: "blue", breed: "easter", hen: S.hens[1].name }, { tile: 8, color: "white", breed: "leghorn", hen: S.hens[0].name }, { tile: 22, color: "chocolate", breed: "marans", hen: S.hens[2].name }];
  S.collection = { white: 5, brown: 3, cream: 1, chocolate: 2 }; S.basket = [{color:"white"},{color:"white"},{color:"cream"},{color:"chocolate"}]; S.lifetime = 11;
  S.hour = 9; S.hens.forEach((h, k) => { const p = tilePos([19,20,26,27][k]); h.x = p.x + 2; h.y = p.y; h.flip = k % 2; });
  S.hens[3].happy = 90; S.hens[2].happy = 30;
  say("WAIT. We got eggs but I don't have a rooster?! <i>Fact: hens lay eggs without a rooster. Roosters only matter if you want chicks.</i>", 1);
  if (demo === "night") { S.hour = 23; S.locked = true; S.weather = WEATHER[4]; S.ground = []; S.hens.forEach(h => { const p = tilePos(7); h.x = p.x + Math.random()*6; h.y = p.y + Math.random()*4; });
    say("Ha! The raccoon rattled the door and left. Locking up works! <i>Tip: raccoons hunt at night, so lock the coop every evening.</i>", 1); }
  renderAll();
  if (demo === "night") { const el = document.createElement("div"); el.className = "predator"; el.textContent = "🦝"; const p = tilePos(13); el.style.left = p.x + "%"; el.style.top = p.y + "%"; $("#fx").appendChild(el); toast("A raccoon tried the coop door. Locked. Nice!"); }
  if (demo === "shop") shop();
  if (demo === "share") shareCard({ color: "cream", breed: "ayam", hen: S.hens[3].name, tile: 0 });
  if (demo === "title") title();
}
})();
