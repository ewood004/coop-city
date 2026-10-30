(() => {
const $ = s => document.querySelector(s);
const COLS = 6, ROWS = 8, N = COLS * ROWS;
const CH = SPECIES.chicken.breeds;
const rnd = a => a[Math.floor(Math.random() * a.length)];
const NAMES = ["Henrietta","Nugget","Beyoncé","Clucky","Omelette","Peggy","Dolly","Kale","Scramble","Pickles","Mabel","Waffles"];

/* ---------- ART ---------- */
let pid = 0;
const ROOS = SPECIES.chicken.roosters, ROO_FACT = SPECIES.chicken.roosterFact;
function henSVG(breed) {
  const a = breed.startsWith("roo:") ? ROOS[breed.slice(4)].art : CH[breed].art, id = "p" + (pid++);
  let defs = "", fill = a.body;
  if (a.pattern === "barred") { defs = `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="8" height="8" fill="#eee"/><rect width="8" height="3.5" fill="#333"/></pattern>`; fill = `url(#${id})`; }
  if (a.pattern === "laced") { defs = `<pattern id="${id}" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="#f6f6f6"/><path d="M0 9 Q5 1 10 9" fill="none" stroke="#2b2b2b" stroke-width="2"/></pattern>`; fill = `url(#${id})`; }
  if (a.pattern === "patchy") { defs = `<pattern id="${id}" width="22" height="18" patternUnits="userSpaceOnUse"><rect width="22" height="18" fill="${a.body}"/><ellipse cx="5" cy="5" rx="4" ry="3" fill="#f2f0e8"/><ellipse cx="16" cy="13" rx="3" ry="2.5" fill="#e8e5da"/></pattern>`; fill = `url(#${id})`; }
  if (a.pattern === "darklaced") { defs = `<pattern id="${id}" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="${a.body}"/><path d="M0 9 Q5 1 10 9" fill="none" stroke="#efeee6" stroke-width="2"/></pattern>`; fill = `url(#${id})`; }
  const cs = a.combSize || 1;
  const comb = cs < 0.8 ? `<ellipse cx="72" cy="18" rx="${9*cs+3}" ry="4" fill="${a.comb}"/>`
    : [62,70,78].map((x,i)=>`<circle cx="${x}" cy="${18-(i==1?3:0)*cs}" r="${5.5*cs}" fill="${a.comb}"/>`).join("");
  const rx = a.fluffy ? 35 : 31, ry = a.fluffy ? 28 : 24;
  const tail = a.tail ? `<path d="M30 54 Q0 10 22 8 Q30 26 38 42Z" fill="${a.tail}"/><path d="M30 50 Q4 30 10 22 Q24 34 36 44Z" fill="${a.tail2 || a.tail}"/>`
    : `<path d="M28 52 Q8 20 18 18 Q26 30 34 40Z" fill="${a.wing}"/>`;
  const fluff = a.fluffy ? [[26,70],[36,77],[50,80],[64,77],[22,58]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${a.body}"/>`).join("") : "";
  const crest = a.crest ? [[64,20,-30],[70,17,-10],[76,18,15]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="8" fill="${a.crest}" stroke="#0002" transform="rotate(${r} ${x} ${y})"/>`).join("") : "";
  return `<svg viewBox="0 0 100 95"><defs>${defs}</defs>
  ${tail}
  <line x1="44" y1="76" x2="40" y2="90" stroke="${a.legs}" stroke-width="4" stroke-linecap="round"/><line x1="58" y1="76" x2="60" y2="90" stroke="${a.legs}" stroke-width="4" stroke-linecap="round"/>
  ${fluff}<ellipse cx="50" cy="56" rx="${rx}" ry="${ry}" fill="${fill}" stroke="#0002"/>
  <ellipse cx="44" cy="58" rx="16" ry="11" fill="${a.wing}" opacity=".9"/>
  ${a.hackle ? `<ellipse cx="68" cy="42" rx="12" ry="14" fill="${a.hackle}"/>` : ""}
  ${comb}${crest}
  <circle cx="72" cy="32" r="13" fill="${a.face || (a.pattern ? (a.pattern=="barred"?"#ddd":"#f6f6f6") : a.body)}" stroke="#0002"/>
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
  incubator: () => `<svg viewBox="0 0 100 100"><rect x="12" y="34" width="76" height="54" rx="10" fill="#eceff1" stroke="#78909c" stroke-width="3"/><rect x="22" y="44" width="56" height="28" rx="6" fill="#ffe0b2" stroke="#90a4ae" stroke-width="2"/>${[34,50,66].map(x=>`<ellipse cx="${x}" cy="58" rx="6" ry="8" fill="#f7f4ea" stroke="#0003"/>`).join("")}<circle cx="78" cy="80" r="3" fill="#ef5350"/><rect x="22" y="78" width="30" height="5" rx="2" fill="#4fc3f7"/></svg>`,
  hand: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">👆</text></svg>`,
  bulldoze: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">🧹</text></svg>`
};
const guySVG = `<svg viewBox="0 0 60 72"><circle cx="30" cy="9" r="6" fill="#5d4037"/><circle cx="30" cy="22" r="13" fill="#f1c7a0"/><path d="M17 18 Q30 4 43 18 Q30 12 17 18Z" fill="#5d4037"/><rect x="18" y="18" width="10" height="6" rx="2" fill="#111"/><rect x="32" y="18" width="10" height="6" rx="2" fill="#111"/><line x1="28" y1="21" x2="32" y2="21" stroke="#111" stroke-width="1.5"/><path d="M25 29 Q30 32 35 29" stroke="#8a4a2a" stroke-width="1.6" fill="none"/><path d="M12 72 V46 Q30 34 48 46 V72Z" fill="#7e57c2"/><path d="M20 38 Q30 46 40 38 L40 44 Q30 50 20 44Z" fill="#ff7043"/><rect x="44" y="48" width="10" height="14" rx="2" fill="#fff" stroke="#795548"/><rect x="44" y="52" width="10" height="4" fill="#8d6e63"/></svg>`;

/* ---------- CONFIG ---------- */
const ITEMS = {
  hand:    { name: "Tap", cost: 0 },
  coop:    { name: "Coop", cost: 30, max: 1, joke: "I bought a coop! Wait, the chickens sleep in it? Like a tiny hotel?", tip: "Hens roost in a coop at night. Lock it after dark to keep predators out." },
  feeder:  { name: "Feeder", cost: 10, joke: "Tried feeding them avocado toast. Nope. Layer feed it is.", tip: "Laying hens need layer feed every day. Tap a feeder to pour in a scoop from your feed bag. Buy more feed in the Shop." },
  waterer: { name: "Water", cost: 8, joke: "They don't want my sparkling water? Rude.", tip: "Fresh water is a must. No water, no eggs. Tap to refill (free)." },
  nest:    { name: "Nest box", cost: 8, joke: "It's a cozy little box for laying. Very Scandinavian.", tip: "Hens like a dark, comfy nest box to lay in. Without one they hide eggs in the grass." },
  run:     { name: "Run", cost: 6, joke: "A covered run! It's like a gated community for birds.", tip: "A covered run gives hens outdoor space and protects them from hawks." },
  fence:   { name: "Fence", cost: 3, joke: "Fences! Like a velvet rope, but for raccoons.", tip: "Fencing keeps out ground predators like raccoons and foxes." },
  incubator:{ name: "Incubator", cost: 40, max: 1, joke: "I bought an egg oven! Not for cooking. Apparently that's important.", tip: "Put fertile eggs from your basket in it to hatch chicks. Fertile eggs need a rooster in the flock. Tap it to open." },
  tree:    { name: "Shade tree", cost: 12, joke: "I planted a tree. I am basically a farmer now.", tip: "Hens need shade on hot days, and trees give cover from hawks." },
  bulldoze:{ name: "Remove", cost: 0 }
};
// Coop levels: more room as you earn more, and bigger coops stay cleaner longer
const COOPS = [
  { name: "Starter coop", cap: 3, cost: 0, dirt: 1, joke: "" },
  { name: "Big coop", cap: 6, cost: 60, dirt: 0.85, joke: "I added a second floor. It's a chicken duplex now.", tip: "Plan about 4 square feet per hen inside the coop, plus one nest box for every 4 or 5 hens." },
  { name: "Barn coop", cap: 10, cost: 150, dirt: 0.7, joke: "I own a BARN. I am legally a farmer. (I am not legally a farmer.)", tip: "More room means less pecking and less mess. Good airflow keeps a big coop dry and healthy." }
];
const OLD_AGE = 20, INCUBATE_DAYS = 3, INCUBATOR_CAP = 6, HATCH_RATE = 0.75, CHICK_GROW_DAYS = 4;
const WEATHER = [["☀️","Sunny"],["☀️","Sunny"],["🔥","Hot"],["🌧️","Rain"],["❄️","Cold"],["⛅","Cloudy"]];
const QUIZ = [
  ["Do hens need a rooster to lay eggs?", ["Yes","No"], 1, "Nope! Hens lay without a rooster. You only need one for fertile eggs that can hatch into chicks."],
  ["What color eggs does the all-black Ayam Cemani lay?", ["Black","Cream"], 1, "Cream! Black feathers, black skin, totally normal eggs."],
  ["Roughly how often can a good laying hen lay?", ["About once a day","Once a week"], 0, "A good layer can lay about one egg a day in her prime, less in winter."],
  ["Which breed's chicks can be sexed by their down color at hatch?", ["Cream Legbar","Leghorn"], 0, "Cream Legbar! It's an auto-sexing breed. Most breeds can't be sexed by looks at hatch."],
  ["Does egg shell color change how it tastes?", ["Yes","No"], 1, "No. Shell color comes from the breed. Taste comes from diet and freshness."]
];

/* ---------- STATE ---------- */
let S;
function fresh(breed = "leghorn") {
  S = { coins: 60, day: 1, hour: 7, grid: Array(N).fill(null), hens: [], basket: [], ground: [], locked: false,
    weather: WEATHER[0], speed: 1, collection: {}, said: {}, unlocked: { leghorn: true }, premium: {}, quizI: 0, lifetime: 0, feed: 5, clean: 100,
    coopLvl: 0, rooster: null, incub: [], chicks: [], hatched: 0, duds: 0,
    bugs: [], tufts: Array(N).fill(null), wormy: 0, foraged: 0 };
  initTufts();
  // Starter yard: a basic coop, feeder, and waterer so new players aren't overwhelmed
  [["coop", 7], ["feeder", 13], ["waterer", 14]].forEach(([t, i]) => S.grid[i] = { type: t, lvl: 100 });
  addHen(breed, true);
}
function addHen(breed, free, mix) {
  const b = CH[breed]; const used = S.hens.map(h => h.name);
  const name = NAMES.find(n => !used.includes(n)) || "Hen " + (S.hens.length + 1);
  S.hens.push({ id: Math.random(), breed, name, age: 0, mix: !!mix, health: 90, happy: 80, egg: rnd(b.eggs), x: 40 + Math.random() * 30, y: 40 + Math.random() * 30, flip: false });
}
const capacity = () => has("coop") ? COOPS[S.coopLvl].cap : 3;
const isOld = h => h.age >= OLD_AGE;
const breedLabel = h => CH[h.breed].name + (h.mix ? " mix" : "");
const rooSVG = () => henSVG("roo:" + S.rooster.breed);
// Chick breed from the hen x rooster pair
function chickOf(hen, sire) {
  if (sire === "ayam" && hen === "leghorn") return { breed: "zombie", mix: false };
  if (sire === "ayam" && hen === "wyandotte") return { breed: "mime", mix: false };
  return { breed: hen, mix: hen !== sire };
}
const SPECIAL = { zombie: ["🧟 Zombie Chicken chick", "Fun nickname for an Ayam Cemani x Leghorn cross. Rare!", 25], mime: ["🎭 Mime chicken chick", "Mime chicken — a homegrown Ayam Cemani x Laced Wyandotte cross (not an official breed). Rare!", 28] };
const chickName = c => SPECIAL[c.breed] ? SPECIAL[c.breed][0] : `${CH[c.breed].name}${c.mix ? " mix" : ""} chick`;
const henValue = h => Math.max(isOld(h) ? 4 : 8, Math.round(CH[h.breed].price * 0.6 * (0.5 + h.health / 200) * (isOld(h) ? 0.5 : 1) * (h.mix ? 0.6 : 1)));
const CULL_VALUE = 5;
const chickValue = c => SPECIAL[c.breed] ? SPECIAL[c.breed][2] : Math.min(12, 6 + Math.round(CH[c.breed].price / 12)) - (c.mix ? 1 : 0);
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
/* Tiles are created once; a tile's innerHTML is only replaced when its content changes.
   Feeder/water bars are updated in place every tick. */
const tileCache = [];
const TUFT_ART = [
  `<svg viewBox="0 0 30 20"><path d="M4 20 Q6 8 9 2 M10 20 Q11 9 15 3 M16 20 Q18 10 22 4 M22 20 Q23 12 27 8" stroke="#3f8f2e" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 30 20"><path d="M15 20 V11" stroke="#2f7a2a" stroke-width="2"/><circle cx="11" cy="9" r="4.5" fill="#4caf50"/><circle cx="19" cy="9" r="4.5" fill="#43a047"/><circle cx="15" cy="4.5" r="4.5" fill="#66bb6a"/></svg>`,
  `<svg viewBox="0 0 30 20"><path d="M15 20 Q14 12 15 7 M15 18 Q9 16 7 12 M15 18 Q21 16 23 13" stroke="#3f8f2e" stroke-width="2" fill="none"/><circle cx="15" cy="6" r="4.5" fill="#fdd835"/><circle cx="15" cy="6" r="1.8" fill="#f9a825"/></svg>`
];
function tileHTML(i) {
  const g = S.grid[i];
  let inner = g ? ART[g.type](g.type === "coop" && S.locked) : "";
  const tf = S.tufts[i];
  if (tf && (!g || g.type === "run")) { const c = i * 37 % 100; inner += `<div class="tuft l${Math.ceil(tf.life)}" style="left:${10 + c % 50}%;top:${55 + c % 25}%">${TUFT_ART[tf.k]}</div>`; }
  if (g && g.type === "coop") inner += `<div class="badge">Lv${S.coopLvl + 1}</div>`;
  if (g && g.type === "incubator" && (S.incub.length || S.chicks.length)) inner += `<div class="badge">${S.chicks.length ? "🐣" + S.chicks.length : "🥚" + S.incub.length}</div>`;
  if (g && g.type === "coop" && S.locked && S.hens.length) inner += `<div style="position:absolute;top:-4px;right:2px;font-size:15px">💤</div>`;
  if (g && g.type === "feeder") inner += `<div class="lvl feed"><i></i></div>`;
  if (g && g.type === "waterer") inner += `<div class="lvl"><i></i></div>`;
  let n = 0; S.ground.forEach((e, k) => { if (e.tile === i) inner += `<div class="egg-drop" style="margin-left:${12 * n++}%" data-egg="${k}">${eggSVG(e.color, CH[e.breed].speckled)}</div>`; });
  return inner;
}
function renderGrid() {
  const grid = $("#grid");
  if (grid.children.length !== N) { grid.innerHTML = Array.from({ length: N }, (_, i) => `<div class="tile" data-i="${i}"></div>`).join(""); tileCache.length = 0; }
  for (let i = 0; i < N; i++) {
    const t = grid.children[i], html = tileHTML(i);
    if (tileCache[i] !== html) { t.innerHTML = html; tileCache[i] = html; }
    const g = S.grid[i];
    if (g && (g.type === "feeder" || g.type === "waterer")) { const bar = t.querySelector(".lvl i"), w = Math.round(g.lvl) + "%"; if (bar && bar.style.width !== w) bar.style.width = w; }
  }
}
/* Hens: one element per bird, created once and moved with GPU transforms. */
const henEls = new Map();
let yardW = 0, yardH = 0;
function measureYard() { const el = $("#hens"); yardW = el.clientWidth; yardH = el.clientHeight; }
// Keep birds fully inside the yard (hen is 15% wide, about 11% tall)
const xf = (x, y) => { x = Math.min(85, Math.max(0, x)); y = Math.min(89, Math.max(0, y)); return `translate(${(x * yardW / 100).toFixed(1)}px,${(y * yardH / 100).toFixed(1)}px)`; };
function birdEl(key, svg, attrs) {
  let el = henEls.get(key);
  if (!el) {
    el = document.createElement("div"); el.className = "hen" + (key.startsWith("roo") ? " roo" : "");
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.innerHTML = `<span class="mood"></span><div class="flipper"><div class="bob" style="animation-delay:-${(Math.random() * 2.4).toFixed(2)}s">${svg}</div></div>`;
    el.style.transition = "none"; henEls.set(key, el); $("#hens").appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.style.transition = ""));
  }
  return el;
}
function placeBird(el, b, mood, inside) {
  const t = xf(b.x, b.y); if (el._t !== t) { el.style.transform = t; el._t = t; }
  el.classList.toggle("flip", !!b.flip); el.classList.toggle("inside", inside);
  if (mood !== undefined) { const m = el.firstChild; if (m.textContent !== mood) m.textContent = mood; }
}
let henbarSig = "";
function renderHens() {
  if (!yardW) measureYard();
  const inside = S.locked && has("coop"), keep = new Set();
  if (S.rooster) { const key = "roo:" + S.rooster.breed; keep.add(key); placeBird(birdEl(key, rooSVG(), { "data-roo": "1" }), S.rooster, undefined, inside); }
  S.hens.forEach(h => {
    const key = "h" + h.id; keep.add(key);
    const mood = h.health < 35 ? "🤒" : h.happy < 35 ? "😤" : h.happy > 75 ? "💛" : "";
    placeBird(birdEl(key, henSVG(h.breed), { "data-h": h.id }), h, mood, inside);
  });
  henEls.forEach((el, k) => { if (!keep.has(k)) { el.remove(); henEls.delete(k); } });
  // Hen bar: rebuild only when the list or labels change; otherwise update bars in place
  const sig = S.hens.map(h => h.id + h.name + breedLabel(h) + isOld(h)).join("|") + (S.rooster ? "R" + S.rooster.breed + S.rooster.name : "");
  const bar = $("#henbar");
  if (sig !== henbarSig) {
    henbarSig = sig;
    bar.innerHTML = (S.hens.map(h => `<div class="hencard" data-card="${h.id}">${henSVG(h.breed)}<div><b>${h.name}</b> <span style="opacity:.6">${breedLabel(h)}</span>${isOld(h) ? ` <span class="old">older</span>` : ""}
   <div class="bar"><i style="background:#e57373"></i></div><div class="bar"><i style="background:#ffca28"></i></div></div></div>`).join("") || `<div class="hencard">No hens yet. Visit the 🛒 Shop!</div>`)
     + (S.rooster ? `<div class="hencard" data-card="roo">${rooSVG()}<div><b>${S.rooster.name}</b> <span style="opacity:.6">${ROOS[S.rooster.breed].name}</span></div></div>` : "");
  }
  S.hens.forEach((h, k) => { const c = bar.children[k]; if (!c) return; const [a, b] = c.querySelectorAll(".bar i");
    const w1 = Math.round(h.health) + "%", w2 = Math.round(h.happy) + "%"; if (a.style.width !== w1) a.style.width = w1; if (b.style.width !== w2) b.style.width = w2; });
}
// Only re-place birds when the yard WIDTH really changes (rotation, desktop resize). Mobile address-bar
// show/hide and HUD text changes must not snap hens. The yard is square tiles, so height follows width.
if (window.ResizeObserver) new ResizeObserver(() => { const w = $("#hens").clientWidth; if (Math.abs(w - yardW) < 4) return; measureYard(); if (S) renderHens(); }).observe($("#hens"));
function renderHUD() {
  $("#coins").textContent = S.coins; $("#day").textContent = S.day;
  $("#clock").textContent = `${(S.hour % 12) || 12}:00 ${S.hour < 12 ? "am" : "pm"}`;
  $("#clockIcon").textContent = isNight() ? "🌙" : "☀️";
  $("#weather").textContent = S.weather.join(" ");
  $("#basketN").textContent = S.basket.length;
  $("#capN").textContent = `${S.hens.length}/${capacity()}`;
  $("#feedN").textContent = S.feed; $("#cleanN").textContent = Math.round(S.clean) + "%";
  $("#cleanStat").classList.toggle("warn", S.clean < 30); $("#feedStat").classList.toggle("warn", S.feed < 2);
  const lb = $("#lockBtn"); lb.textContent = S.locked ? "🔒 Locked" : "🔓 Coop open"; lb.classList.toggle("locked", S.locked);
  $("#speedBtn").textContent = S.speed ? `▶︎ ${S.speed}x` : "⏸ Paused";
  const nl = String(NIGHT_RAMP[S.hour]), ng = $("#night");
  if (ng.style.opacity !== nl) { if (!ng._init) { ng._init = 1; ng.style.transition = "none"; requestAnimationFrame(() => requestAnimationFrame(() => ng.style.transition = "")); } ng.style.opacity = nl; }
  const rain = S.weather[1] === "Rain"; if (!!$("#sky").firstChild !== rain) $("#sky").innerHTML = rain ? `<div class="rain"></div>` : "";
}
// Gradual dusk and dawn (opacity of the night overlay by hour; CSS transitions between them)
const NIGHT_RAMP = [.62,.62,.62,.62,.6,.5,.3,.12,0,0,0,0,0,0,0,0,0,0,.06,.18,.4,.55,.6,.62];
function renderAll() { renderHUD(); renderGrid(); renderHens(); renderForage(); }

/* ---------- HEN MOVEMENT ---------- */
function tilePos(i) { return { x: (i % COLS) / COLS * 100 + 1, y: Math.floor(i / COLS) / ROWS * 100 + 1 }; }
function pickSpot(h) {
  const coop = tilesOf("coop")[0];
  let p;
  if ((isNight() || S.locked) && coop !== undefined) { p = tilePos(coop); p.x += Math.random() * 6; p.y += Math.random() * 4; return p; }
  const runs = tilesOf("run");
  const spots = runs.length && Math.random() < 0.7 ? runs : [...Array(N).keys()].filter(i => !S.grid[i] || S.grid[i].type === "run");
  p = tilePos(rnd(spots)); p.x += Math.random() * 4; p.y += Math.random() * 4; return p;
}
function moveBird(h) {
  if (h.busy) return;
  const outside = !isNight() && !S.locked;
  if (outside && h.breed && tryForage(h)) return;
  const p = pickSpot(h); h.flip = p.x < h.x; h.x = p.x; h.y = p.y;
}
// Move every bird at once (used after building, locking, starting)
function wander() { S.hens.forEach(h => { h.busy = false; moveBird(h); }); if (S.rooster) moveBird(S.rooster); renderHens(); }
// Each bird schedules its own next move at a random 1.5-4s interval, so they don't all move together
function wanderTick() {
  const now = performance.now(); let moved = false;
  [...S.hens, ...(S.rooster ? [S.rooster] : [])].forEach(b => { if (!b.next || now >= b.next) { moveBird(b); b.next = now + 1500 + Math.random() * 2500; moved = true; } });
  if (moved) renderHens();
}

/* ---------- FORAGE (bugs, worms, greens) ---------- */
const BUGS = { beetle: "🪲", cricket: "🦗", worm: "🪱", fly: "🪰", butterfly: "🦋" };
const BUG_CAP = 10;
const forageEls = new Map();
let bugId = 0;
function initTufts() {
  for (let i = 0; i < N; i++) { const r = Math.random(); S.tufts[i] = r < 0.42 ? { k: r < 0.24 ? 0 : r < 0.34 ? 1 : 2, life: 3 } : null; }
}
function openTiles() { return [...Array(N).keys()].filter(i => !S.grid[i] || S.grid[i].type === "run"); }
function spawnBug(kind) {
  if (S.bugs.length >= BUG_CAP) return;
  const tiles = openTiles(); if (!tiles.length) return;
  const tile = rnd(tiles);
  if (!kind) { const worm = S.wormy ? 0.45 : 0.12; const r = Math.random(); kind = r < worm ? "worm" : r < worm + 0.3 ? "beetle" : r < worm + 0.6 ? "cricket" : r < 0.93 ? "fly" : "butterfly"; }
  S.bugs.push({ id: ++bugId, kind, tile, born: S.hour, x: ((tile % COLS) + 0.15 + Math.random() * 0.6) / COLS * 100, y: (Math.floor(tile / COLS) + 0.2 + Math.random() * 0.55) / ROWS * 100 });
}
function forageHour() {
  if (isNight()) { if (S.bugs.length) S.bugs = []; return; }
  S.bugs = S.bugs.filter(b => (S.hour - b.born + 24) % 24 < 6 && !(S.grid[b.tile] && S.grid[b.tile].type !== "run"));
  const n = S.wormy ? 3 : 2; for (let k = 0; k < n; k++) if (Math.random() < 0.75) spawnBug();
}
function renderForage() {
  const layer = $("#forage"); if (!layer || !S) return;
  const keep = new Set();
  S.bugs.forEach(b => {
    keep.add(b.id); if (forageEls.has(b.id)) return;
    const el = document.createElement("div"); el.className = "bug " + b.kind; el.style.left = b.x + "%"; el.style.top = b.y + "%";
    el.innerHTML = `<span style="animation-delay:-${(Math.random() * 2).toFixed(2)}s">${BUGS[b.kind]}</span>`; layer.appendChild(el); forageEls.set(b.id, el);
  });
  forageEls.forEach((el, id) => { if (!keep.has(id)) { forageEls.delete(id); el.classList.add("gone"); setTimeout(() => el.remove(), 350); } });
}
function tryForage(h) {
  const free = S.bugs.filter(b => !b.claimed && b.kind !== "butterfly");
  if (!free.length) return false;
  free.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
  const bug = free[0], inRun = S.grid[bug.tile] && S.grid[bug.tile].type === "run";
  if (Math.hypot(bug.x - h.x, bug.y - h.y) > (inRun ? 45 : 30) || Math.random() > (inRun ? 0.8 : 0.45)) return false;
  bug.claimed = 1; h.busy = true;
  h.flip = bug.x < h.x; h.x = h.flip ? bug.x - 2 : bug.x - 12; h.y = bug.y - 8;
  setTimeout(() => peck(h, bug), 2300);
  return true;
}
function peck(h, bug) {
  h.busy = false;
  if (!S.hens.includes(h) || !S.bugs.includes(bug) || isNight() || S.locked) { bug.claimed = 0; return; }
  const el = henEls.get("h" + h.id); if (el) { const bob = el.querySelector(".bob"); bob.classList.remove("pecking"); void bob.offsetWidth; bob.classList.add("pecking"); bob.addEventListener("animationend", () => bob.classList.remove("pecking"), { once: true }); }
  setTimeout(() => {
    if (!S.bugs.includes(bug)) return;
    S.bugs = S.bugs.filter(b => b !== bug); S.foraged++;
    h.happy = Math.min(100, h.happy + 3);
    const f = tilesOf("feeder").map(i => S.grid[i]).find(g => g.lvl > 0); if (f) f.lvl = Math.min(100, f.lvl + 2);
    floatXY(bug.x, bug.y, "+😊");
    sayOnce("forage", `${h.name} just ate a ${bug.kind === "worm" ? "worm" : "bug"}. Like, on purpose. Gross. Also kind of impressive. <i>Tip: free-ranging hens eat insects, worms, and greens, which adds protein. They still need layer feed every day.</i>`, 1);
    if (S.tufts[bug.tile] && S.grid[bug.tile] && S.grid[bug.tile].type === "run") S.tufts[bug.tile].life -= 0.5;
    renderForage(); renderGrid();
  }, 500);
}
function floatXY(x, y, text) {
  const el = document.createElement("div"); el.className = "float small"; el.textContent = text; el.style.left = x + "%"; el.style.top = y + "%";
  $("#fx").appendChild(el); setTimeout(() => el.remove(), 1300);
}

/* ---------- SIMULATION ---------- */
function predator(emoji, i, msg) {
  const el = document.createElement("div"); el.className = "predator"; el.textContent = emoji;
  const p = tilePos(i ?? 0), W = $("#fx").clientWidth; el.style.top = p.y + "%";
  const at = x => el.style.transform = `translate3d(${x * W / 100}px,0,0)`; at(-15);
  $("#fx").appendChild(el); requestAnimationFrame(() => requestAnimationFrame(() => at(p.x)));
  setTimeout(() => at(110), 1700); setTimeout(() => el.remove(), 3300);
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
    if (has("coop") && S.clean < 30) { d -= 2; if (S.hour % 3 === 0) h.health -= 1; sayOnce("dirty", "Something smells... like a lot. <i>Tip: dirty bedding makes hens sick. Buy pine shavings in the Shop to clean the coop.</i>", 1); }
    if (has("coop") && totalFeed > 0 && totalWater > 0 && d > 0) h.health = Math.min(100, h.health + 1);
    h.happy = Math.max(0, Math.min(100, h.happy + d));
    h.health = Math.max(0, Math.min(100, h.health));
  });
  forageHour();
  if (S.hour === 8) layEggs();
  if (S.hour === 13) hawkCheck();
  if (S.hour === 20 && !S.locked) say(has("coop") ? "The hens just... went to bed by themselves? At 8pm? Icons. <i>Tip: lock the coop at night!</i>" : "It's dark and my hens have nowhere to sleep. <i>Tip: build a coop.</i>", 1);
  if (S.hour === 23) raccoonCheck();
  if (S.hour === 5 && S.rooster) { if (!S.said.crow) { S.said.crow = 1; say(`${S.rooster.name} just screamed at 5am. Is he okay?? The neighbors left a note. <i>Tip: roosters crow at dawn (and whenever they feel like it). Hens lay without a rooster, but you need one for fertile eggs that hatch into chicks.</i>`, 1); } else toast(`🐓 ${S.rooster.name}: COCK-A-DOODLE-DOO!`); }
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
  if (has("coop")) S.clean = Math.max(0, S.clean - 6 * COOPS[S.coopLvl].dirt * Math.max(1, S.hens.length));
  S.hens.forEach(h => { h.age = (h.age || 0) + 1; if (h.age === OLD_AGE) sayOnce("old" + h.id, `${h.name} is slowing down on eggs. Is she... retiring? <i>Tip: hens lay best in their first couple of years, then lay fewer eggs each year.</i>`, 1); });
  incubateDay();
  // Run areas wear down to bare dirt; open grass slowly regrows weeds and clover
  S.wormy = S.weather[1] === "Rain" ? 2 : Math.max(0, S.wormy - 1);
  for (let i = 0; i < N; i++) { const g = S.grid[i], t = S.tufts[i];
    if (g && g.type === "run" && t && S.hens.length) { t.life -= 0.5; if (t.life <= 0) S.tufts[i] = null; }
    else if (!g && !t && Math.random() < 0.08) S.tufts[i] = { k: Math.floor(Math.random() * 3), life: 1 };
    else if (!g && t && t.life < 3) t.life = Math.min(3, t.life + 1); }
  if (S.wormy === 2) sayOnce("worms", "Worms everywhere after the rain! The hens are thrilled. I am not. <i>Tip: rain brings earthworms to the surface, a favorite chicken snack.</i>", 1);
  if (S.feed < 2) sayOnce("lowfeed" + S.day, "The feed bag is almost empty. <i>Tip: buy a bag of layer feed in the Shop before it runs out.</i>", 1);
  if (S.weather[1] === "Cold") sayOnce("cold", "It's freezing! Do chickens wear sweaters? <i>Tip: a draft-free coop keeps hens warm. No sweaters needed.</i>", 1);
}
function layEggs() {
  const nests = tilesOf("nest");
  S.hens.forEach(h => {
    const ok = h.health > 40 && h.happy > 35 && !(S.locked && !has("nest"));
    const rate = CH[h.breed].layRate * (S.weather[1] === "Cold" ? 0.6 : 1) * (isOld(h) ? 0.5 : 1);
    if (!ok || Math.random() > rate) return;
    let tile = nests.length ? rnd(nests) : rnd([...Array(N).keys()].filter(i => !S.grid[i]));
    S.ground.push({ tile, color: h.egg, breed: h.breed, hen: h.name, fertile: !!S.rooster, sire: S.rooster && S.rooster.breed });
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
    if (g && g.type === "feeder") { if (S.feed < 1) { say("The feed bag is empty! <i>Tip: buy a bag of layer feed in the 🛒 Shop under Supplies.</i>", 1); return toast("Out of feed! Buy some in the Shop."); } S.feed--; g.lvl = 100; floatAt(i, "-1 scoop 🌾"); }
    else if (g && g.type === "waterer") { g.lvl = 100; floatAt(i, "💧 full"); }
    else if (g && g.type === "coop") return toggleLock();
    else if (g && g.type === "incubator") return incubatorModal();
    return renderAll();
  }
  if (tool === "bulldoze") { if (g && g.type === "incubator" && (S.incub.length || S.chicks.length)) return toast("Empty the incubator first");
    if (g && g.type === "coop" && S.coopLvl) { S.coopLvl = 0; toast("Coop removed. Upgrades lost."); }
    if (g) { S.coins += Math.floor(ITEMS[g.type].cost / 2); S.grid[i] = null; floatAt(i, "removed"); renderAll(); } return; }
  if (g) return toast("Something's already there");
  const it = ITEMS[tool];
  if (it.max && tilesOf(tool).length >= it.max) return toast(`One ${it.name.toLowerCase()} is plenty for now`);
  if (S.coins < it.cost) return toast("Not enough coins. Sell some eggs!");
  S.coins -= it.cost; S.grid[i] = { type: tool, lvl: 100 }; floatAt(i, `-${it.cost}🪙`); if (tool !== "run") S.bugs = S.bugs.filter(b => b.tile !== i);
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
$("#henbar").addEventListener("click", e => { const c = e.target.closest("[data-card]"); if (!c) return; c.dataset.card === "roo" ? roosterModal() : henModal(c.dataset.card); });
$("#hens").addEventListener("click", e => { const el = e.target.closest(".hen"); if (!el) return;
  if (el.dataset.roo) return say(`<b>${S.rooster.name}</b> the ${ROOS[S.rooster.breed].name}: ${ROOS[S.rooster.breed].blurb} <i>${ROO_FACT}</i>`, 1);
  const h = S.hens.find(x => x.id == el.dataset.h);
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
  const tabs = `<div class="tabs">${[["hens","🐔 Hens"],["coop","🏠 Coop"],["supplies","🌾 Supplies"],["premium","⭐ Extras"],["quiz","❓ Quiz"]].map(([k,l])=>`<button class="${shopTab===k?"on":""}" onclick="shopTab('${k}')">${l}</button>`).join("")}</div>`;
  let body = "";
  if (shopTab === "hens") {
    body = Object.entries(CH).filter(([k, b]) => !b.hatchOnly).map(([k, b]) => `<div class="row">${henSVG(k)}<div class="t"><b>${b.name}</b> lays ${b.eggs.map(c => EGG_COLORS[c].label.toLowerCase()).join(" or ")}<br>${b.blurb}</div>
      <button class="buy" ${S.coins < b.price ? "disabled" : ""} onclick="buyHen('${k}')">${b.price ? b.price + "🪙" : "Free"}</button></div>`).join("")
      + `<p style="margin-top:10px"><b>🐓 Roosters</b> (max 1, no eggs, needed for chicks)</p>` + Object.entries(ROOS).map(([k, r]) => `<div class="row">${henSVG("roo:" + k)}<div class="t"><b>${r.name}</b><br>${r.blurb}</div>
      <button class="buy" ${S.coins < r.price || S.rooster ? "disabled" : ""} onclick="buyRooster('${k}')">${S.rooster && S.rooster.breed === k ? "Owned" : r.price + "🪙"}</button></div>`).join("")
      + Object.values(SPECIES).filter(s => s.comingSoon).map(s => `<div class="row" style="opacity:.6"><span style="font-size:36px">${s.icon}</span><div class="t"><b>${s.name} 🔒</b><br>${s.teaser}</div></div>`).join("");
  } else if (shopTab === "coop") {
    body = `<p>🏠 ${has("coop") ? `<b>${COOPS[S.coopLvl].name}</b> (level ${S.coopLvl + 1})` : "<b>No coop built</b>"} · 🐔 ${S.hens.length}/${capacity()} hens</p>`
      + COOPS.map((c, i) => `<div class="row"><span style="font-size:30px">${["🛖","🏠","🏚️"][i]}</span><div class="t"><b>${c.name}</b> · ${c.cap} hens<br>${i ? `Stays clean ${Math.round((1 - c.dirt) * 100)}% longer.` : "Where every city chicken starts."}</div>
        ${i <= S.coopLvl ? `<button class="buy" disabled>${i === S.coopLvl ? "Yours" : "✓"}</button>` : i === S.coopLvl + 1 ? `<button class="buy" ${S.coins < c.cost || !has("coop") ? "disabled" : ""} onclick="upgradeCoop()">${c.cost}🪙</button>` : `<button class="buy" disabled>🔒 ${c.cost}🪙</button>`}</div>`).join("")
      + `<p style="font-size:12px"><i>Tip:</i> without a coop you can keep 3 hens. Upgrade one level at a time.</p>`;
  } else if (shopTab === "supplies") {
    body = `<p>🌾 Feed: <b>${S.feed}</b> scoops · 🧹 Coop: <b>${Math.round(S.clean)}%</b> clean</p>` + SUPPLIES.map(([k, t, d, p]) => `<div class="row"><div class="t"><b>${t}</b><br>${d}</div><button class="buy" ${S.coins < p ? "disabled" : ""} onclick="buySupply('${k}')">${p}🪙</button></div>`).join("");
  } else if (shopTab === "premium") {
    const P = [["twin","🏡 Twin with a real farm hen","Your hen is paired with a real hen on a small farm. Her real laying drives your eggs, plus weekly photos.","$4.99/mo"],
      ["pack","🌈 Rare breed pack","Unlock every shop breed instantly, including Marans and Ayam Cemani.","$2.99"],
      ["disco","🪩 Disco coop skin","Cosmetic only. Hens remain unimpressed.","$0.99"],
      ["realeggs","📦 Real eggs from the farm","Order a dozen real eggs from the farm, for pickup or local delivery.","$7/dozen"]];
    body = `<span class="demo">DEMO: no real payments. Buttons just show how it would work.</span>` + P.map(([k,t,d,p]) => `<div class="row"><div class="t"><b>${t}</b><br>${d}</div><button class="buy real" onclick="mockPay('${t}','${p}')">${S.premium[k]?"✓":p}</button></div>`).join("");
  } else {
    const q = QUIZ[S.quizI % QUIZ.length];
    body = `<p><b>City Slicker Quiz:</b> ${q[0]}</p>${q[1].map((o,i)=>`<button class="buy big" onclick="answer(${i})">${o}</button>`).join("")}<p id="qa"></p>`;
  }
  modal(`<h2>🛒 Coop Shop</h2><p>🪙 ${S.coins} coins</p>${tabs}${body}<button class="act big" onclick="closeModal()">Close</button>`);
}
const SUPPLIES = [["feed", "🌾 Bag of layer feed", "10 scoops. Each scoop fills a feeder once.", 12],
  ["shavings", "🪵 Pine shavings", "Clean out the coop and put down fresh bedding.", 6],
  ["oyster", "🐚 Oyster shell", "Extra calcium for strong eggshells. Gives every hen a small health boost.", 5]];
window.buySupply = k => { const it = SUPPLIES.find(x => x[0] === k); if (S.coins < it[3]) return toast("Not enough coins. Sell some eggs!");
  if (k === "shavings" && !has("coop")) return toast("Build a coop first!");
  S.coins -= it[3];
  if (k === "feed") { S.feed += 10; toast("+10 scoops of feed"); sayOnce("boughtfeed", "Fifty pounds of chicken cereal. My trunk smells like a barn now.", 1); }
  if (k === "shavings") { S.clean = 100; toast("Coop cleaned! Fresh bedding."); sayOnce("cleaned", "I cleaned the coop. I have seen things. <i>Tip: clean bedding keeps hens healthy.</i>", 1); }
  if (k === "oyster") { S.hens.forEach(h => h.health = Math.min(100, h.health + 10)); toast("Hens got their calcium"); sayOnce("oyster", "I'm feeding them... seashells? <i>Fact: laying hens need extra calcium, and crushed oyster shell is a common source.</i>", 1); }
  shop(); renderAll(); };
window.shopTab = k => { shopTab = k; shop(); };
window.upgradeCoop = () => { const n = S.coopLvl + 1, c = COOPS[n]; if (!c || !has("coop")) return toast("Build a coop first!"); if (S.coins < c.cost) return toast("Not enough coins. Sell some eggs!");
  S.coins -= c.cost; S.coopLvl = n; toast(`Upgraded to ${c.name}! Room for ${c.cap} hens.`); say(`${c.joke} <i>Tip: ${c.tip}</i>`, 1); shop(); renderAll(); };
window.buyRooster = k => { const r = ROOS[k]; if (S.rooster) return toast("One rooster is plenty. Trust the neighbors on this.");
  if (S.coins < r.price) return toast("Not enough coins. Sell some eggs!");
  S.coins -= r.price; S.rooster = { name: k === "ayam" ? "Vlad" : "Kevin", breed: k, x: 45, y: 45, flip: false }; closeModal(); toast(`Welcome, ${S.rooster.name} the ${r.name}!`);
  say(`I got a rooster named ${S.rooster.name}. He is VERY confident. <i>Fact: ${ROO_FACT} From now on your eggs are fertile. Same-breed pairs hatch purebred chicks; other pairs hatch mixes.</i>`, 1); renderAll(); wander(); };
window.buyHen = k => { const b = CH[k]; if (S.coins < b.price) return; if (S.hens.length >= capacity()) return toast(`Coop is full (${capacity()} hens max). Upgrade it in the Shop!`); S.coins -= b.price; addHen(k); closeModal(); toast(`Welcome, ${S.hens.at(-1).name} the ${b.name}!`); say(`New hen! ${b.fact}`, 1); renderAll(); wander(); };
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

/* ---------- HEN DETAILS: SELL / CULL ---------- */
function henModal(id) {
  const h = S.hens.find(x => x.id == id); if (!h) return;
  const b = CH[h.breed];
  modal(`<h2>${h.name}</h2><div style="width:90px;margin:0 auto">${henSVG(h.breed)}</div>
   <p><b>${breedLabel(h)}</b> · lays ${b.eggs.map(c => EGG_COLORS[c].label.toLowerCase()).join(" or ")}</p>
   <p>Age: <b>${h.age || 0}</b> days${isOld(h) ? ` · <span class="old">older</span> (lays half as often)` : ""}<br>Health ${Math.round(h.health)}% · Happiness ${Math.round(h.happy)}%</p>
   <p style="font-size:13px">${b.fact}</p>
   <button class="buy big" onclick="confirmHen('${h.id}','sell')">🤝 Sell to a neighbor · ${henValue(h)}🪙</button>
   <button class="buy big cull" onclick="confirmHen('${h.id}','cull')">🧊 Freezer camp · ${CULL_VALUE}🪙</button>
   <button class="act big" onclick="closeModal()">Keep her</button>`);
}
window.confirmHen = (id, what) => {
  const h = S.hens.find(x => x.id == id); if (!h) return;
  const last = S.hens.length === 1 ? `<p class="demo">⚠️ ${h.name} is your last hen. Your yard will be empty.</p>` : "";
  const txt = what === "sell" ? `Sell ${h.name} to a neighbor for ${henValue(h)}🪙?` : `Send ${h.name} to freezer camp for ${CULL_VALUE}🪙?`;
  modal(`<h2>Are you sure?</h2><p>${txt}</p>${last}<button class="buy big ${what === "cull" ? "cull" : ""}" onclick="doHen('${h.id}','${what}')">Yes, ${what === "sell" ? "sell her" : "do it"}</button><button class="act big" onclick="henModal('${h.id}')">Cancel</button>`);
};
window.doHen = (id, what) => {
  const h = S.hens.find(x => x.id == id); if (!h) return closeModal();
  const v = what === "sell" ? henValue(h) : CULL_VALUE;
  S.hens = S.hens.filter(x => x !== h); S.coins += v; closeModal();
  if (what === "sell") { toast(`Sold ${h.name}! +${v}🪙`); say(`My neighbor Deb took ${h.name}. She has a real farm and real boots. <i>Tip: hens are flock animals, so they settle in best with other chickens.</i>`, 1); }
  else { toast(`${h.name} went to freezer camp. +${v}🪙`); say(`I... made chicken soup. I need a minute. 🥣 <i>Tip: on small farms, older hens that stop laying are often culled for stew. It's part of raising your own food.</i>`, 1); }
  renderAll();
};
window.henModal = henModal;
function roosterModal() {
  if (!S.rooster) return;
  const r = ROOS[S.rooster.breed];
  modal(`<h2>${S.rooster.name} the rooster</h2><div style="width:90px;margin:0 auto">${rooSVG()}</div><p><b>${r.name}</b> · ${r.blurb}</p><p style="font-size:13px"><i>${ROO_FACT}</i></p>
   <button class="buy big" onclick="confirmRooster()">🤝 Rehome him with a neighbor · 15🪙</button><button class="act big" onclick="closeModal()">Keep him</button>`);
}
window.confirmRooster = () => modal(`<h2>Are you sure?</h2><p>Rehome ${S.rooster.name} for 15🪙? New eggs won't be fertile without him.</p><button class="buy big" onclick="rehomeRooster()">Yes, rehome him</button><button class="act big" onclick="closeModal()">Cancel</button>`);
window.rehomeRooster = () => { const n = S.rooster.name; S.rooster = null; S.coins += 15; closeModal(); toast(`${n} moved to a farm. +15🪙`); say("It's so quiet at 5am now. I almost miss him. Almost.", 1); renderAll(); };

/* ---------- INCUBATOR / NURSERY ---------- */
function incubateDay() {
  S.incub.forEach(e => e.days--);
  const done = S.incub.filter(e => e.days <= 0); S.incub = S.incub.filter(e => e.days > 0);
  let born = 0, duds = 0;
  done.forEach(e => { if (Math.random() < HATCH_RATE) { born++; S.hatched++; const c = chickOf(e.breed, e.sire); S.chicks.push({ id: Math.random(), ...c, age: 0 });
    if (c.breed === "zombie") sayOnce("zombie", `A ZOMBIE CHICKEN! It's black with white patches and it's adorable. <i>${CH.zombie.fact}</i>`, 1);
    if (c.breed === "mime") sayOnce("mime", `It hatched and didn't make a single sound. Just stared at me. Then... peep. It's a Mime chicken! 🎭 <i>${CH.mime.fact}</i>`, 1); } else { duds++; S.duds++; } });
  if (done.length) { toast(`🐣 ${born} chick${born === 1 ? "" : "s"} hatched${duds ? `, ${duds} egg${duds === 1 ? "" : "s"} didn't` : ""}!`);
    sayOnce("hatch", `THEY'RE ALIVE! Tiny peeping fluff balls! <i>Tip: not every egg hatches. Home incubator hatch rates vary a lot, and many backyard keepers are happy with 70-80%.</i>`, 1); }
  const grown = [];
  S.chicks.forEach(c => { c.age++; if (c.age >= CHICK_GROW_DAYS) { if (S.hens.length < capacity()) { addHen(c.breed, false, c.mix); grown.push(c); } else sayOnce("nursefull" + S.day, "A chick is all grown up but the coop is full! <i>Tip: upgrade your coop in the Shop, or sell a chick.</i>", 1); } });
  if (grown.length) { S.chicks = S.chicks.filter(c => !grown.includes(c)); toast(`${grown.length} chick${grown.length > 1 ? "s" : ""} grew up and joined the flock!`);
    sayOnce("grewup", `My baby is a hen now. I'm not crying, you're crying. <i>Tip: most breeds can't be sexed at hatch (auto-sexing breeds like Cream Legbar are the exception), so real hatches are about half roosters. In this game, all chicks are pullets.</i>`, 1); }
}
function incubatorModal() {
  const fert = S.basket.filter(e => e.fertile).length, room = INCUBATOR_CAP - S.incub.length;
  const slots = S.incub.map(e => `<div class="slot">${eggSVG(e.color, CH[e.breed].speckled)}<small>${e.days}d</small></div>`).join("") + Array(room).fill(`<div class="slot empty"></div>`).join("");
  const nursery = S.chicks.map(c => `<div class="row">${SPECIAL[c.breed] ? `<div class="chickart">${henSVG(c.breed)}</div>` : `<span style="font-size:30px">🐥</span>`}<div class="t"><b>${chickName(c)}</b>${SPECIAL[c.breed] ? `<br><small>${SPECIAL[c.breed][1]}</small>` : ""}<br>Raising · grows up in ${Math.max(0, CHICK_GROW_DAYS - c.age)} day${CHICK_GROW_DAYS - c.age === 1 ? "" : "s"}</div><button class="buy" onclick="sellChick('${c.id}')">Sell ${chickValue(c)}🪙</button></div>`).join("") || `<p style="font-size:13px;opacity:.7">No chicks yet.</p>`;
  modal(`<h2>🥚 Incubator</h2><p>${S.incub.length}/${INCUBATOR_CAP} eggs · hatches in ${INCUBATE_DAYS} game days</p><div class="slots">${slots}</div>
   ${S.rooster ? "" : `<p class="demo">No rooster, no chicks. Buy a rooster in the 🛒 Shop so new eggs are fertile.</p>`}
   <button class="buy big" ${fert && room ? "" : "disabled"} onclick="loadIncubator()">Add fertile eggs from basket (${fert})</button>
   <p style="font-size:12px"><i>Tip:</i> real chicken eggs take about 21 days to hatch, kept at about 99.5°F with the right humidity and turned several times a day. Coop City speeds that up to ${INCUBATE_DAYS} days.</p>
   <h3 style="margin:10px 0 0">🐣 Nursery</h3>${nursery}
   <p style="font-size:12px">Chicks join the flock after ${CHICK_GROW_DAYS} days if the coop has room (${S.hens.length}/${capacity()}).</p>
   <button class="act big" onclick="closeModal()">Close</button>`);
}
window.incubatorModal = incubatorModal;
window.loadIncubator = () => { let n = 0;
  S.basket = S.basket.filter(e => { if (e.fertile && S.incub.length < INCUBATOR_CAP) { S.incub.push({ color: e.color, breed: e.breed, sire: e.sire, days: INCUBATE_DAYS }); n++; return false; } return true; });
  toast(`${n} egg${n === 1 ? "" : "s"} in the incubator`); sayOnce("incub", "I'm basically a chicken dad now. Do I need to sit on them? <i>Tip: the incubator does the hen's job: steady heat, humidity, and turning.</i>", 1);
  incubatorModal(); renderAll(); };
window.sellChick = id => { const c = S.chicks.find(x => x.id == id); if (!c) return; const v = chickValue(c);
  S.chicks = S.chicks.filter(x => x !== c); S.coins += v; toast(`Sold a chick! +${v}🪙`);
  sayOnce("chicksale", "A family bought a chick for their kids. It's like a tiny adoption. <i>Tip: chicks need a warm brooder for their first few weeks.</i>", 1); incubatorModal(); renderAll(); };

/* ---------- START ---------- */
function title() {
  modal(`<div class="title"><h1>Coop City</h1><div class="sub">A chicken sim for people who've never met a chicken.</div><div class="ver">build 6 · smooth hens + bugs</div>
   <div style="width:90px;margin:10px auto">${guySVG}</div>
   <p>"Hi, I'm Brayden. I moved to a house with a yard and got a hen. I have no idea what I'm doing."</p>
   <p><b>Pick your first hen:</b></p>
   ${["leghorn","barred"].map(k=>`<div class="row">${henSVG(k)}<div class="t"><b>${CH[k].name}</b><br>${CH[k].blurb}</div><button class="buy" onclick="start('${k}')">Adopt</button></div>`).join("")}
   <p style="font-size:12px;opacity:.7">More breeds unlock as you sell eggs. Egg laying is simulated demo data.</p></div>`);
}
window.start = k => { fresh(k); ["beetle", "cricket", "worm", "beetle"].forEach(b => spawnBug(b)); closeModal(); renderTools(); renderAll(); wander(); say("Grandma left me a coop, a feeder, and a waterer. Now what? <i>Tip: tap the feeder or waterer to refill them, and lock the coop at night.</i>", 1); loop(); };
let timer, wtimer;
// Daytime hours last longer than night hours so players have time to build
const hourMs = () => (isNight() ? 2000 : 4500) / S.speed;
function step() { tick(); if (S.speed) timer = setTimeout(step, hourMs()); }
function loop() { clearTimeout(timer); clearInterval(timer); if (S.speed) timer = setTimeout(step, hourMs()); clearInterval(wtimer); wtimer = setInterval(wanderTick, 400); }
$("#guyArt").innerHTML = guySVG;

// Demo states for screenshots: ?demo=yard|night|shop|hensshop|coopshop|henmodal|incubator|share|title
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
  S.hens[3].happy = 90; S.hens[2].happy = 30; S.coopLvl = 1;
  ["beetle", "cricket", "worm", "worm", "fly", "butterfly", "beetle"].forEach(k => spawnBug(k));
  S.hens.forEach((h, k) => h.age = [12, 6, 23, 3][k]);
  say("WAIT. We got eggs but I don't have a rooster?! <i>Fact: hens lay eggs without a rooster. Roosters only matter if you want chicks.</i>", 1);
  if (demo === "night") { S.hour = 23; S.locked = true; S.bugs = []; S.weather = WEATHER[4]; S.ground = []; S.hens.forEach(h => { const p = tilePos(7); h.x = p.x + Math.random()*6; h.y = p.y + Math.random()*4; });
    say("Ha! The raccoon rattled the door and left. Locking up works! <i>Tip: raccoons hunt at night, so lock the coop every evening.</i>", 1); }
  renderAll();
  if (demo === "night") { const el = document.createElement("div"); el.className = "predator"; el.textContent = "🦝"; const p = tilePos(13); el.style.left = p.x + "%"; el.style.top = p.y + "%"; $("#fx").appendChild(el); toast("A raccoon tried the coop door. Locked. Nice!"); }
  if (demo === "shop" || demo === "hensshop") shop();
  if (demo === "coopshop") { S.coins = 72; shopTab = "coop"; shop(); }
  if (demo === "henmodal") henModal(S.hens[2].id);
  if (demo === "incubator") {
    put("incubator", 9); S.rooster = { name: "Vlad", breed: "ayam", x: 50, y: 60, flip: true };
    S.incub = [{ color: "white", breed: "leghorn", sire: "ayam", days: 2 }, { color: "brown", breed: "wyandotte", sire: "ayam", days: 2 }, { color: "blue", breed: "easter", sire: "ayam", days: 1 }, { color: "chocolate", breed: "marans", sire: "ayam", days: 3 }];
    S.chicks = [{ id: 1, breed: "zombie", mix: false, age: 1 }, { id: 2, breed: "mime", mix: false, age: 2 }, { id: 3, breed: "easter", mix: true, age: 0 }];
    S.basket.push({ color: "white", breed: "leghorn", fertile: true, sire: "ayam" });
    renderAll(); incubatorModal();
  }
  if (demo === "share") shareCard({ color: "cream", breed: "ayam", hen: S.hens[3].name, tile: 0 });
  if (demo === "title") title();
}
})();
