(() => {
const $ = s => document.querySelector(s);
const COLS = 12, ROWS = 12, N = COLS * ROWS, VC = 6, VR = 8; // world tiles; VC x VR tiles fit on screen
const ux = x => (x * VC / COLS) + "%", uy = y => (y * VR / ROWS) + "%"; // yard units -> % of the world layer
const CH = SPECIES.chicken.breeds;
const rnd = a => a[Math.floor(Math.random() * a.length)];

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
  coop: l => COOP_ART[0](l),
  _oldcoop: l => `<svg viewBox="0 0 100 100"><rect x="14" y="44" width="72" height="46" fill="#c0392b" stroke="#7b1f16" stroke-width="3"/><path d="M6 48 L50 12 L94 48Z" fill="#6d4c41"/><rect x="40" y="62" width="20" height="28" fill="${l?"#5d4037":"#2b1a10"}"/><path d="M38 90 L62 90 L72 99 L28 99Z" fill="#a1887f"/>${l?`<rect x="43" y="70" width="14" height="11" rx="2" fill="#ffd54f"/><path d="M45 70 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#ffd54f" stroke-width="2.5"/>`:""}<circle cx="27" cy="58" r="5" fill="#ffe082"/></svg>`,
  annex: () => "",
  bed: () => `<svg viewBox="0 0 100 100"><rect x="8" y="10" width="84" height="80" rx="6" fill="#6d4c41"/><path d="M14 30 H86 M14 50 H86 M14 70 H86" stroke="#4e342e" stroke-width="5"/><g font-size="15"><text x="16" y="28">🥬</text><text x="56" y="48">🥕</text><text x="22" y="68">🥬</text><text x="60" y="88">🥕</text></g></svg>`,
  pond: () => `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#4fa3d9"/><path d="M10 40 q10 -6 20 0 t20 0 M50 70 q10 -6 20 0 t20 0" stroke="#bfe6fb" stroke-width="3" fill="none"/><text x="60" y="34" font-size="16">🪷</text></svg>`,
  run: () => `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#d9bb86"/><path d="M0 0 L100 100 M25 0 L100 75 M50 0 L100 50 M75 0 L100 25 M0 25 L75 100 M0 50 L50 100 M0 75 L25 100 M100 0 L0 100 M75 0 L0 75 M50 0 L0 50 M25 0 L0 25 M100 25 L25 100 M100 50 L50 100 M100 75 L75 100" stroke="#8d8d8d" stroke-width="1.5" opacity=".6"/></svg>`,
  feeder: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="82" rx="32" ry="9" fill="#9e9e9e"/><ellipse cx="50" cy="80" rx="26" ry="6" fill="#f2c14e"/><rect x="36" y="26" width="28" height="52" rx="4" fill="#b0bec5" stroke="#607d8b" stroke-width="2"/><ellipse cx="50" cy="26" rx="16" ry="5" fill="#90a4ae"/></svg>`,
  waterer: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="84" rx="30" ry="8" fill="#c62828"/><ellipse cx="50" cy="82" rx="24" ry="5" fill="#4fc3f7"/><path d="M32 80 L34 34 Q50 20 66 34 L68 80Z" fill="#e3f2fd" stroke="#90caf9" stroke-width="2"/><rect x="34" y="50" width="32" height="28" fill="#81d4fa" opacity=".7"/><rect x="46" y="18" width="8" height="10" fill="#c62828"/></svg>`,
  nest: () => `<svg viewBox="0 0 100 100"><rect x="14" y="40" width="72" height="50" fill="#a1683a" stroke="#6d4421" stroke-width="3"/><path d="M18 46 Q30 36 40 46 Q50 34 60 46 Q72 36 82 46" stroke="#f4d03f" stroke-width="7" fill="none"/><rect x="14" y="30" width="72" height="10" fill="#8d5a2b"/></svg>`,
  fence: () => `<svg viewBox="0 0 100 100"><rect y="34" width="100" height="9" fill="#8d6e63"/><rect y="62" width="100" height="9" fill="#8d6e63"/>${[10,40,70].map(x=>`<path d="M${x} 90 V24 L${x+10} 14 L${x+20} 24 V90Z" fill="#bcaaa4" stroke="#6d4c41" stroke-width="2"/>`).join("")}</svg>`,
  tree: () => `<svg viewBox="0 0 100 100"><rect x="44" y="56" width="12" height="36" fill="#6d4c41"/><circle cx="50" cy="42" r="30" fill="#388e3c"/><circle cx="36" cy="34" r="16" fill="#43a047"/><circle cx="62" cy="30" r="14" fill="#4caf50"/></svg>`,
  incubator: () => `<svg viewBox="0 0 100 100"><rect x="12" y="34" width="76" height="54" rx="10" fill="#eceff1" stroke="#78909c" stroke-width="3"/><rect x="22" y="44" width="56" height="28" rx="6" fill="#ffe0b2" stroke="#90a4ae" stroke-width="2"/>${[34,50,66].map(x=>`<ellipse cx="${x}" cy="58" rx="6" ry="8" fill="#f7f4ea" stroke="#0003"/>`).join("")}<circle cx="78" cy="80" r="3" fill="#ef5350"/><rect x="22" y="78" width="30" height="5" rx="2" fill="#4fc3f7"/></svg>`,
  hand: () => `<svg viewBox="0 0 100 100"><text x="50" y="70" font-size="58" text-anchor="middle">✋</text></svg>`,
  bulldoze: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">🧹</text></svg>`
};
const BUILD = "build 12 · feedback";
const guySVG = `<svg viewBox="0 0 60 72"><path d="M12 72 V47 Q30 35 48 47 V72Z" fill="#2e7d32"/><path d="M12 56 H48 M12 64 H48 M22 42 V72 M38 42 V72" stroke="#1b5e20" stroke-width="2"/><path d="M23 39 L30 47 L37 39Z" fill="#f1c7a0"/><rect x="25" y="33" width="10" height="7" fill="#f1c7a0"/><circle cx="30" cy="22" r="13" fill="#f1c7a0"/><path d="M19 27 Q30 40 41 27 Q41 34 30 36 Q19 34 19 27Z" fill="#6d4c41" opacity=".55"/><path d="M16 21 Q14 7 30 6 Q46 7 44 21 Q42 13 36 12 L33 9 L30 12 L26 9 L23 12 Q18 13 16 21Z" fill="#4e342e"/><rect x="17" y="18" width="11" height="6" rx="2" fill="#111"/><rect x="32" y="18" width="11" height="6" rx="2" fill="#111"/><line x1="28" y1="20" x2="32" y2="20" stroke="#111" stroke-width="1.5"/><path d="M25 29 Q30 32 35 29" stroke="#5d2f1a" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="44" y="49" width="10" height="13" rx="2" fill="#fff" stroke="#795548"/><rect x="44" y="52" width="10" height="4" fill="#8d6e63"/></svg>`;

/* ---------- COOP ART PER LEVEL ---------- */
const lockSVG = (x, y) => `<rect x="${x}" y="${y + 6}" width="12" height="10" rx="2" fill="#ffd54f" stroke="#a07800"/><path d="M${x + 2} ${y + 6} v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="#ffd54f" stroke-width="2.4"/>`;
const COOP_ART = [
  // Starter: small plywood box on legs
  l => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="94" rx="40" ry="5" fill="#0002"/><rect x="22" y="70" width="5" height="22" fill="#8d6e63"/><rect x="73" y="70" width="5" height="22" fill="#8d6e63"/>
    <rect x="16" y="40" width="68" height="34" fill="#dcb47c" stroke="#a5814f" stroke-width="2"/><path d="M16 50 H84 M16 62 H84" stroke="#c49a63" stroke-width="1"/><path d="M10 44 L90 30 L90 36 L10 50Z" fill="#7b5a3c"/>
    <rect x="42" y="52" width="16" height="22" fill="${l ? "#8d6e63" : "#3b2616"}"/>${l ? lockSVG(44, 54) : ""}<path d="M44 74 L38 92 M56 74 L62 92" stroke="#a5814f" stroke-width="3"/><path d="M40 80 H60 M39 86 H61" stroke="#a5814f" stroke-width="2"/></svg>`,
  // Big: two-story coop with ramp, window, and nest-box bump-out (2 tiles wide)
  l => `<svg viewBox="0 0 200 100"><ellipse cx="100" cy="95" rx="92" ry="5" fill="#0002"/><rect x="30" y="20" width="110" height="72" fill="#8fae7e" stroke="#5f7d52" stroke-width="2.5"/>
    <path d="M30 56 H140" stroke="#fff" stroke-width="3"/><path d="M22 24 L85 0 L148 24Z" fill="#6d4c41"/><rect x="74" y="8" width="22" height="10" fill="#5d4037"/>
    <rect x="44" y="28" width="22" height="18" fill="#bfe3f2" stroke="#fff" stroke-width="3"/><path d="M55 28 V46 M44 37 H66" stroke="#fff" stroke-width="2"/>
    <rect x="96" y="28" width="30" height="18" fill="#bfe3f2" stroke="#fff" stroke-width="3"/><path d="M111 28 V46" stroke="#fff" stroke-width="2"/>
    <rect x="140" y="38" width="36" height="22" fill="#a7c49a" stroke="#5f7d52" stroke-width="2"/><path d="M137 38 L179 32 L179 38Z" fill="#6d4c41"/><path d="M152 38 V60 M164 38 V60" stroke="#5f7d52"/><text x="158" y="54" font-size="9" text-anchor="middle">🥚</text>
    <rect x="76" y="64" width="20" height="28" fill="${l ? "#5d4037" : "#2b1a10"}" stroke="#fff" stroke-width="2"/>${l ? lockSVG(80, 68) : ""}
    <path d="M96 92 L132 99" stroke="#a1887f" stroke-width="6"/><path d="M104 93 l1 4 M114 95 l1 4 M124 97 l1 3" stroke="#6d4c41" stroke-width="2"/><circle cx="40" cy="68" r="4" fill="#ffe082"/></svg>`,
  // Barn: red barn with cupola + weathervane and a fenced run (2x2 tiles)
  l => `<svg viewBox="0 -20 200 220"><ellipse cx="100" cy="190" rx="94" ry="7" fill="#0002"/>
    <path d="M40 150 V190 M70 150 V190 M100 150 V190 M130 150 V190 M160 150 V190 M190 150 V190" stroke="#e8e0d0" stroke-width="5"/><path d="M38 162 H192 M38 178 H192" stroke="#e8e0d0" stroke-width="4"/>
    <path d="M14 70 L44 34 L100 22 L156 34 L186 70Z" fill="#5d4037"/><rect x="18" y="68" width="164" height="104" fill="#c0392b" stroke="#7b1f16" stroke-width="3"/>
    <path d="M18 88 H182" stroke="#a93226" stroke-width="2"/><path d="M40 68 V172 M62 68 V172 M138 68 V172 M160 68 V172" stroke="#a93226" stroke-width="1.5" opacity=".6"/>
    <rect x="84" y="38" width="32" height="20" fill="#fff" stroke="#7b1f16" stroke-width="2"/><path d="M84 38 L116 58 M116 38 L84 58" stroke="#c0392b" stroke-width="2"/>
    <rect x="88" y="6" width="24" height="18" fill="#c0392b" stroke="#fff" stroke-width="2"/><path d="M84 8 L100 -2 L116 8Z" fill="#5d4037"/><path d="M100 -2 V-16" stroke="#333" stroke-width="2"/><path d="M92 -14 H108 L104 -18 M92 -14 l3 -3" stroke="#333" stroke-width="2" fill="none"/>
    <rect x="70" y="110" width="60" height="62" fill="${l ? "#8b2a20" : "#3a120d"}" stroke="#fff" stroke-width="4"/>${l ? "" : ""}<path d="M70 110 L130 172 M130 110 L70 172" stroke="#fff" stroke-width="4"/>${l ? lockSVG(94, 128) : ""}
    <rect x="30" y="100" width="24" height="20" fill="#ffe082" stroke="#fff" stroke-width="3"/><rect x="146" y="100" width="24" height="20" fill="#ffe082" stroke="#fff" stroke-width="3"/></svg>`];
// Footprint offsets for each coop level (tile index offsets from the coop's top-left)
const COOP_FOOT = [[0], [0, 1], [0, 1, COLS, COLS + 1]];
// Find a top-left tile near the current coop where the bigger footprint fits on free, owned tiles
function coopFit(lvl) { const c = tilesOf("coop")[0]; if (c === undefined) return null;
  const mine = new Set(S.grid.map((g, i) => g && (g.type === "coop" || g.type === "annex") ? i : -1).filter(i => i >= 0));
  for (const tl of [c, c - 1, c - COLS, c - COLS - 1]) { if (tl < 0) continue;
    const cells = COOP_FOOT[lvl].map(o => tl + o);
    if (cells.every(i => i < N && (i % COLS) >= (tl % COLS) && owned(i) && (!S.grid[i] || mine.has(i)))) return tl; }
  return null; }
function placeCoop(tl, lvl) { S.grid.forEach((g, i) => { if (g && (g.type === "coop" || g.type === "annex")) S.grid[i] = null; });
  COOP_FOOT[lvl].forEach((o, k) => S.grid[tl + o] = k ? { type: "annex", lvl: 100, of: tl } : { type: "coop", lvl: 100 });
  S.bugs = S.bugs.filter(b => !COOP_FOOT[lvl].includes(b.tile - tl)); }

/* ---------- CONFIG ---------- */
const ITEMS = {
  hand:    { name: "Hand", cost: 0 },
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

/* ---------- FUNNY NAME GENERATOR ---------- */
const FUNNY = ["Henrietta Von Cluckington","Nugget (ironic)","Sir Lays-a-Lot","Kentucky (very ironic)","Omelette","Scramble","Princess Peep","Hen Solo","Drumstick (please no)","Rotisserie (do not)","Gravy","Biscuit","Waffles","Pancake","Pickles","Noodle","Dumpling","Tater Tot","Meatball (vegetarian)","Pot Pie (absolutely not)","Buffalo Wing","Nuggetta","Tikka Masala","Pesto","Paprika","Nutmeg","Cinnamon","Saffron","Ginger Snap","Pumpkin Spice","Marshmallow","S'more","Cupcake","Muffin","Crumpet","Scone","Brioche","Croissant","Baguette","Pretzel","Bagel","Toast","French Toast","Sourdough","Butterbean","Chickpea (obviously)","Lentil","Edamame","Tofu","Kale","Radish","Turnip","Parsnip","Rutabaga","Zucchini","Eggplant (confusing)","Quiche","Frittata","Shakshuka","Deviled Egg (rude)","Sunny Side","Over Easy","Hard Boiled","Poached","Benedict","Eggward","Eggnes","Shelly","Featherstone","Fluffington","Puffball","Henny Penny","Chicken Little","Little Red Hen","Clucky","Cluckers","Cluckles","Peggy","Peck Ness Monster","Pecky Blinders","Peckerella","Cindercluck","Rapunzhen","Henya","Hennifer","Hentley","Henergizer","Clementine","Mabel","Dolly","Betty","Gertrude","Mildred","Agnes","Ethel","Doris","Bernadette","Winifred","Philomena","Prudence","Penelope","Matilda","Ophelia","Gladys","Hazel","Marigold","Daisy","Buttercup","Clover","Dandelion","Sunflower","Pepper","Salt","Paprikash","Mustard","Ketchup (controversial)","Relish","Mayo","Sriracha","Tabasco","Jalapeño","Chipotle","Taco Tuesday","Burrito","Quesadilla","Nacho","Churro","Tamale","Fajita","Sushi","Ramen","Udon","Wonton","Bao","Kimchi","Bibimbap","Pierogi","Gnocchi","Ravioli","Tortellini","Lasagna","Calzone","Stromboli","Cannoli","Tiramisu","Gelato","Sorbet","Sprinkles","Jellybean","Gumdrop","Bonbon","Truffle","Toffee","Fudge","Caramel","Butterscotch","Lady Gobbles (not a turkey)","Duchess of Dirt Baths","Countess Cluckula","Baroness Von Beak","Admiral Peck","Captain Crunch-a-Bug","Professor Feathers","Agent Double-O-Egg","Rocket","Zoom","Speedy (is not)","Tiny (is huge)","Chonk","Princess Chonkers","Thunder","Lightning","Storm","Pebbles","Nibbles","Wiggles","Scooter","Bubbles","Squawkward","Fowl Play","Bok Choy","Bok Bok","Free Range Rhonda","Organic Olga","Cage-Free Cathy","Grade A Grace","Jumbo Judy","Extra Large Edna","Farm Fresh Fiona"];
const N_TITLE = ["Lady","Sir","Duchess","Captain","Professor","Madame","Aunt","Little","Big","Dame","Baroness","Countess","Admiral","Princess","Grandma"];
const N_FOOD = ["Biscuit","Waffle","Noodle","Nugget","Muffin","Pickle","Crumpet","Dumpling","Pancake","Tater","Gravy","Pudding","Cobbler","Meatloaf","Butterbean","Cornbread","Jellybean","Pretzel","Turnip","Crouton"];
const N_SUF = ["McFluff","Von Cluck","the Third","of the Coop","Featherbottom","Pecksworth","the Brave","the Bossy","Esquire","Cluckington","the Magnificent","Scratchwell","Beakman","the Unbothered","of Backyard Manor"];
const used = () => S ? S.hens.map(h => h.name) : [];
function funnyName() {
  for (let k = 0; k < 20; k++) {
    const n = Math.random() < 0.65 ? rnd(FUNNY) : Math.random() < 0.5 ? `${rnd(N_TITLE)} ${rnd(N_FOOD)} ${rnd(N_SUF)}` : `${rnd(N_FOOD)} ${rnd(N_SUF)}`;
    if (!used().includes(n)) return n;
  }
  return rnd(N_FOOD) + " " + Math.floor(Math.random() * 99);
}

/* ---------- LAND PLOTS + PAN/ZOOM WORLD ---------- */
// World is 12x12 tiles; the screen shows 6x8. Units: x 100 = 6 tiles wide, y 100 = 8 tiles tall.
const PLOTS = { home: [0, 0, 6, 8, 0, "🏡 Home yard", ""], garden: [6, 0, 6, 4, 40, "🥕 Garden", "Veggie beds full of bugs and greens."], pasture: [6, 4, 6, 4, 60, "🌾 Pasture", "Tall grass. Free-range heaven."],
  pond: [0, 8, 6, 4, 80, "🦆 Pond", "A little pond. More bugs, frogs, and a great view."], orchard: [6, 8, 6, 4, 100, "🍎 Orchard", "Fruit trees for shade and hawk cover."] };
const plotOf = i => { const c = i % COLS, r = Math.floor(i / COLS); for (const k in PLOTS) { const [x, y, w, h] = PLOTS[k]; if (c >= x && c < x + w && r >= y && r < y + h) return k; } return "home"; };
const owned = i => S.land.includes(plotOf(i));
const T6 = i => (i % 6) + Math.floor(i / 6) * COLS; // starter-yard index (6 wide) -> world index
const plotTiles = k => { const [x, y, w, h] = PLOTS[k], out = []; for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) out.push(r * COLS + c); return out; };
const signTile = k => { const [x, y, w, h] = PLOTS[k]; return (y + Math.floor(h / 2) - 1) * COLS + x + Math.floor(w / 2) - 1; };
function decoratePlot(k) {
  const t = plotTiles(k), put = (i, type) => { if (!S.grid[i]) S.grid[i] = { type, lvl: 100, fixed: 1 }; };
  if (k === "garden") [1, 2, 3, 13, 14, 15].forEach(o => put(t[o], "bed"));
  if (k === "orchard") [1, 4, 13, 16, 20].forEach(o => put(t[o], "tree"));
  if (k === "pond") [7, 8, 13, 14].forEach(o => put(t[o], "pond"));
  t.forEach(i => { if (!S.grid[i] && Math.random() < (k === "pasture" ? 0.7 : 0.4)) S.tufts[i] = { k: Math.floor(Math.random() * 3), life: 3 }; });
}
window.buyPlot = k => { const p = PLOTS[k]; if (S.land.includes(k)) return; if (S.coins < p[4]) return toast("Not enough coins for this land yet!");
  S.coins -= p[4]; coinPop(-p[4]); S.land.push(k); decoratePlot(k); closeModal(); beep("lvl"); xp(10);
  toast(`${p[5]} is yours!`); say(`I own MORE land now. I'm a land baron. A chicken land baron. <i>Tip: more space means happier hens. Free-ranging birds forage bugs and greens, but they still need feed, water, and a safe coop at night.</i>`, 1);
  const [x, y, w, h] = p; panTo((x + w / 2) / VC * 100, (y + h / 2) / VR * 100); renderAll(); wander();
  setTimeout(() => plotTiles(k).forEach((i, n) => { if (n % 5 === 0) { const q = tilePos(i); particle("✨", q.x + 6, q.y + 6, 2); } }), 500); };
function plotModal(k) { const p = PLOTS[k];
  modal(`<h2>${p[5]}</h2><p>${p[6]}</p><p>Price: <b>${p[4]}🪙</b> · you have ${S.coins}🪙</p><button class="buy big" ${S.coins < p[4] ? "disabled" : ""} onclick="buyPlot('${k}')">Buy this land</button><button class="act big" onclick="closeModal()">Maybe later</button>`); }
window.plotModal = plotModal;

// Pan / pinch-zoom on the world container: transform only, rAF-driven, momentum and soft edges
const pan = { x: 0, y: 0, z: 1, vx: 0, vy: 0, drag: false, goto: null, t: "" };
const ptrs = new Map(); let downAt = null, pinch0 = null;
const worldW = () => yardW * COLS / VC, worldH = () => yardH * ROWS / VR;
function panBounds() { return { mx: Math.max(0, worldW() * pan.z - yardW), my: Math.max(0, worldH() * pan.z - viewH) }; }
const zMin = () => Math.max(0.5, viewH / (worldH() || 1), yardW / (worldW() || 1));
function panTo(ux, uy) { const b = panBounds(); pan.goto = { x: Math.min(b.mx, Math.max(0, ux * yardW / 100 * pan.z - yardW / 2)), y: Math.min(b.my, Math.max(0, uy * yardH / 100 * pan.z - viewH / 2)) }; pan.vx = pan.vy = 0; }
window.recenter = () => { const c = tilesOf("coop")[0]; const p = c !== undefined ? tilePos(c) : { x: 50, y: 50 }; pan.zGoal = 1; panTo(p.x + 8, p.y + 8); };
function stepPan(dt) {
  const b = panBounds();
  if (pan.zGoal) { pan.z += (pan.zGoal - pan.z) * Math.min(1, dt * 8); if (Math.abs(pan.zGoal - pan.z) < 0.002) { pan.z = pan.zGoal; pan.zGoal = 0; } }
  if (pan.goto) { pan.x += (pan.goto.x - pan.x) * Math.min(1, dt * 6); pan.y += (pan.goto.y - pan.y) * Math.min(1, dt * 6); if (Math.hypot(pan.goto.x - pan.x, pan.goto.y - pan.y) < 0.5) pan.goto = null; }
  else if (!pan.drag) {
    pan.x += pan.vx * dt; pan.y += pan.vy * dt; const f = Math.exp(-dt * 4.5); pan.vx *= f; pan.vy *= f;
    // soft edges: spring back inside bounds
    if (pan.x < 0) { pan.x += -pan.x * Math.min(1, dt * 12); pan.vx = 0; } if (pan.x > b.mx) { pan.x += (b.mx - pan.x) * Math.min(1, dt * 12); pan.vx = 0; }
    if (pan.y < 0) { pan.y += -pan.y * Math.min(1, dt * 12); pan.vy = 0; } if (pan.y > b.my) { pan.y += (b.my - pan.y) * Math.min(1, dt * 12); pan.vy = 0; }
  }
  const t = `translate3d(${(-pan.x).toFixed(1)}px,${(-pan.y).toFixed(1)}px,0) scale(${pan.z.toFixed(3)})`;
  if (t !== pan.t) { pan.t = t; $("#world").style.transform = t; const mv = $("#miniView");
    if (mv) mv.style.transform = `translate3d(${(pan.x / (worldW() * pan.z) * 54).toFixed(1)}px,${(pan.y / (worldH() * pan.z) * 54).toFixed(1)}px,0) scale(${(yardW / (worldW() * pan.z)).toFixed(3)},${Math.min(1, viewH / (worldH() * pan.z)).toFixed(3)})`; }
}
// Touch input for the world. Build 7 relied on the browser's synthesized "click" after a pointer gesture and
// treated any wiggle over 8px as a drag (which silently ate the tap). Build 8 detects taps itself from pointer
// events: under 14px of movement (or under 24px within 300ms) is a tap, and we hit-test with elementsFromPoint
// using a fat-finger search, so it doesn't depend on Safari's click heuristics.
const TAP_SLOP = 14, TAP_QUICK = 24, TAP_QUICK_MS = 300;
function initPan() {
  const vp = $("#grid-wrap");
  vp.addEventListener("pointerdown", e => { if (e.button > 0 || e.target.closest("#recenter, #dock, #scrapBtn")) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const fling = Math.hypot(pan.vx, pan.vy) > 260; pan.vx = 0; pan.vy = 0; pan.goto = null;
    if (ptrs.size === 1) downAt = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, t: performance.now(), lx: e.clientX, ly: e.clientY, lt: performance.now(), max: 0, fling, multi: false };
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), z: pan.z, px: pan.x, py: pan.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; pan.drag = true; if (downAt) downAt.multi = true; } });
  window.addEventListener("pointermove", e => { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2 && pinch0) { const [a, b] = [...ptrs.values()], r = vp.getBoundingClientRect(); const z = Math.min(1.4, Math.max(zMin(), pinch0.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch0.d));
      const mx = pinch0.mx - r.left, my = pinch0.my - r.top; pan.x = (pinch0.px + mx) * z / pinch0.z - mx; pan.y = (pinch0.py + my) * z / pinch0.z - my; pan.z = z; return; }
    if (!downAt) return; downAt.max = Math.max(downAt.max, Math.hypot(e.clientX - downAt.sx, e.clientY - downAt.sy));
    if (!pan.drag && downAt.max > TAP_SLOP && !(downAt.max <= TAP_QUICK && performance.now() - downAt.t < 120)) { pan.drag = true; downAt.x = e.clientX; downAt.y = e.clientY; downAt.px = pan.x; downAt.py = pan.y; }
    const dx = e.clientX - downAt.x, dy = e.clientY - downAt.y;
    if (pan.drag) { const b = panBounds(); let x = downAt.px - dx, y = downAt.py - dy;
      if (x < 0) x /= 3; if (x > b.mx) x = b.mx + (x - b.mx) / 3; if (y < 0) y /= 3; if (y > b.my) y = b.my + (y - b.my) / 3; pan.x = x; pan.y = y;
      const now = performance.now(), ddt = Math.max(1, now - downAt.lt) / 1000; pan.vx = 0.8 * (-(e.clientX - downAt.lx) / ddt) + 0.2 * pan.vx; pan.vy = 0.8 * (-(e.clientY - downAt.ly) / ddt) + 0.2 * pan.vy; downAt.lx = e.clientX; downAt.ly = e.clientY; downAt.lt = now; } });
  const up = e => { if (!ptrs.delete(e.pointerId)) return; if (ptrs.size < 2) pinch0 = null;
    if (ptrs.size) return;
    const d = downAt, dur = d ? performance.now() - d.t : 1e9;
    const isTap = d && e.type === "pointerup" && !d.multi && !d.fling && !pan.drag && (d.max <= TAP_SLOP ? dur < 800 : d.max <= TAP_QUICK && dur < TAP_QUICK_MS);
    if (d && pan.drag && performance.now() - d.lt > 80) { pan.vx = 0; pan.vy = 0; }
    pan.drag = false; downAt = null;
    if (isTap) { lastTapAt = performance.now(); worldTap(d.sx, d.sy); } };
  window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  // We handle world taps ourselves; swallow the browser's synthesized clicks inside the world so nothing fires twice.
  vp.addEventListener("click", e => { if (e.target.closest("#world")) { e.stopPropagation(); e.preventDefault(); } }, true);
  vp.addEventListener("contextmenu", e => e.preventDefault());
}
let lastTapAt = 0;
const TAP_RING = [[0, 0], [0, -9], [9, 0], [-9, 0], [0, 9], [7, -7], [-7, -7], [7, 7], [-7, 7], [0, -16], [15, 0], [-15, 0], [0, 15]];
function worldTap(x, y) {
  if (!S || !S.started && !demoMode) return;
  const at = (dx, dy) => document.elementsFromPoint(x + dx, y + dy);
  const find = (els, sel) => { for (const el of els) { const m = el.closest && el.closest(sel); if (m) return m; } return null; };
  // 1) predators and eggs win, with a generous fat-finger ring (~16px)
  for (const [dx, dy] of TAP_RING) { const els = at(dx, dy);
    const th = find(els, ".threat.tappable"); if (th) { th._tap && th._tap(); return; }
    const eg = find(els, "[data-egg]"); if (eg) { tapFX(eg.closest(".tile")); return collect(+eg.dataset.egg); } }
  const els = at(0, 0), tile = find(els, ".tile"), g = tile && S.grid[+tile.dataset.i];
  const eq = g && (g.type === "annex" ? S.grid[g.of] : g);
  // 2) with the hand tool, feeders/waterers that need a refill beat a hen standing in front of them
  if (tool === "hand" && eq && (eq.type === "feeder" || eq.type === "waterer") && eq.lvl < 95) return tileTap(tile);
  // 3) hens (painted shape, then a small ring when the hand tool has nothing else to do there)
  let hen = find(els, ".hen"); if (hen) return henTap(hen);
  if (tool === "hand" && (!eq || eq.type === "run" || eq.type === "fence")) for (const [dx, dy] of TAP_RING.slice(1, 9)) { hen = find(at(dx, dy), ".hen"); if (hen) return henTap(hen); }
  // 4) tiles, signs, equipment
  if (tile) return tileTap(find(els, "[data-plot]") || tile);
}
function tapFX(t) { if (!t) return; buzz(8); t.classList.remove("tapped"); void t.offsetWidth; t.classList.add("tapped"); clearTimeout(t._tt); t._tt = setTimeout(() => t.classList.remove("tapped"), 420); }
function renderMini() { const m = $("#mini"); if (!m) return; const sig = S.land.join();
  if (m._s === sig) return; m._s = sig;
  m.innerHTML = Object.entries(PLOTS).map(([k, [x, y, w, h]]) => `<i class="${S.land.includes(k) ? "own" : ""}" style="left:${x / COLS * 100}%;top:${y / ROWS * 100}%;width:${w / COLS * 100}%;height:${h / ROWS * 100}%"></i>`).join("") + `<b id="miniView"></b>`; pan.t = ""; }

/* ---------- STATE ---------- */
let S;
function fresh(breed = "leghorn") {
  S = { coins: 60, day: 1, hour: 7, grid: Array(N).fill(null), hens: [], basket: [], ground: [], locked: false,
    weather: WEATHER[0], speed: 1, collection: {}, said: {}, unlocked: { leghorn: true }, premium: {}, quizI: 0, lifetime: 0, feed: 5, clean: 100,
    coopLvl: 0, land: ["home"], rooster: null, incub: [], chicks: [], hatched: 0, duds: 0,
    bugs: [], tufts: Array(N).fill(null), wormy: 0, foraged: 0 };
  migrate(S); initTufts(); rollDaily();
  // Starter yard: a basic coop, feeder, and waterer so new players aren't overwhelmed
  [["coop", 7], ["feeder", 13], ["waterer", 14]].forEach(([t, i]) => S.grid[T6(i)] = { type: t, lvl: t === "feeder" ? 25 : t === "waterer" ? 35 : 100 });
  addHen(breed, true); S.tut = 0;
}
function addHen(breed, free, mix) {
  const b = CH[breed];
  S.hens.push({ id: Math.random(), breed, name: funnyName(), age: 0, mix: !!mix, health: 90, happy: 80, egg: rnd(b.eggs), x: 40 + Math.random() * 30, y: 40 + Math.random() * 30, flip: false, pers: rnd(Object.keys(PERS)), cond: null });
  S.seen[breed] = 1; return S.hens.at(-1);
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
let tutHold = 0, sayHold = 0; // sayHold: keep the one-time feedback ask readable for a few seconds
function say(text, tip, force) { if (!force && ((S && S.tut < TUT.length && performance.now() < tutHold) || (performance.now() < sayHold && !threat))) return false;
  $("#bubbleText").innerHTML = text; const b = $("#bubble"); b.classList.toggle("tip", !!tip); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
  b.classList.remove("more"); requestAnimationFrame(() => b.classList.toggle("more", b.scrollHeight > b.clientHeight + 3)); return true; }
function sayOnce(key, text, tip) { if (S.said[key]) return; if (say(text, tip) !== false) S.said[key] = 1; }
// toasts queue briefly so a quest/badge toast doesn't instantly hide "Feeder filled!"
const toastQ = []; let toastBusy = 0, frzOn = 0; // frzOn: a scrap frenzy is running, so badge news waits until it ends
function toast(t, now, pri) { t = { t, at: performance.now(), now: !!now, pri: !!pri }; if (now) { toastQ.unshift(t); toastBusy = 0; return toastNext(); } if (toastQ.length > 3) toastQ.splice(toastQ.findLastIndex(q => !q.pri) >= 0 ? toastQ.findIndex(q => !q.pri) : 0, 1); // pri: what just happened goes ahead of queued badge news
  if (pri) { const i = toastQ.findIndex(q => !q.pri); toastQ.splice(i < 0 ? toastQ.length : i, 0, t); } else toastQ.push(t); if (!toastBusy) toastNext(); }
const fbOpen = () => !$("#modal").classList.contains("hidden") && !!$("#modalCard .fbform, #modalCard .fbthanks"); // someone typing feedback: hold news (predator warnings still show)
function toastPause() { const el = $("#toast"); if (el.classList.contains("on") && !/^⚠️/.test(el.textContent)) { toastQ.unshift({ t: el.textContent, at: performance.now(), now: false, pri: true }); clearTimeout(el._t); el.classList.remove("on"); } toastNext(); }
function toastNext() { const el = $("#toast"); clearTimeout(toastNext._t);
  if (toastQ.length && ($("#modalCard .title") || (frzOn && !toastQ[0].now) || (fbOpen() && !/^⚠️/.test(toastQ[0].t)))) { toastQ.forEach(q => q.at = performance.now()); toastBusy = 1; toastNext._t = setTimeout(toastNext, 600); return; } // hold toasts while the title card is up
  let q; while ((q = toastQ.shift()) && performance.now() - q.at > 7000) {} // drop stale news
  if (!q) { toastBusy = 0; return; } toastBusy = 1; const t = q.t;
  const dur = Math.min(4200, 1500 + t.length * 38);
  el.textContent = t; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), dur); toastNext._t = setTimeout(toastNext, toastQ.length ? Math.min(dur, 1800) : dur + 200); }
function floatAt(i, text) {
  const el = document.createElement("div"); el.className = "float"; el.textContent = text;
  const p = tilePos(i); el.style.left = ux(p.x + 2); el.style.top = uy(p.y - 1);
  $("#fx").appendChild(el); setTimeout(() => el.remove(), 1300);
}
function modal(html) { const m = $("#modal"), c = $("#modalCard"); clearTimeout(m._t); m.classList.remove("closing"); c.innerHTML = html; c.scrollTop = 0;
  if (m.classList.contains("hidden")) { m.classList.remove("hidden"); m.classList.remove("show"); void m.offsetWidth; m.classList.add("show"); } if (fbOpen()) toastPause(); if (S && S.started) requestAnimationFrame(coach); }
function closeModal() { const m = $("#modal"); if (m.classList.contains("hidden") || m.classList.contains("closing")) return; m.classList.add("closing");
  m._t = setTimeout(() => { m.classList.add("hidden"); m.classList.remove("closing", "show"); if (S && S.started) coach(); }, 170); }
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
  if (!owned(i)) { const k = plotOf(i); return signTile(k) === i ? `<div class="sign" data-plot="${k}">🪧<b>${PLOTS[k][5]}</b><small>${PLOTS[k][4]}🪙</small></div>` : ""; }
  let inner = g ? (g.type === "coop" ? `<div class="coopart s${S.coopLvl}">${COOP_ART[S.coopLvl](S.locked)}</div>` : ART[g.type](false)) : "";
  const tf = S.tufts[i];
  if (tf && (!g || g.type === "run")) { const c = i * 37 % 100; inner += `<div class="tuft l${Math.ceil(tf.life)}" style="left:${10 + c % 50}%;top:${55 + c % 25}%">${TUFT_ART[tf.k]}</div>`; }
  if (g && g.type === "coop") inner += `<div class="badge">Lv${S.coopLvl + 1}</div>${S.def.eyes && isNight() ? `<div class="eyes">🔴</div>` : ""}`;
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
    const t = grid.children[i], html = tileHTML(i), g0 = S.grid[i];
    const cls = "tile" + (owned(i) ? (g0 ? "" : " free") : " forsale") + (g0 && g0.type === "coop" ? " hascoop" : "") + (g0 && g0.type === "pond" ? " water" : "");
    if (t._c !== cls) { t.className = cls; t._c = cls; }
    if (tileCache[i] !== html) { t.innerHTML = html; tileCache[i] = html; }
    const g = S.grid[i];
    if (g && (g.type === "feeder" || g.type === "waterer")) { const bar = t.querySelector(".lvl i"), w = Math.round(g.lvl) + "%"; if (bar && bar.style.width !== w) bar.style.width = w; }
  }
}
/* Hens: one element per bird, created once and moved with GPU transforms. */
const henEls = new Map();
let yardW = 0, yardH = 0, viewH = 0;
// The yard viewport can be any height (it flexes to fill the phone). World units stay tied to the width (square tiles).
function measureYard() { const el = $("#grid-wrap"); yardW = el.clientWidth; yardH = yardW * 4 / 3; viewH = el.clientHeight; pan.t = ""; if (pan.z < zMin()) pan.z = zMin(); }
// Keep birds fully inside the yard (hen is 15% wide, about 11% tall)
const xf = (x, y) => { x = Math.min(85, Math.max(0, x)); y = Math.min(89, Math.max(0, y)); return `translate(${(x * yardW / 100).toFixed(1)}px,${(y * yardH / 100).toFixed(1)}px)`; };
function birdEl(key, svg, attrs) {
  let el = henEls.get(key);
  if (!el) {
    el = document.createElement("div"); el.className = "hen" + (key.startsWith("roo") ? " roo" : "");
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.innerHTML = `<span class="mood"></span><div class="flipper"><div class="bob" style="animation-delay:-${(Math.random() * 2.4).toFixed(2)}s">${svg}${HOL ? `<span class="hat">${HOL.hat}</span>` : ""}</div></div>`;
    el._roo = key.startsWith("roo"); henEls.set(key, el); $("#hens").appendChild(el);
  }
  return el;
}
function placeBird(el, b, mood, inside) {
  el._b = b; // the rAF loop steers the element toward b.x/b.y every frame
  if (el._in !== inside) { el._in = inside; el.classList.toggle("inside", inside); }
  if (mood !== undefined) { const m = el.firstChild; if (m.textContent !== mood) m.textContent = mood; }
  if (!el._m) { el._m = { x: b.x, y: b.y, vx: 0, vy: 0, ph: Math.random() * 6, face: !!b.flip, walk: false, t: "", bt: "" }; el.classList.toggle("flip", !!b.flip); }
}
/* ---------- MOTION ENGINE: one requestAnimationFrame loop for birds, predators, particles ----------
   Positions are in yard % and written as transform only. Layout is measured by ResizeObserver, never per frame. */
const clampX = x => Math.min(COLS / VC * 100 - 15, Math.max(0, x)), clampY = y => Math.min(ROWS / VR * 100 - 11, Math.max(0, y));
const actors = new Set();
let rafId = 0, lastT = 0, frameLog = null;
function frame(t) {
  rafId = requestAnimationFrame(frame);
  const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016); 
  if (frameLog && lastT) frameLog.push(t - lastT);
  lastT = t;
  if (!yardW) return;
  stepPan(dt);
  const kx = yardW / 100, ky = yardH / 100;
  henEls.forEach(el => {
    const b = el._b, m = el._m; if (!b || !m) return;
    const tx = clampX(b.x), ty = clampY(b.y), dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
    const max = b.spd || (b.run ? 30 : el._roo ? 11 : 9); // % of yard per second
    // arrive steering: desired velocity eases down near the target, velocity eases toward it
    const want = d > 0.05 ? Math.min(max, d * 2.2) / d : 0, k = Math.min(1, dt * 5);
    m.vx += (dx * want - m.vx) * k; m.vy += (dy * want - m.vy) * k;
    m.x += m.vx * dt; m.y += m.vy * dt;
    const sp = Math.hypot(m.vx, m.vy), s = Math.min(1, sp / 9);
    const tr = `translate3d(${(m.x * kx).toFixed(1)}px,${(m.y * ky).toFixed(1)}px,0)`;
    if (tr !== m.t) { el.style.transform = tr; m.t = tr; }
    const face = Math.abs(m.vx) > 1.8 ? m.vx < 0 : !!b.flip;
    if (face !== m.face) { m.face = face; el.classList.toggle("flip", face); }
    const walking = s > 0.08, bob = el._bob || (el._bob = el.querySelector(".bob"));
    if (walking !== m.walk) { m.walk = walking; bob.classList.toggle("walk", walking); if (!walking) { bob.style.transform = ""; m.bt = ""; } }
    if (walking) { m.ph += dt * (8 + 10 * s);
      const bt = `translate3d(0,${(-Math.abs(Math.sin(m.ph)) * 3.2 * s).toFixed(1)}px,0) rotate(${(Math.sin(m.ph) * 5 * s).toFixed(1)}deg)`;
      if (bt !== m.bt) { bob.style.transform = bt; m.bt = bt; }
      if (b.cond && b.cond.k === "molt" && Math.random() < dt * 0.6) particle("🪶", m.x + 7, m.y + 6, 1);
    }
  });
  actors.forEach(a => {
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
    if (d < 0.4) { if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(); } }
    else { const step = Math.min(d, a.speed * dt * Math.min(1, 0.35 + d / 12)); a.x += dx / d * step; a.y += dy / d * step; }
    a.ph = (a.ph || 0) + dt * (a.sky ? 3 : 9);
    const bobY = a.sky ? Math.sin(a.ph) * 1.2 : -Math.abs(Math.sin(a.ph)) * 0.8 * (d > 0.4 ? 1 : 0);
    const flip = a.tx < a.x - 0.3 ? -1 : a.tx > a.x + 0.3 ? 1 : a.face || 1; a.face = flip; if (a.fl !== flip) { a.fl = flip; a.el.classList.toggle("fr", flip > 0 && !a.noflip); }
    const tr = `translate3d(${(a.x * kx).toFixed(1)}px,${((a.y + bobY) * ky).toFixed(1)}px,0) scaleX(${a.noflip ? 1 : -flip})`;
    if (tr !== a.t) { a.el.style.transform = tr; a.t = tr; }
    if (a.fade != null) { a.op += (a.fade - a.op) * Math.min(1, dt * 4); const o = a.op.toFixed(2); if (o !== a.o) { a.el.style.opacity = o; a.o = o; } }
  });
  if (frenzies.size) try { stepFrenzies(dt, kx, ky); } catch (e) { console.error(e); frenzies.forEach(f => endFrenzy(f, "abort")); } // never let a scrap bug stall the yard
  stepParticles(dt, kx, ky);
}
function startLoop() { if (!rafId && !document.hidden) { lastT = 0; rafId = requestAnimationFrame(frame); } }
function stopLoop() { cancelAnimationFrame(rafId); rafId = 0; }
document.addEventListener("visibilitychange", () => { if (document.hidden) { stopLoop(); clearTimeout(timer); clearInterval(wtimer); save(); }
  else if (S && S.started && !demoMode) { awayGift(); loop(); } else startLoop(); });
// Actor: a predator or helper that glides toward a target (x,y in yard %)
function actor(html, cls, x, y, speed, opts = {}) {
  const el = document.createElement("div"); el.className = "threat " + cls; el.innerHTML = html; $("#fx").appendChild(el);
  const a = Object.assign({ el, x, y, tx: x, ty: y, speed, op: 0, fade: 1, t: "" }, opts); el.style.opacity = 0; actors.add(a); return a;
}
function dropActor(a, ms = 500) { a.fade = 0; setTimeout(() => { actors.delete(a); a.el.remove(); }, ms); }
// Particle pool: fixed set of nodes reused for feathers, dust, coin pops (no DOM churn)
const PART = [];
function initParticles() { const fx = $("#fx"); for (let i = 0; i < 18; i++) { const el = document.createElement("div"); el.className = "pt"; el.style.opacity = 0; fx.appendChild(el); PART.push({ el, life: 0 }); } }
function particle(txt, x, y, kind) {
  const p = PART.find(q => q.life <= 0); if (!p) return;
  if (p.txt !== txt) { p.el.textContent = txt; p.txt = txt; }
  Object.assign(p, { x, y, life: 1, kind, vx: (Math.random() - 0.5) * (kind === 2 ? 14 : 6), vy: kind === 1 ? -4 - Math.random() * 3 : kind === 2 ? -6 - Math.random() * 4 : -12, rot: Math.random() * 360, dur: kind === 1 ? 1.8 : kind === 2 ? 0.9 : 1.1 });
}
function stepParticles(dt, kx, ky) {
  for (const p of PART) { if (p.life <= 0) continue;
    p.life -= dt / p.dur; if (p.life <= 0) { p.el.style.opacity = 0; continue; }
    if (p.kind === 1) { p.vy += 5 * dt; p.vx = Math.sin(p.life * 9) * 6; p.rot += dt * 90; } else if (p.kind === 2) { p.vy += 10 * dt; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.el.style.transform = `translate3d(${(p.x * kx).toFixed(1)}px,${(p.y * ky).toFixed(1)}px,0) rotate(${p.kind === 1 ? p.rot.toFixed(0) : 0}deg) scale(${p.kind === 2 ? (1.6 - p.life).toFixed(2) : 1})`;
    p.el.style.opacity = Math.min(1, p.life * 2).toFixed(2);
  }
}
let henbarSig = "";
function renderHens() {
  if (!yardW) measureYard();
  const inside = S.locked && has("coop"), keep = new Set();
  if (S.rooster) { const key = "roo:" + S.rooster.breed; keep.add(key); placeBird(birdEl(key, rooSVG(), { "data-roo": "1" }), S.rooster, undefined, inside); }
  S.hens.forEach(h => {
    const key = "h" + h.id; keep.add(key);
    const mood = h.xc ? h.xc : h.cond ? COND[h.cond.k][0] : h.dust ? "💨" : h.tummy && (S.day < h.tummy || (S.day === h.tummy && S.hour < 10)) ? "🤢" : h.dust ? "💨" : h.health < 35 ? "🤒" : h.happy < 35 ? "😤" : h.happy > 75 ? "💛" : "";
    placeBird(birdEl(key, henSVG(h.breed), { "data-h": h.id }), h, mood, inside);
  });
  henEls.forEach((el, k) => { if (!keep.has(k)) { el.remove(); henEls.delete(k); } });
  // Hen bar: rebuild only when the list or labels change; otherwise update bars in place
  const sig = S.hens.map(h => h.id + h.name + breedLabel(h) + isOld(h) + (h.cond ? h.cond.k : "")).join("|") + (S.rooster ? "R" + S.rooster.breed + S.rooster.name : "");
  const bar = $("#henbar");
  if (sig !== henbarSig) {
    henbarSig = sig;
    bar.innerHTML = (S.hens.map(h => `<button class="hencard${h.cond ? " alert" : ""}" data-card="${h.id}" aria-label="${esc(h.name)}, ${breedLabel(h)}">${henSVG(h.breed)}<span class="hc"><b>${h.cond ? `<span class="cbadge">${COND[h.cond.k][0]}</span>` : ""}${h.name}</b>
   <span class="bars"><span class="bl">❤️</span><span class="bar"><i style="background:linear-gradient(90deg,#ff7a7a,#e5533d)"></i></span><span class="bl">😊</span><span class="bar"><i style="background:linear-gradient(90deg,#ffe066,#ffb41f)"></i></span></span></span></button>`).join("") || `<div class="hencard empty">No hens yet. Tap 🐔 to adopt one!</div>`)
     + (S.rooster ? `<button class="hencard roo" data-card="roo">${rooSVG()}<span class="hc"><b>${S.rooster.name}</b><span class="bars"><span class="bl">🐓 ${ROOS[S.rooster.breed].name}</span></span></span></button>` : "");
  }
  S.hens.forEach((h, k) => { const c = bar.children[k]; if (!c) return; const [a, b] = c.querySelectorAll(".bar i");
    const w1 = Math.round(h.health) + "%", w2 = Math.round(h.happy) + "%"; if (a.style.width !== w1) a.style.width = w1; if (b.style.width !== w2) b.style.width = w2; });
}
// Only re-place birds when the yard WIDTH really changes (rotation, desktop resize). Mobile address-bar
// show/hide and HUD text changes must not snap hens. The yard is square tiles, so height follows width.
if (window.ResizeObserver) new ResizeObserver(() => { const el = $("#grid-wrap"), w = el.clientWidth; if (Math.abs(el.clientHeight - viewH) >= 2) { viewH = el.clientHeight; pan.t = ""; if (pan.z < zMin()) pan.z = zMin(); } if (Math.abs(w - yardW) < 4) return; measureYard(); if (S) renderHens(); }).observe($("#grid-wrap"));
function setTxt(sel, v) { const el = $(sel); if (el && el.textContent !== String(v)) el.textContent = v; }
function setHTML(el, v) { if (el && el._h !== v) { el._h = v; el.innerHTML = v; } }
function renderHUD() {
  bucketBtn();
  setTxt("#coins", S.coins); setTxt("#day", S.day);
  setTxt("#clock", `${(S.hour % 12) || 12}${S.hour < 12 ? "am" : "pm"}`);
  setTxt("#clockIcon", isNight() ? "🌙" : S.weather[0]); $("#clockStat").title = `${season()[1]} · ${S.weather[1]}`;
  renderGoalbar();
  setTxt("#basketN", S.basket.length);
  setTxt("#capN", `${S.hens.length}/${capacity()}`);
  setTxt("#feedN", S.feed); setTxt("#cleanN", Math.round(S.clean) + "%");
  $("#cleanStat").classList.toggle("warn", S.clean < 30); $("#feedStat").classList.toggle("warn", S.feed < 2);
  const lb = $("#lockBtn"); setHTML(lb, S.locked ? `<span class="ai">🔓</span><span class="al">Let out</span>` : `<span class="ai">🔒</span><span class="al">Lock coop</span>`); lb.classList.toggle("locked", S.locked);
  lb.classList.toggle("pulse", has("coop") && !S.locked && isNight() && S.hens.length > 0); lb.classList.toggle("pulse2", has("coop") && S.locked && !isNight() && S.hour >= 7 && S.hour < 18 && S.tut >= TUT.length);
  const sb = $("#sellBtn"), val = S.basket.reduce((a, e) => a + eggPrice(e), 0);
  setHTML(sb, `<span class="ai">💰</span><span class="al">Sell${S.basket.length ? ` <em>${val}🪙</em>` : ""}</span>`); sb.classList.toggle("pulse", S.basket.length >= 6);
  setHTML($("#speedBtn"), S.speed ? `<span class="ai">${S.speed > 1 ? "⏩" : "▶️"}</span><span class="al">Speed ${S.speed}×</span>` : `<span class="ai">⏸️</span><span class="al">Paused</span>`);
  const nl = String(NIGHT_RAMP[S.hour]), ng = $("#night");
  if (ng.style.opacity !== nl) { if (!ng._init) { ng._init = 1; ng.style.transition = "none"; requestAnimationFrame(() => requestAnimationFrame(() => ng.style.transition = "")); } ng.style.opacity = nl; }
  const rain = S.weather[1] === "Rain"; if (!!$("#sky").firstChild !== rain) $("#sky").innerHTML = rain ? `<div class="rain"></div>` : "";
}
// Gradual dusk and dawn (opacity of the night overlay by hour; CSS transitions between them)
const NIGHT_RAMP = [.62,.62,.62,.62,.6,.5,.3,.12,0,0,0,0,0,0,0,0,0,0,.06,.18,.4,.55,.6,.62];
function renderAll() { checkGoals(); tutCheck(); renderHUD(); renderGrid(); renderHens(); renderForage(); renderMini(); needGlow(); coach(); saveSoon(); }
/* ---------- BUILD 9: ONBOARDING, NEXT-STEP COACH, JUICE ---------- */
const tileOf = t => tilesOf(t)[0];
const firstEggTile = () => S.ground.length ? S.ground[0].tile : undefined;
// Guided first-run tutorial: one clear step at a time, each with a pulsing pointer on the exact thing to tap.
const TUT = [
  { k: "feed", t: "Tap the feeder to fill it", tile: () => tileOf("feeder"), done: () => { const f = S.grid[tileOf("feeder")]; return !f || f.lvl >= 95; },
    say: "Okay, step one. The hens are hungry and the feeder is almost empty. Tap the feeder! <i>Tip: laying hens eat a complete layer feed, about 16% protein, and a hen eats roughly a quarter pound a day.</i>" },
  { k: "water", t: "Tap the waterer to refill it", tile: () => tileOf("waterer"), done: () => { const w = S.grid[tileOf("waterer")]; return !w || w.lvl >= 95; },
    say: "Nice! Now the water. Tap the waterer. <i>Tip: an egg is mostly water, so hens stop laying fast without clean, fresh water.</i>" },
  { k: "egg", t: "Tap the egg to collect it", tile: firstEggTile, done: () => S.lifetime >= 1, start: () => tutEgg(),
    say: "WAIT. She laid an egg! Right there in the grass! Tap it to put it in your basket. <i>Tip: a healthy hen lays about one egg a day at most, since each egg takes around 25 hours to form.</i>" },
  { k: "sell", t: "Tap 💰 Sell, then Sell all", el: () => $("#modal").classList.contains("hidden") ? "#sellBtn" : "#sellAllBtn", done: () => S.stats.sold >= 1,
    say: "Our first egg! Let's sell it. Tap 💰 Sell down below. <i>Tip: coins buy feed, more hens, and coop upgrades.</i>" },
  { k: "lock", t: "Tap the coop to lock it", tile: () => tileOf("coop"), done: () => S.locked,
    say: "Last thing. Every night you HAVE to lock the coop. Practice now: tap the coop. <i>Tip: raccoons, foxes, and owls do most of their hunting at night, and a locked coop is the best defense.</i>" },
  { k: "open", t: "Tap the coop again to let them out", tile: () => tileOf("coop"), done: () => !S.locked || isNight(),
    say: "Locked! Do that every night. Now tap the coop again to let them out to look for bugs. <i>Tip: the 🔒 button below does the same thing.</i>" },
  { k: "hawk", t: "Tap the hawk to scare it off!", el: () => ".threat.tappable", done: () => S.said.tutHawkDone || isNight(), start: () => setTimeout(tutHawk, 1200),
    say: "Uh oh. Something's circling. If a predator shows up, tap it fast to scare it off!" }];
function tutEgg() { if (S.ground.length) return; const c = tileOf("coop") ?? 0, h = S.hens[0]; const near = [c + 2, c + COLS + 2, c + 2 * COLS, c + 2 * COLS + 1].find(i => owned(i) && !S.grid[i]) ?? openTiles()[0];
  S.ground.push({ tile: near, color: h ? h.egg : "white", breed: h ? h.breed : "leghorn", hen: h ? h.name : "", fertile: false }); renderAll(); }
function tutHawk() { if (S.tut >= TUT.length || TUT[S.tut].k !== "hawk") return; if (threat || isNight() || !hensOut()) { S.said.tutHawkDone = 1; return renderAll(); }
  dayThreat("hawk", true); if (!threat) { S.said.tutHawkDone = 1; renderAll(); } }
function tutCheck() {
  if (!S || S.tut == null || S.tut >= TUT.length || demoMode) return;
  let moved = false;
  while (S.tut < TUT.length && TUT[S.tut].done()) { S.tut++; moved = true; if (S.tut < TUT.length || S.said.tutHawkDone) coinFly(5, coachPoint()); S.coins += 5; }
  if (!moved && S.tut === 0 && !S.said.tut0) { S.said.tut0 = 1; tutSay(); }
  if (!moved) return;
  if (S.tut >= TUT.length) { gain(15); confetti(); buzz(30); tutHold = 0;
    say(`You're a natural${S.player ? ", " + esc(S.player) : ""}! I'm basically your assistant now. The bar at the top always shows what to do next. <i>Tip: tap ⚙️ for How to play and settings.</i>`, 1, 1);
    toast("🎓 Tutorial done! +15🪙", 1); S.said.tutDone = 1; return; }
  tutSay(); const st = TUT[S.tut]; if (st.start) st.start();
}
function tutSay() { const st = TUT[S.tut]; say(`<b class="step">Step ${S.tut + 1}/${TUT.length}</b> ${S.tut === 0 ? `${S.player ? `Hi ${esc(S.player)}! ` : ""}Grandma left us a coop, a feeder, and a waterer. ` : ""}${st.say}`, 1, 1); tutHold = performance.now() + 60000; }
// "One obvious next step at all times": tutorial step, then urgent care, then the next badge goal.
function nextHint() {
  if (S.tut < TUT.length) { const st = TUT[S.tut]; return { t: st.t, tile: st.tile && st.tile(), el: st.el && st.el(), step: `STEP ${S.tut + 1}/${TUT.length}` }; }
  if (threat && !threat.done) return { t: `Tap the ${threat.T.name.toLowerCase()} to scare it off!`, el: ".threat.tappable", urgent: 1 };
  const coop = tileOf("coop"), fd = tilesOf("feeder").find(i => S.grid[i].lvl < 30), wt = tilesOf("waterer").find(i => S.grid[i].lvl < 30);
  if (coop !== undefined && isNight() && !S.locked && S.hens.length) return { t: "It's dark: tap the coop to lock it", tile: coop, urgent: 1 };
  if (wt !== undefined) return { t: "Water is low: tap the waterer", tile: wt, urgent: 1 };
  if (fd !== undefined) return S.feed > 0 ? { t: "Feeder is low: tap it to refill", tile: fd, urgent: 1 } : { t: "Out of feed: buy a bag in Shop → Supplies", act: () => { shopTab = "supplies"; shop(); }, el: "#shopBtn", urgent: 1 };
  if (S.ground.length) return { t: `Collect ${S.ground.length > 1 ? S.ground.length + " eggs" : "the egg"} in the yard`, tile: S.ground[0].tile };
  if (S.scraps.length && !(S.stats.scraps > 0) && hensOut() && !frenzies.size) return { t: "Kitchen scraps! Tap 🪣 Scraps to toss them to the hens", el: "#scrapBtn", act: scrapTray };
  if (S.feed < 2) return { t: "Feed is running low: Shop → Supplies", act: () => { shopTab = "supplies"; shop(); }, el: "#shopBtn" };
  if (S.clean < 40) return { t: "Coop is dirty: buy pine shavings in Supplies", act: () => { shopTab = "supplies"; shop(); }, el: "#shopBtn" };
  if (S.basket.length >= 6) return { t: `Sell your ${S.basket.length} eggs`, el: "#sellBtn" };
  if (coop !== undefined && S.locked && !isNight() && S.hour >= 7 && S.hour < 18) return { t: "Morning! Tap the coop to let the hens out", tile: coop };
  const g = nextGoal(); return g ? { t: `${g[1]} ${g[2]}\u00a0·\u00a0+${g[4]}🪙`, act: () => { gTab = "badges"; goalsModal(); }, goal: 1 } : { t: "🏆 All badges earned!", act: goalsModal };
}
let hint = null, coachSig = "";
function coach() {
  if (!S || !S.started) return;
  hint = nextHint();
  const sig = [hint.t, hint.tile, hint.el, hint.step, hint.urgent].join("|");
  if (sig !== coachSig) { coachSig = sig; setTxt("#goalTxt", hint.t); setTxt("#nextLbl", hint.step || (hint.urgent ? "NOW" : hint.goal ? "GOAL" : "NEXT"));
    const nb = $("#nextBtn"); nb.classList.toggle("urgent", !!hint.urgent); nb.classList.toggle("tut", !!hint.step); nb.classList.remove("flash"); void nb.offsetWidth; nb.classList.add("flash"); }
  const cm = $("#coachMark"), showTile = hint.tile !== undefined && hint.tile !== null && (hint.step || hint.urgent || (performance.now() < coachPin && hint.tile === coachPinTile));
  if (showTile) { const p = tilePos(hint.tile); cm.style.left = ux(p.x - 1); cm.style.top = uy(p.y - 1); cm.classList.add("on"); } else cm.classList.remove("on");
  document.querySelectorAll(".coach").forEach(e => { if (!hint.el || !e.matches(hint.el)) e.classList.remove("coach"); });
  if (hint.el && (hint.step || hint.urgent || hint.el === "#sellBtn" || hint.el === "#scrapBtn")) { const e = document.querySelector(hint.el); if (e) e.classList.add("coach"); }
}
function coachPoint() { const cm = $("#coachMark"); if (cm.classList.contains("on")) { const r = cm.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }
  const e = hint && hint.el && document.querySelector(hint.el); if (e) { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; } return null; }
let coachPin = 0, coachPinTile = null;
function hintTap() { if (!hint) return; buzz(8); coachPin = performance.now() + 5000; coachPinTile = hint.tile;
  if (hint.act) return hint.act();
  if (hint.tile !== undefined && hint.tile !== null) { const p = tilePos(hint.tile); pan.zGoal = Math.max(pan.z, 0.85); panTo(p.x + 8, p.y + 8); const cm = $("#coachMark"); cm.classList.add("on"); cm.classList.remove("ping"); void cm.offsetWidth; cm.classList.add("ping"); setTimeout(coach, 1800); return; }
  if (hint.el) { const e = document.querySelector(hint.el); if (e) { e.classList.add("coach"); setTimeout(coach, 2200); } } }
// Things that need attention glow softly (low feeder/waterer); eggs already sparkle.
function needGlow() { tilesOf("feeder").concat(tilesOf("waterer")).forEach(i => { const t = $("#grid").children[i]; if (t) t.classList.toggle("need", S.grid[i].lvl < 30); });
  const c = tileOf("coop"), ct = c !== undefined && $("#grid").children[c]; if (ct) ct.classList.toggle("need", isNight() && !S.locked && S.hens.length > 0); }

/* Juice: coins fly to the HUD, eggs fly to the basket, confetti, haptics */
let vibOn = true; try { vibOn = localStorage.getItem("coopcity-vib") !== "0"; } catch (e) {}
let touched = false; ["pointerdown", "touchstart", "keydown"].forEach(ev => document.addEventListener(ev, () => { touched = true; }, { capture: true, passive: true }));
function buzz(ms) { if (vibOn && touched && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} }
const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function flyTo(emoji, from, toSel, n, onEnd) {
  const to = $(toSel); if (!to || !from || reduceMotion) { onEnd && onEnd(); return; } const r = to.getBoundingClientRect(), tx = r.x + 16, ty = r.y + r.height / 2, layer = $("#fly");
  n = Math.min(6, Math.max(1, n)); let left = n;
  for (let i = 0; i < n; i++) { const el = document.createElement("i"); el.textContent = emoji; layer.appendChild(el);
    const sx = from[0] + (Math.random() - 0.5) * 26, sy = from[1] + (Math.random() - 0.5) * 18, mx = (sx + tx) / 2 + (Math.random() - 0.5) * 80, my = Math.min(sy, ty) - 40 - Math.random() * 50;
    const an = el.animate([{ transform: `translate(${sx}px,${sy}px) scale(.6)`, opacity: 0 }, { transform: `translate(${sx}px,${sy - 14}px) scale(1.15)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${mx}px,${my}px) scale(1)`, opacity: 1, offset: 0.55 }, { transform: `translate(${tx}px,${ty}px) scale(.55)`, opacity: 0.9 }],
      { duration: 620 + i * 70, easing: "cubic-bezier(.45,0,.4,1)", delay: i * 45 });
    an.onfinish = () => { el.remove(); if (--left === 0) { const c = to; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); onEnd && onEnd(); } }; } }
function coinFly(n, from) { flyTo("🪙", from || centerOf("#grid-wrap"), "#coinStat", Math.ceil(n / 4)); }
const centerOf = sel => { const e = $(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; };
function confetti() { if (reduceMotion) return; const layer = $("#fly"), W = innerWidth, cols = ["#ff5a5f", "#ffc531", "#4cc36a", "#4aa8ff", "#b46cff", "#ff9a3c"];
  for (let i = 0; i < 46; i++) { const el = document.createElement("b"); el.style.background = cols[i % cols.length]; layer.appendChild(el);
    const x0 = W / 2 + (Math.random() - 0.5) * 60, y0 = innerHeight * 0.32, x1 = x0 + (Math.random() - 0.5) * W * 1.1, y1 = y0 + 160 + Math.random() * innerHeight * 0.5, rot = (Math.random() - 0.5) * 1080;
    el.animate([{ transform: `translate(${x0}px,${y0}px) rotate(0) scale(.4)`, opacity: 1 }, { transform: `translate(${(x0 + x1) / 2}px,${y0 - 120 - Math.random() * 120}px) rotate(${rot / 2}deg) scale(1)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${x1}px,${y1}px) rotate(${rot}deg) scale(.9)`, opacity: 0 }], { duration: 1300 + Math.random() * 700, easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = () => el.remove(); } }
function sparkle(x, y) { const layer = $("#fly"); for (let i = 0; i < 7; i++) { const el = document.createElement("i"); el.textContent = i % 2 ? "✨" : "⭐"; el.style.fontSize = "14px"; layer.appendChild(el);
  const a = i / 7 * Math.PI * 2, d = 26 + Math.random() * 14; el.animate([{ transform: `translate(${x}px,${y}px) scale(.3)`, opacity: 1 }, { transform: `translate(${x + Math.cos(a) * d}px,${y + Math.sin(a) * d}px) scale(1)`, opacity: 0 }], { duration: 520, easing: "ease-out" }).onfinish = () => el.remove(); } }

/* Settings + How to play (⚙️) */
window.settingsModal = () => {
  const sw = (on, fn, ic, label, sub) => `<button class="setrow" onclick="${fn}"><span class="si">${ic}</span><span class="st"><b>${label}</b>${sub ? `<small>${sub}</small>` : ""}</span><span class="switch ${on ? "on" : ""}"><i></i></span></button>`;
  modal(`<h2>⚙️ Settings</h2>
   <button class="setrow fbrow" onclick="feedback()"><span class="si">💬</span><span class="st"><b>Send feedback to Bill</b><small>Takes 10 seconds. He reads every one.</small></span><span class="chev">›</span></button>
   ${sw(musicOn, "toggleMusic()", "🎵", "Music", "Ukulele & flute theme by day, music-box lullaby at night")}
   ${sw(soundOn, "toggleSound()", "🔊", "Farm sounds", "Clucks, egg pops, coins, rooster crow")}
   ${navigator.vibrate ? sw(vibOn, "toggleVib()", "📳", "Vibration", "A tiny buzz when you tap things") : ""}
   <p class="hint">Hearing nothing on iPhone? Turn the volume up with the side buttons, then tap 🎵.</p>
   <h3>Your farmer name</h3><div class="namerow"><input id="playerIn" maxlength="24" value="${esc(S && S.player || "")}" placeholder="Your name" enterkeyhint="done"><button class="buy" onclick="setPlayer()">Save</button></div>
   <button class="act big" onclick="helpModal()">📖 How to play</button>
   ${S && S.started ? `<button class="act big" onclick="replayTut()">🎓 Replay the tutorial</button><button class="act big danger" onclick="resetGame('settings')">🌱 Start a new farm…</button>` : ""}
   <p class="hint">Progress saves automatically on this device. · ${BUILD}</p>
   <button class="buy big" onclick="closeModal()">Done</button>`); };
window.toggleVib = () => { vibOn = !vibOn; try { localStorage.setItem("coopcity-vib", vibOn ? "1" : "0"); } catch (e) {} buzz(20); settingsModal(); };
window.replayTut = () => { S.tut = 0; S.said.tut0 = 0; S.said.tutHawkDone = 0; const f = S.grid[tileOf("feeder")]; if (f) f.lvl = Math.min(f.lvl, 25); const w = S.grid[tileOf("waterer")]; if (w) w.lvl = Math.min(w.lvl, 35);
  closeModal(); recenter(); tutCheck(); renderAll(); };
window.helpModal = () => modal(`<h2>📖 How to play</h2>
  <div class="how"><span>🌾</span><p><b>Keep them fed and watered.</b> Tap the feeder or waterer to refill it. Feed comes from the 🛒 Shop → Supplies.</p></div>
  <div class="how"><span>🥚</span><p><b>Collect eggs</b> by tapping them in the yard, then <b>💰 Sell</b> them for coins.</p></div>
  <div class="how"><span>🔒</span><p><b>Lock the coop every night</b> (tap the coop or the 🔒 button), and let the hens out in the morning.</p></div>
  <div class="how"><span>🦅</span><p><b>Tap predators</b> to scare them off. Roosters, dogs, and defenses in Shop → Guard help too.</p></div>
  <div class="how"><span>🪣</span><p><b>Kitchen scraps:</b> Charlie fills the 🪣 bucket after breakfast and dinner. Toss scraps to the hens as a treat, or ♻️ compost the few that are bad for them. Keep treats to about 10% of what they eat.</p></div>
  <div class="how"><span>🔨</span><p><b>Build:</b> pick an item in the bottom tray, then tap an empty spot of grass. Pick ✋ Hand to go back to tapping.</p></div>
  <div class="how"><span>🗺️</span><p><b>Look around:</b> drag the yard, pinch to zoom, and tap 🏠 to come back. Tap a 🪧 sign to buy more land.</p></div>
  <div class="how"><span>⭐</span><p><b>Goals:</b> the bar at the top always shows the next thing to do. Tap ⭐ for daily quests, badges, and your breed book.</p></div>
  <div class="how"><span>😌</span><p><b>No stress:</b> time only passes while the game is open. Nothing bad happens while you're away.</p></div>
  <button class="buy big" onclick="closeModal()">Got it!</button>`);


/* ---------- HEN MOVEMENT ---------- */
function tilePos(i) { return { x: (i % COLS) / VC * 100 + 1, y: Math.floor(i / COLS) / VR * 100 + 1 }; }
function pickSpot(h) {
  const coop = tilesOf("coop")[0];
  let p;
  if (h.cond && h.cond.k === "broody") { const n = tilesOf("nest")[0] ?? coop; if (n !== undefined) { p = tilePos(n); p.x += 2; p.y += 1; return p; } }
  if ((isNight() || S.locked) && coop !== undefined) { p = tilePos(coop); const w = [6, 22, 22][S.coopLvl], hh = [4, 4, 18][S.coopLvl]; p.x += Math.random() * w; p.y += Math.random() * hh; return p; }
  const runs = tilesOf("run");
  const spots = runs.length && Math.random() < 0.6 ? runs : openTiles();
  p = tilePos(rnd(spots)); p.x += Math.random() * 4; p.y += Math.random() * 4; return p;
}
function moveBird(h) {
  if (h.busy || frzBirds.has(h)) return;
  const outside = !isNight() && !S.locked;
  if (outside && h.breed && !(h.cond && h.cond.k === "broody") && (tryForage(h) || (h.pers === "curious" && tryForage(h)) || (S.hour > 9 && maybeDustBath(h)))) return;
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
function openTiles() { return [...Array(N).keys()].filter(i => owned(i) && (!S.grid[i] || S.grid[i].type === "run" || S.grid[i].type === "bed")); }
function spawnBug(kind) {
  if (S.bugs.length >= BUG_CAP) return;
  const tiles = openTiles(); if (!tiles.length) return;
  const tile = rnd(tiles);
  if (!kind) { const worm = S.wormy ? 0.45 : 0.12; const r = Math.random(); kind = r < worm ? "worm" : r < worm + 0.3 ? "beetle" : r < worm + 0.6 ? "cricket" : r < 0.93 ? "fly" : "butterfly"; }
  S.bugs.push({ id: ++bugId, kind, tile, born: S.hour, x: ((tile % COLS) + 0.15 + Math.random() * 0.6) / VC * 100, y: (Math.floor(tile / COLS) + 0.2 + Math.random() * 0.55) / VR * 100 });
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
    const el = document.createElement("div"); el.className = "bug " + b.kind; el.style.left = ux(b.x); el.style.top = uy(b.y);
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
    S.bugs = S.bugs.filter(b => b !== bug); S.foraged++; bump("bugs");
    h.happy = Math.min(100, h.happy + 3);
    const f = tilesOf("feeder").map(i => S.grid[i]).find(g => g.lvl > 0); if (f) f.lvl = Math.min(100, f.lvl + 2);
    floatXY(bug.x, bug.y, "+😊");
    sayOnce("forage", `${h.name} just ate a ${bug.kind === "worm" ? "worm" : "bug"}. Like, on purpose. Gross. Also kind of impressive. <i>Tip: free-ranging hens eat insects, worms, and greens, which adds protein. They still need layer feed every day.</i>`, 1);
    if (S.tufts[bug.tile] && S.grid[bug.tile] && S.grid[bug.tile].type === "run") S.tufts[bug.tile].life -= 0.5;
    renderForage(); renderGrid();
  }, 500);
}
function floatXY(x, y, text) {
  const el = document.createElement("div"); el.className = "float small"; el.textContent = text; el.style.left = ux(x); el.style.top = uy(y);
  $("#fx").appendChild(el); setTimeout(() => el.remove(), 1300);
}


/* ---------- BUILD 11: KITCHEN SCRAPS ----------
   Real-life rules this follows (sources are listed in the build 11 report):
   - Treats and scraps stay around 10% of the diet, about what the flock finishes in 10-15 minutes (Purina 90/10, VCA, OSU Extension).
   - Safe: greens, veggie peels, most fruit, plain cooked rice/pasta/oats, pumpkin and squash. Avoid: avocado skin/pit (persin),
     raw or dried beans, chocolate, moldy food, salty/greasy food, onions (off-flavored eggs), big piles of citrus (Purina, avian vets).
   - Behavior: the flock rushes over, squabbles, and one hen grabs the prize and runs ("keep-away") until she drops it or gulps it
     (Hobby Farms, BackYard Chickens). Roosters "tidbit" (call hens to food). Hens learn a bucket rattle in a few sessions. */
const SCRAPS = {
  // key: [emoji, name, kind (big = keep-away, bits = scatter and peck, meh = they ignore it), bad effect, seasons, where it came from, Charlie's line]
  pumpkin: ["🎃", "Pumpkin guts & seeds", "big", 0, "Fall", "Left over from carving jack-o'-lanterns", "Pumpkin guts! Best day of their lives, apparently. <i>Tip: pumpkin flesh and seeds are a safe fall treat. Skip pumpkins that are painted, waxed, or moldy.</i>"],
  zucchini: ["🥒", "Zucchini ends", "big", 0, "Summer Fall", "From Charlie's zucchini bread", "Zucchini is a sport now. <i>Tip: squash and zucchini, raw or cooked, are healthy treats.</i>"],
  watermelon: ["🍉", "Watermelon rind", "big", 0, "Summer", "From Charlie's picnic", "They cleaned that rind down to the green part. <i>Tip: watermelon is a great hot-day treat because it's mostly water.</i>"],
  corn: ["🌽", "Corn cob", "big", 0, "Summer Fall", "From last night's dinner", "They're stripping that cob one kernel at a time. <i>Tip: corn is a fun treat, not a meal. Keep treats to about 10% of what they eat.</i>"],
  apple: ["🍎", "Apple slices", "big", 0, "Fall Winter", "From packing lunch", "Apple! They went bananas. Apple-nanas. <i>Tip: apple is a favorite treat. Core it first, because apple seeds are on the vets' avoid list.</i>"],
  greens: ["🥬", "Lettuce & kale ends", "big", 0, "all", "From making a salad", "The salad bar is open! <i>Tip: leafy greens like kale, collards, and lettuce are healthy treats most hens love.</i>"],
  pasta: ["🍝", "Plain cooked spaghetti", "big", 0, "all", "From spaghetti night", "Noodle tug-of-war! I think they think it's a worm. <i>Tip: plain cooked pasta and rice are fine in small amounts. Skip salty, buttery sauce.</i>"],
  banana: ["🍌", "Mushy banana", "big", 0, "all", "Too brown even for banana bread", "Banana gone in nine seconds. <i>Tip: soft fruit like bananas and berries is a safe treat in small amounts.</i>"],
  tomato: ["🍅", "Ripe tomato ends", "big", 0, "Summer", "From making salsa", "Tomato juice everywhere. They regret nothing. <i>Tip: ripe tomatoes are fine. Green, unripe tomatoes and the plant's leaves are on the avoid list.</i>"],
  broccoli: ["🥦", "Broccoli stems", "big", 0, "Winter Spring", "From stir-fry night", "Tiny trees for tiny dinosaurs. <i>Tip: broccoli and cabbage give bored winter hens something to peck at.</i>"],
  carrot: ["🥕", "Carrot peels", "bits", 0, "all", "From Charlie's soup", "Peels everywhere and they're scratching for every last one. <i>Tip: veggie peels are a classic, safe kitchen scrap.</i>"],
  rice: ["🍚", "Leftover cooked rice", "bits", 0, "all", "From takeout night", "Rice confetti! <i>Tip: cooked rice is fine. Dry, uncooked rice is on the avoid list.</i>"],
  berries: ["🫐", "Squishy blueberries", "bits", 0, "Spring Summer", "From the back of the fridge (squishy, not moldy)", "Blueberry beaks! <i>Tip: berries are a safe treat most hens go wild for.</i>"],
  oats: ["🥣", "Leftover oatmeal", "bits", 0, "Fall Winter", "From breakfast", "Warm oatmeal on a cold day. They're so cozy. <i>Tip: plain cooked oats are a good winter treat.</i>"],
  avocado: ["🥑", "Avocado skin & pit", "big", "tummy", "all", "From guac night", "Uh oh. That was avocado skin. <i>Tip: avocado skin and pits contain persin, which is toxic to chickens. Compost them instead.</i>"],
  beans: ["🫘", "Dried beans (the bag ripped)", "bits", "tummy", "all", "Spilled on the kitchen floor", "Wait, were those DRY beans? <i>Tip: raw or dried beans contain a toxin that's harmful to chickens. Cooked beans are fine.</i>"],
  moldy: ["🍞", "Moldy bread heel", "big", "tummy", "all", "Found behind the toaster", "That bread was fuzzy. Fuzzy is bad. <i>Tip: never feed moldy or rotten food. Mold can make chickens sick.</i>"],
  fries: ["🍟", "Cold salty fries", "big", "salty", "all", "From the drive-thru", "They LOVED the fries. That's the problem. <i>Tip: salty, greasy food isn't good for chickens. Too much salt makes them drink a ton and can make them sick.</i>"],
  onion: ["🧅", "Onion ends", "bits", "onion", "all", "From chopping onions", "Onion breath. On a chicken. <i>Tip: lots of onion (or garlic) can give eggs an off flavor, and big amounts aren't healthy for hens. Compost it.</i>"],
  chocolate: ["🍫", "Chocolate cake crumbs", "bits", "tummy", "all", "From Charlie's birthday", "No no no, not the cake! <i>Tip: chocolate is toxic to chickens, just like it is to dogs.</i>"],
  citrus: ["🍊", "A big pile of orange peels", "meh", "citrus", "Winter", "From juicing oranges", "They looked at it. They looked at me. They left. <i>Tip: a little citrus is okay, but most hens don't like it, and a big pile of peels can upset their stomachs. Compost it.</i>"] };
const BUCKET_MAX = 6;
const treatBudget = () => Math.max(2, S.hens.length + 1);
const frenzies = new Set(), frzBirds = new Set();
const birdKey = b => b === S.rooster ? "roo:" + b.breed : "h" + b.id;
const mOf = b => { const el = henEls.get(birdKey(b)); return el && el._m ? el._m : { x: b.x, y: b.y, face: !!b.flip }; };
const beakOf = b => { const m = mOf(b); return { x: m.x + (m.face ? 2 : b === S.rooster ? 14 : 12), y: m.y + 8 }; };
const near = (b, d = 2.2) => { const m = mOf(b); return Math.hypot(m.x - clampX(b.x), m.y - clampY(b.y)) < d; };
const setT = (b, p) => { b.x = p.x; b.y = p.y; if (p.flip !== undefined) b.flip = p.flip; };
function setMood(b, t) { if (b !== S.rooster) b.xc = t; const el = henEls.get(birdKey(b)); if (el && el.firstChild.textContent !== (t || "")) el.firstChild.textContent = t || ""; }
function pk(b, cls = "pecking") { const el = henEls.get(birdKey(b)); if (!el) return; const bob = el._bob || (el._bob = el.querySelector(".bob"));
  bob.classList.remove("pecking", "scratching"); void bob.offsetWidth; bob.classList.add(cls); bob.onanimationend = () => bob.classList.remove(cls); }
function okGround(x, y) { const c = Math.floor(x * VC / 100), r = Math.floor(y * VR / 100), i = r * COLS + c;
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS || !owned(i)) return false; const g = S.grid[i]; return !g || g.type === "run" || g.type === "bed"; }
const viewCenter = () => ({ x: (pan.x + yardW / 2) / pan.z / yardW * 100, y: (pan.y + viewH / 2) / pan.z / yardH * 100 });
const inView = (x, y, m = 30) => { const sx = x * yardW / 100 * pan.z - pan.x, sy = y * yardH / 100 * pan.z - pan.y; return sx > m && sy > m && sx < yardW - m && sy < viewH - m - 40; };
const toScreen = (x, y) => { const r = $("#grid-wrap").getBoundingClientRect(); return [r.left + x * yardW / 100 * pan.z - pan.x, r.top + y * yardH / 100 * pan.z - pan.y]; };
const starterScrap = () => ({ Fall: "pumpkin", Summer: "watermelon", Spring: "greens", Winter: "apple" })[realSeason()[1]];
function pickScrap() { const se = season()[1], fills = S.stats.fills || 0;
  if (!fills) return starterScrap(); // the very first scrap is always a safe, seasonal crowd-pleaser
  const w = {}; Object.entries(SCRAPS).forEach(([k, d]) => { if (d[3] && fills < 2) return;
    w[k] = { w: (d[4] === "all" ? 1 : d[4].includes(se) ? 3 : 0.15) * (d[3] ? 0.7 : 1) * (k === "pumpkin" && HOL && HOL.k === "halloween" ? 4 : 1) }; });
  return pickW(w); }
// Charlie adds scraps after breakfast and dinner. The bucket tops out at 6 and never spoils (walk-away friendly).
function fillBucket(n, meal) { if (!S.hens.length) return; const was = S.scraps.length;
  for (let i = 0; i < n && S.scraps.length < BUCKET_MAX; i++) { S.scraps.push(pickScrap()); S.stats.fills = (S.stats.fills || 0) + 1; }
  if (S.scraps.length === was) return; bucketBtn(); const b = $("#scrapBtn"); if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  const d = SCRAPS[S.scraps[S.scraps.length - 1]];
  if (!S.said.bucket1) sayOnce("bucket1", `I made ${meal === "dinner" ? "dinner" : "breakfast"} and now I have ${d[1].toLowerCase()}. Do chickens eat that? <i>Tip: tap 🪣 Scraps to take kitchen scraps out to the hens. Most veggie and fruit scraps make great treats.</i>`, 1);
  else if (!was) toast(`🪣 ${d[0]} Fresh kitchen scraps from ${meal}! Tap 🪣 to take them out.`); }
function bucketBtn() { const b = $("#scrapBtn"); if (!b || !S) return; b.classList.toggle("tuthide", S.tut != null && S.tut < TUT.length && !demoMode); /* one new thing at a time: the bucket appears once the tutorial steps are done */ const n = S.scraps.length; setTxt("#scrapN", n);
  b.classList.toggle("has", n > 0); b.classList.toggle("fresh", n > 0 && !(S.stats.scraps > 0) && !b.classList.contains("coach"));
  const al = n ? `Scrap bucket, ${n} kitchen scrap${n > 1 ? "s" : ""}. Tap to take them out to the hens` : "Scrap bucket, empty"; if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al); }
window.scrapTray = () => { if (!S || !S.started) return; sfx("rattle"); buzz(10);
  const n = S.scraps.length, used = S.treatN || 0, bud = treatBudget(), out = hensOut();
  const dots = Array.from({ length: bud }, (_, i) => `<i class="${i < used ? "on" : ""}"></i>`).join("") + `<i class="on over"></i>`.repeat(Math.max(0, Math.min(3, used - bud)));
  modal(`<h2>🪣 Kitchen scraps</h2>
   <p class="trayi">Most kitchen scraps make great chicken treats, but a few are bad for hens. Not sure? ♻️ Compost it.</p>
   <div class="treatm"><span>Treats today</span><span class="dots">${dots}</span><b>${used}/${bud}</b></div>
   <p class="hint" style="margin:4px 0 6px">Keep treats to about 10% of what hens eat. Layer feed is the rest.</p>
   ${n ? S.scraps.map((k, i) => { const d = SCRAPS[k]; return `<div class="row scraprow"><span class="se">${d[0]}</span><div class="t"><b>${d[1]}</b><br><small>${d[5]}</small></div><div class="sb"><button class="buy" ${out ? "" : "disabled"} onclick="tossScrap(${i})" aria-label="Toss the ${d[1].toLowerCase()} to the hens">🐔 Toss to hens</button><button class="act cmp" onclick="compostScrap(${i})" aria-label="Compost the ${d[1].toLowerCase()}">♻️ Compost</button></div></div>`; }).join("")
     : `<p class="trayi"><i>The bucket's empty. Charlie adds scraps after breakfast and dinner.</i></p>`}
   ${out || !n ? "" : `<p class="demo">${isNight() ? "It's dark and the hens are asleep. Scraps keep till morning." : "The hens are locked in. Let them out first!"}</p>`}
   <button class="act big" onclick="closeModal()">Close</button>`);
  bucketCall(); };
// Hens that have eaten from the bucket a few times learn the rattle and come running before anything is tossed.
function bucketCall() { if (!hensOut()) return; const v = viewCenter(), now = performance.now(); let first = null;
  S.hens.forEach(h => { if ((h.scr || 0) < 3 || frzBirds.has(h) || h.busy) return; first = first || h; setMood(h, "❗"); h.run = true;
    setT(h, { x: v.x - 7 + (Math.random() - 0.5) * 20, y: v.y - 4 + (Math.random() - 0.5) * 10 }); h.next = now + 5000;
    setTimeout(() => { if (!frzBirds.has(h)) { h.run = false; if (h.xc === "❗") h.xc = ""; } }, 2000); });
  if (!first) return; renderHens();
  if (!S.said.trained) { S.said.trained = 1; say(`${first.name} heard the bucket rattle and came RUNNING. She knows the sound now! <i>Fact: chickens learn fast. Shake the same bucket every time you bring treats and they'll come running, which is handy for getting them back in the run.</i>`, 1); } }
window.compostScrap = i => { const k = S.scraps[i]; if (!k) return; const d = SCRAPS[k]; S.scraps.splice(i, 1); S.compost = (S.compost || 0) + 1; S.stats.compost = (S.stats.compost || 0) + 1; buzz(8); sfx("pour");
  if (d[3]) { xp(1); say(`Good call. ${d[6].replace(/^.*?<i>/, "<i>")}`, 1); toast(`♻️ ${d[0]} Composted. Good call!`, 1); }
  else toast(`♻️ ${d[0]} Into the compost. (The hens would've loved that, though!)`, 1);
  compostWorms(); bucketBtn(); renderAll(); if (S.scraps.length) scrapTray(); else closeModal(); };
function compostWorms() { if ((S.compost || 0) % 4 || isNight()) return; for (let i = 0; i < 3; i++) spawnBug("worm"); renderForage();
  toast("🪱 The compost pile is full of worms, and the hens noticed!");
  sayOnce("compost", "The compost bin is crawling with worms and the hens are thrilled. <i>Tip: compost piles draw earthworms and bugs, which are great protein for hens. Hens love to scratch through a pile and turn it for you.</i>", 1); }
window.tossScrap = i => { const k = S.scraps[i]; if (!k) return; if (!hensOut()) return toast(isNight() ? "It's dark. Scraps keep till morning." : "Let the hens out first!", 1);
  if (threat && !threat.done) { closeModal(); return toast("Not now. Scare off the predator first!", 1); }
  S.scraps.splice(i, 1); closeModal(); bucketBtn(); buzz(12);
  const p = tossSpot(), far = !inView(p.x, p.y) || !inView(p.cx, p.cy); if (far) { pan.zGoal = Math.max(pan.z, 0.85); panTo((p.x + p.cx) / 2, (p.y + p.cy) / 2); } // frame the landing spot and the flock together
  setTimeout(() => flyArc(SCRAPS[k][0], centerOf("#scrapBtn"), toScreen(p.x, p.y), () => land(k, p)), far ? 450 : 80); };
function tossSpot() { const free = S.hens.filter(h => !frzBirds.has(h)), src = free.length ? free : S.hens; let cx = 0, cy = 0;
  src.forEach(h => { const m = mOf(h); cx += m.x + 7; cy += m.y + 8; }); cx /= src.length || 1; cy /= src.length || 1;
  const v = viewCenter(); let x = cx * 0.55 + v.x * 0.45 + (Math.random() - 0.5) * 10, y = cy * 0.55 + v.y * 0.45 + (Math.random() - 0.5) * 6;
  if (!okGround(x, y)) { const t = openTiles().map(i => { const q = tilePos(i); return { x: q.x + 7, y: q.y + 6 }; }).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0]; if (t) { x = t.x; y = t.y; } }
  return { x: Math.min(188, Math.max(12, x)), y: Math.min(145, Math.max(12, y)), cx, cy }; }
function flyArc(emoji, from, to, done) { if (!from || !to || reduceMotion) return done(); const el = document.createElement("i"); el.className = "toss"; el.textContent = emoji; $("#fly").appendChild(el);
  const [fx, fy] = [from[0] - 14, from[1] - 14], [tx, ty] = [to[0] - 14, to[1] - 14], mx = (fx + tx) / 2, my = Math.min(fy, ty) - 70 - Math.random() * 30;
  el.animate([{ transform: `translate(${fx}px,${fy}px) scale(.6) rotate(0deg)` }, { transform: `translate(${(fx + mx) / 2}px,${(fy + my) / 2 - 18}px) scale(1) rotate(120deg)`, offset: 0.28 },
    { transform: `translate(${mx}px,${my}px) scale(1.2) rotate(220deg)`, offset: 0.5 }, { transform: `translate(${(mx + tx) / 2}px,${(my + ty) / 2 - 12}px) scale(1.1) rotate(320deg)`, offset: 0.75 },
    { transform: `translate(${tx}px,${ty}px) scale(1) rotate(400deg)` }], { duration: 620, easing: "linear" }).onfinish = () => { el.remove(); done(); }; }
function scrapEl(txt, cls) { const el = document.createElement("div"); el.className = "scrap " + cls; el.innerHTML = `<span>${txt}</span>`; $("#fx").appendChild(el); return el; }
function land(k, p) { if (!hensOut()) { S.scraps.unshift(k); bucketBtn(); return; }
  sfx("plop"); buzz(10); for (let i = 0; i < 3; i++) particle("💨", p.x - 4 + Math.random() * 8, p.y - 2, 2);
  startFrenzy(k, p); coach(); }
function startFrenzy(k, p) {
  const d = SCRAPS[k], f = { k, d, x: p.x, y: p.y, t: 0, ph: "call", hens: [], info: new Map(), bits: [], steals: 0, max: 0, car: null, eaters: new Map(), roo: null, nx: 0, sides: [0, 0] };
  if (d[2] === "bits") { const n = Math.min(7, 3 + S.hens.length); for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = 4 + Math.random() * 15;
    const b = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.6, el: scrapEl(d[0], "bit"), who: null, gone: false }; b.el.style.transform = `translate3d(${(b.x * yardW / 100).toFixed(1)}px,${(b.y * yardH / 100).toFixed(1)}px,0)`; f.bits.push(b); } }
  else f.el = scrapEl(d[0], "big");
  // Food call: a rooster "tidbits" (clucks, picks the food up and drops it) to call his hens over instead of eating it himself
  const r = S.rooster; if (r && !frzBirds.has(r) && d[2] !== "meh") { frzBirds.add(r); frzCls(r, 1); f.roo = r; r.run = true; r.spd = 28; const right = mOf(r).x + 8 > p.x; setT(r, { x: right ? p.x - 2 : p.x - 14, y: p.y - 8, flip: right }); }
  frenzies.add(f); frzOn = 1; $("#hens").classList.add("frz"); $("#toast").classList.add("fz"); recruit(f); sfx("cluck"); }
// hide holiday hats on birds in a frenzy so a 🎃 hat is never mistaken for the 🎃 scrap
function frzCls(b, on) { const el = henEls.get(birdKey(b)); if (el) el.classList.toggle("frz", !!on); }
function recruit(f) {
  const add = S.hens.filter(h => !frzBirds.has(h) && !(h.cond && h.cond.k === "broody")).map(h => { const m = mOf(h); return [h, Math.hypot(m.x + 7 - f.x, m.y + 8 - f.y), m]; }).sort((a, b) => a[1] - b[1]);
  add.forEach(([h, dist, m]) => { frzBirds.add(h); frzCls(h, 1); f.hens.push(h); h.busy = true;
    if (h.dust) { h.dust = false; const el = henEls.get("h" + h.id), bob = el && el.querySelector(".bob"); if (bob) bob.classList.remove("dusting"); }
    let side = m.x + 7 > f.x ? 1 : 0; if (f.sides[side] > f.sides[1 - side] + 1) side = 1 - side; const I = { side, r: f.sides[side]++, on: false, st: 0, bit: null };
    I.go = Math.max(0.12, 0.3 + dist * 0.012 + Math.random() * 0.4 - Math.min(5, h.scr || 0) * 0.08 - (f.roo ? 0.2 : 0)); f.info.set(h, I); });
}
function slot(f, I) { const off = I.r * 3.6, dy = (I.r % 2 ? 3.4 : -2.4) * (I.r ? 1 : 0.4) + (Math.random() - 0.5) * 1.2;
  return I.side ? { x: f.x - 2 + off, y: f.y - 8 + dy, flip: true } : { x: f.x - 12 - off, y: f.y - 8 + dy, flip: false }; }
function pickBit(f, h) { const m = mOf(h), hx = m.x + 7, hy = m.y + 8, I = f.info.get(h); let best = null, bd = 1e9;
  f.bits.forEach(b => { if (b.gone) return; const d = Math.hypot(b.x - hx, b.y - hy) + (b.who && b.who !== h ? 14 : 0); if (d < bd) { bd = d; best = b; } });
  I.bit = best; I.st = 0; I.pk = 0; if (!best) return; best.who = h; const right = hx > best.x; setT(h, right ? { x: best.x - 2, y: best.y - 8, flip: true } : { x: best.x - 12, y: best.y - 8, flip: false }); }
// the part of the yard on screen, as a box for a hen's top-left corner, kept m px inside the view (and clear of the bottom buttons)
function viewBox(m) { const ux = sx => (sx + pan.x) / pan.z / yardW * 100, uy = sy => (sy + pan.y) / pan.z / yardH * 100;
  return { x0: ux(m) - 7, x1: ux(yardW - m) - 7, y0: uy(m) - 6, y1: uy(viewH - m - 40) - 6 }; }
function runPoint(f, h) { const m = mOf(h), vb = viewBox(56); let cx = 0, cy = 0, n = 0; f.hens.forEach(o => { if (o === h) return; const q = mOf(o); cx += q.x; cy += q.y; n++; });
  const base = n ? Math.atan2(m.y - cy / n, m.x - cx / n) : Math.random() * 6.283; let best = null, bs = -1e9;
  for (let i = 0; i < 24; i++) { const a = base + (Math.random() - 0.5) * 5, d = 26 + Math.random() * 16, x = m.x + Math.cos(a) * d, y = m.y + Math.sin(a) * d * 0.75;
    if (x < vb.x0 || x > vb.x1 || y < vb.y0 || y > vb.y1 || !okGround(x + 7, y + 8)) continue;
    const sc = Math.cos(a - base) + Math.min(x - vb.x0, vb.x1 - x, (y - vb.y0) * 1.3, (vb.y1 - y) * 1.3) / 18; // away from the flock, but not into a corner
    if (sc > bs) { bs = sc; best = { x, y }; } }
  if (best) return best;
  const v = viewCenter(); return { x: clampX(m.x + (v.x - 7 - m.x) * 0.7), y: clampY(m.y + (v.y - 6 - m.y) * 0.7) }; } // nowhere open: cut back across the middle
function grab(f, h) { const prev = f.car; f.car = h; f.ph = "carry"; f.ct = f.t; f.cd = 2.6 + Math.random() * 1.2; f.legs = 2 + (Math.random() < 0.45); h.spd = 28 + Math.random() * 3; setMood(h, "😋");
  if (prev) { setMood(prev, "😤"); prev.spd = 20 + Math.random() * 3; }
  setT(h, runPoint(f, h)); if (f.el) f.el.classList.add("held"); const m = mOf(h); particle("💨", m.x + 7, m.y + 9, 2);
  if (f.hens.length > 1) sayOnce("keepaway", `${h.name} grabbed it and RAN, and now everyone's chasing her. Is this a sport? <i>Fact: when one hen grabs a big treat, the flock plays "keep-away" until she drops it or gulps it down.</i>`, 1); }
function stepFrenzies(dt, kx, ky) {
  if (!frenzies.size) return; const danger = (threat && !threat.done) || !hensOut();
  frenzies.forEach(f => {
    if (danger) return endFrenzy(f, "abort");
    f.t += dt; f.hens = f.hens.filter(h => S.hens.includes(h));
    if (!f.hens.length) { recruit(f); if (!f.hens.length && f.t > 15) return endFrenzy(f, "abort"); }
    const big = f.d[2] === "big";
    // each hen notices on her own schedule (closer and bucket-trained hens first), then sprints over
    f.hens.forEach(h => { const I = f.info.get(h); if (I.on || f.t < I.go) return; I.on = true; h.run = true; h.spd = 24 + Math.random() * 6; setMood(h, "❗");
      const m = mOf(h); particle("❗", m.x + 6, m.y - 2, 0);
      if (f.d[2] === "bits") pickBit(f, h); else if (f.ph !== "carry") setT(h, slot(f, I)); });
    const r = f.roo;
    if (r) { if (!f.rs && near(r, 3)) { f.rs = f.t; pk(r); const m = mOf(r); floatXY(m.x + 2, m.y - 4, "tuk-tuk-tuk!");
        sayOnce("tidbit", `${r.name} found the food and is calling the hens over instead of eating it. What a gentleman. <i>Fact: roosters "tidbit": they cluck, bob their head, and pick up and drop food to call hens to it.</i>`, 1); }
      if (f.rs && !f.r2 && f.t - f.rs > 0.7) { f.r2 = 1; pk(r); }
      if ((f.rs && f.t - f.rs > 1.6 && f.ph !== "call") || f.t > 6) { const m = mOf(r); setT(r, { x: clampX(m.x + (m.face ? 14 : -14)), y: clampY(m.y + 5) }); r.run = false; r.spd = 0; frzBirds.delete(r); frzCls(r, 0); r.next = performance.now() + 2500; f.roo = null; } }
    if (f.ph === "call" && f.d[2] !== "bits") { const arr = f.hens.filter(h => f.info.get(h).on && near(h, 3)).length;
      if (arr >= Math.min(2, f.hens.length) || (arr && f.t > 4.5)) { f.ph = big ? "squab" : "sniff"; f.pt = f.t; } }
    else if (f.ph === "call") f.ph = "peck";
    if (f.ph === "squab") { // a short scrum: heads down, pecks, a feather or two, everyone shoving for position
      const on = f.hens.filter(h => f.info.get(h).on && near(h, 5));
      if (f.t >= f.nx && on.length) { f.nx = f.t + 0.15 + Math.random() * 0.12; pk(rnd(on)); if (Math.random() < 0.55) particle(Math.random() < 0.5 ? "🪶" : "💨", f.x - 3 + Math.random() * 6, f.y - 5, Math.random() < 0.5 ? 1 : 2);
        const j = rnd(on), s = slot(f, f.info.get(j)); s.x += (Math.random() - 0.5) * 3; s.y += (Math.random() - 0.5) * 2; setT(j, s); }
      if (f.t - f.pt > 1.1) { const pool = on.length ? on : f.hens.filter(h => f.info.get(h).on), w = {}; pool.forEach((h, i) => w[i] = { w: (h.pers === "bossy" ? 3 : 1) + Math.min(5, h.scr || 0) * 0.1 });
        const n = f.hens.length; f.max = n >= 3 ? 1 + (Math.random() < 0.6) : n === 2 ? 1 : 0; grab(f, pool[+pickW(w)]); } }
    else if (f.ph === "carry") { const c = f.car, b = beakOf(c), cm = mOf(c); const tx = b.x + (cm.face ? -2.5 : 2.5), ty = b.y - 4.5, e = Math.min(1, dt * 16); f.x += (tx - f.x) * e; f.y += (ty - f.y) * e; let i = 0; // held up and out in front of her beak so it reads clearly
      const back = cm.face ? 1 : -1, lane = [-5, 5, 0, -10, 10, -3, 4], vb = viewBox(14); // chasers string out behind her in loose lanes, not one blob
      f.hens.forEach(h => { if (h === c || !f.info.get(h).on) return; if (!h.spd || h.spd > 25) h.spd = 20 + Math.random() * 4;
        let tx = Math.min(vb.x1, Math.max(vb.x0, cm.x + back * (11 + i * 6))), ty = Math.min(vb.y1, Math.max(vb.y0, cm.y + lane[i % 7])); if (!okGround(tx + 7, ty + 8)) { tx = cm.x + back * (9 + i * 4); ty = cm.y + lane[i % 7] * 0.3; } setT(h, { x: clampX(tx), y: clampY(ty) }); i++; });
      if (near(c, 2.5) && f.legs > 1 && f.t - f.ct < f.cd - 0.6) { f.legs--; setT(c, runPoint(f, c)); particle("💨", cm.x + 7, cm.y + 9, 2); } // she cuts and zig-zags
      else if (near(c, 2.5) || f.t - f.ct > f.cd) { f.ph = "drop"; f.dt = f.t; f.dp2 = 0; setT(c, { x: cm.x, y: cm.y, flip: cm.face }); pk(c); if (f.el) f.el.classList.remove("held");
        f.hens.forEach(h => { if (h !== c && f.info.get(h).on) setT(h, slot(f, f.info.get(h))); }); } }
    else if (f.ph === "drop") { const c = f.car; // she stops to eat it; the others crowd in and someone may snatch it
      if (!f.dp2 && f.t - f.dt > 0.45) { f.dp2 = 1; pk(c); }
      if (f.t - f.dt > 0.95) { const cm = mOf(c), th = f.hens.filter(h => h !== c && f.info.get(h).on).map(h => [h, Math.hypot(mOf(h).x - cm.x, mOf(h).y - cm.y)]).filter(a => a[1] < 28).sort((a, b) => a[1] - b[1]);
        if (th.length && f.steals < f.max && Math.random() < 0.75) { f.steals++; particle("💢", f.x, f.y - 7, 0); sfx("cluck"); grab(f, th[0][0]); }
        else { f.ph = "eat"; f.et = f.t; f.e2 = 0; pk(c); } } }
    else if (f.ph === "eat") { const c = f.car; if (!f.e2 && f.t - f.et > 0.55) { f.e2 = 1; pk(c); if (f.el) f.el.classList.add("eaten"); }
      if (f.t - f.et > 1.15) { f.eaters.set(c, 2); return endFrenzy(f, "ate"); } }
    else if (f.ph === "peck") { // scattered bits: everyone scratches and pecks their own piece
      f.hens.forEach(h => { const I = f.info.get(h); if (!I.on) return; if (I.bit && I.bit.gone) pickBit(f, h);
        if (!I.bit) { if (!I.idle) { I.idle = 1; pk(h, "scratching"); } return; }
        if (!I.st && near(h, 2.6)) { I.st = f.t; pk(h, "scratching"); const m = mOf(h); particle("💨", m.x + 6, m.y + 9, 2); }
        if (I.st && !I.pk && f.t - I.st > 0.5) { I.pk = 1; pk(h); }
        if (I.st && f.t - I.st > 1.0) { I.bit.gone = true; I.bit.el.classList.add("eaten"); f.eaters.set(h, (f.eaters.get(h) || 0) + 1); pickBit(f, h); } });
      if (f.bits.every(b => b.gone)) { f.dn = f.dn || f.t; if (f.t - f.dn > 0.5) return endFrenzy(f, "ate"); }
      if (f.t > 16) return endFrenzy(f, "ate"); }
    else if (f.ph === "sniff") { const on = f.hens.filter(h => f.info.get(h).on && near(h, 4));
      if (!f.s1 && on.length) { f.s1 = 1; pk(on[0]); } if (!f.s2 && f.t - f.pt > 0.8) { f.s2 = 1; on.forEach(h => setMood(h, "🤨")); }
      if (f.t - f.pt > 1.9) return endFrenzy(f, "meh"); }
    if (f.t > 25) return endFrenzy(f, "ate");
    if (f.el) { const t = `translate3d(${(f.x * kx).toFixed(1)}px,${(f.y * ky).toFixed(1)}px,0)`; if (t !== f.tt) { f.el.style.transform = t; f.tt = t; } }
  });
}
function endFrenzy(f, how) { if (!frenzies.has(f)) return; frenzies.delete(f); const now = performance.now();
  if (!frenzies.size) { frzOn = 0; $("#hens").classList.remove("frz"); $("#toast").classList.remove("fz"); }
  if (f.roo) { const r = f.roo; frzBirds.delete(r); frzCls(r, 0); r.run = false; r.spd = 0; r.next = now + 1500; }
  f.hens.forEach(h => { frzBirds.delete(h); frzCls(h, 0); h.busy = false; h.spd = 0; h.xc = ""; h.run = false;
    if (how !== "abort" && S.hens.includes(h)) { const m = mOf(h); setT(h, { x: clampX(m.x + (Math.random() - 0.5) * 6), y: clampY(m.y + (Math.random() - 0.5) * 4) }); h.next = now + 1400 + Math.random() * 2200;
      if (Math.random() < 0.6) setTimeout(() => pk(h, "scratching"), 300 + Math.random() * 700); } }); // they hang around scratching for crumbs
  const els = [f.el, ...f.bits.map(b => b.el)].filter(Boolean); els.forEach(e => e.classList.add(how === "meh" ? "linger" : "eaten")); setTimeout(() => els.forEach(e => e.remove()), how === "meh" ? 3200 : 700);
  if (how === "abort") { if (S.scraps.length < BUCKET_MAX) S.scraps.unshift(f.k); bucketBtn(); renderHens(); return; } // a hawk or bedtime interrupted: the scrap goes back in the bucket
  scrapDone(f, how); }
function scrapDone(f, how) { const d = f.d, bad = d[3], eat = [...f.eaters.keys()].filter(h => S.hens.includes(h)).sort((a, b) => f.eaters.get(b) - f.eaters.get(a)), top = eat[0];
  if (how !== "meh") S.treatN = (S.treatN || 0) + 1; S.stats.scraps = (S.stats.scraps || 0) + 1;
  f.hens.forEach(h => h.happy = Math.min(100, h.happy + 2));
  eat.forEach(h => { h.scr = (h.scr || 0) + 1; if (!bad) h.happy = Math.min(100, h.happy + 6); });
  const m = top && mOf(top);
  if (how === "meh") { S.compost = (S.compost || 0) + 1; toast(`${d[0]} The hens sniffed it and walked off. Charlie raked it into the compost.`, 0, 1); say(d[6], 1); compostWorms(); }
  else if (!bad) { bump("scraps"); xp(1); beep("good"); if (m) { floatXY(m.x + 4, m.y - 2, "+😊"); particle("💛", m.x + 7, m.y, 0); } sayOnce("scrap_" + f.k, d[6], 1); }
  else { beep("warn"); say(d[6], 1);
    if (bad === "tummy" && top) { top.tummy = S.day + 1; top.happy = Math.max(10, top.happy - 8); toast(`🤢 ${top.name} has a tummy ache. She'll be fine, but no egg from her tomorrow.`, 0, 1); }
    else if (bad === "salty") { tilesOf("waterer").forEach(i => S.grid[i].lvl = Math.max(0, S.grid[i].lvl - 30)); eat.forEach(h => h.happy = Math.max(10, h.happy - 3)); toast("💧 So salty! The hens are guzzling water. Check the waterer.", 0, 1); }
    else if (bad === "onion") toast(`🧅 Tomorrow's eggs from ${eat.slice(0, 2).map(h => h.name.split(" ")[0]).join(" and ") || "the flock"} might taste a little oniony.`, 0, 1); }
  if (S.treatN > treatBudget()) { S.stuffed = S.day + 1;
    if (S.said.stuffDay !== S.day) { S.said.stuffDay = S.day; setTimeout(() => { say("They're stuffed, and now they're ignoring their feed. Oops. <i>Tip: keep treats and scraps to about 10% of what hens eat, roughly what they finish in 10 to 15 minutes. Fill up on treats and they skip the layer feed they need to lay.</i>", 1); toast("🥬 That's a lot of treats today. Expect a few fewer eggs tomorrow.", 0, 1); }, 1600); } }
  else if (S.treatN === treatBudget()) setTimeout(() => toast("🥄 That's today's treat allowance. Save the rest for tomorrow!", 0, 1), 1600);
  renderAll(); }
/* ---------- SIMULATION ---------- */
// Walk-away friendly: hens never die or leave. Health bottoms out at "grumpy" and recovers fast with food + water.
const FLOOR = 40;
function hurt(h, n) { h.health = Math.max(FLOOR, h.health - n); h.happy = Math.max(10, h.happy - n / 2); }
function tick() {
  S.hour = (S.hour + 1) % 24;
  if (S.hour === 0) newDay();
  if (S.hour === 10 || S.hour === 15) setTimeout(fbAsk, 1200); // build 12: one gentle feedback ask, once per device
  const feeders = tilesOf("feeder").map(i => S.grid[i]), waters = tilesOf("waterer").map(i => S.grid[i]);
  const day = !isNight(), w = S.weather[1];
  const totalFeed = feeders.reduce((a, f) => a + f.lvl, 0), totalWater = waters.reduce((a, f) => a + f.lvl, 0);
  if (day) {
    feeders.forEach(f => f.lvl = Math.max(0, f.lvl - 1.5 * S.hens.length / feeders.length));
    waters.forEach(f => f.lvl = Math.max(0, f.lvl - (w === "Hot" ? 4 : 2) * S.hens.length / waters.length));
  }
  S.hens.forEach(h => {
    let d = 1; condHour(h);
    if (day && totalFeed <= 0) { d -= 3; h.health -= 1; sayOnce("nofeed", "Why are they yelling at me? 😰 <i>Tip: the feeder is empty. Tap it to refill.</i>", 1); }
    if (day && totalWater <= 0) { d -= 3; h.health -= 2; sayOnce("nowater", "They keep staring at me. Thirsty? <i>Tip: hens need fresh water all day.</i>", 1); }
    if (day && w === "Hot" && !has("tree")) { d -= 3; h.health -= 1; sayOnce("hot", "They're panting with their beaks open! <i>Tip: on hot days hens need shade and water.</i>", 1); }
    if (w === "Cold" && !has("coop")) { h.health -= 2; d -= 2; }
    if (w === "Rain" && !has("coop")) d -= 1;
    if (day && S.locked && S.hour > 7 && S.hour < 19) { d -= 3; sayOnce("stuck", "The hens are banging on the door. Oh. It's daytime. <i>Tip: unlock the coop in the morning.</i>", 1); }
    if (has("coop") && S.clean < 30) { d -= 2; if (S.hour % 3 === 0) h.health -= 1; sayOnce("dirty", "Something smells... like a lot. <i>Tip: dirty bedding makes hens sick. Buy pine shavings in the Shop to clean the coop.</i>", 1); }
    if (totalFeed > 0 && totalWater > 0 && d > 0) h.health = Math.min(100, h.health + (h.health < 70 ? 3 : 1));
    h.happy = Math.max(10, Math.min(100, h.happy + d));
    h.health = Math.max(FLOOR, Math.min(100, h.health));
  });
  forageHour();
  if (S.hour === 8) { layEggs(); fillBucket(1, "breakfast"); }
  if ((S.hour === 9 || S.hour === 13 || S.hour === 16) && S.tut >= TUT.length && !threat) { if (!S.said.lonely && S.hens.length === 1 && S.day >= 2) sayOnce("lonely", `${S.hens[0].name} keeps following me around. I think she's lonely. <i>Tip: chickens are flock animals and shouldn't live alone. Most keepers start with at least 3 hens. Get her some friends in the 🛒 Shop.</i>`, 1);
    else if (!S.said.rooRatio && S.rooster && S.hens.length && S.hens.length < 5) sayOnce("rooRatio", `${S.rooster.name} is giving the girls a LOT of attention. They look tired of him. <i>Tip: with too few hens, a rooster over-mates them and they lose back feathers. Keepers aim for about 1 rooster per 8 to 10 hens.</i>`, 1);
    else if (season()[1] === "Fall" && S.day >= 3) sayOnce("fallLight", "Fewer eggs lately. Did I do something wrong? <i>Tip: nope! Hens need about 14 hours of daylight to lay steadily. As fall days get shorter, laying slows down, and lots of hens molt.</i>", 1); }
  if (S.hour === 18) fillBucket(2, "dinner");
  if (S.hour === 14 && S.ground.length && !has("nest") && Math.random() < 0.15) { S.ground.shift(); sayOnce("eggeat", "One of the hens just ATE an egg. Her own egg! Is that allowed?? <i>Tip: egg eating can become a habit. Collect eggs often, use nest boxes, and keep calcium up so shells stay strong.</i>", 1); toast("🍳 A hen pecked open an egg and ate it!"); }
  if (S.hour === 7 && S.weather[1] === "Cold" && season()[1] === "Winter" && has("waterer") && Math.random() < 0.6) { tilesOf("waterer").forEach(i => { S.grid[i].lvl = 0; floatAt(i, "🧊 frozen!"); });
    sayOnce("frozen", "The water turned into a chicken popsicle. <i>Tip: in freezing weather, swap in fresh water a few times a day or use a heated waterer base.</i>", 1); }
  if (S.hour === 20) { S.nightLock = has("coop"); S.nightHurt = false; }
  if (isNight() && S.hour !== 20 && !S.locked) S.nightLock = false;
  if (S.hour === 22 && S.locked) bump("lock");
  if (S.hour === 6 && has("coop")) { if (S.nightLock) S.stats.nightsLocked++; if (S.nightLock && !S.nightHurt) S.stats.safeNights++; }
  if (S.hour === 7 && S.hens.length) { const r = mornBonus(); gain(r); toast(`☀️ Morning bonus +${r}🪙${S.stats.safeNights ? ` · 🛡️ ${S.stats.safeNights} safe nights so far` : ""}`); xp(2); }
  if (S.hour === 14 && S.day === 1 && !S.rooster && !S.said.rooOffer) offerRooster();
  threatHour();
  if (S.hour === 20 && !S.locked) say(has("coop") ? (S.said.bed1 ? "Bedtime. The hens are on the roost. <i>Tap the coop to lock it.</i>" : (S.said.bed1 = 1, "The hens just... put themselves to bed at dusk? Icons. <i>Tip: chickens head to the roost on their own as it gets dark. Lock the coop behind them!</i>")) : "It's dark and my hens have nowhere to sleep. <i>Tip: build a coop.</i>", 1);
  if (S.hour === 5 && S.rooster) { sfx("crow"); if (!S.said.crow) { S.said.crow = 1; say(`${S.rooster.name} just screamed at 5am. Is he okay?? I guess my alarm clock is a bird now. <i>Tip: roosters crow at dawn (and whenever they feel like it). Hens lay without a rooster, but you need one for fertile eggs that hatch into chicks.</i>`, 1); } else toast(`🐓 ${S.rooster.name}: COCK-A-DOODLE-DOO!`); }
  if (S.hour === 6 && S.locked) say("Morning! Time to unlock the coop and let the ladies out.", 1);
  renderAll(); save();
}
function offerRooster() { if (!$("#modal").classList.contains("hidden")) return; S.said.rooOffer = 1;
  modal(`<h2>🐓 A neighborly offer</h2><div style="width:90px;margin:0 auto">${henSVG("roo:barnyard")}</div><p>Neighbor Deb saw that hawk earlier. "Take Rocky," she says. "He's loud, but he watches the sky."</p>
   <p style="font-size:13px"><i>Tip: a rooster watches for danger and sounds an alarm call so hens run for cover. ${ROO_FACT}</i></p>
   <button class="buy big" onclick="takeRocky()">Take Rocky (free!)</button><button class="act big" onclick="closeModal()">No thanks</button>`); }
window.takeRocky = () => { sfx("crow"); S.rooster = { name: "Rocky", breed: "barnyard", x: 45, y: 45, flip: false }; closeModal(); toast("Welcome, Rocky the Barnyard rooster!");
  say("I own a rooster now. He looked me in the eye and I blinked first. <i>Tip: roosters protect the flock, and from now on your eggs are fertile, so you can hatch chicks.</i>", 1); renderAll(); wander(); };
function newDay() {
  S.day++; S.weather = WEATHER[rnd(SEASON_WX[season()[1]])];
  if (HOL && HOL.k === "easter") { for (let k = 0; k < 3; k++) { const t = openTiles().filter(i => !S.grid[i]); if (t.length) S.ground.push({ tile: rnd(t), color: rnd(["blue", "green", "cream", "lightbrown"]), breed: "easter", hen: "the Easter hunt" }); } toast("🐰 Painted eggs are hidden around the yard!"); }
  S.event = S.day > 1 && Math.random() < 0.3 ? rnd(Object.keys(EVENTS)) : null;
  if (S.event) { toast(`${EVENTS[S.event][0]} ${EVENTS[S.event][1]}`); if (S.event === "bugs") for (let k = 0; k < 6; k++) spawnBug(); }
  S.contestWon = false; S.treatN = 0; rollDaily(); xp(3); realismDay();
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
    if (h.tummy === S.day) return; // tummy ache from a bad scrap: she skips one day, then she's fine
    const ok = h.health > 40 && h.happy > 35 && !(S.locked && !has("nest")) && !(h.cond && ["molt", "broody", "eggbound"].includes(h.cond.k));
    const rate = CH[h.breed].layRate * ({ Winter: 0.55, Fall: 0.8 }[season()[1]] || 1) * (S.weather[1] === "Cold" ? 0.85 : 1) * (isOld(h) ? 0.5 : 1) * (S.stuffed === S.day ? 0.75 : 1); // too many treats yesterday = they skipped layer feed
    if (!ok || Math.random() > rate) return;
    if (S.day - S.calcium > 8 && Math.random() < 0.08) { toast(`🥚 ${h.name} laid a soft, rubbery egg.`); sayOnce("soft", "This egg is SQUISHY. Like a water balloon. <i>Tip: soft-shelled eggs often mean a hen needs more calcium. Offer oyster shell on the side.</i>", 1); return; }
    if (h.pers === "chatty") sayOnce("chatty" + S.day, `${h.name} laid an egg and is now SCREAMING about it. <i>Fact: hens often sing an 'egg song' after laying.</i>`, 1);
    let tile = nests.length ? rnd(nests) : rnd([...Array(N).keys()].filter(i => !S.grid[i] && owned(i)));
    const gold = Math.random() < (S.event === "lucky" || (HOL && HOL.k === "stpat") ? 0.1 : 0.02);
    if (gold) { toast(`✨ ${h.name} laid a GOLDEN egg! (Just for fun. Real hens don't.)`); beep("lvl"); }
    S.ground.push({ tile, color: gold ? "golden" : h.egg, breed: h.breed, hen: h.name, fertile: !!S.rooster, sire: S.rooster && S.rooster.breed });
    if (!nests.length) sayOnce("hidden", "I found an egg... in a bush?! <i>Tip: give them a nest box so they lay where you can find them.</i>", 1);
  });
  if (S.ground.length) sayOnce("rooster", "WAIT. We got eggs but I don't have a rooster?! <i>Fact: hens lay eggs without a rooster. Roosters only matter if you want chicks.</i>", 1);
}
const mornBonus = () => 5 + Math.min(10, Math.floor(S.stats.safeNights / 2)) + (HOL && HOL.k === "thanks" ? 5 : 0);
/* ---------- PROGRESSION: coins pop, XP + farm level, goals, daily quests, events, streaks ---------- */
/* ---------- AUDIO: recorded score (music/*.mp3) + farm SFX (Web Audio) ----------
   Original "Coup City" theme, composed for this game and rendered offline with GeneralUser GS instrument samples
   (ukulele, flute, marimba, glockenspiel, pizzicato strings, banjo, upright bass, brushes). See CREDITS.md.
   Day: G major, 108 BPM swing, 32 bars (71.1 s loop). Night: same hook as a celesta/EP lullaby, 78 BPM, 24 bars (73.8 s).
   Each file = 0.5 s pre-roll + one loop + 0.5 s post-roll, so looping between loopStart/loopEnd is seamless even with
   MP3 encoder delay. Played through an AudioBufferSourceNode (sample-accurate loop); <audio> fallback if decoding fails. */
let soundOn = false; try { soundOn = localStorage.getItem("coopcity-sound") === "1"; } catch (e) {}
let musicOn = true; try { musicOn = localStorage.getItem("coopcity-music") !== "0"; } catch (e) {}
const MUSIC_VOL = 0.5; // mastered at about -17 LUFS, so this sits well under the farm sounds
const TRACKS = { day: { src: "music/coup-city-day.mp3?v=10", a: 0.5, b: 0.5 + 71.1111 }, night: { src: "music/coup-city-night.mp3?v=10", a: 0.5, b: 0.5 + 73.8461 } };
for (const k in TRACKS) Object.assign(TRACKS[k], { bytes: null, buf: null, src0: null, gain: null, el: null, want: 0, offAt: 0, err: 0 });
let AC = null, master, sfxBus, noiseBuf, musTimer = 0;
function fetchTrack(k) { const T = TRACKS[k]; if (T.bytes || T.loading) return; T.loading = 1;
  fetch(T.src).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(b => { T.bytes = b; decodeTrack(k); }).catch(() => { T.err = 1; T.loading = 0; }); }
function decodeTrack(k) { const T = TRACKS[k]; if (!AC || !T.bytes || T.buf || T.decoding) return; T.decoding = 1;
  const ok = b => { T.buf = b; T.decoding = 0; }, bad = () => { T.err = 1; T.decoding = 0; };
  try { const p = AC.decodeAudioData(T.bytes.slice(0), ok, bad); if (p && p.catch) p.catch(bad); } catch (e) { bad(); } }
function ac() {
  if (AC) return AC; const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
  AC = new C(); master = AC.createGain(); master.gain.value = MUSIC_VOL; master.connect(AC.destination);
  for (const k in TRACKS) { const g = AC.createGain(); g.gain.value = 0; g.connect(master); TRACKS[k].gain = g; }
  sfxBus = AC.createGain(); sfxBus.gain.value = 0.35; sfxBus.connect(AC.destination);
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.5 | 0, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  for (const k in TRACKS) decodeTrack(k);
  return AC;
}
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
function pluck(bus, m, t, vol, dec = 0.3, type = "square", cut = 2600) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(mf(m) * 1.012, t); o.frequency.exponentialRampToValueAtTime(mf(m), t + 0.03);
  f.type = "lowpass"; f.frequency.setValueAtTime(cut, t); f.frequency.exponentialRampToValueAtTime(cut * 0.3, t + dec); f.Q.value = 1.5;
  env(g, t, 0.004, vol, dec); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + dec + 0.06); }
function noise(bus, t, dur, vol, freq, type = "highpass") { const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noiseBuf;
  f.type = type; f.frequency.value = freq; env(g, t, 0.002, vol, dur); s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.05); }
function cluck(bus, t, vol, big) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = "square";
  const a = big ? 620 : 540; o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(a * (big ? 2.1 : 1.8), t + 0.035); o.frequency.exponentialRampToValueAtTime(a * 1.15, t + (big ? 0.16 : 0.08));
  f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 2.5; env(g, t, 0.003, vol, big ? 0.17 : 0.08); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.22); noise(bus, t, 0.025, vol * 0.6, 2400, "bandpass"); }
const musicNight = () => !!(S && S.started && typeof isNight === "function" && isNight());
function startTrack(k) { const T = TRACKS[k]; if (T.src0) return;
  if (T.buf) { const s = AC.createBufferSource(); s.buffer = T.buf; s.loop = true; s.loopStart = T.a; s.loopEnd = Math.min(T.b, T.buf.duration - 0.01); s.connect(T.gain); s.start(AC.currentTime + 0.02, T.a); T.src0 = s; return; }
  if (T.err) { // fallback: plain <audio> element (tiny loop gap is acceptable here)
    if (!T.el) { T.el = new Audio(T.src); T.el.loop = true; T.el.setAttribute("playsinline", ""); T.el.preload = "auto"; }
    T.el.volume = MUSIC_VOL; const p = T.el.play(); if (p && p.catch) p.catch(() => {}); T.src0 = T.el; } }
function stopTrack(k) { const T = TRACKS[k]; if (!T.src0) return; try { T.src0 === T.el ? T.el.pause() : T.src0.stop(); } catch (e) {} T.src0 = null; }
function musicTick() {
  if (!AC || AC.state !== "running") return; const now = AC.currentTime, night = musicNight();
  if (TRACKS.day.buf && !TRACKS.night.bytes) fetchTrack("night"); // warm the lullaby so dusk crossfades instantly
  for (const k in TRACKS) { const T = TRACKS[k], want = musicOn && (k === "night") === night ? 1 : 0;
    if (want) { fetchTrack(k); decodeTrack(k); startTrack(k); }
    if (want !== T.want) { const fade = musicOn ? 3 : 0.6; T.gain.gain.cancelScheduledValues(now); T.gain.gain.setValueAtTime(T.gain.gain.value, now); T.gain.gain.linearRampToValueAtTime(want, now + fade); T.want = want; T.offAt = now + fade + 0.1; if (T.el) T.el.volume = want ? MUSIC_VOL : 0; }
    if (!want && T.src0 && now > T.offAt) stopTrack(k);
    if (want && T.src0 === T.el && T.el && T.el.paused && !document.hidden) { const p = T.el.play(); if (p && p.catch) p.catch(() => {}); } } }
if (musicOn) fetchTrack("day"); // prefetch the day theme (about 1.1 MB) while the title card is up
/* iPhone audio. Three things make Web Audio reliable on iOS Safari:
   1) create/resume the AudioContext synchronously inside a real gesture (touchend/click) and play a 1-sample buffer;
   2) the ring/silent switch mutes Web Audio unless the page's audio session is "playback". iOS 17+ exposes
      navigator.audioSession.type for that; older iOS switches the session when an HTML <audio> element plays, so we
      loop a short, inaudible WAV in an <audio> element while sound is on (the approach used by the unmute-ios-audio library);
   3) iOS can leave the context "interrupted" (calls, Siri, app switch), so retry resume() on return and on the next tap. */
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let keepAlive = null;
function silentWav() { const sr = 8000, n = sr / 2, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, i % 2 ? 1 : -1, true); // +/-1 LSB: inaudible, but not "digital silence"
  return URL.createObjectURL(new Blob([b], { type: "audio/wav" })); }
function sessionPlayback() {
  try { if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback"; } catch (e) {}
  if (!IOS || document.hidden || !(musicOn || soundOn)) return;
  try { if (!keepAlive) { keepAlive = document.createElement("audio"); keepAlive.setAttribute("playsinline", ""); keepAlive.setAttribute("x-webkit-airplay", "deny"); keepAlive.loop = true; keepAlive.preload = "auto"; keepAlive.src = silentWav(); keepAlive.disableRemotePlayback = true; }
    if (keepAlive.paused) { const pr = keepAlive.play(); if (pr && pr.catch) pr.catch(() => {}); } } catch (e) {} }
function audioStart() { if (!ac()) return;
  sessionPlayback();
  if (AC.state !== "running") { const pr = AC.resume(); if (pr && pr.catch) pr.catch(() => {}); }
  try { const b = AC.createBufferSource(); b.buffer = AC.createBuffer(1, 1, 22050); b.connect(AC.destination); b.start(0); } catch (e) {}
  if (!AC._watch) { AC._watch = 1; AC.onstatechange = () => { if (AC.state !== "running" && !document.hidden && (musicOn || soundOn)) setTimeout(() => { if (AC.state !== "running" && !document.hidden) AC.resume().catch(() => {}); }, 300); audioBtns(); }; }
  if (!musTimer && !document.hidden) musTimer = setInterval(musicTick, 100); }
// Unlock on every real gesture until audio is running (also recovers from iOS "interrupted"). Cheap when already running.
["touchend", "pointerup", "click", "keydown"].forEach(ev => document.addEventListener(ev, () => { if (!AC || AC.state !== "running" || (IOS && keepAlive && keepAlive.paused && (musicOn || soundOn))) audioStart(); }, true));
document.addEventListener("visibilitychange", () => { if (!AC) return;
  if (document.hidden) { clearInterval(musTimer); musTimer = 0; AC.suspend().catch(() => {}); if (keepAlive) keepAlive.pause(); for (const k in TRACKS) if (TRACKS[k].el) TRACKS[k].el.pause(); }
  else { audioStart(); } });
window.addEventListener("pageshow", () => { if (AC && !document.hidden) audioStart(); });
// Farm SFX (off by default; 🔊 toggle)
function sfx(kind) { if (!soundOn || !ac() || AC.state !== "running") return; const t = AC.currentTime + 0.01, B = sfxBus;
  try {
    if (kind === "cluck") { cluck(B, t, 0.5); cluck(B, t + 0.13, 0.45); }
    else if (kind === "egg") { pluck(B, 84, t, 0.35, 0.12, "sine", 5000); pluck(B, 91, t + 0.06, 0.3, 0.15, "sine", 5000); }
    else if (kind === "coin") { pluck(B, 83, t, 0.25, 0.1, "square", 6000); pluck(B, 88, t + 0.07, 0.25, 0.25, "square", 6000); }
    else if (kind === "crow") { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = "sawtooth";
      [[0, 480], [0.12, 760], [0.35, 820], [0.7, 640], [1.0, 380]].forEach(([d, fr]) => o.frequency.linearRampToValueAtTime(fr, t + d)); f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 1.5;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4, t + 0.05); g.gain.setValueAtTime(0.4, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05); o.connect(f); f.connect(g); g.connect(B); o.start(t); o.stop(t + 1.1); }
    else if (kind === "rattle") { for (let i = 0; i < 5; i++) noise(B, t + i * 0.065 + Math.random() * 0.02, 0.045, 0.2, 2600 + i * 350, "bandpass"); }
    else if (kind === "plop") { noise(B, t, 0.1, 0.3, 450, "lowpass"); pluck(B, 50, t, 0.3, 0.12, "sine", 900); }
    else if (kind === "pour") { noise(B, t, 0.35, 0.25, 1200, "bandpass"); pluck(B, 79, t + 0.25, 0.15, 0.2, "sine", 4000); }
    else { const f = { lvl: [72, 76, 79, 84], warn: [62, 58], good: [76, 81] }[kind] || [76]; f.forEach((m, i) => pluck(B, m, t + i * 0.08, 0.25, 0.18, "triangle", 4000)); }
  } catch (e) {} }
const beep = sfx;
function audioBtns() { const m = $("#musicBtn"), x = $("#sfxBtn");
  if (m) { m.classList.toggle("off", !musicOn); m.setAttribute("aria-pressed", musicOn); m.setAttribute("aria-label", musicOn ? "Music on. Tap to mute" : "Music off. Tap to play"); }
  if (x) { x.textContent = soundOn ? "🔊" : "🔇"; x.classList.toggle("off", !soundOn); x.setAttribute("aria-pressed", soundOn); x.setAttribute("aria-label", soundOn ? "Farm sounds on" : "Farm sounds off"); }
  const tp = $("#titleMusic"); if (tp) { tp.innerHTML = `🎵 Music: <b>${musicOn ? "On" : "Off"}</b>`; tp.classList.toggle("off", !musicOn); }
  if (keepAlive && !(musicOn || soundOn)) keepAlive.pause(); }
const reopenSettings = () => { const c = $("#modalCard"); if (!$("#modal").classList.contains("hidden") && c.querySelector(".setrow")) settingsModal(); };
window.toggleMusic = () => { musicOn = !musicOn; try { localStorage.setItem("coopcity-music", musicOn ? "1" : "0"); } catch (e) {} audioStart(); buzz(10); toast(musicOn ? "🎵 Music on" : "🎵 Music off", 1); audioBtns(); reopenSettings(); };
window.toggleSound = () => { soundOn = !soundOn; try { localStorage.setItem("coopcity-sound", soundOn ? "1" : "0"); } catch (e) {} audioStart(); buzz(10); sfx("cluck"); toast(soundOn ? "🔊 Farm sounds on" : "🔇 Farm sounds off", 1); audioBtns(); reopenSettings(); };
function musicTip() { let seen = false; try { seen = localStorage.getItem("coopcity-mtip") === "1"; localStorage.setItem("coopcity-mtip", "1"); } catch (e) {}
  if (seen || !musicOn) return; setTimeout(() => { toast("🎵 Music on. Tap the 🎵 button to mute.", 1); const d = $("#dock"); d.classList.add("hey"); setTimeout(() => d.classList.remove("hey"), 4200); }, 900); }
function coinPop(n) { const el = $("#coinPop"); if (!el) return; el.textContent = (n > 0 ? "+" : "") + n + "🪙"; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
  const st = $("#coinStat"); st.classList.remove("bump"); void st.offsetWidth; st.classList.add("bump"); }
function gain(n, why, from) { if (!n) return; S.coins += n; coinPop(n); beep("coin"); buzz(12); coinFly(n, from || coachPoint() || centerOf("#toast")); if (why) toast(why); }
const xpNeed = l => 15 + 10 * (l - 1);
const UNLOCK = { wyandotte: 2, lavender: 2, easter: 3, legbar: 3, marans: 4, ayam: 5, "roo:ayam": 4, goose: 2, efence: 3, dog: 4 };
const lockedLv = k => (UNLOCK[k] || 1) > S.lvl && !(S.premium && S.premium.pack && CH[k]);
function xp(n) { S.xp += n;
  while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; const r = 10 + 5 * S.lvl; S.coins += r; coinPop(r); beep("lvl"); confetti(); buzz(40);
    const un = Object.entries(UNLOCK).filter(([k, l]) => l === S.lvl).map(([k]) => k.startsWith("roo:") ? ROOS[k.slice(4)].name : CH[k] ? CH[k].name : DEF.find(d => d[0] === k)[2]);
    for (let i = 0; i < 8; i++) particle(rnd(["⭐", "✨", "🎉"]), 30 + Math.random() * 40, 40 + Math.random() * 20, 2);
    toast(`⭐ Farm level ${S.lvl}! +${r}🪙${un.length ? " · Unlocked: " + un.join(", ") : ""}`); } }
const GOALS = [
  ["egg1", "🥚", "Collect your first egg", () => S.lifetime >= 1, 5],
  ["sell1", "💰", "Sell eggs at the market", () => S.stats.sold >= 1, 5],
  ["hens3", "🐔", "Get her friends: a flock of 3 hens", () => S.hens.length >= 3, 10],
  ["scare1", "🦅", "Scare off a predator (tap it!)", () => S.stats.scared >= 1, 10],
  ["lock1", "🔒", "Lock the coop for a whole night", () => S.stats.nightsLocked >= 1, 8],
  ["scraps1", "🥬", "Toss kitchen scraps to the hens", () => S.stats.scraps >= 1, 6],
  ["nest", "🪺", "Build a nest box", () => has("nest"), 6],
  ["roo", "🐓", "Get a rooster", () => !!S.rooster, 8],
  ["eggs10", "🧺", "Collect 10 eggs", () => S.lifetime >= 10, 10],
  ["def1", "🛡️", "Buy a predator defense", () => Object.keys(S.def).length >= 1, 8],
  ["big", "🏠", "Upgrade to the Big coop", () => S.coopLvl >= 1, 15],
  ["hens4", "🐔", "Raise a flock of 4 hens", () => S.hens.length >= 4, 12],
  ["care1", "🩹", "Nurse a hen back to health", () => S.stats.cared >= 1, 10],
  ["colors3", "🌈", "Collect 3 egg colors", () => Object.keys(S.collection).length >= 3, 12],
  ["streak3", "🛡️", "3 safe nights", () => S.stats.safeNights >= 3, 15],
  ["compost5", "♻️", "Compost 5 kitchen scraps", () => S.stats.compost >= 5, 8],
  ["trained", "🪣", "Teach a hen the bucket rattle", () => S.hens.some(h => (h.scr || 0) >= 3), 12],
  ["forage20", "🪲", "Hens eat 20 bugs", () => S.foraged >= 20, 10],
  ["roowin", "💪", "Your rooster drives off a predator", () => S.stats.rooWins >= 1, 12],
  ["hatch1", "🐣", "Hatch a chick", () => S.hatched >= 1, 15],
  ["lvl5", "⭐", "Reach farm level 5", () => S.lvl >= 5, 20],
  ["eggs50", "🏆", "Collect 50 eggs", () => S.lifetime >= 50, 25],
  ["golden", "✨", "Find a golden egg", () => (S.collection.golden || 0) >= 1, 25],
  ["barn", "🏚️", "Build the Barn coop", () => S.coopLvl >= 2, 30],
  ["rainbow", "🎨", "Collect all 7 egg colors", () => ["white", "brown", "lightbrown", "cream", "blue", "green", "chocolate"].every(c => S.collection[c]), 40]];
const DQ = { eggs: ["🥚", n => `Collect ${n} eggs`], scraps: ["🥬", n => `Share ${n} kitchen scraps`], bugs: ["🪲", n => `Hens eat ${n} bugs`], sell: ["💰", n => `Sell ${n} eggs`], refill: ["🌾", n => `Refill feeders or waterers ${n} times`], scare: ["🦅", n => `Scare off a predator`], lock: ["🔒", n => `Lock the coop tonight`], pet: ["💛", n => `Tap your hens ${n} times`] };
function rollDaily() { const keys = Object.keys(DQ).sort(() => Math.random() - 0.5).slice(0, 3);
  const n = { eggs: Math.max(2, Math.min(6, S.hens.length + 1)), bugs: 5, sell: 3, scraps: 2, refill: 2, scare: 1, lock: 1, pet: 3 };
  S.dq = keys.map(k => ({ k, n: n[k], r: 6 + Math.floor(Math.random() * 5), done: false })); S.today = {}; }
function bump(k, n = 1) { S.today[k] = (S.today[k] || 0) + n; }
function checkGoals() {
  if (!S || !S.stats) return;
  GOALS.forEach(([k, ic, t, ok, r]) => { if (!S.goals[k] && ok()) { S.goals[k] = S.day; gain(r); xp(Math.ceil(r / 2)); toast(`🏅 ${t} · +${r}🪙`); } });
  S.dq.forEach(q => { if (!q.done && (S.today[q.k] || 0) >= q.n) { q.done = true; gain(q.r); xp(4); toast(`🎯 Daily: ${DQ[q.k][1](q.n)} · +${q.r}🪙`);
    if (S.dq.every(x => x.done)) setTimeout(() => { gain(10); xp(5); toast("🧹 Daily sweep! All 3 done · +10🪙"); renderHUD(); }, 1500); } });
}
const EVENTS = { market: ["🧺", "Farmers market day! Eggs sell for 1.5x today."], contest: ["🏆", "Egg contest today! Sell a fancy-colored egg for a +15🪙 prize."], bugs: ["🐛", "Bug bloom! Extra bugs in the yard today."], lucky: ["✨", "Lucky day! Golden eggs are 5x more likely."] };
const eggPrice = e => Math.round((EGG_COLORS[e.color].value) * (S.event === "market" ? 1.5 : 1));
// Real-world visits: counts calendar days you've played (never resets) + a small welcome-back gift
function loginBonus() { const today = new Date().toDateString();
  if (S.login.last === today) return; const first = !S.login.last; S.login.last = today; S.login.days = (S.login.days || 0) + 1;
  if (first) return; const r = 10 + Math.min(20, 2 * S.login.days); setTimeout(() => { gain(r); toast(`📆 Welcome back${S.player ? ", " + S.player : ""}! Farm day ${S.login.days} · +${r}🪙`); renderHUD(); }, 900); }
// While you were away: game time is frozen when the app is closed. You only ever come back to a small gift.
function awayGift() { const away = Date.now() - (S.savedAt || Date.now()); if (away < 30 * 60e3 || !S.hens.length) return;
  const hrs = away / 36e5, eggs = Math.min(6, Math.max(1, Math.floor(hrs / 4) * S.hens.length)), coins = Math.min(15, 3 + Math.floor(hrs));
  const layers = S.hens.filter(h => !h.cond || !["molt", "broody"].includes(h.cond.k)); const src = layers.length ? layers : S.hens;
  for (let i = 0; i < eggs; i++) { const h = src[i % src.length]; S.collection[h.egg] = (S.collection[h.egg] || 0) + 1; S.basket.push({ color: h.egg, breed: h.breed, hen: h.name, fertile: !!S.rooster, sire: S.rooster && S.rooster.breed }); }
  S.lifetime += eggs; S.coins += coins; S.savedAt = Date.now();
  setTimeout(() => modal(`<h2>🧺 While you were away</h2><p>Time stops on the farm when you leave, so nobody got hungry or dirty, and no predators came by.</p><p>Charlie peeked in and found a little basket waiting:</p><p style="font-size:20px;text-align:center">🥚 ×${eggs} · 🪙 +${coins}</p><button class="buy big" onclick="closeModal()">Thanks, Charlie!</button>`), 1400); }
/* ---------- SEASONS + REALISM ---------- */
const SEASONS = [["🌱", "Spring"], ["☀️", "Summer"], ["🍂", "Fall"], ["⛄", "Winter"]];
const season = () => realSeason();
const SEASON_WX = { Spring: [0, 0, 3, 3, 5, 1], Summer: [0, 1, 2, 2, 3, 5], Fall: [0, 3, 5, 5, 4, 1], Winter: [4, 4, 5, 3, 0, 4] };
const PERS = { bossy: ["👑", "Bossy", "Top of the pecking order. Gets first dibs on every bug."], shy: ["🙈", "Shy", "First to hide when anything flies over."], cuddly: ["🤗", "Cuddly", "Loves attention. Tap her for a happy boost."], curious: ["🔍", "Curious", "Investigates everything. Finds the most bugs."], chatty: ["💬", "Chatty", "Narrates her whole day. Loudly. Especially after laying."] };
const COND = {
  molt: ["🪶", "Molting", "Losing old feathers and growing new ones. No eggs until she's done.", "Give protein treats", 3, "Molting usually happens in fall. Hens stop laying while they regrow feathers, and extra protein helps."],
  broody: ["🪺", "Broody", "Won't leave the nest. Puffs up and growls if you get close.", "", 0, "A broody hen wants to hatch eggs and stops laying. Let her sit on fertile eggs, or gently break the broodiness."],
  mites: ["🐜", "Mites", "Scratching, dull feathers, and pale comb.", "Dust with mite powder", 6, "Check under the feathers near the vent. Treat the hens and the coop with a poultry dust, and give them a dust bath spot."],
  eggbound: ["😣", "Egg-bound", "Straining, tail down, waddling like a penguin.", "Warm bath + calcium", 0, "An egg is stuck. A warm soak and extra calcium often help. If it doesn't pass soon, call a vet."],
  bumble: ["🦶", "Bumblefoot", "Limping, with a swollen foot pad.", "Clean and wrap her foot", 4, "Bumblefoot is an infection that starts from a small cut. Keep perches smooth and not too high, and keep bedding dry."],
  newbie: ["😤", "Settling in", "Getting pecked while the flock sorts out who's boss.", "", 0, "New hens get squabbled with while the pecking order resets. Quarantine new birds first, then introduce them slowly, see-but-don't-touch."] };
const condLine = { molt: n => `${n} is losing feathers EVERYWHERE. Is she... shedding? Like a dog? Is she okay??`, broody: n => `${n} won't get off the nest and she growled at me. Chickens can GROWL?`,
  mites: n => `${n} keeps scratching. I'm itchy just looking at her.`, eggbound: n => `${n} is walking like a penguin and looks very uncomfortable.`, bumble: n => `${n} is limping. Did she twist her ankle? Do chickens have ankles?`,
  newbie: n => `The other hens are being SO mean to ${n}. It's like the first day of middle school.` };
function setCond(h, k, days) { if (h.cond) return false; h.cond = { k, days }; const c = COND[k]; toast(`${c[0]} ${h.name}: ${c[1]}. Tap her card to help.`); beep("warn");
  sayOnce("cond_" + k, `${condLine[k](h.name)} <i>Tip: ${c[5]}</i>`, 1); return true; }
// One gentle, readable problem at most per day so it stays fun, not a chore list
function realismDay() {
  S.hens.forEach(h => { if (!h.cond) return; h.cond.days--; if (h.cond.days <= 0) { const k = h.cond.k; h.cond = null;
    if (k === "molt") toast(`🪶 ${h.name} finished molting. Shiny new feathers!`); if (k === "broody") toast(`${h.name} gave up on being broody.`); if (k === "newbie") toast(`${h.name} found her place in the pecking order.`); } });
  const se = season()[1], free = S.hens.filter(h => !h.cond); if (!free.length) return;
  if (se === "Fall") { const yr = new Date().getFullYear(), h = free.find(h => h.molted !== yr); if (h && Math.random() < 0.35) { h.molted = yr; setCond(h, "molt", 4); return; } }
  if (se === "Winter" && !S.said.winter) sayOnce("winter", "It's dark at like 5pm. The hens are on strike. <i>Tip: hens need about 14-16 hours of daylight to lay steadily, so laying slows down in winter.</i>", 1);
  if (Math.random() > 0.3) return;
  const h = rnd(free), r = Math.random();
  if ((se === "Spring" || se === "Summer") && !isOld(h) && r < 0.35) setCond(h, "broody", 5);
  else if (r < 0.65 && (S.clean < 60 || !has("run") || Math.random() < 0.4)) setCond(h, "mites", 9);
  else if (r < 0.82) setCond(h, "eggbound", 2);
  else setCond(h, "bumble", 6);
}
function condHour(h) { const c = h.cond; if (!c) return 0;
  if (c.k === "mites") { h.happy -= 1; if (S.hour % 4 === 0) h.health -= 1; } if (c.k === "eggbound" && S.hour % 3 === 0) h.health -= 1;
  if (c.k === "bumble") h.happy -= 0.5; if (c.k === "newbie") h.happy -= 0.5; return 0; }
window.careHen = (id, act) => { const h = S.hens.find(x => x.id == id); if (!h || !h.cond) return; const k = h.cond.k, c = COND[k];
  if (act === "hatch") { const eggs = S.basket.filter(e => e.fertile).slice(0, 4); if (!eggs.length) return toast("She needs fertile eggs. You'll need a rooster!");
    S.basket = S.basket.filter(e => !eggs.includes(e)); eggs.forEach(e => S.incub.push({ color: e.color, breed: e.breed, sire: e.sire, days: INCUBATE_DAYS + 1, hen: h.name }));
    h.cond.days = INCUBATE_DAYS + 1; toast(`🪺 ${h.name} is sitting on ${eggs.length} egg${eggs.length > 1 ? "s" : ""}!`);
    say(`${h.name} is hatching eggs herself. No incubator, no electricity. Just vibes. <i>Tip: a broody hen keeps eggs warm and turns them herself. Real chicken eggs take about 21 days to hatch.</i>`, 1); return henModal(h.id); }
  if (act === "break") { h.cond = null; S.stats.cared++; toast(`${h.name} is back to normal hen life.`); say(`I gently picked her up off the nest and gave her a snack. She's over it. <i>Tip: to break broodiness, remove her from the nest often, collect eggs right away, and block the nest box for a few days.</i>`, 1); return henModal(h.id); }
  if (c[4] && S.coins < c[4]) return toast("Not enough coins!");
  if (c[4]) { S.coins -= c[4]; coinPop(-c[4]); }
  if (k === "mites") S.hens.forEach(x => { if (x.cond && x.cond.k === "mites") x.cond = null; }); else if (k === "molt") h.cond.days = Math.max(1, h.cond.days - 2); else h.cond = null;
  h.health = Math.min(100, h.health + 10); h.happy = Math.min(100, h.happy + 10); S.stats.cared++; beep("good"); particle("💚", h.x + 7, h.y, 0);
  toast(k === "molt" ? `${h.name} loves her mealworms. Feathers coming in faster!` : `${h.name} is feeling better!`); henModal(h.id); renderAll(); };
// Dust bathing: an occasional, visual, healthy behavior on dry days
function maybeDustBath(h) { if (S.weather[1] === "Rain" || h.cond || Math.random() > 0.04) return false;
  h.busy = true; h.dust = true; const el = henEls.get("h" + h.id), bob = el && el.querySelector(".bob"); if (bob) bob.classList.add("dusting");
  let n = 0; const iv = setInterval(() => { particle("💨", h.x + 5 + Math.random() * 6, h.y + 8, 2); if (++n > 6) clearInterval(iv); }, 400);
  setTimeout(() => { h.busy = false; h.dust = false; if (bob) bob.classList.remove("dusting"); }, 3200);
  sayOnce("dust", `${h.name} is rolling around in the dirt and kicking it everywhere. I think she's broken. <i>Tip: dust bathing is how chickens clean their feathers and fight off mites. Totally normal (and adorable).</i>`, 1); return true; }

/* ---------- PREDATORS ---------- */
const DAY_T = {
  hawk: { e: "🦅", name: "Hawk", sky: 1, hit: 0.55, dmg: 25, w: 45, line: "There's a huge bird circling and it's looking at my hens like they're nuggets.", tip: "Hawks hunt by day. A covered run, trees, and shrubs give hens places to hide, and a rooster's alarm call sends them running." },
  eagle: { e: "🦅", big: 1, name: "Eagle", sky: 1, hit: 0.6, dmg: 35, w: 7, line: "Is that a BALD EAGLE? That's so patriotic and so terrifying.", tip: "Eagles occasionally take chickens, especially near water. A covered run is the best defense." },
  cat: { e: "🐈", name: "Neighbor's cat", sky: 0, hit: 0.3, dmg: 10, w: 20, line: "Mr. Whiskers from next door is stalking my hens. He's 10 pounds. They're 6. Fair fight?", tip: "Most cats leave full-grown hens alone but will go after chicks. Keep chicks in a secure brooder." },
  dog: { e: "🐕", name: "Stray dog", sky: 0, hit: 0.55, dmg: 30, w: 15, line: "A loose dog got in and thinks my hens are squeaky toys!", tip: "Loose dogs are one of the most common chicken predators. Solid fencing or electric poultry netting keeps them out." } };
const FOX_DUSK = { e: "🦊", name: "Fox", sky: 0, hit: 0.5, dmg: 30, line: "A fox at dinnertime?! I thought they only came out at night.", tip: "Foxes often hunt at dawn and dusk, not just at night. Lock up at sunset." };
const NIGHT_T = {
  raccoon: ["🦝", "Raccoon", 20, "A raccoon was fiddling with the coop door. With its little HANDS. I can't even open a pickle jar.", "Raccoons have nimble paws and can open simple hook and slide latches. Use a two-step or carabiner-style latch."],
  possum: ["🐭", "Possum", 15, "A possum came snooping for eggs, then played dead when I came out. Rude.", "Opossums mostly steal eggs and rarely go after adult hens. Collect eggs every day."],
  coyote: ["🐺", "Coyote", 12, "I heard yipping. Like a dog party. A scary dog party.", "Coyotes mostly hunt at night. A locked coop and electric poultry netting keep them out."],
  fox: ["🦊", "Fox", 12, "A fox tried to dig a TUNNEL. It's like a heist movie.", "Foxes dig under fences. Bury hardware cloth or lay an apron of it around the coop."],
  owl: ["🦉", "Owl", 10, "Something said 'who?' from the tree. I said 'Charlie.' It did not care.", "Great horned owls hunt at night and can take hens that roost outside. Lock everyone in the coop."],
  snake: ["🐍", "Snake", 8, "A snake was poking around the nest box. They swallow eggs WHOLE.", "Rat snakes eat eggs and chicks. Seal small gaps with hardware cloth and collect eggs daily."],
  rat: ["🐀", "Rats", 12, "Something was sniffing around the feed. I'm choosing to believe it was a cute mouse.", "Rats come for spilled feed. Store feed in a metal can with a tight lid."],
  skunk: ["🦨", "Skunk", 8, "The yard smells like a skunk lost an argument. It did.", "Skunks eat eggs and sometimes attack hens. Collect eggs daily and secure the coop at night."],
  weasel: ["🦦", "Weasel", 5, "Something tiny and slinky was testing every gap in the coop!", "Weasels fit through 1-inch gaps. Chicken wire keeps chickens in but doesn't keep predators out. Use 1/2-inch hardware cloth."] };
const DEF = [
  ["latch", "🔩", "Two-step latch", 10, "Raccoons can open simple latches. This one takes two moves.", "Raccoons can open simple hook and slide latches. A two-step or carabiner latch stops them."],
  ["feedbin", "🗑️", "Metal feed bin", 8, "Keeps rats out of the feed.", "Rats chew through feed bags. A metal can with a tight lid stops them."],
  ["motion", "💡", "Motion light", 12, "Startles possums, skunks, and raccoons.", "A sudden light can spook night visitors, though some get used to it."],
  ["eyes", "🔴", "Solar predator-eye lights", 15, "Blinking red lights after dark.", "Some keepers say blinking 'eye' lights deter foxes and coyotes. Results vary, so pair them with a solid coop."],
  ["hwcloth", "🧱", "Hardware cloth", 25, "1/2-inch welded mesh over vents and gaps, plus a buried apron.", "Chicken wire keeps chickens in, but predators can tear or reach through it. 1/2-inch hardware cloth keeps out weasels, snakes, and rats."],
  ["goose", "🪿", "Guard goose", 35, "Loud, bossy, territorial. Honks at intruders.", "Geese are noisy and territorial, so they make good alarm systems. They won't stop every predator."],
  ["efence", "⚡", "Electric poultry netting", 45, "Keeps dogs, foxes, and coyotes away from free-range hens.", "Electric poultry netting is a common way to protect free-ranging chickens from ground predators."],
  ["dog", "🐶", "Livestock guardian dog", 120, "Patrols day and night.", "Livestock guardian breeds like Great Pyrenees are bred to protect animals, but they need training and time with the flock."]];
window.buyDef = k => { const d = DEF.find(x => x[0] === k); if (S.def[k] || S.coins < d[3] || lockedLv(k)) return;
  S.coins -= d[3]; coinPop(-d[3]); S.def[k] = S.day; toast(`${d[1]} ${d[2]} installed!`); say(`${rnd(["I installed it myself. Only bled a little.", "The guy at the farm store called me 'bud.' I've never felt more rural.", "Fort Cluck is getting serious."])} <i>Tip: ${d[5]}</i>`, 1); shop(); renderAll(); };
const roo = () => S.rooster ? ROOS[S.rooster.breed].guard : null;
let threat = null;
const hensOut = () => !isNight() && !(S.locked && has("coop"));
function coverSpot() { const t = [...tilesOf("tree"), ...tilesOf("run"), ...tilesOf("coop")]; if (!t.length) return null; const p = tilePos(rnd(t)); p.x += Math.random() * 5; p.y += Math.random() * 4; return p; }
function runForCover(ms, only) { frenzies.forEach(f => endFrenzy(f, "abort")); const now = performance.now(); (only || S.hens).forEach(h => { const p = coverSpot(); if (!p) return; h.flip = p.x < h.x; h.x = p.x; h.y = p.y; h.busy = true; h.run = true; h.next = now + ms;
  setTimeout(() => { h.busy = false; h.run = false; }, ms); }); if (S.rooster) { S.rooster.run = true; setTimeout(() => S.rooster && (S.rooster.run = false), 2000); } renderHens(); }
const pickW = o => { const e = Object.entries(o), tot = e.reduce((a, [, v]) => a + (v.w || v[2]), 0); let r = Math.random() * tot; for (const [k, v] of e) { r -= v.w || v[2]; if (r <= 0) return k; } return e[0][0]; };
function dayThreat(kind, tut) {
  if (threat || !S.hens.length || !hensOut()) return;
  const T = kind === "fox" ? FOX_DUSK : DAY_T[kind], target = rnd(S.hens), fromL = Math.random() < 0.5, sx = target.x + (fromL ? -62 : 62);
  const ty = T.sky ? Math.max(0, target.y - 16) : target.y;
  const a = actor(`<span>${T.e}</span>`, (T.sky ? "sky" : "ground") + (T.big ? " big" : ""), sx, T.sky ? -12 : ty, T.sky ? 45 : 30, { sky: T.sky });
  a.tx = target.x - 2; a.ty = ty; panTo(target.x + 6, target.y + 4); // bring the action into view
  const sh = T.sky ? actor("", "shadow", sx, target.y + 7, 45, { noflip: 1 }) : null; if (sh) { sh.tx = target.x; sh.ty = target.y + 8; }
  threat = { kind, T, a, sh, target, fromL, sx, done: false, tut: !!tut };
  a.el.classList.add("tappable"); a.el._tap = () => { if (threat && !threat.done) { threat.tapped = true; resolveDay(); } };
  a.el.addEventListener("pointerdown", e => { e.stopPropagation(); a.el._tap(); });
  toast(`⚠️ ${T.name}! Tap it to scare it off!`, 1); beep("warn");
  const g = roo();
  runForCover(4200, S.hens.filter(h => h.pers === "shy"));
  if (g && Math.random() < g.alarm + (T.sky ? 0.1 : 0)) setTimeout(() => { if (threat && !threat.done) { threat.alarm = true; particle("❗", S.rooster.x + 6, S.rooster.y - 2, 0); toast(`🐓 ${S.rooster.name} sounds the alarm! Hens run for cover!`); runForCover(4500); } }, 800);
  else if (S.def.goose && Math.random() < 0.5) setTimeout(() => { if (threat && !threat.done) { threat.alarm = true; toast("🪿 HONK HONK! The goose sounds the alarm!"); runForCover(4500); } }, 800);
  sayOnce("t_" + kind, `${T.line} <i>Tip: ${T.tip}</i>`, 1);
  if (!S.said.taptip) { S.said.taptip = 1; say(`${T.line} Quick, tap it! <i>Tip: ${T.tip}</i>`, 1); }
  threat.timer = setTimeout(resolveDay, tut ? 7000 : 4300); renderAll();
}
function resolveDay() {
  const t = threat; if (!t || t.done) return; t.done = true; clearTimeout(t.timer);
  const { T, target, kind } = t, nm = T.name.toLowerCase().replace("neighbor's ", ""), g = roo(); let msg;
  if (t.tut) S.said.tutHawkDone = 1;
  if (t.tapped) { buzz(25); const tp = t.a.el.getBoundingClientRect(); sparkle(tp.x + tp.width / 2, tp.y + tp.height / 2); S.stats.scared++; bump("scare"); xp(5); gain(3); msg = `You flapped your arms and yelled. The ${nm} left! +3🪙`; beep("good"); }
  else if (S.def.dog && Math.random() < (T.sky ? 0.35 : 0.9)) msg = `Your guard dog barked the ${nm} away! 🐶`;
  else if (S.def.goose && !T.sky && Math.random() < 0.5) msg = `The goose HONKED and charged. The ${nm} left. 🪿`;
  else if (g && Math.random() < g.fight * (T.big ? 0.6 : 1) * (kind === "dog" ? 0.6 : 1)) { msg = `${S.rooster.name} puffed up and charged! The ${nm} backed off. 💪`; S.stats.rooWins++; xp(3); particle("💪", S.rooster.x + 6, S.rooster.y - 2, 0);
    sayOnce("roowin", `${S.rooster.name} just body-slammed a ${nm}. I take back everything I said about 5am. <i>Tip: roosters watch for danger, sound an alarm call, and will often fight to protect their hens.</i>`, 1); }
  else if (t.tut) msg = `The ${nm} flew off. Next time, tap it fast!`;
  else { let p = T.hit; if (t.alarm) p *= 0.35; if (target.pers === "shy") p *= 0.5;
    if (T.sky) { if (has("run")) p *= 0.5; if (has("tree")) p *= 0.7; } else { p *= 1 - 0.5 * Math.min(1, tilesOf("fence").length / 12); if (S.def.efence) p *= 0.2; }
    if (S.hens.includes(target) && Math.random() < p) { hurt(target, Math.min(10, Math.round(T.dmg / 3))); for (let i = 0; i < 5; i++) particle("🪶", target.x + 7, target.y + 4, 1); msg = `The ${nm} swiped at ${target.name}! She lost a few feathers and is hiding, but she'll be fine.`; S.nightHurt = true; beep("warn"); }
    else msg = t.alarm ? `The hens hid in time. The ${nm} gave up.` : `The ${nm} missed and left.`; }
  toast(msg);
  const ex = t.sx; t.a.tx = ex; t.a.ty = T.sky ? -14 : t.a.y; t.a.speed *= 1.3; t.a.onArrive = () => dropActor(t.a);
  if (t.sh) { t.sh.tx = ex; t.sh.onArrive = () => dropActor(t.sh); }
  threat = null; renderAll();
}
function nightThreat(kind) {
  const [e, name, , line, tip] = NIGHT_T[kind], D = S.def, coop = tilesOf("coop")[0], safe = coop !== undefined && S.locked;
  const fenceF = Math.min(1, tilesOf("fence").length / 12), R = Math.random;
  const harm = n => { const h = rnd(S.hens); if (!h) return "a hen"; hurt(h, S.rooster && R() < roo().alarm * 0.6 ? 4 : 8); S.nightHurt = true; return h.name; };
  const eatEggs = m => { const k = Math.min(m, 2, S.ground.length); S.ground.splice(0, k); return k; };
  let msg = null, ok = true;
  const mammal = ["raccoon", "possum", "coyote", "fox", "skunk"].includes(kind);
  if (mammal && D.dog && R() < 0.85) msg = `Your guard dog chased off a ${name.toLowerCase()}! 🐶`;
  else if (["coyote", "fox", "raccoon", "owl"].includes(kind) && D.eyes && R() < 0.25) msg = `The blinking red lights spooked a ${name.toLowerCase()}.`;
  else if (["possum", "skunk", "raccoon"].includes(kind) && D.motion && R() < 0.45) msg = `The motion light flicked on. The ${name.toLowerCase()} bolted.`;
  else if (mammal && D.goose && R() < 0.3) msg = `The goose honked the ${name.toLowerCase()} right out of the yard. 🪿`;
  else switch (kind) {
    case "raccoon": if (safe && (D.latch || R() < 0.75)) msg = "A raccoon rattled the coop latch. It held!";
      else { const k = eatEggs(9); msg = `A raccoon ${safe ? "opened the latch and " : ""}ruffled ${harm(35)} (she hid and will be fine)${k ? " and ate the eggs" : ""}!`; ok = false; } break;
    case "possum": if (!S.ground.length) msg = "A possum sniffed around, found no eggs, and waddled off."; else { const k = eatEggs(3); msg = `A possum ate ${k} egg${k > 1 ? "s" : ""} you left out!`; ok = false; } break;
    case "snake": if (D.hwcloth) msg = "A snake couldn't squeeze through the hardware cloth."; else if (!S.ground.length) msg = "A snake slithered through, found no eggs, and left."; else { const k = eatEggs(2); msg = `A snake swallowed ${k} egg${k > 1 ? "s" : ""}!`; ok = false; } break;
    case "rat": if (D.feedbin) msg = "Rats tried the feed bin. Metal wins."; else if (S.feed > 0) { S.feed = Math.max(0, S.feed - 2); msg = "Rats chewed into the feed bag! -2 scoops."; ok = false; } else msg = "Rats found an empty feed bag. Ha."; break;
    case "coyote": if (safe) msg = "A coyote circled the locked coop and gave up."; else if (D.efence && R() < 0.9) msg = "A coyote touched the electric netting. Yelp! Gone."; else if (R() < fenceF * 0.5) msg = "A coyote couldn't get past the fence."; else { msg = `A coyote got into the yard and ruffled ${harm(40)} (she hid and will be fine)!`; ok = false; } break;
    case "fox": if (safe && (D.hwcloth || R() < 0.8)) msg = `A fox tried digging under the coop${D.hwcloth ? " and hit hardware cloth" : ""}. Foiled!`; else if (!safe && D.efence && R() < 0.9) msg = "A fox hit the electric netting and ran off."; else { msg = `A fox ${safe ? "dug under the coop and " : ""}ruffled ${harm(30)} (she hid and will be fine)!`; ok = false; } break;
    case "owl": if (safe) msg = "An owl hooted from the tree. Everyone's locked inside."; else { msg = `An owl swooped at ${harm(30)}, who was sleeping outside! She hid under a bush and is okay.`; ok = false; } break;
    case "skunk": { const k = eatEggs(2); S.hens.forEach(h => h.happy = Math.max(0, h.happy - 8)); msg = `A skunk ${k ? `ate ${k} egg${k > 1 ? "s" : ""} and ` : ""}stank up the yard. 🤢`; ok = !k; } break;
    case "weasel": if (D.hwcloth) msg = "A weasel couldn't fit through the 1/2-inch hardware cloth."; else if (safe && R() < 0.5) msg = "A weasel searched for a gap and didn't find one tonight."; else { msg = `A weasel squeezed in and ruffled ${harm(30)} (she hid and will be fine)!`; ok = false; } break;
  }
  // Animate: walk in to the coop, pause, walk out
  const tgt = coop !== undefined ? tilePos(coop) : { x: 45, y: 45 }, fromL = R() < 0.5, sx = tgt.x + (fromL ? -60 : 60), flyer = kind === "owl";
  const a = actor(`<span>${e}</span><small>${name}</small>`, "night" + (flyer ? " sky" : ""), sx, flyer ? -10 : tgt.y + 6, flyer ? 40 : 26, { sky: flyer });
  a.tx = tgt.x + (fromL ? -6 : 10); a.ty = tgt.y + (flyer ? -4 : 6);
  a.onArrive = () => { particle(ok ? "🛡️" : "💥", tgt.x + 6, tgt.y, 0); setTimeout(() => { a.tx = sx; a.onArrive = () => dropActor(a); }, 900); };
  toast(`${e} ${msg}`); if (!ok) beep("warn");
  sayOnce("n_" + kind, `${line} <i>Tip: ${tip}</i>`, 1);
  renderAll();
}
function predator(emoji, i, msg) { const p = tilePos(i ?? 0); const a = actor(`<span>${emoji}</span>`, "ground", -16, p.y, 30); a.tx = p.x; a.ty = p.y;
  a.onArrive = () => setTimeout(() => { a.tx = 108; a.onArrive = () => dropActor(a); }, 600); toast(msg); }
function threatHour() {
  const h = S.hour; if (S.tut < TUT.length) return; // no predators until the player has learned the basics
  if (!$("#modal").classList.contains("hidden") && h < 20) return; // never ambush someone reading a menu
  if (h === 11 && S.day === 1 && !S.said.tuthawk && !S.said.tutHawkDone && hensOut()) { S.said.tuthawk = 1; return dayThreat("hawk"); }
  if (h >= 9 && h <= 16 && S.day > 1 && Math.random() < 0.12) return dayThreat(pickW(DAY_T));
  if ((h === 18 || h === 19) && Math.random() < 0.15) return dayThreat("fox");
  if ((h === 22 || h === 2) && S.hens.length && Math.random() < 0.55) { let k = pickW(NIGHT_T); if (k === "snake" && season()[1] === "Winter") k = "rat"; nightThreat(k); }
}

/* ---------- SAVE / LOAD ---------- */
const SAVE_KEY = "coopcity-save-v1";
let demoMode = false, saveT;
function save() { if (demoMode || !S || !S.started) return; S.savedAt = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(save, 250); }
window.addEventListener("pagehide", save);
function migrate(s) {
  const d = { def: {}, goals: {}, stats: {}, xp: 0, lvl: 1, today: {}, dq: [], seen: {}, login: {}, event: null, player: "", calcium: 0 };
  Object.keys(d).forEach(k => { if (s[k] == null) s[k] = d[k]; });
  ["sold", "nightsLocked", "scared", "safeNights", "rooWins", "cared"].forEach(k => s.stats[k] = s.stats[k] || 0); if (!s.stats.safeNights && s.stats.bestStreak) s.stats.safeNights = s.stats.bestStreak;
  s.login = s.login || {}; s.login.days = s.login.days || (s.login.last ? 1 : 0); (s.hens || []).forEach(h => { h.health = Math.max(40, h.health); });
  s.hens.forEach(h => { h.busy = false; h.run = false; h.next = 0; h.dust = false; if (!h.pers) h.pers = rnd(Object.keys(PERS)); s.seen[h.breed] = 1; });
  if (s.rooster) { s.rooster.run = false; s.rooster.next = 0; s.rooster.spd = 0; }
  // build 11: kitchen scraps. Returning farms find a seasonal scrap waiting so they discover the bucket.
  s.hens.forEach(h => { h.spd = 0; h.xc = ""; });
  ["scraps", "compost", "fills"].forEach(k => s.stats[k] = s.stats[k] || 0);
  if (!Array.isArray(s.scraps)) { s.scraps = s.lifetime > 0 && s.hens.length ? [starterScrap()] : []; if (s.scraps.length) s.stats.fills = 1; }
  s.scraps = s.scraps.filter(k => SCRAPS[k]).slice(0, BUCKET_MAX); if (s.compost == null) s.compost = 0; if (s.treatN == null) s.treatN = 0;
  (s.bugs || []).forEach(b => b.claimed = 0); if (!s.speed) s.speed = 1; if (s.tut == null) s.tut = 99; return s;
}
function loadSave() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }

/* ---------- REAL-WORLD CALENDAR: seasons + holidays (Northern Hemisphere) ---------- */
function easter(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
  i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
function holiday(now = new Date()) {
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate(), day = 864e5, inRange = (a, b) => now >= a && now < b;
  if ((m === 9 && d >= 24) || (m === 10 && d <= 1)) return { k: "halloween", hat: "🎃", name: "🎃 Halloween", line: "The hens are in costume. One is a pumpkin. One is... also a pumpkin. Spooky season!", tip: "Fun fact: chickens can see more colors than people, including ultraviolet light." };
  const nov1 = new Date(y, 10, 1), thx = new Date(y, 10, 1 + ((4 - nov1.getDay() + 7) % 7) + 21);
  if (inRange(new Date(thx - 3 * day), new Date(+thx + 2 * day))) return { k: "thanks", hat: "🍂", name: "🦃 Thanksgiving", line: "My hens are SO thankful they're not turkeys. Bonus coins for gratitude.", tip: "Fun fact: turkeys and chickens are both in the same bird family (pheasants and relatives)." };
  if ((m === 11 && d >= 15) || (m === 0 && d <= 1)) return { k: "winter", hat: "🎅", name: "🎄 Winter holidays", line: "I got the hens tiny Santa hats. They hate them. Happy holidays!", tip: "Winter tip: hens handle cold well in a dry, draft-free coop with good ventilation." };
  if (m === 1 && d >= 10 && d <= 14) return { k: "valentine", hat: "💘", name: "💘 Valentine's", line: "Rocky brought a hen a worm. Romance isn't dead.", tip: "Fun fact: hens lay eggs whether or not a rooster is around." };
  if (m === 2 && d === 17) return { k: "stpat", hat: "🍀", name: "🍀 St. Patrick's Day", line: "Feeling lucky! Golden eggs are more likely today.", tip: "Fun fact: some breeds, like Olive Eggers, lay green eggs." };
  const ea = easter(y); if (inRange(new Date(ea - 6 * day), new Date(+ea + day))) return { k: "easter", hat: "🐰", name: "🐰 Easter egg hunt", line: "Someone hid painted eggs all over the yard. Find them for bonus coins!", tip: "Fun fact: Easter Eggers are a mix that can lay blue, green, or pinkish eggs." };
  return null;
}
const HOL = holiday();
const realSeason = () => { const m = new Date().getMonth(); return SEASONS[m >= 2 && m <= 4 ? 0 : m >= 5 && m <= 7 ? 1 : m >= 8 && m <= 10 ? 2 : 3]; };

/* ---------- SHARE + TRADE (no server: compact codes in links) ---------- */
const b64e = o => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64d = s => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
const sum = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 1679616; return h.toString(36).padStart(4, "0"); };
const mkCode = (pre, o) => { const b = b64e(o); return `${pre}${b}.${sum(b)}`; };
function readCode(str) { const m = String(str).trim().match(/(CCV|CCG)([A-Za-z0-9_-]+)\.([a-z0-9]{4})/); if (!m || sum(m[2]) !== m[3]) return null; try { return { kind: m[1], o: b64d(m[2]) }; } catch (e) { return null; } }
const baseURL = () => location.origin + location.pathname;
async function shareOut(title, text, url) {
  if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
  try { await navigator.clipboard.writeText(`${text} ${url}`); toast("Link copied! Paste it to a friend."); } catch (e) { modal(`<h2>Copy this link</h2><textarea class="code" readonly onclick="this.select()">${esc(url)}</textarea><button class="act big" onclick="closeModal()">Done</button>`); }
}
function farmSnap() { return { v: 1, n: S.player || "A city farmer", d: S.day, l: S.lvl, c: S.coopLvl, a: S.land.length, e: S.lifetime, g: Object.keys(S.goals).length,
  h: S.hens.slice(0, 12).map(h => [h.breed, h.name.slice(0, 32), h.pers]), r: S.rooster ? [S.rooster.breed, S.rooster.name.slice(0, 32)] : 0, k: S.collection }; }
window.shareFarm = () => shareOut("My Coup City farm", `Come visit my chicken farm in Coup City! 🐔`, `${baseURL()}#visit=${mkCode("CCV", farmSnap())}`);
function visitModal(f) {
  modal(`<h2>🏡 ${esc(f.n)}'s farm</h2><p>Day ${+f.d || 1} · ⭐ Level ${+f.l || 1} · ${COOPS[f.c] ? COOPS[f.c].name : "Coop"} · ${+f.a || 1} plot${f.a > 1 ? "s" : ""} of land</p>
   <div class="visit">${(f.h || []).filter(h => CH[h[0]]).map(h => `<div>${henSVG(h[0])}<small>${esc(h[1])}<br>${PERS[h[2]] ? PERS[h[2]][0] : ""} ${CH[h[0]].name}</small></div>`).join("")}${f.r && ROOS[f.r[0]] ? `<div>${henSVG("roo:" + f.r[0])}<small>${esc(f.r[1])}<br>🐓 rooster</small></div>` : ""}</div>
   <p>🥚 ${+f.e || 0} eggs collected · 🏅 ${+f.g || 0} badges</p><div class="eggrow">${Object.keys(f.k || {}).filter(k => EGG_COLORS[k]).map(k => eggSVG(k)).join("")}</div>
   <p class="demo">View-only visit. Live neighbors and real-time trading would need a server later.</p><button class="buy big" onclick="closeModal()">Back to my farm</button>`); }
// Gift codes: the sender's item leaves their farm; the receiver can redeem each code once on this device
const redeemed = () => { try { return JSON.parse(localStorage.getItem("coopcity-redeemed") || "[]"); } catch (e) { return []; } };
window.giftHen = id => { const h = S.hens.find(x => x.id == id); if (!h) return; if (S.hens.length < 2) return toast("Keep at least one hen!");
  modal(`<h2>🎁 Gift ${esc(h.name)}?</h2><p>She'll leave your farm and go to whoever opens the link. Each gift code works once per device.</p><button class="buy big" onclick="doGiftHen('${h.id}')">Yes, make a gift link</button><button class="act big" onclick="henModal('${h.id}')">Cancel</button>`); };
window.doGiftHen = id => { const h = S.hens.find(x => x.id == id); if (!h) return; S.hens = S.hens.filter(x => x !== h); S.stats.gifts = (S.stats.gifts || 0) + 1;
  const code = mkCode("CCG", { t: "hen", b: h.breed, n: h.name.slice(0, 32), p: h.pers, m: h.mix ? 1 : 0, f: (S.player || "A friend").slice(0, 24), id: Math.random().toString(36).slice(2, 10) });
  renderAll(); giftReady(code, `${h.name} the ${CH[h.breed].name}`); };
window.giftEggs = () => { const eggs = S.basket.filter(e => e.fertile && e.color !== "golden").slice(0, 12); if (!eggs.length) return toast("You need fertile eggs in your basket (get a rooster!)");
  S.basket = S.basket.filter(e => !eggs.includes(e));
  const code = mkCode("CCG", { t: "eggs", e: eggs.map(e => [e.color, e.breed, e.sire]), f: (S.player || "A friend").slice(0, 24), id: Math.random().toString(36).slice(2, 10) });
  renderAll(); giftReady(code, `${eggs.length} hatching egg${eggs.length > 1 ? "s" : ""}`); };
function giftReady(code, what) { const url = `${baseURL()}#gift=${code}`;
  modal(`<h2>🎁 Gift ready!</h2><p>Send ${esc(what)} to a friend. They open the link (or paste the code in Goals → Trade).</p><textarea class="code" readonly onclick="this.select()">${code}</textarea>
   <button class="buy big" onclick='shareGift(${JSON.stringify(url)})'>📤 Share gift link</button><button class="act big" onclick="closeModal()">Done</button>`);
  say("I'm regifting a chicken. Is that allowed? It feels allowed. <i>Tip: real flocks should quarantine new birds for about 30 days before mixing them in.</i>", 1); }
window.shareGift = url => shareOut("A Coup City gift", "I sent you a gift for your Coup City farm! 🎁🐔", url);
function redeem(str) { const r = readCode(str); if (!r) return toast("That code doesn't look right.");
  if (r.kind === "CCV") return visitModal(r.o);
  const o = r.o, used = redeemed(); if (used.includes(o.id)) return toast("This gift was already opened on this device.");
  if (o.t === "hen") { if (!CH[o.b]) return toast("Unknown breed in this gift."); if (S.hens.length >= capacity()) return toast(`Your coop is full (${capacity()}). Upgrade it, then open the gift!`);
    const h = addHen(o.b, true, !!o.m); h.name = String(o.n || h.name).slice(0, 32); if (PERS[o.p]) h.pers = o.p; if (S.hens.length > 1) setCond(h, "newbie", 2); toast(`🎁 ${o.f || "A friend"} sent you ${h.name}!`); }
  else if (o.t === "eggs") { const eggs = (o.e || []).filter(e => EGG_COLORS[e[0]] && CH[e[1]]).slice(0, 12); eggs.forEach(e => S.basket.push({ color: e[0], breed: e[1], fertile: true, sire: ROOS[e[2]] ? e[2] : e[1] })); toast(`🎁 ${o.f || "A friend"} sent you ${eggs.length} hatching eggs! They're in your basket.`); }
  else return toast("Unknown gift.");
  used.push(o.id); try { localStorage.setItem("coopcity-redeemed", JSON.stringify(used.slice(-200))); } catch (e) {} S.stats.gotGifts = (S.stats.gotGifts || 0) + 1; closeModal(); renderAll(); wander(); }
window.redeemInput = () => redeem($("#codeIn").value);

/* ---------- GOAL BAR + GOALS / BOOK / TRADE ---------- */
function nextGoal() { return GOALS.find(g => !S.goals[g[0]]); }
let gbSig = "";
function renderGoalbar() {
  const g = nextGoal(), dqLeft = S.dq.filter(q => !q.done).length, need = xpNeed(S.lvl);
  const sig = [S.lvl, Math.round(S.xp / need * 100), g && g[0], dqLeft, S.event, S.stats.safeNights, S.player].join("|"); if (sig === gbSig) return; gbSig = sig;
  $("#lvN").textContent = S.lvl; $("#xpFill").style.transform = `scaleX(${Math.min(1, S.xp / need).toFixed(3)})`;
  $("#dqN").textContent = dqLeft ? `🎯${dqLeft}` : "🎯✓";
  $("#evChip").textContent = (S.event ? EVENTS[S.event][0] : "") + (HOL ? HOL.hat : "") + "";
}
let gTab = "today";
const gTabs = ["today", "badges", "book", "trade"];
function goalsModal() { if (!gTabs.includes(gTab)) gTab = "today";
  const tabs = [["today", "🎯 Today"], ["badges", "🏅 Badges"], ["book", "📖 Book"], ["trade", "🎁 Trade"]].map(([k, l]) => `<button class="${gTab === k ? "on" : ""}" onclick="gTabSet('${k}')">${l}</button>`).join("");
  let body = "";
  if (gTab === "today") body = `<p>⭐ Farm level <b>${S.lvl}</b> · ${S.xp}/${xpNeed(S.lvl)} XP · next level +${10 + 5 * (S.lvl + 1)}🪙</p>`
    + S.dq.map(q => `<div class="row"><span style="font-size:24px">${DQ[q.k][0]}</span><div class="t"><b>${DQ[q.k][1](q.n)}</b><br>${Math.min(q.n, S.today[q.k] || 0)}/${q.n}</div><button class="buy" disabled>${q.done ? "✓" : "+" + q.r + "🪙"}</button></div>`).join("")
    + `<p style="font-size:13px">Finish all 3 for a +10🪙 sweep bonus. New quests every game day.</p>`
    + `<p>☀️ Morning bonus: <b>${mornBonus()}🪙</b> (grows with every safe night) · 🛡️ Safe nights: <b>${S.stats.safeNights}</b><br>📆 Days you've farmed: <b>${S.login.days || 1}</b>. Nothing here ever resets, and time pauses when you leave.</p>`
    + (S.event ? `<p class="demo">${EVENTS[S.event].join(" ")}</p>` : "") + (HOL ? `<p class="demo">${HOL.name}: ${HOL.line}</p>` : "") + `<p style="font-size:13px">${realSeason()[0]} It's ${realSeason()[1].toLowerCase()} (follows your real calendar).</p>`;
  else if (gTab === "badges") body = `<p>${Object.keys(S.goals).length}/${GOALS.length} badges</p><div class="badges">` + GOALS.map(([k, ic, t, , r]) => `<div class="bdg ${S.goals[k] ? "got" : ""}"><span>${S.goals[k] ? ic : "🔒"}</span><small>${t}</small><em>+${r}🪙</em></div>`).join("") + `</div>`;
  else if (gTab === "book") { const all = Object.keys(CH), seen = all.filter(k => S.seen[k]).length, cols = [...Object.keys(EGG_COLORS)];
    body = `<p><b>Breeds</b> ${seen}/${all.length}</p><div class="book">` + all.map(k => `<div class="${S.seen[k] ? "" : "unseen"}">${henSVG(k)}<small>${S.seen[k] ? CH[k].name : "???"}</small></div>`).join("") + `</div>`
      + `<p><b>Egg colors</b> ${cols.filter(c => S.collection[c]).length}/${cols.length}</p><div class="book eggs">` + cols.map(c => `<div class="${S.collection[c] ? "" : "unseen"}">${eggSVG(c)}<small>${S.collection[c] ? `${EGG_COLORS[c].label} ×${S.collection[c]}` : "???"}</small></div>`).join("") + `</div>`; }
  else if (gTab === "trade") body = `<p><b>Visit + trade with friends.</b> No account needed: it all travels in a link.</p>
    <button class="buy big" onclick="shareFarm()">🏡 Share my farm (view-only link)</button>
    <button class="buy big" ${S.basket.some(e => e.fertile) ? "" : "disabled"} onclick="giftEggs()">🥚 Gift hatching eggs (${Math.min(12, S.basket.filter(e => e.fertile).length)})</button>
    <p style="font-size:13px">To gift a hen, tap her card and choose 🎁 Gift.</p>
    <p><b>Got a code?</b></p><textarea id="codeIn" class="code" placeholder="Paste a farm or gift code"></textarea><button class="buy big" onclick="redeemInput()">Open code</button>
    <p class="demo">Codes work offline and each gift opens once per device. Live neighbors would need a server later.</p>`;
  else body = `<p><b>Your farmer name</b></p><div class="namerow"><input id="playerIn" maxlength="24" value="${esc(S.player)}" placeholder="Your name"><button class="buy" onclick="setPlayer()">Save</button></div>
    <p>Charlie is your clueless neighbor and guide. You're the one in charge.</p>
    <button class="act big" onclick="toggleMusic()">${musicOn ? "🎵 Music on" : "🎵 Music off"}</button>
    <button class="act big" onclick="toggleSound()">${soundOn ? "🔊 Farm sounds on" : "🔇 Farm sounds off"}</button>
    <button class="act big" onclick="resetGame('farm')">🌱 Start a new farm…</button><p style="font-size:12px">Progress saves automatically on this device.</p>`;
  modal(`<h2>🐔 ${esc(S.player ? S.player + "'s farm" : "My farm")}</h2><div class="tabs">${tabs}</div>${body}<button class="act big" onclick="closeModal()">Close</button>`);
}
window.goalsModal = goalsModal; window.gTabSet = k => { gTab = k; goalsModal(); };
window.setPlayer = () => { S.player = $("#playerIn").value.trim().slice(0, 24); toast(S.player ? `Hi, ${S.player}!` : "Name cleared", 1); gbSig = ""; renderAll(); settingsModal(); };
let resetFrom = "settings";
window.resetGame = from => { resetFrom = from || "settings"; const sv = S && S.started ? S : loadSave(); if (!sv) return title();
  const hn = (sv.hens || []).length, farm = sv.player ? `${esc(sv.player)}'s farm` : "your farm";
  modal(`<h2>🌱 Start a new farm?</h2><div class="resetsum"><div class="guyMini">${guySVG}</div><p><b>Charlie:</b> This erases <b>${farm}</b>, Day ${sv.day || 1}, ${hn} ${hn === 1 ? "hen" : "hens"}${sv.rooster ? " and " + esc(sv.rooster.name) : ""}. Start over?</p></div>
   <p class="hint">Eggs, coins, badges, and the tutorial all reset. Your music and sound settings stay the same. This can't be undone.</p>
   <button class="buy big cull" id="resetYes" onclick="doReset()">🗑️ Erase &amp; start over</button><button class="act big" id="resetNo" onclick="keepFarm()">💛 Keep my farm</button>`); };
window.keepFarm = () => resetFrom === "title" ? title() : resetFrom === "farm" ? (gTab = "farm", goalsModal()) : settingsModal();
window.doReset = () => { // stop everything first so pagehide/visibilitychange can't write the old farm back
  try { stopLoop(); } catch (e) {} clearTimeout(timer); clearInterval(wtimer); if (S) S.started = false;
  try { ["coopcity-save-v1", "coopcity-fbask", "coopcity-fbsent"].forEach(k => localStorage.removeItem(k)); } catch (e) {}
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} location.reload(); };

/* ---------- INPUT ---------- */
function setTool(k) { tool = k; renderTools(); $("#grid").classList.toggle("placing", k !== "hand" && k !== "bulldoze"); $("#grid").classList.toggle("removing", k === "bulldoze"); }
$("#tools").addEventListener("click", e => { const b = e.target.closest(".tool"); if (!b) return; buzz(8); const k = b.dataset.t; setTool(k === tool && k !== "hand" ? "hand" : k);
  if (tool === "hand") return toast("✋ Hand: tap things in the yard", 1);
  if (tool === "bulldoze") { toast("🧹 Tap something you built to remove it", 1); return; }
  const it = ITEMS[tool]; toast(S.coins < it.cost ? `${it.name} costs ${it.cost}🪙. Sell some eggs first!` : `Tap an empty grass spot to build a ${it.name.toLowerCase()} (${it.cost}🪙)`, 1); if (it.tip) say(`${it.name}: ${it.tip}`, 1); });
window.tileTap = tileTap;
function tileTap(target) {
  const eg = target.closest("[data-egg]");
  if (eg) return collect(+eg.dataset.egg);
  const sg = target.closest("[data-plot]"); if (sg) return plotModal(sg.dataset.plot);
  const t = target.closest(".tile"); if (!t) return; tapFX(t); let i = +t.dataset.i, g = S.grid[i];
  if (!owned(i)) return plotModal(plotOf(i));
  if (g && g.type === "annex") { i = g.of; g = S.grid[i]; }
  if (tool === "hand") {
    if (g && g.type === "feeder") {
      if (g.lvl >= 95) { toast("🌾 Feeder is already full 👍", 1); return; }
      if (S.feed < 1) { say("The feed bag is empty! <i>Tip: buy a bag of layer feed in the 🛒 Shop under 🌾 Supplies.</i>", 1); toast("🌾 Out of feed! Opening Shop → Supplies", 1); shopTab = "supplies"; setTimeout(shop, 500); return; }
      S.feed--; g.lvl = 100; floatAt(i, "🌾 full!"); bump("refill"); sfx("pour");
      toast(S.feed <= 1 ? `Feeder filled! -1 scoop (${S.feed} left: buy more in Shop → Supplies)` : `Feeder filled! -1 scoop (${S.feed} left)`, 1); }
    else if (g && g.type === "waterer") { if (g.lvl >= 95) { toast("💧 Water's already fresh 👍", 1); return; } g.lvl = 100; floatAt(i, "💧 full!"); bump("refill"); sfx("pour"); toast("💧 Waterer filled! Fresh water", 1); }
    else if (g && g.type === "coop") return toggleLock();
    else if (g && g.type === "incubator") return incubatorModal();
    return renderAll();
  }
  if (tool === "bulldoze") { if (g && g.type === "incubator" && (S.incub.length || S.chicks.length)) return toast("Empty the incubator first");
    if (g && g.fixed) return toast("That's part of the land. It stays!");
    if (g && g.type === "coop") { S.grid.forEach((x, j) => { if (x && x.type === "annex") S.grid[j] = null; }); if (S.coopLvl) { S.coopLvl = 0; toast("Coop removed. Upgrades lost."); } }
    if (!g) return toast("Nothing to remove there");
    if (["coop", "feeder", "waterer"].includes(g.type) && tilesOf(g.type).length === 1 && !window._rmOK) return modal(`<h2>Remove the ${ITEMS[g.type].name.toLowerCase()}?</h2><p>Your hens need ${g.type === "coop" ? "a coop to sleep in" : g.type === "feeder" ? "a feeder" : "water"}. You'll get ${Math.floor(ITEMS[g.type].cost / 2)}🪙 back.</p><button class="buy big cull" onclick="window._rmOK=1;closeModal();tileTap(document.querySelector('.tile[data-i=\'${i}\']'));window._rmOK=0">Remove it</button><button class="act big" onclick="closeModal()">Keep it</button>`);
    S.coins += Math.floor(ITEMS[g.type].cost / 2); S.grid[i] = null; floatAt(i, "removed"); setTool("hand"); renderAll(); return; }
  if (g) return toast("Something's already there");
  const it = ITEMS[tool];
  if (it.max && tilesOf(tool).length >= it.max) return toast(`One ${it.name.toLowerCase()} is plenty for now`);
  if (S.coins < it.cost) return toast("Not enough coins. Sell some eggs!");
  S.coins -= it.cost; S.grid[i] = { type: tool, lvl: 100 }; floatAt(i, `-${it.cost}🪙`); if (tool !== "run") S.bugs = S.bugs.filter(b => b.tile !== i); buzz(20); sfx("lvl");
  setTimeout(() => { const tt = $("#grid").children[i]; if (tt) { tt.classList.add("built"); setTimeout(() => tt.classList.remove("built"), 700); } const p = tilePos(i); for (let k = 0; k < 6; k++) particle(k % 2 ? "✨" : "💨", p.x + Math.random() * 8, p.y + 2 + Math.random() * 6, 2); }, 0);
  const built = tool; if (!["fence", "run"].includes(built)) setTool("hand");
  if (!S.said["built_" + built]) { S.said["built_" + built] = 1; say(`${it.joke} <i>${it.tip}</i>`, 1); }
  renderAll(); wander();
}
function collect(k) {
  const e = S.ground.splice(k, 1)[0]; S.basket.push(e); S.lifetime++; bump("eggs"); xp(2);
  S.collection[e.color] = (S.collection[e.color] || 0) + 1; floatAt(e.tile, "+1 🥚"); sfx("egg"); buzz(15);
  const et = $("#grid").children[e.tile]; if (et) { const r = et.getBoundingClientRect(), pt = [r.x + r.width / 2, r.y + r.height / 2]; sparkle(pt[0], pt[1]); flyTo("🥚", pt, "#eggStat", 1); }
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
function henTap(el) { sfx("cluck"); el.classList.remove("poke"); void el.offsetWidth; el.classList.add("poke");
  if (el.dataset.roo) return say(`<b>${S.rooster.name}</b> the ${ROOS[S.rooster.breed].name}: ${ROOS[S.rooster.breed].blurb} <i>${ROO_FACT}</i>`, 1);
  const h = S.hens.find(x => x.id == el.dataset.h); if (!h) return; bump("pet");
  if (h.pers === "cuddly" || Math.random() < 0.5) { h.happy = Math.min(100, h.happy + (h.pers === "cuddly" ? 5 : 2)); particle("💛", h.x + 7, h.y, 0); }
  const P = PERS[h.pers]; say(`<b>${h.name}</b> the ${CH[h.breed].name} (${P[0]} ${P[1]}): ${P[2]} <i>${CH[h.breed].fact}</i>`, 1); renderAll(); }

/* ---------- SELL / SHOP / SHARE ---------- */
function counts(list) { const c = {}; list.forEach(e => c[e.color] = (c[e.color] || 0) + 1); return c; }
$("#sellBtn").onclick = () => {
  const c = counts(S.basket); const total = S.basket.reduce((a, e) => a + eggPrice(e), 0);
  modal(`<h2>💰 Farmers market</h2><p>Charlie set up a folding table outside his apartment. Fancy colors sell for more.</p>${S.event === "market" || S.event === "contest" ? `<p class="demo">${EVENTS[S.event].join(" ")}</p>` : ""}
   ${Object.keys(c).map(k => `<div class="row">${eggSVG(k)}<div class="t"><b>${EGG_COLORS[k].label}</b> × ${c[k]}<br>${eggPrice({ color: k })}🪙 each</div></div>`).join("") || "<p><i>Your basket is empty. Tap eggs in the yard to collect them.</i></p>"}
   <button class="buy big" id="sellAllBtn" ${total ? "" : "disabled"} onclick="sellAll()">Sell all for ${total}🪙</button>
   <button class="buy big" onclick="shareCard()">📸 Share my egg rainbow</button>
   <button class="act big" onclick="closeModal()">Close</button>`);
};
window.sellAll = () => { const t = S.basket.reduce((a, e) => a + eggPrice(e), 0), n = S.basket.length; if (!n) return;
  const fancy = S.event === "contest" && !S.contestWon && S.basket.some(e => !["white", "brown"].includes(e.color));
  S.stats.sold += n; bump("sell", n); xp(Math.ceil(n / 2)); S.basket = []; closeModal(); gain(t, `Sold ${n} egg${n > 1 ? "s" : ""}! +${t}🪙`, centerOf("#sellBtn"));
  if (fancy) { S.contestWon = true; setTimeout(() => { gain(15, "🏆 Your egg won the contest! +15🪙"); renderHUD(); }, 1400); }
  renderAll(); };
let shopTab = "hens";
function shop() {
  const tabs = `<div class="tabs">${[["hens","🐔 Hens"],["coop","🏠 Coop"],["guard","🛡️ Guard"],["supplies","🌾 Supplies"],["premium","⭐ Extras"],["quiz","❓ Quiz"]].map(([k,l])=>`<button class="${shopTab===k?"on":""}" onclick="shopTab('${k}')">${l}</button>`).join("")}</div>`;
  let body = "";
  if (shopTab === "hens") {
    body = Object.entries(CH).filter(([k, b]) => !b.hatchOnly).map(([k, b]) => `<div class="row">${henSVG(k)}<div class="t"><b>${b.name}</b> lays ${b.eggs.map(c => EGG_COLORS[c].label.toLowerCase()).join(" or ")}<br>${b.blurb}</div>
      ${lockedLv(k) ? `<button class="buy" disabled>🔒 Lv ${UNLOCK[k]}</button>` : `<button class="buy" ${S.coins < b.price ? "disabled" : ""} onclick="buyHen('${k}')">${b.price ? b.price + "🪙" : "Free"}</button>`}</div>`).join("")
      + `<p style="margin-top:10px"><b>🐓 Roosters</b> (max 1 · guards the flock · needed for chicks)</p>` + Object.entries(ROOS).map(([k, r]) => `<div class="row">${henSVG("roo:" + k)}<div class="t"><b>${r.name}</b> <span class="gstat">📢${stars(r.guard.alarm)} 💪${stars(r.guard.fight)}</span><br>${r.blurb}</div>
      ${lockedLv("roo:" + k) ? `<button class="buy" disabled>🔒 Lv ${UNLOCK["roo:" + k]}</button>` : `<button class="buy" ${S.coins < r.price || S.rooster ? "disabled" : ""} onclick="buyRooster('${k}')">${S.rooster && S.rooster.breed === k ? "Owned" : r.price + "🪙"}</button>`}</div>`).join("")
      + `<p style="font-size:12px">📢 = spots danger and sounds the alarm · 💪 = fights off predators</p>`
      + Object.values(SPECIES).filter(s => s.comingSoon).map(s => `<div class="row" style="opacity:.6"><span style="font-size:36px">${s.icon}</span><div class="t"><b>${s.name} 🔒</b><br>${s.teaser}</div></div>`).join("");
  } else if (shopTab === "coop") {
    body = `<p>🏠 ${has("coop") ? `<b>${COOPS[S.coopLvl].name}</b> (level ${S.coopLvl + 1})` : "<b>No coop built</b>"} · 🐔 ${S.hens.length}/${capacity()} hens</p>`
      + COOPS.map((c, i) => `<div class="row"><span style="font-size:30px">${["🛖","🏠","🏚️"][i]}</span><div class="t"><b>${c.name}</b> · ${c.cap} hens<br>${i ? `Stays clean ${Math.round((1 - c.dirt) * 100)}% longer.` : "Where every city chicken starts."}</div>
        ${i <= S.coopLvl ? `<button class="buy" disabled>${i === S.coopLvl ? "Yours" : "✓"}</button>` : i === S.coopLvl + 1 ? `<button class="buy" ${S.coins < c.cost || !has("coop") ? "disabled" : ""} onclick="upgradeCoop()">${c.cost}🪙</button>` : `<button class="buy" disabled>🔒 ${c.cost}🪙</button>`}</div>`).join("")
      + `<p style="font-size:12px"><i>Tip:</i> without a coop you can keep 3 hens. Upgrade one level at a time.</p>`;
  } else if (shopTab === "guard") {
    body = `<p>Lock the coop every night, then add layers. <b>${Object.keys(S.def).length}</b>/${DEF.length} installed.</p>` + DEF.map(([k, ic, t, p, d]) => `<div class="row"><span style="font-size:28px">${ic}</span><div class="t"><b>${t}</b><br>${d}</div>
      ${S.def[k] ? `<button class="buy" disabled>✓</button>` : lockedLv(k) ? `<button class="buy" disabled>🔒 Lv ${UNLOCK[k]}</button>` : `<button class="buy" ${S.coins < p ? "disabled" : ""} onclick="buyDef('${k}')">${p}🪙</button>`}</div>`).join("")
      + `<p style="font-size:12px"><i>Tip:</i> chicken wire keeps chickens in, but it doesn't keep predators out. Hardware cloth does.</p>`;
  } else if (shopTab === "supplies") {
    body = `<p>🌾 Feed: <b>${S.feed}</b> ${S.feed === 1 ? "scoop" : "scoops"} · 🧹 Coop: <b>${Math.round(S.clean)}%</b> clean</p>` + SUPPLIES.map(([k, t, d, p]) => `<div class="row"><div class="t"><b>${t}</b><br>${d}</div><button class="buy" ${S.coins < p ? "disabled" : ""} onclick="buySupply('${k}')">${p}🪙</button></div>`).join("");
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
const stars = v => "★".repeat(Math.round(v * 4)) + "☆".repeat(4 - Math.round(v * 4));
const SUPPLIES = [["feed", "🌾 Bag of layer feed", "10 scoops. Each scoop fills a feeder once.", 12],
  ["shavings", "🪵 Pine shavings", "Clean out the coop and put down fresh bedding.", 6],
  ["oyster", "🐚 Oyster shell", "Extra calcium for strong eggshells. Gives every hen a small health boost.", 5]];
window.buySupply = k => { const it = SUPPLIES.find(x => x[0] === k); if (S.coins < it[3]) return toast("Not enough coins. Sell some eggs!");
  if (k === "shavings" && !has("coop")) return toast("Build a coop first!");
  S.coins -= it[3];
  if (k === "feed") { S.feed += 10; toast("+10 scoops of feed"); sayOnce("boughtfeed", "Fifty pounds of chicken cereal. My trunk smells like a barn now.", 1); }
  if (k === "shavings") { S.clean = 100; toast("Coop cleaned! Fresh bedding."); sayOnce("cleaned", "I cleaned the coop. I have seen things. <i>Tip: clean bedding keeps hens healthy.</i>", 1); }
  if (k === "oyster") { S.calcium = S.day; S.hens.forEach(h => h.health = Math.min(100, h.health + 10)); toast("Hens got their calcium"); sayOnce("oyster", "I'm feeding them... seashells? <i>Fact: laying hens need extra calcium, and crushed oyster shell is a common source.</i>", 1); }
  shop(); renderAll(); };
window.shopTab = k => { shopTab = k; shop(); };
window.upgradeCoop = () => { const n = S.coopLvl + 1, c = COOPS[n]; if (!c || !has("coop")) return toast("Build a coop first!"); if (S.coins < c.cost) return toast("Not enough coins. Sell some eggs!");
  const tl = coopFit(n); if (tl === null) return toast(`The ${c.name} needs ${n === 1 ? "a free tile beside" : "a free 2x2 space around"} the coop. Clear some space first!`);
  S.coins -= c.cost; coinPop(-c.cost); S.coopLvl = n; placeCoop(tl, n); closeModal(); toast(`Upgraded to ${c.name}! Room for ${c.cap} hens.`); say(`${c.joke} <i>Tip: ${c.tip}</i>`, 1); renderAll(); buildFX(tl); xp(8); };
function buildFX(tl) { const t = $("#grid").children[tl], art = t && t.querySelector(".coopart"); if (art) { art.classList.add("buildup"); art.addEventListener("animationend", () => art.classList.remove("buildup"), { once: true }); }
  const p = tilePos(tl), w = [8, 25, 25][S.coopLvl], h = [8, 8, 25][S.coopLvl]; beep("lvl");
  for (let k = 0; k < 12; k++) setTimeout(() => particle(k % 3 ? "💨" : "✨", p.x + Math.random() * w, p.y + h * 0.6 + Math.random() * h * 0.5, 2), k * 60);
  recenter(); }
window.buyRooster = k => { const r = ROOS[k]; if (S.rooster) return toast("One rooster is plenty. Trust the neighbors on this.");
  if (S.coins < r.price) return toast("Not enough coins. Sell some eggs!");
  if (lockedLv("roo:" + k)) return; S.coins -= r.price; coinPop(-r.price); S.rooster = { name: { ayam: "Vlad", leghorn: "Kevin", barnyard: "Rocky" }[k], breed: k, x: 45, y: 45, flip: false }; closeModal(); toast(`Welcome, ${S.rooster.name} the ${r.name}!`);
  say(`I got a rooster named ${S.rooster.name}. He is VERY confident. <i>Fact: ${ROO_FACT} From now on your eggs are fertile. Same-breed pairs hatch purebred chicks; other pairs hatch mixes.</i>`, 1); renderAll(); wander(); };
window.buyHen = k => { const b = CH[k]; if (S.coins < b.price) return; if (S.hens.length >= capacity()) return toast(`Coop is full (${capacity()} hens max). Upgrade it in the Shop!`); if (lockedLv(k)) return; S.coins -= b.price; coinPop(-b.price); const had = S.hens.length, h = addHen(k); closeModal(); toast(`Welcome, ${h.name} the ${b.name}!`); say(`New hen! ${b.fact}`, 1);
  if (had) setCond(h, "newbie", 2); renderAll(); wander(); };
window.mockPay = (t, p) => modal(`<h2>Demo checkout</h2><p><b>${t}</b> · ${p}</p><p class="demo">This is a prototype. No payment is taken.</p><button class="buy big" onclick="shopTab('premium')">Back to shop</button>`);
window.answer = i => { const q = QUIZ[S.quizI % QUIZ.length]; const right = i === q[2]; if (right) S.coins += 3;
  document.getElementById("qa").innerHTML = `${right ? "✅ Correct! +3🪙" : "❌ Not quite."} ${q[3]}<br><button class="buy big" onclick="nextQ()">Next question</button>`; renderHUD(); };
window.nextQ = () => { S.quizI++; shop(); };
$("#shopBtn").onclick = shop;
window.shareCard = e => {
  const c = Object.keys(S.collection);
  const headline = e ? `My hen ${e.hen} laid a ${EGG_COLORS[e.color].label.toLowerCase()} egg!` : `My Coup City egg rainbow`;
  const henB = e ? e.breed : (S.hens[0] || { breed: "leghorn" }).breed;
  const fun = e && e.breed === "ayam" ? "Plot twist: the all-black hen lays CREAM eggs. 🖤🥚" : e ? CH[e.breed].fact : `${S.lifetime} eggs collected so far.`;
  modal(`<div class="share"><div style="width:110px;margin:0 auto">${henSVG(henB)}</div><h3>${headline}</h3>
   <div class="eggrow">${(e ? [e.color] : c).map(k => eggSVG(k, k === "chocolate")).join("")}</div><p>${fun}</p><p style="font-size:12px">🐔 Coup City · Day ${S.day}</p></div>
   <button class="buy big" onclick="navigator.clipboard&&navigator.clipboard.writeText('${headline.replace(/'/g,"")} #CoupCity');toast('Copied! (demo)')">📤 Share</button>
   <button class="act big" onclick="closeModal()">Back to the yard</button>`);
};
window.toast = toast;

/* ---------- HEN DETAILS: SELL / CULL ---------- */
function henModal(id) {
  const h = S.hens.find(x => x.id == id); if (!h) return;
  const b = CH[h.breed];
  const P = PERS[h.pers] || PERS.chatty, c = h.cond && COND[h.cond.k];
  const care = !c ? "" : `<div class="care"><b>${c[0]} ${c[1]}</b>${h.cond.k === "broody" && S.incub.some(e => e.hen === h.name) ? " · sitting on eggs" : ""}<br><small>${c[2]}</small><br><small><i>Tip: ${c[5]}</i></small>
     ${h.cond.k === "broody" ? (S.incub.some(e => e.hen === h.name) ? "" : `<button class="buy big" onclick="careHen('${h.id}','hatch')">🪺 Let her hatch fertile eggs (${S.basket.filter(e => e.fertile).length})</button><button class="act big" onclick="careHen('${h.id}','break')">Break the broodiness</button>`)
       : c[3] ? `<button class="buy big" onclick="careHen('${h.id}')">${c[3]}${c[4] ? " · " + c[4] + "🪙" : ""}</button>` : ""}</div>`;
  modal(`<h2>${esc(h.name)}</h2><div style="width:90px;margin:0 auto">${henSVG(h.breed)}</div>${nameRow(h.id)}${care}
   <p>${P[0]} <b>${P[1]}</b>: ${P[2]}</p>
   <p><b>${breedLabel(h)}</b> · lays ${b.eggs.map(c => EGG_COLORS[c].label.toLowerCase()).join(" or ")}</p>
   <p>Age: <b>${h.age || 0}</b> days${isOld(h) ? ` · <span class="old">older</span> (lays half as often)` : ""}<br>Health ${Math.round(h.health)}% · Happiness ${Math.round(h.happy)}%</p>
   <p style="font-size:13px">${b.fact}</p>
   <button class="act big" onclick="giftHen('${h.id}')">🎁 Gift her to a friend</button>
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
const rooValue = () => Math.max(3, Math.round(ROOS[S.rooster.breed].price * 0.4));
// Rename row with a dice button for funny names
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const nameRow = id => `<div class="namerow"><input id="nameIn" maxlength="32" value="${esc(id === "roo" ? S.rooster.name : S.hens.find(h => h.id == id).name)}" aria-label="Name"><button class="act" onclick="diceName()" title="Random funny name">🎲</button><button class="buy" onclick="rename('${id}')">Save</button></div>`;
window.diceName = () => { $("#nameIn").value = funnyName(); };
window.rename = id => { const v = $("#nameIn").value.trim().slice(0, 32); if (!v) return; if (id === "roo") { S.rooster.name = v; roosterModal(); } else { const h = S.hens.find(x => x.id == id); if (!h) return; h.name = v; henModal(h.id); } toast(`Renamed to ${v}!`); renderAll(); };
function roosterModal() {
  if (!S.rooster) return;
  const r = ROOS[S.rooster.breed];
  modal(`<h2>${S.rooster.name} the rooster</h2><div style="width:90px;margin:0 auto">${rooSVG()}</div>${nameRow("roo")}<p><b>${r.name}</b> · ${r.blurb}</p>
   <p>📢 Alarm ${stars(r.guard.alarm)} · 💪 Fight ${stars(r.guard.fight)}<br><small>Predators driven off: ${S.stats.rooWins}</small></p><p style="font-size:13px"><i>Tip: roosters watch the sky, sound an alarm call so hens run for cover, and often fight to protect them. ${ROO_FACT}</i></p>
   <button class="buy big" onclick="confirmRooster()">🤝 Rehome him with a neighbor · ${rooValue()}🪙</button><button class="act big" onclick="closeModal()">Keep him</button>`);
}
window.confirmRooster = () => modal(`<h2>Are you sure?</h2><p>Rehome ${S.rooster.name} for ${rooValue()}🪙? New eggs won't be fertile without him.</p><button class="buy big" onclick="rehomeRooster()">Yes, rehome him</button><button class="act big" onclick="closeModal()">Cancel</button>`);
window.rehomeRooster = () => { const n = S.rooster.name; const v = rooValue(); S.rooster = null; S.coins += v; closeModal(); toast(`${n} moved to a farm. +${v}🪙`); say("It's so quiet at 5am now. I almost miss him. Almost.", 1); renderAll(); };

/* ---------- INCUBATOR / NURSERY ---------- */
function incubateDay() {
  S.incub.forEach(e => e.days--);
  const done = S.incub.filter(e => e.days <= 0); S.incub = S.incub.filter(e => e.days > 0);
  let born = 0, duds = 0;
  done.forEach(e => { if (Math.random() < HATCH_RATE) { born++; S.hatched++; const c = chickOf(e.breed, e.sire); S.chicks.push({ id: Math.random(), ...c, age: 0, pasty: Math.random() < 0.25 }); S.seen[c.breed] = 1;
    if (c.breed === "zombie") sayOnce("zombie", `A ZOMBIE CHICKEN! It's black with white patches and it's adorable. <i>${CH.zombie.fact}</i>`, 1);
    if (c.breed === "mime") sayOnce("mime", `It hatched and didn't make a single sound. Just stared at me. Then... peep. It's a Mime chicken! 🎭 <i>${CH.mime.fact}</i>`, 1); } else { duds++; S.duds++; } });
  if (done.length) { toast(`🐣 ${born} chick${born === 1 ? "" : "s"} hatched${duds ? `, ${duds} egg${duds === 1 ? "" : "s"} didn't` : ""}!`);
    sayOnce("hatch", `THEY'RE ALIVE! Tiny peeping fluff balls! <i>Tip: not every egg hatches. Home incubator hatch rates vary a lot, and many backyard keepers are happy with 70-80%.</i>`, 1); }
  const grown = [];
  S.chicks.forEach(c => { if (c.pasty) return; c.age++; if (c.age >= CHICK_GROW_DAYS) { if (S.hens.length < capacity()) { addHen(c.breed, false, c.mix); grown.push(c); } else sayOnce("nursefull" + S.day, "A chick is all grown up but the coop is full! <i>Tip: upgrade your coop in the Shop, or sell a chick.</i>", 1); } });
  if (grown.length) { S.chicks = S.chicks.filter(c => !grown.includes(c)); toast(`${grown.length} chick${grown.length > 1 ? "s" : ""} grew up and joined the flock!`);
    sayOnce("grewup", `My baby is a hen now. I'm not crying, you're crying. <i>Tip: most breeds can't be sexed at hatch (auto-sexing breeds like Cream Legbar are the exception), so real hatches are about half roosters. In this game, all chicks are pullets.</i>`, 1); }
}
function incubatorModal() {
  const fert = S.basket.filter(e => e.fertile).length, room = INCUBATOR_CAP - S.incub.length;
  const slots = S.incub.map(e => `<div class="slot">${eggSVG(e.color, CH[e.breed].speckled)}<small>${e.days}d</small></div>`).join("") + Array(room).fill(`<div class="slot empty"></div>`).join("");
  const nursery = S.chicks.map(c => `<div class="row">${SPECIAL[c.breed] ? `<div class="chickart">${henSVG(c.breed)}</div>` : `<span style="font-size:30px">🐥</span>`}<div class="t"><b>${chickName(c)}</b>${SPECIAL[c.breed] ? `<br><small>${SPECIAL[c.breed][1]}</small>` : ""}<br>${c.pasty ? "💩 Pasty butt! Not growing until cleaned." : `Raising · grows up in ${Math.max(0, CHICK_GROW_DAYS - c.age)} day${CHICK_GROW_DAYS - c.age === 1 ? "" : "s"}`}</div>${c.pasty ? `<button class="buy" onclick="cleanChick('${c.id}')">🧽 Clean</button>` : `<button class="buy" onclick="sellChick('${c.id}')">Sell ${chickValue(c)}🪙</button>`}</div>`).join("") || `<p style="font-size:13px;opacity:.7">No chicks yet.</p>`;
  modal(`<h2>🥚 Incubator</h2><p>${S.incub.length}/${INCUBATOR_CAP} eggs · hatches in ${INCUBATE_DAYS} game days</p><div class="slots">${slots}</div>
   ${S.rooster ? "" : `<p class="demo">No rooster, no chicks. Buy a rooster in the 🛒 Shop so new eggs are fertile.</p>`}
   <button class="buy big" ${fert && room ? "" : "disabled"} onclick="loadIncubator()">Add fertile eggs from basket (${fert})</button>
   <p style="font-size:12px"><i>Tip:</i> real chicken eggs take about 21 days to hatch, kept at about 99.5°F with the right humidity and turned several times a day. Coup City speeds that up to ${INCUBATE_DAYS} days.</p>
   <h3 style="margin:10px 0 0">🐣 Nursery</h3>${nursery}
   <p style="font-size:12px">Chicks join the flock after ${CHICK_GROW_DAYS} days if the coop has room (${S.hens.length}/${capacity()}).</p>
   <button class="act big" onclick="closeModal()">Close</button>`);
}
window.incubatorModal = incubatorModal;
window.loadIncubator = () => { let n = 0;
  S.basket = S.basket.filter(e => { if (e.fertile && S.incub.length < INCUBATOR_CAP) { S.incub.push({ color: e.color, breed: e.breed, sire: e.sire, days: INCUBATE_DAYS }); n++; return false; } return true; });
  toast(`${n} egg${n === 1 ? "" : "s"} in the incubator`); sayOnce("incub", "I'm basically a chicken dad now. Do I need to sit on them? <i>Tip: the incubator does the hen's job: steady heat, humidity, and turning.</i>", 1);
  incubatorModal(); renderAll(); };
window.cleanChick = id => { const c = S.chicks.find(x => x.id == id); if (!c) return; c.pasty = false; S.stats.cared++; toast("Chick cleaned up! 🐥");
  sayOnce("pasty", "I just gave a baby chicken a butt bath with a warm washcloth. This is my life now. <i>Tip: 'pasty butt' is when droppings dry over a young chick's vent. Gently clean it with warm water; it can be serious if left.</i>", 1); incubatorModal(); renderAll(); };
window.sellChick = id => { const c = S.chicks.find(x => x.id == id); if (!c) return; const v = chickValue(c);
  S.chicks = S.chicks.filter(x => x !== c); S.coins += v; toast(`Sold a chick! +${v}🪙`);
  sayOnce("chicksale", "A family bought a chick for their kids. It's like a tiny adoption. <i>Tip: chicks need a warm brooder for their first few weeks.</i>", 1); incubatorModal(); renderAll(); };

/* ---------- BUILD 12: FEEDBACK ----------
   One short in-game form: a 1-5 face rating, one optional text box, an optional name. Build/day/hens/device/screen/time
   are attached automatically and shown to the player. Sent via FormSubmit's AJAX endpoint to Bill's inbox. The id below is
   FormSubmit's public alias for the address (made to sit in page source), not a secret. No account or email app for testers. */
const FB_URL = "https://formsubmit.co/ajax/12a3f1a139f9e46a7b40d92607d979d5";
const FB_FACES = [["😖", "Not fun"], ["😕", "Meh"], ["😐", "Okay"], ["🙂", "Fun"], ["😍", "Love it"]];
const fbLS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; };
let fb = null, fbBusy = 0, fbBack = null; // fbBack: where Close returns to (title card or Settings)
function fbDraft() { if (!fb) { let d = null; try { d = JSON.parse(fbLS("coopcity-fbdraft") || "null"); } catch (e) {} fb = Object.assign({ r: 0, msg: "", name: "" }, d || {}); if (!fb.name && S && S.player) fb.name = S.player; } return fb; }
function fbKeep() { if (fb) fbLS("coopcity-fbdraft", JSON.stringify({ r: fb.r, msg: fb.msg, name: fb.name })); }
function fbDevice() { const u = navigator.userAgent;
  const os = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1) ? "iPad" : /Android/.test(u) ? "Android" : /Windows/.test(u) ? "Windows" : /Mac OS X/.test(u) ? "Mac" : /CrOS/.test(u) ? "Chromebook" : /Linux/.test(u) ? "Linux" : "Other";
  const br = /EdgA?\//.test(u) ? "Edge" : /SamsungBrowser/.test(u) ? "Samsung Internet" : /CriOS|Chrome\//.test(u) ? "Chrome" : /FxiOS|Firefox\//.test(u) ? "Firefox" : /Safari\//.test(u) ? "Safari" : "Other";
  return os + " · " + br; }
function fbCtx() { const d = new Date(), sv = S && S.started ? S : loadSave();
  let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  return { Build: BUILD, Day: sv ? sv.day : "not started", Hens: sv ? (sv.hens || []).length + (sv.rooster ? " + rooster" : "") : 0, "Farm level": sv ? sv.lvl || 1 : "-",
    Tutorial: sv ? (sv.tut != null && sv.tut < TUT.length ? `step ${sv.tut + 1} of ${TUT.length}` : "done") : "-", "Scraps tossed": sv && sv.stats ? sv.stats.scraps || 0 : 0,
    Device: fbDevice(), Screen: `${screen.width}×${screen.height} @${Math.round((devicePixelRatio || 1) * 100) / 100}x`, Window: `${innerWidth}×${innerHeight}`,
    Sent: d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) + (tz ? ` (${tz})` : ""), "Sent (UTC)": d.toISOString(), "User agent": navigator.userAgent }; }
window.feedback = () => { fbDraft(); const cur = $("#modalCard"); fbBack = $("#modal").classList.contains("hidden") ? null : cur.querySelector(".title") ? "title" : cur.querySelector(".setrow") ? "settings" : fbBack; if (S && S.said) S.said.fbAsk = 1; fbLS("coopcity-fbask", "1"); $("#fbBtn") && $("#fbBtn").classList.remove("hey"); buzz(10);
  const c = fbCtx(), hn = parseInt(c.Hens) || 0, ctxLine = `${c.Build} · Day ${c.Day} · ${hn} ${hn === 1 ? "hen" : "hens"}${/rooster/.test(c.Hens) ? " + rooster" : ""} · ${c.Device} · ${c.Window}`;
  modal(`<h2>💬 Tell Bill what you think</h2><div class="fbform">
   <div class="intro fbintro"><div class="guyMini">${guySVG}</div><p class="say"><b>Charlie:</b> Bill made this game. He reads every note. Even the mean ones. <b>Especially</b> those.</p></div>
   <p class="fbq" id="fbQ">How's it going so far?</p>
   <div class="faces" role="radiogroup" aria-labelledby="fbQ">${FB_FACES.map(([e, l], i) => `<button type="button" class="face${fb.r === i + 1 ? " on" : ""}" role="radio" aria-checked="${fb.r === i + 1}" aria-label="${i + 1} of 5: ${l}" onclick="fbRate(${i + 1})"><span>${e}</span><small>${l}</small></button>`).join("")}</div>
   <label class="fbl" for="fbMsg">What did you like? What was confusing or annoying? <i>(optional)</i></label>
   <textarea id="fbMsg" maxlength="2000" rows="4" placeholder="Anything at all. Bugs, ideas, “the hawk is rude”…" oninput="fbType()">${esc(fb.msg)}</textarea>
   <label class="fbl" for="fbName">Your name <i>(optional)</i></label>
   <div class="namerow"><input id="fbName" maxlength="40" placeholder="So Bill knows who to thank" autocomplete="name" enterkeyhint="send" value="${esc(fb.name)}" oninput="fbType()"></div>
   <input type="text" id="fbHoney" tabindex="-1" autocomplete="off" aria-hidden="true" class="fbhp">
   <p class="fberr hidden" id="fbErr" role="alert"></p>
   <button type="button" class="buy big fbsend" id="fbSend" onclick="fbSend()">📨 Send to Bill</button>
   <p class="fbctx">Also sends: ${esc(ctxLine)}, and the time. Nothing else.</p>
   <button type="button" class="act big" onclick="fbClose()">Not now</button></div>`);
  fbState(); const m = $("#fbName"); m.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); fbSend(); } };
  $("#modalCard").querySelectorAll(".fbform textarea,.fbform input").forEach(el => el.addEventListener("focus", fbFocus)); };
window.fbClose = () => { fbKeep(); fbDone(); };
window.fbDone = () => { const to = fbBack; fbBack = null; if (to === "title" && !(S && S.started && !demoMode)) return title(); if (to === "settings") return settingsModal(); closeModal(); };
window.fbRate = r => { fbDraft(); fb.r = fb.r === r ? 0 : r; buzz(8); sfx("cluck"); $("#modalCard").querySelectorAll(".face").forEach((b, i) => { b.classList.toggle("on", fb.r === i + 1); b.setAttribute("aria-checked", fb.r === i + 1); }); fbKeep(); fbState(); };
window.fbType = () => { fbDraft(); const t = $("#fbMsg"), n = $("#fbName"); if (t) fb.msg = t.value; if (n) fb.name = n.value; fbKeep(); fbState(); };
function fbState(msg) { const b = $("#fbSend"), e = $("#fbErr"); if (!b) return; const ready = fb.r > 0 || fb.msg.trim().length > 0;
  b.disabled = fbBusy || !ready; b.classList.toggle("busy", !!fbBusy); b.innerHTML = fbBusy ? `<span class="spin"></span> Sending…` : ready ? "📨 Send to Bill" : "Pick a face or write a note";
  if (msg !== undefined && e) { e.innerHTML = msg; e.classList.toggle("hidden", !msg); } }
// iPhone keyboards cover the bottom of the page without resizing it, so keep the focused box and Send button in view
function fbFocus(ev) { const go = () => { const c = $("#modalCard"), s = $("#fbSend"), f = ev.target; if (!c || !s || !c.contains(f)) return; const vv = window.visualViewport, bot = vv ? vv.offsetTop + vv.height : innerHeight;
    const cr = c.getBoundingClientRect(), fr = f.getBoundingClientRect(), sh = s.offsetHeight; // Send is sticky at the card's bottom edge
    const floor = Math.min(cr.bottom, bot) - sh - 12, over = fr.bottom - floor; if (over > 0) c.scrollTop += Math.min(over, Math.max(0, fr.top - cr.top - 8)); };
  setTimeout(go, 60); setTimeout(go, 380); }
function kbFit() { const vv = window.visualViewport; if (!vv) return; const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)); document.documentElement.style.setProperty("--kb", (kb > 80 ? kb : 0) + "px"); }
if (window.visualViewport) { visualViewport.addEventListener("resize", kbFit); visualViewport.addEventListener("scroll", kbFit); }
window.fbSend = async () => { fbDraft(); if (fbBusy) return; const t = $("#fbMsg"), n = $("#fbName"); if (t) fb.msg = t.value; if (n) fb.name = n.value; fbKeep();
  if (!(fb.r > 0 || fb.msg.trim())) return fbState();
  if ($("#fbHoney") && $("#fbHoney").value) return fbThanks(); // bots fill hidden boxes; people don't
  const sig = fb.r + "|" + fb.msg.trim() + "|" + fb.name.trim(), last = JSON.parse(fbLS("coopcity-fblast") || "{}");
  if (last.sig === sig && Date.now() - last.at < 10 * 60e3) return fbThanks(1); // same note again: it already went
  const wait = Math.ceil((30e3 - (Date.now() - (last.at || 0))) / 1000); if (wait > 0) return fbState(`Bill's inbox needs a breather. Try again in ${wait} seconds.`);
  if (navigator.onLine === false) return fbState(`📵 You look offline. Your note is saved right here, so tap Send again when you're back online.`);
  fbBusy = 1; fbState(""); const c = fbCtx(), face = FB_FACES[fb.r - 1];
  const body = Object.assign({ _subject: `Coup City feedback${face ? `: ${fb.r}/5 (${face[1]})` : ""}, Day ${c.Day}${fb.name.trim() ? ", from " + fb.name.trim().slice(0, 40) : ""}` /* plain subject: emoji-heavy subjects get spam-filtered */, _template: "table", _captcha: "false",
    Rating: face ? `${fb.r}/5 ${face[0]} ${face[1]}` : "(no rating)", Feedback: fb.msg.trim() || "(no comment)", Name: fb.name.trim() || "(anonymous)" }, c);
  if (/^TEST from Chicken App/.test(fb.msg.trim())) body._subject = "TEST from Chicken App build 12: " + body._subject; // lets Bill filter test notes
  let ok = false, why = "";
  try { const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch(FB_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body), signal: ctl.signal }); clearTimeout(to);
    const j = await r.json().catch(() => ({})); ok = r.ok && String(j.success) === "true"; if (!ok) why = j.message || "HTTP " + r.status;
  } catch (e) { why = e.name === "AbortError" ? "timeout" : "network"; }
  fbBusy = 0; window.__fbLast = { ok, why };
  if (!ok) return fbState(why === "timeout" || why === "network" ? `📵 That didn't go through (the connection dropped). Your note is still here. Tap Send to try again.` : `😬 The mailbox hiccuped. Your note is still here. Tap Send to try again in a minute.`);
  fbLS("coopcity-fblast", JSON.stringify({ sig, at: Date.now() })); fbLS("coopcity-fbsent", String((+fbLS("coopcity-fbsent") || 0) + 1));
  fbThanks(); };
function fbThanks(dupe) { const nm = (fb && fb.name.trim()) || (S && S.player) || ""; fb = null; fbLS("coopcity-fbdraft", null); sfx("coin"); buzz([10, 40, 10]);
  modal(`<h2>💌 Sent!</h2><div class="bubblefull fbthanks"><div class="guyMini">${guySVG}</div><p><b>Charlie:</b> ${dupe ? "Bill already got that one. He's probably reading it right now with a very serious face." : `Thanks${nm && !/^bill$/i.test(nm.trim()) ? ", " + esc(nm) : ""}! It's on its way to Bill. I'd hand-deliver it, but the hens need me. He reads every single one.`}</p></div>
   <p class="hint">Got more to say later? 💬 is always in the corner of the yard and in ⚙️ Settings.</p>
   <button class="buy big" onclick="fbDone()">${fbBack === "title" && !(S && S.started && !demoMode) ? "Back" : fbBack === "settings" ? "Back to Settings" : "Back to the hens"}</button>`); }
// one gentle ask after a real first session (tutorial done + first scraps toss, or Day 2), once per device, never during anything busy
function fbAsk() { if (!S || !S.started || demoMode || S.said.fbAsk || fbLS("coopcity-fbask") || fbLS("coopcity-fbsent")) return;
  if (!(S.tut >= TUT.length) || !(S.stats.scraps >= 1 || S.day >= 2) || isNight() || threat || frzOn || !$("#modal").classList.contains("hidden")) return;
  const prevSay = $("#bubbleText").innerHTML, prevTip = $("#bubble").classList.contains("tip"); if (say(`Got a sec to tell Bill what you think? Tap 💬 down in the corner. Totally optional, the hens won't know.`, 0) === false) return;
  setTimeout(() => { if (/Got a sec to tell Bill/.test($("#bubbleText").innerHTML)) say(prevSay, prevTip); }, 25000);
  S.said.fbAsk = 1; sayHold = performance.now() + 8000; fbLS("coopcity-fbask", "1"); const b = $("#fbBtn"); if (b) { b.classList.remove("hey"); void b.offsetWidth; b.classList.add("hey"); } save(); }

/* ---------- START ---------- */
function title() {
  const sv = loadSave();
  modal(`<div class="title"><div class="logo"><div class="rays"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="hill"></div><div class="peek">${henSVG("leghorn")}</div><div class="peek p2">${henSVG("barred")}</div>
   <h1 aria-label="Coup City">${[..."Coup City"].map((c, i) => `<span style="--i:${i}"${i === 0 ? ' class="king"' : ""}>${i === 0 ? '<em class="crown" aria-hidden="true">👑</em>' : ""}${c === " " ? "&nbsp;" : c}</span>`).join("")}</h1></div>
   <div class="sub">Chickens for people who can't have chickens (yet).</div>
   <button class="pill" id="titleMusic" onclick="toggleMusic()"></button>
   ${sv && sv.hens ? `<button class="buy big cta" onclick="continueGame()">▶️ Continue${sv.player ? " as " + esc(sv.player) : ""} <small>Day ${sv.day}</small></button>
   <button class="act big newfarm" onclick="resetGame('title')">🌱 New farm</button>` : `<div class="intro"><div class="guyMini">${guySVG}</div><p class="say"><b>Charlie:</b> Hi, I'm Charlie, your neighbor. I just got chickens too and I have NO idea what I'm doing. What's your name?</p></div>
   <div class="namerow"><input id="playerIn" maxlength="24" placeholder="Your farmer name (optional)" enterkeyhint="done" autocomplete="given-name"></div>
   <h3>Pick your first hen</h3>
   ${["leghorn", "barred"].map(k => `<button class="henpick" onclick="start('${k}')">${henSVG(k)}<span class="t"><b>${CH[k].name}</b><small>${CH[k].blurb}</small></span><span class="go">Adopt</span></button>`).join("")}`}
   <button class="pill fbpill" onclick="feedback()">💬 Send feedback</button>
   <p class="foot">${realSeason()[0]} ${realSeason()[1]}${HOL ? " · " + HOL.name : ""} · <span class="ver">${BUILD}</span></p></div>`);
  audioBtns();
}
const pendingCode = (location.hash.match(/#(?:visit|gift)=(.+)$/) || [])[1];
function afterLoad() { if (pendingCode) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} setTimeout(() => redeem(pendingCode), 2600); } }
window.start = k => { const nm = $("#playerIn") ? $("#playerIn").value.trim().slice(0, 24) : ""; fresh(k); S.player = nm; S.started = true; S.login.last = new Date().toDateString(); S.login.days = 1;
  ["beetle", "cricket", "worm", "beetle"].forEach(b => spawnBug(b)); closeModal(); renderTools(); renderAll(); wander(); recenter();
  save(); loop(); afterLoad(); musicTip(); };
window.continueGame = () => { const sv = loadSave(); if (!sv) return; S = migrate(sv); S.started = true; henEls.forEach(el => el.remove()); henEls.clear(); henbarSig = "";
  closeModal(); renderTools(); renderAll(); wander(); recenter(); loginBonus(); awayGift(); say(`Welcome back${S.player ? ", " + esc(S.player) : ""}! The hens missed you. Probably. ${HOL ? HOL.line : ""}`, 1); loop(); afterLoad(); musicTip(); };
let timer, wtimer;
// Daytime hours last longer than night hours so players have time to build
const hourMs = () => (isNight() ? 2000 : 4500) / S.speed;
function step() { tick(); if (S.speed) timer = setTimeout(step, hourMs()); }
function loop() { startLoop(); clearTimeout(timer); clearInterval(timer); if (S.speed) timer = setTimeout(step, hourMs()); clearInterval(wtimer); wtimer = setInterval(wanderTick, 400); }
$("#guyArt").innerHTML = guySVG; initParticles(); initPan(); audioBtns(); $("#scrapBtn").onclick = e => { e.stopPropagation(); scrapTray(); }; $("#lvBadge").onclick = () => { gTab = "today"; goalsModal(); }; $("#dqBtn").onclick = () => { gTab = "today"; goalsModal(); }; $("#nextBtn").onclick = hintTap; $("#gearBtn").onclick = () => settingsModal(); $("#fbBtn").onclick = e => { e.stopPropagation(); feedback(); }; $("#musicBtn").onclick = e => { e.stopPropagation(); toggleMusic(); }; $("#sfxBtn").onclick = e => { e.stopPropagation(); toggleSound(); }; $("#flockChip").onclick = () => { shopTab = "hens"; shop(); }; $("#bubble").onclick = () => { if ($("#bubble").classList.contains("more")) modal(`<div class="bubblefull"><div class="guyMini">${guySVG}</div><p><b>Charlie:</b> ${$("#bubbleText").innerHTML}</p></div><button class="buy big" onclick="closeModal()">OK</button>`); }; $("#recenter").onclick = e => { e.stopPropagation(); recenter(); };

// Demo states for screenshots: ?demo=yard|night|shop|hensshop|coopshop|guardshop|henmodal|incubator|share|title|hawk|predator|goals|book|trade|land|barn|care|visit
const demo = new URLSearchParams(location.search).get("demo");
fresh("leghorn"); renderTools();
if (!demo) { renderAll(); say("Welcome to Coup City! It's like Coop City, but the chickens are in charge. <i>Tip: a coop is the house where chickens sleep and lay eggs.</i>"); title(); startLoop(); }
else {
  demoMode = true; S.started = true; S.coins = 48; S.day = 4; S.speed = 0; S.player = "Bill"; S.tut = 99; S.lvl = 3; S.xp = 22;
  const put = (t, i) => S.grid[T6(i)] = { type: t, lvl: t === "feeder" ? 70 : t === "waterer" ? 45 : 100 };
  S.grid = Array(N).fill(null); put("coop", 7); put("nest", 9); put("feeder", 13); put("waterer", 14); put("tree", 10);
  [19,20,21,25,26,27].forEach(i => put("run", i)); [0,1,2,3,4,5,6,12,18,24,30,36,37,38,39].forEach(i => put("fence", i));
  S.hens = []; addHen("leghorn", true); addHen("easter"); addHen("marans"); addHen("ayam");
  S.hens.forEach((h, k) => { h.name = ["Henrietta Von Cluckington", "Nugget (ironic)", "Sir Lays-a-Lot", "Kentucky (very ironic)"][k]; h.pers = ["bossy", "shy", "cuddly", "curious"][k]; });
  S.hens[1].egg = "blue"; S.coopLvl = 1; placeCoop(T6(7), 1);
  S.ground = [{ tile: T6(9), color: "blue", breed: "easter", hen: S.hens[1].name }, { tile: T6(9), color: "white", breed: "leghorn", hen: S.hens[0].name }, { tile: T6(22), color: "chocolate", breed: "marans", hen: S.hens[2].name }];
  S.collection = { white: 5, brown: 3, cream: 1, chocolate: 2 }; S.basket = [{color:"white"},{color:"white"},{color:"cream"},{color:"chocolate"}]; S.lifetime = 11;
  S.hour = 9; S.hens.forEach((h, k) => { const p = tilePos(T6([19,20,26,27][k])); h.x = p.x + 2; h.y = p.y; h.flip = k % 2; });
  S.hens[3].happy = 90; S.hens[2].happy = 30;
  ["beetle", "cricket", "worm", "worm", "fly", "butterfly", "beetle"].forEach(k => spawnBug(k));
  S.hens.forEach((h, k) => h.age = [12, 6, 23, 3][k]);
  S.rooster = { name: "Rocky", breed: "barnyard", x: 52, y: 58, flip: true };
  ["egg1", "sell1", "nest", "roo", "big"].forEach(k => S.goals[k] = 1); S.stats.safeNights = 2; S.dq[0].done = true; S.today[S.dq[0].k] = S.dq[0].n;
  say("WAIT. We got eggs but I don't have a rooster?! <i>Fact: hens lay eggs without a rooster. Roosters only matter if you want chicks.</i>", 1);
  if (demo === "night" || demo === "predator") { S.hour = 23; S.locked = true; S.bugs = []; S.weather = WEATHER[4]; S.ground = []; S.hens.forEach(h => { const p = tilePos(T6(7)); h.x = p.x + Math.random()*22; h.y = p.y + Math.random()*4; }); S.rooster.x = tilePos(T6(7)).x + 10; S.rooster.y = tilePos(T6(7)).y;
    S.def = { latch: 1, eyes: 1, hwcloth: 1 };
    say("Ha! The raccoon rattled the door and left. Locking up works! <i>Tip: raccoons can open simple latches, so use a two-step latch and lock the coop every evening.</i>", 1); }
  if (demo === "barn") { S.coopLvl = 2; S.grid[T6(13)] = null; S.grid[T6(14)] = null; placeCoop(T6(7), 2); put("feeder", 15); put("waterer", 16); S.land = ["home", "garden"]; decoratePlot("garden"); }
  if (demo === "land") { S.land = ["home", "garden", "pasture"]; decoratePlot("garden"); decoratePlot("pasture"); S.coins = 140; }
  if (demo === "care") { S.hens[2].cond = { k: "broody", days: 4 }; S.hens[0].cond = { k: "mites", days: 5 }; S.hens[1].cond = { k: "molt", days: 3 }; S.basket.push({ color: "white", breed: "leghorn", fertile: true, sire: "barnyard" }, { color: "brown", breed: "marans", fertile: true, sire: "barnyard" }); }
  renderAll(); startLoop();
  if (demo === "predator") setTimeout(() => nightThreat("raccoon"), 300);
  if (demo === "hawk") setTimeout(() => { Math.random = (r => () => 0.3)(Math.random); S.said.taptip = 1; dayThreat("hawk"); }, 300);
  if (demo === "shop" || demo === "hensshop") shop();
  if (demo === "coopshop") { S.coins = 72; shopTab = "coop"; shop(); }
  if (demo === "guardshop") { S.coins = 70; S.def = { latch: 1 }; shopTab = "guard"; shop(); }
  if (demo === "henmodal") henModal(S.hens[2].id);
  if (demo === "care") henModal(S.hens[2].id);
  if (demo === "goals") goalsModal();
  if (demo === "scraps" || demo === "bucket") { S.scraps = ["pumpkin", "carrot", "avocado", "pasta"]; S.ground = []; S.goals.egg1 = 1; renderHUD(); coach(); }
  if (demo === "scraps") setTimeout(() => tossScrap(0), 700);
  if (demo === "bucket") scrapTray();
  if (demo === "book") { gTab = "book"; S.seen.zombie = 1; goalsModal(); }
  if (demo === "trade") { gTab = "trade"; goalsModal(); }
  if (demo === "visit") visitModal(farmSnap());
  if (demo === "land") { pan.x = yardW * 0.9; pan.t = ""; setTimeout(() => plotModal("orchard"), 200); }
  if (demo === "incubator") {
    put("incubator", 8); S.rooster = { name: "Vlad", breed: "ayam", x: 50, y: 60, flip: true };
    S.incub = [{ color: "white", breed: "leghorn", sire: "ayam", days: 2 }, { color: "brown", breed: "wyandotte", sire: "ayam", days: 2 }, { color: "blue", breed: "easter", sire: "ayam", days: 1 }, { color: "chocolate", breed: "marans", sire: "ayam", days: 3 }];
    S.chicks = [{ id: 1, breed: "zombie", mix: false, age: 1 }, { id: 2, breed: "mime", mix: false, age: 2, pasty: true }, { id: 3, breed: "easter", mix: true, age: 0 }];
    S.basket.push({ color: "white", breed: "leghorn", fertile: true, sire: "ayam" });
    renderAll(); incubatorModal();
  }
  if (demo === "share") shareCard({ color: "cream", breed: "ayam", hen: S.hens[3].name, tile: 0 });
  if (demo === "title") { demoMode = false; title(); demoMode = true; }
  if (/^(yard|hawk|predator|night|barn|scraps|bucket)$/.test(demo)) { clearInterval(wtimer); wtimer = setInterval(wanderTick, 400); }
}
// test hooks (read-only debugging)
window.__cc = { get S() { return S; }, toss: i => tossScrap(i), tray: () => scrapTray(), fill: (n, m) => fillBucket(n, m || "dinner"), frenzy: () => [...frenzies].map(f => ({ k: f.k, ph: f.ph, x: +f.x.toFixed(1), y: +f.y.toFixed(1), cm: f.car && [+mOf(f.car).x.toFixed(1), +mOf(f.car).y.toFixed(1)], hm: f.hens.map(h => [+mOf(h).x.toFixed(0), +mOf(h).y.toFixed(0)]), steals: f.steals, hens: f.hens.length, car: f.car && f.car.name })), musicNode: () => master, pan, dayThreat, nightThreat, mkCode, readCode, farmSnap, frameLog: () => frameLog, SAVE_KEY, audio: () => ({ state: AC && AC.state, musicOn, soundOn, tracks: Object.fromEntries(Object.entries(TRACKS).map(([k, T]) => [k, { loaded: !!T.buf, err: T.err, playing: !!T.src0, gain: T.gain && +T.gain.gain.value.toFixed(2), dur: T.buf && +T.buf.duration.toFixed(2) }])) }) };
})();
