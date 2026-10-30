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
  hand: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">👆</text></svg>`,
  bulldoze: () => `<svg viewBox="0 0 100 100"><text x="50" y="68" font-size="56" text-anchor="middle">🧹</text></svg>`
};
const guySVG = `<svg viewBox="0 0 60 72"><circle cx="30" cy="9" r="6" fill="#5d4037"/><circle cx="30" cy="22" r="13" fill="#f1c7a0"/><path d="M17 18 Q30 4 43 18 Q30 12 17 18Z" fill="#5d4037"/><rect x="18" y="18" width="10" height="6" rx="2" fill="#111"/><rect x="32" y="18" width="10" height="6" rx="2" fill="#111"/><line x1="28" y1="21" x2="32" y2="21" stroke="#111" stroke-width="1.5"/><path d="M25 29 Q30 32 35 29" stroke="#8a4a2a" stroke-width="1.6" fill="none"/><path d="M12 72 V46 Q30 34 48 46 V72Z" fill="#7e57c2"/><path d="M20 38 Q30 46 40 38 L40 44 Q30 50 20 44Z" fill="#ff7043"/><rect x="44" y="48" width="10" height="14" rx="2" fill="#fff" stroke="#795548"/><rect x="44" y="52" width="10" height="4" fill="#8d6e63"/></svg>`;

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
function panBounds() { return { mx: Math.max(0, worldW() * pan.z - yardW), my: Math.max(0, worldH() * pan.z - yardH) }; }
function panTo(ux, uy) { const b = panBounds(); pan.goto = { x: Math.min(b.mx, Math.max(0, ux * yardW / 100 * pan.z - yardW / 2)), y: Math.min(b.my, Math.max(0, uy * yardH / 100 * pan.z - yardH / 2)) }; pan.vx = pan.vy = 0; }
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
    if (mv) mv.style.transform = `translate3d(${(pan.x / (worldW() * pan.z) * 54).toFixed(1)}px,${(pan.y / (worldH() * pan.z) * 54).toFixed(1)}px,0) scale(${(yardW / (worldW() * pan.z)).toFixed(3)},${(yardH / (worldH() * pan.z)).toFixed(3)})`; }
}
// Touch input for the world. Build 7 relied on the browser's synthesized "click" after a pointer gesture and
// treated any wiggle over 8px as a drag (which silently ate the tap). Build 8 detects taps itself from pointer
// events: under 14px of movement (or under 24px within 300ms) is a tap, and we hit-test with elementsFromPoint
// using a fat-finger search, so it doesn't depend on Safari's click heuristics.
const TAP_SLOP = 14, TAP_QUICK = 24, TAP_QUICK_MS = 300;
function initPan() {
  const vp = $("#grid-wrap");
  vp.addEventListener("pointerdown", e => { if (e.button > 0 || e.target.closest("#recenter")) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const fling = Math.hypot(pan.vx, pan.vy) > 260; pan.vx = 0; pan.vy = 0; pan.goto = null;
    if (ptrs.size === 1) downAt = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, t: performance.now(), lx: e.clientX, ly: e.clientY, lt: performance.now(), max: 0, fling, multi: false };
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), z: pan.z, px: pan.x, py: pan.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; pan.drag = true; if (downAt) downAt.multi = true; } });
  window.addEventListener("pointermove", e => { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2 && pinch0) { const [a, b] = [...ptrs.values()], r = vp.getBoundingClientRect(); const z = Math.min(1.4, Math.max(0.5, pinch0.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch0.d));
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
function tapFX(t) { if (!t) return; t.classList.remove("tapped"); void t.offsetWidth; t.classList.add("tapped"); clearTimeout(t._tt); t._tt = setTimeout(() => t.classList.remove("tapped"), 420); }
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
  [["coop", 7], ["feeder", 13], ["waterer", 14]].forEach(([t, i]) => S.grid[T6(i)] = { type: t, lvl: 100 });
  addHen(breed, true);
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
function say(text, tip) { $("#bubbleText").innerHTML = text; $("#bubble").classList.toggle("tip", !!tip); }
function sayOnce(key, text, tip) { if (S.said[key]) return; S.said[key] = 1; say(text, tip); }
// toasts queue briefly so a quest/badge toast doesn't instantly hide "Feeder filled!"
const toastQ = []; let toastBusy = 0;
function toast(t, now) { if (now) { toastQ.unshift(t); toastBusy = 0; return toastNext(); } if (toastQ.length > 3) toastQ.shift(); toastQ.push(t); if (!toastBusy) toastNext(); }
function toastNext() { const el = $("#toast"), t = toastQ.shift(); if (t == null) { toastBusy = 0; return; } toastBusy = 1;
  el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 2200); clearTimeout(toastNext._t); toastNext._t = setTimeout(toastNext, 1300); }
function floatAt(i, text) {
  const el = document.createElement("div"); el.className = "float"; el.textContent = text;
  const p = tilePos(i); el.style.left = ux(p.x + 2); el.style.top = uy(p.y - 1);
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
    const cls = "tile" + (owned(i) ? "" : " forsale") + (g0 && g0.type === "coop" ? " hascoop" : "") + (g0 && g0.type === "pond" ? " water" : "");
    if (t._c !== cls) { t.className = cls; t._c = cls; }
    if (tileCache[i] !== html) { t.innerHTML = html; tileCache[i] = html; }
    const g = S.grid[i];
    if (g && (g.type === "feeder" || g.type === "waterer")) { const bar = t.querySelector(".lvl i"), w = Math.round(g.lvl) + "%"; if (bar && bar.style.width !== w) bar.style.width = w; }
  }
}
/* Hens: one element per bird, created once and moved with GPU transforms. */
const henEls = new Map();
let yardW = 0, yardH = 0;
function measureYard() { const el = $("#grid-wrap"); yardW = el.clientWidth; yardH = el.clientHeight; pan.t = ""; }
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
    const max = b.run ? 30 : el._roo ? 11 : 9; // % of yard per second
    // arrive steering: desired velocity eases down near the target, velocity eases toward it
    const want = d > 0.05 ? Math.min(max, d * 2.2) / d : 0, k = Math.min(1, dt * 5);
    m.vx += (dx * want - m.vx) * k; m.vy += (dy * want - m.vy) * k;
    m.x += m.vx * dt; m.y += m.vy * dt;
    const sp = Math.hypot(m.vx, m.vy), s = Math.min(1, sp / 9);
    const tr = `translate3d(${(m.x * kx).toFixed(1)}px,${(m.y * ky).toFixed(1)}px,0)`;
    if (tr !== m.t) { el.style.transform = tr; m.t = tr; }
    const face = Math.abs(m.vx) > 0.6 ? m.vx < 0 : !!b.flip;
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
    const mood = h.cond ? COND[h.cond.k][0] : h.dust ? "💨" : h.health < 35 ? "🤒" : h.happy < 35 ? "😤" : h.happy > 75 ? "💛" : "";
    placeBird(birdEl(key, henSVG(h.breed), { "data-h": h.id }), h, mood, inside);
  });
  henEls.forEach((el, k) => { if (!keep.has(k)) { el.remove(); henEls.delete(k); } });
  // Hen bar: rebuild only when the list or labels change; otherwise update bars in place
  const sig = S.hens.map(h => h.id + h.name + breedLabel(h) + isOld(h) + (h.cond ? h.cond.k : "")).join("|") + (S.rooster ? "R" + S.rooster.breed + S.rooster.name : "");
  const bar = $("#henbar");
  if (sig !== henbarSig) {
    henbarSig = sig;
    bar.innerHTML = (S.hens.map(h => `<div class="hencard${h.cond ? " alert" : ""}" data-card="${h.id}">${henSVG(h.breed)}<div>${h.cond ? `<span class="cbadge">${COND[h.cond.k][0]}</span>` : ""}<b>${h.name}</b> <span style="opacity:.6">${breedLabel(h)}</span>${isOld(h) ? ` <span class="old">older</span>` : ""}
   <div class="bar"><i style="background:#e57373"></i></div><div class="bar"><i style="background:#ffca28"></i></div></div></div>`).join("") || `<div class="hencard">No hens yet. Visit the 🛒 Shop!</div>`)
     + (S.rooster ? `<div class="hencard" data-card="roo">${rooSVG()}<div><b>${S.rooster.name}</b> <span style="opacity:.6">${ROOS[S.rooster.breed].name}</span></div></div>` : "");
  }
  S.hens.forEach((h, k) => { const c = bar.children[k]; if (!c) return; const [a, b] = c.querySelectorAll(".bar i");
    const w1 = Math.round(h.health) + "%", w2 = Math.round(h.happy) + "%"; if (a.style.width !== w1) a.style.width = w1; if (b.style.width !== w2) b.style.width = w2; });
}
// Only re-place birds when the yard WIDTH really changes (rotation, desktop resize). Mobile address-bar
// show/hide and HUD text changes must not snap hens. The yard is square tiles, so height follows width.
if (window.ResizeObserver) new ResizeObserver(() => { const w = $("#grid-wrap").clientWidth; if (Math.abs(w - yardW) < 4) return; measureYard(); if (S) renderHens(); }).observe($("#grid-wrap"));
function renderHUD() {
  $("#coins").textContent = S.coins; $("#day").textContent = S.day;
  $("#clock").textContent = `${(S.hour % 12) || 12}:00 ${S.hour < 12 ? "am" : "pm"}`;
  $("#clockIcon").textContent = isNight() ? "🌙" : "☀️";
  const wx = season()[0] + S.weather.join(" "); if ($("#weather").textContent !== wx) $("#weather").textContent = wx;
  renderGoalbar();
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
function renderAll() { checkGoals(); renderHUD(); renderGrid(); renderHens(); renderForage(); renderMini(); saveSoon(); }

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
  if (h.busy) return;
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

/* ---------- SIMULATION ---------- */
// Walk-away friendly: hens never die or leave. Health bottoms out at "grumpy" and recovers fast with food + water.
const FLOOR = 40;
function hurt(h, n) { h.health = Math.max(FLOOR, h.health - n); h.happy = Math.max(10, h.happy - n / 2); }
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
  if (S.hour === 8) layEggs();
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
  if (S.hour === 20 && !S.locked) say(has("coop") ? "The hens just... went to bed by themselves? At 8pm? Icons. <i>Tip: lock the coop at night!</i>" : "It's dark and my hens have nowhere to sleep. <i>Tip: build a coop.</i>", 1);
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
  S.contestWon = false; rollDaily(); xp(3); realismDay();
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
    const ok = h.health > 40 && h.happy > 35 && !(S.locked && !has("nest")) && !(h.cond && ["molt", "broody", "eggbound"].includes(h.cond.k));
    const rate = CH[h.breed].layRate * (season()[1] === "Winter" ? 0.55 : 1) * (S.weather[1] === "Cold" ? 0.85 : 1) * (isOld(h) ? 0.5 : 1);
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
/* ---------- AUDIO: original procedural "Coop City Hoedown" + farm SFX (Web Audio, no files) ----------
   Key of G major, 116 BPM swung eighths. Form per loop: A A' B A C C (C = chorus with the "buk-buk-buk... BAWK" cluck hook).
   Variation: loop 2 swaps lead to banjo, loop 3 modulates up to A major, loop 4 uses a whistle lead.
   Night: the same hook as a slow music-box lullaby (72 BPM), crossfaded with the day/night cycle. */
let soundOn = false; try { soundOn = localStorage.getItem("coopcity-sound") === "1"; } catch (e) {}
let musicOn = true; try { musicOn = localStorage.getItem("coopcity-music") !== "0"; } catch (e) {}
let AC = null, master, dayBus, nightBus, sfxBus, noiseBuf, musTimer = 0, musWant = [0, 0];
function ac() {
  if (AC) return AC; const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
  AC = new C(); master = AC.createGain(); master.gain.value = 0.16; master.connect(AC.destination);
  dayBus = AC.createGain(); dayBus.gain.value = 0; dayBus.connect(master);
  const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1600; nightBus = AC.createGain(); nightBus.gain.value = 0; nightBus.connect(lp); lp.connect(master);
  sfxBus = AC.createGain(); sfxBus.gain.value = 0.35; sfxBus.connect(AC.destination);
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.5 | 0, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return AC;
}
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
function pluck(bus, m, t, vol, dec = 0.3, type = "square", cut = 2600) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(mf(m) * 1.012, t); o.frequency.exponentialRampToValueAtTime(mf(m), t + 0.03);
  f.type = "lowpass"; f.frequency.setValueAtTime(cut, t); f.frequency.exponentialRampToValueAtTime(cut * 0.3, t + dec); f.Q.value = 1.5;
  env(g, t, 0.004, vol, dec); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + dec + 0.06); }
function lead(bus, m, t, dur, vol, type) { const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter(), lfo = AC.createOscillator(), lg = AC.createGain();
  o.type = type; o.frequency.value = mf(m); lfo.frequency.value = 5.2; lg.gain.value = mf(m) * 0.007; lfo.connect(lg); lg.connect(o.frequency);
  f.type = "lowpass"; f.frequency.value = type === "sawtooth" ? 2000 : 5000;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.025); g.gain.setValueAtTime(vol * 0.85, t + Math.max(0.04, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.07);
  o.connect(f); f.connect(g); g.connect(bus); o.start(t); lfo.start(t); o.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1); }
function noise(bus, t, dur, vol, freq, type = "highpass") { const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noiseBuf;
  f.type = type; f.frequency.value = freq; env(g, t, 0.002, vol, dur); s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.05); }
function cluck(bus, t, vol, big) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = "square";
  const a = big ? 620 : 540; o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(a * (big ? 2.1 : 1.8), t + 0.035); o.frequency.exponentialRampToValueAtTime(a * 1.15, t + (big ? 0.16 : 0.08));
  f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 2.5; env(g, t, 0.003, vol, big ? 0.17 : 0.08); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.22); noise(bus, t, 0.025, vol * 0.6, 2400, "bandpass"); }

// Melody grid: 8 swung eighths per bar, semitones above the tonic (G4). H = hold, R = rest, chords = [root, minor?]
const H = -99, R = null, MAJ = [0, 4, 7], MIN = [0, 3, 7];
const SEC = {
  A:  { ch: [[0, 0], [5, 0], [7, 0], [0, 0]], mel: [[7, R, 4, 7, 12, H, 9, 7], [9, H, 9, 7, 4, H, R, R], [2, 4, 7, H, 11, H, 9, 7], [7, 4, 2, 4, 0, H, H, R]] },
  A2: { ch: [[0, 0], [5, 0], [7, 0], [0, 0]], mel: [[7, R, 4, 7, 12, H, 9, 7], [9, H, 9, 7, 4, H, R, R], [2, 4, 7, H, 11, H, 14, 12], [11, 9, 7, 4, 7, H, H, R]] },
  B:  { ch: [[9, 1], [5, 0], [2, 1], [7, 0]], mel: [[4, H, H, 7, 9, H, 7, 4], [5, H, H, 4, 0, H, 4, H], [2, H, H, 4, 5, H, 9, H], [7, H, H, 9, 11, H, H, R]] },
  C:  { ch: [[0, 0], [5, 0], [7, 0], [0, 0]], mel: [[12, 12, 12, R, 16, H, 12, R], [9, 9, 9, R, 12, H, 9, R], [11, 11, 11, R, 14, H, 11, 9], [7, 9, 11, 12, H, R, R, R]], cl: [[3, 7], [3, 7], [3], [5, 6, 7]] } };
const DAY_FORM = ["A", "A2", "B", "A", "C", "C"], NIGHT_FORM = ["A", "A2", "B", "A"];
const ROLL = [0, 2, 3, 1, 2, 3, 0, 2]; // banjo forward-roll over chord tones (3 = octave root)
const mkSeq = (form, bpm, swing, night) => ({ form, bpm, swing, night, sec: 0, bar: 0, step: 0, loop: 0, t: 0, on: false, offAt: 0 });
const DAYQ = mkSeq(DAY_FORM, 116, 0.62, false), NIGHTQ = mkSeq(NIGHT_FORM, 72, 0.54, true);
function holdLen(mel, bar, step, secName, q) { let n = 1, b = bar, s = step + 1;
  for (;;) { if (s > 7) { s = 0; b++; if (b > 3) break; } if (SEC[secName].mel[b][s] !== H) break; n++; s++; } return n; }
function playStep(q, bus) {
  const name = q.form[q.sec], S2 = SEC[name], [root, minor] = S2.ch[q.bar], tones = minor ? MIN : MAJ, e = 60 / q.bpm / 2, t = q.t, st = q.step;
  const v = q.night ? 0 : q.loop % 4, key = v === 2 ? 2 : 0, chordT = i => root + (i === 3 ? 12 : tones[i]);
  const note = S2.mel[q.bar][st];
  if (q.night) {
    if (st === 0) pluck(bus, 43 + key + root, t, 0.32, 1.4, "sine", 600);
    if (st % 2 === 0) pluck(bus, 55 + key + chordT(ROLL[st]), t, 0.05, 0.9, "sine", 1200);
    if (note !== R && note !== H) pluck(bus, 67 + key + note + 12, t, 0.14, 1.1, "sine", 3000);
    return;
  }
  // boom-chick bass + chick strum
  if (st === 0) pluck(bus, 43 + key + root, t, 0.42, 0.32, "triangle", 900);
  if (st === 4) pluck(bus, 43 + key + root + (root >= 5 ? -5 : 7), t, 0.36, 0.3, "triangle", 900);
  if (st === 2 || st === 6) { tones.forEach(k => pluck(bus, 55 + key + root + k, t, 0.05, 0.07, "triangle", 2000)); noise(bus, t, 0.05, 0.05, 3500); }
  // shaker on every swung eighth, accent on the off-beats
  noise(bus, t, 0.03, st % 2 ? 0.035 : 0.018, 7000);
  // banjo roll (guitar on the banjo-lead loop so they don't clash)
  if (v === 1) pluck(bus, 55 + key + chordT(ROLL[st]), t, 0.05, 0.18, "triangle", 1500);
  else pluck(bus, 67 + key + chordT(ROLL[st]) - 12, t, 0.055, 0.2, "square", 3200);
  // lead melody
  if (note !== R && note !== H) { const dur = holdLen(S2.mel, q.bar, st, name, q) * e * 0.95, m = 67 + key + note;
    if (v === 1) { pluck(bus, m, t, 0.2, 0.35, "square", 3600); }
    else lead(bus, m, t, dur, v === 3 ? 0.11 : 0.1, v === 3 ? "sine" : "sawtooth"); }
  // the cluck answer in the chorus
  if (S2.cl && S2.cl[q.bar].includes(st)) cluck(bus, t, 0.16, q.bar === 3 && st === 7);
}
function advance(q) { const e = 60 / q.bpm / 2, long = 2 * e * q.swing, short = 2 * e - long;
  q.t += q.step % 2 === 0 ? long : short; q.step++;
  if (q.step > 7) { q.step = 0; q.bar++; if (q.bar > 3) { q.bar = 0; q.sec++; if (q.sec >= q.form.length) { q.sec = 0; q.loop++; } } } }
const musicNight = () => !!(S && S.started && typeof isNight === "function" && isNight());
function musicTick() {
  if (!AC || AC.state !== "running") return; const now = AC.currentTime, ahead = now + 0.3;
  const want = musicOn ? (musicNight() ? [0, 1] : [1, 0]) : [0, 0];
  [[DAYQ, dayBus, 0], [NIGHTQ, nightBus, 1]].forEach(([q, bus, i]) => {
    if (want[i] !== musWant[i]) { const fade = musicOn ? 4 : 0.6; bus.gain.cancelScheduledValues(now); bus.gain.setValueAtTime(bus.gain.value, now); bus.gain.linearRampToValueAtTime(want[i] ? (i ? 0.85 : 1) : 0, now + fade); if (!want[i]) q.offAt = now + fade; }
    if (!want[i] && now > q.offAt) { q.on = false; return; }
    if (!q.on) { q.on = true; q.t = now + 0.06; q.step = 0; q.bar = 0; }
    if (q.t < now - 0.2) q.t = now + 0.05; // resumed after a pause: don't burst-play missed notes
    while (q.t < ahead) { playStep(q, bus); advance(q); }
  });
  musWant = want;
}
function audioStart() { if (!ac()) return; if (AC.state !== "running") AC.resume().catch(() => {});
  try { const b = AC.createBufferSource(); b.buffer = AC.createBuffer(1, 1, 22050); b.connect(AC.destination); b.start(0); } catch (e) {}
  if (!musTimer && !document.hidden) musTimer = setInterval(musicTick, 100); }
// Mobile browsers only allow audio after a user gesture: unlock on the first tap anywhere (Start/Continue included)
["pointerup", "touchend", "click", "keydown"].forEach(ev => document.addEventListener(ev, function unlock() { audioStart(); if (AC && AC.state === "running") ["pointerup", "touchend", "click", "keydown"].forEach(x => document.removeEventListener(x, unlock, true)); }, true));
document.addEventListener("visibilitychange", () => { if (!AC) return;
  if (document.hidden) { clearInterval(musTimer); musTimer = 0; AC.suspend().catch(() => {}); } else { AC.resume().catch(() => {}); if (!musTimer) musTimer = setInterval(musicTick, 100); } });
// Farm SFX (off by default; 🔊 toggle)
function sfx(kind) { if (!soundOn || !ac() || AC.state !== "running") return; const t = AC.currentTime + 0.01, B = sfxBus;
  try {
    if (kind === "cluck") { cluck(B, t, 0.5); cluck(B, t + 0.13, 0.45); }
    else if (kind === "egg") { pluck(B, 84, t, 0.35, 0.12, "sine", 5000); pluck(B, 91, t + 0.06, 0.3, 0.15, "sine", 5000); }
    else if (kind === "coin") { pluck(B, 83, t, 0.25, 0.1, "square", 6000); pluck(B, 88, t + 0.07, 0.25, 0.25, "square", 6000); }
    else if (kind === "crow") { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = "sawtooth";
      [[0, 480], [0.12, 760], [0.35, 820], [0.7, 640], [1.0, 380]].forEach(([d, fr]) => o.frequency.linearRampToValueAtTime(fr, t + d)); f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 1.5;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4, t + 0.05); g.gain.setValueAtTime(0.4, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05); o.connect(f); f.connect(g); g.connect(B); o.start(t); o.stop(t + 1.1); }
    else if (kind === "pour") { noise(B, t, 0.35, 0.25, 1200, "bandpass"); pluck(B, 79, t + 0.25, 0.15, 0.2, "sine", 4000); }
    else { const f = { lvl: [72, 76, 79, 84], warn: [62, 58], good: [76, 81] }[kind] || [76]; f.forEach((m, i) => pluck(B, m, t + i * 0.08, 0.25, 0.18, "triangle", 4000)); }
  } catch (e) {} }
const beep = sfx;
function audioBtns() { const m = $("#musicBtn"), s = $("#sfxBtn"); if (m) { m.classList.toggle("off", !musicOn); m.setAttribute("aria-pressed", musicOn); } if (s) { s.classList.toggle("off", !soundOn); s.setAttribute("aria-pressed", soundOn); } }
window.toggleMusic = () => { musicOn = !musicOn; try { localStorage.setItem("coopcity-music", musicOn ? "1" : "0"); } catch (e) {} audioStart(); toast(musicOn ? "🎵 Music on" : "🎵 Music off"); audioBtns(); if (!$("#modal").classList.contains("hidden") && $("#modal").innerText.includes("farmer name")) goalsModal(); };
window.toggleSound = () => { soundOn = !soundOn; try { localStorage.setItem("coopcity-sound", soundOn ? "1" : "0"); } catch (e) {} audioStart(); sfx("cluck"); toast(soundOn ? "🔊 Farm sounds on" : "🔇 Farm sounds off"); audioBtns(); if (!$("#modal").classList.contains("hidden") && $("#modal").innerText.includes("farmer name")) goalsModal(); };
function coinPop(n) { const el = $("#coinPop"); if (!el) return; el.textContent = (n > 0 ? "+" : "") + n + "🪙"; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
  const st = $("#coinStat"); st.classList.remove("bump"); void st.offsetWidth; st.classList.add("bump"); }
function gain(n, why) { if (!n) return; S.coins += n; coinPop(n); beep("coin"); if (why) toast(why); }
const xpNeed = l => 15 + 10 * (l - 1);
const UNLOCK = { wyandotte: 2, lavender: 2, easter: 3, legbar: 3, marans: 4, ayam: 5, "roo:ayam": 4, goose: 2, efence: 3, dog: 4 };
const lockedLv = k => (UNLOCK[k] || 1) > S.lvl && !(S.premium && S.premium.pack && CH[k]);
function xp(n) { S.xp += n;
  while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; const r = 10 + 5 * S.lvl; S.coins += r; coinPop(r); beep("lvl");
    const un = Object.entries(UNLOCK).filter(([k, l]) => l === S.lvl).map(([k]) => k.startsWith("roo:") ? ROOS[k.slice(4)].name : CH[k] ? CH[k].name : DEF.find(d => d[0] === k)[2]);
    for (let i = 0; i < 8; i++) particle(rnd(["⭐", "✨", "🎉"]), 30 + Math.random() * 40, 40 + Math.random() * 20, 2);
    toast(`⭐ Farm level ${S.lvl}! +${r}🪙${un.length ? " · Unlocked: " + un.join(", ") : ""}`); } }
const GOALS = [
  ["egg1", "🥚", "Collect your first egg", () => S.lifetime >= 1, 5],
  ["sell1", "💰", "Sell eggs at the market", () => S.stats.sold >= 1, 5],
  ["scare1", "🦅", "Scare off a predator (tap it!)", () => S.stats.scared >= 1, 10],
  ["lock1", "🔒", "Lock the coop for a whole night", () => S.stats.nightsLocked >= 1, 8],
  ["nest", "🪺", "Build a nest box", () => has("nest"), 6],
  ["roo", "🐓", "Get a rooster", () => !!S.rooster, 8],
  ["eggs10", "🧺", "Collect 10 eggs", () => S.lifetime >= 10, 10],
  ["def1", "🛡️", "Buy a predator defense", () => Object.keys(S.def).length >= 1, 8],
  ["big", "🏠", "Upgrade to the Big coop", () => S.coopLvl >= 1, 15],
  ["hens4", "🐔", "Raise a flock of 4 hens", () => S.hens.length >= 4, 12],
  ["care1", "🩹", "Nurse a hen back to health", () => S.stats.cared >= 1, 10],
  ["colors3", "🌈", "Collect 3 egg colors", () => Object.keys(S.collection).length >= 3, 12],
  ["streak3", "🛡️", "3 safe nights", () => S.stats.safeNights >= 3, 15],
  ["forage20", "🪲", "Hens eat 20 bugs", () => S.foraged >= 20, 10],
  ["roowin", "💪", "Your rooster drives off a predator", () => S.stats.rooWins >= 1, 12],
  ["hatch1", "🐣", "Hatch a chick", () => S.hatched >= 1, 15],
  ["lvl5", "⭐", "Reach farm level 5", () => S.lvl >= 5, 20],
  ["eggs50", "🏆", "Collect 50 eggs", () => S.lifetime >= 50, 25],
  ["golden", "✨", "Find a golden egg", () => (S.collection.golden || 0) >= 1, 25],
  ["barn", "🏚️", "Build the Barn coop", () => S.coopLvl >= 2, 30],
  ["rainbow", "🎨", "Collect all 7 egg colors", () => ["white", "brown", "lightbrown", "cream", "blue", "green", "chocolate"].every(c => S.collection[c]), 40]];
const DQ = { eggs: ["🥚", n => `Collect ${n} eggs`], bugs: ["🪲", n => `Hens eat ${n} bugs`], sell: ["💰", n => `Sell ${n} eggs`], refill: ["🌾", n => `Refill feeders or waterers ${n} times`], scare: ["🦅", n => `Scare off a predator`], lock: ["🔒", n => `Lock the coop tonight`], pet: ["💛", n => `Tap your hens ${n} times`] };
function rollDaily() { const keys = Object.keys(DQ).sort(() => Math.random() - 0.5).slice(0, 3);
  const n = { eggs: Math.max(2, Math.min(6, S.hens.length + 1)), bugs: 5, sell: 3, refill: 2, scare: 1, lock: 1, pet: 3 };
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
  setTimeout(() => modal(`<h2>🧺 While you were away</h2><p>Time stops on the farm when you leave, so nobody got hungry or dirty, and no predators came by.</p><p>Brayden peeked in and found a little basket waiting:</p><p style="font-size:20px;text-align:center">🥚 ×${eggs} · 🪙 +${coins}</p><button class="buy big" onclick="closeModal()">Thanks, Brayden!</button>`), 1400); }
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
  owl: ["🦉", "Owl", 10, "Something said 'who?' from the tree. I said 'Brayden.' It did not care.", "Great horned owls hunt at night and can take hens that roost outside. Lock everyone in the coop."],
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
function runForCover(ms, only) { const now = performance.now(); (only || S.hens).forEach(h => { const p = coverSpot(); if (!p) return; h.flip = p.x < h.x; h.x = p.x; h.y = p.y; h.busy = true; h.run = true; h.next = now + ms;
  setTimeout(() => { h.busy = false; h.run = false; }, ms); }); if (S.rooster) { S.rooster.run = true; setTimeout(() => S.rooster && (S.rooster.run = false), 2000); } renderHens(); }
const pickW = o => { const e = Object.entries(o), tot = e.reduce((a, [, v]) => a + (v.w || v[2]), 0); let r = Math.random() * tot; for (const [k, v] of e) { r -= v.w || v[2]; if (r <= 0) return k; } return e[0][0]; };
function dayThreat(kind) {
  if (threat || !S.hens.length || !hensOut()) return;
  const T = kind === "fox" ? FOX_DUSK : DAY_T[kind], target = rnd(S.hens), fromL = Math.random() < 0.5, sx = target.x + (fromL ? -62 : 62);
  const ty = T.sky ? Math.max(0, target.y - 16) : target.y;
  const a = actor(`<span>${T.e}</span>`, (T.sky ? "sky" : "ground") + (T.big ? " big" : ""), sx, T.sky ? -12 : ty, T.sky ? 45 : 30, { sky: T.sky });
  a.tx = target.x - 2; a.ty = ty;
  const sh = T.sky ? actor("", "shadow", sx, target.y + 7, 45, { noflip: 1 }) : null; if (sh) { sh.tx = target.x; sh.ty = target.y + 8; }
  threat = { kind, T, a, sh, target, fromL, sx, done: false };
  a.el.classList.add("tappable"); a.el._tap = () => { if (threat && !threat.done) { threat.tapped = true; resolveDay(); } };
  a.el.addEventListener("pointerdown", e => { e.stopPropagation(); a.el._tap(); });
  toast(`⚠️ ${T.name}! Tap it to scare it off!`); beep("warn");
  const g = roo();
  runForCover(4200, S.hens.filter(h => h.pers === "shy"));
  if (g && Math.random() < g.alarm + (T.sky ? 0.1 : 0)) setTimeout(() => { if (threat && !threat.done) { threat.alarm = true; particle("❗", S.rooster.x + 6, S.rooster.y - 2, 0); toast(`🐓 ${S.rooster.name} sounds the alarm! Hens run for cover!`); runForCover(4500); } }, 800);
  else if (S.def.goose && Math.random() < 0.5) setTimeout(() => { if (threat && !threat.done) { threat.alarm = true; toast("🪿 HONK HONK! The goose sounds the alarm!"); runForCover(4500); } }, 800);
  sayOnce("t_" + kind, `${T.line} <i>Tip: ${T.tip}</i>`, 1);
  if (!S.said.taptip) { S.said.taptip = 1; say(`${T.line} Quick, tap it! <i>Tip: ${T.tip}</i>`, 1); }
  threat.timer = setTimeout(resolveDay, 4300);
}
function resolveDay() {
  const t = threat; if (!t || t.done) return; t.done = true; clearTimeout(t.timer);
  const { T, target, kind } = t, nm = T.name.toLowerCase().replace("neighbor's ", ""), g = roo(); let msg;
  if (t.tapped) { S.stats.scared++; bump("scare"); xp(5); gain(3); msg = `You flapped your arms and yelled. The ${nm} left! +3🪙`; beep("good"); }
  else if (S.def.dog && Math.random() < (T.sky ? 0.35 : 0.9)) msg = `Your guard dog barked the ${nm} away! 🐶`;
  else if (S.def.goose && !T.sky && Math.random() < 0.5) msg = `The goose HONKED and charged. The ${nm} left. 🪿`;
  else if (g && Math.random() < g.fight * (T.big ? 0.6 : 1) * (kind === "dog" ? 0.6 : 1)) { msg = `${S.rooster.name} puffed up and charged! The ${nm} backed off. 💪`; S.stats.rooWins++; xp(3); particle("💪", S.rooster.x + 6, S.rooster.y - 2, 0);
    sayOnce("roowin", `${S.rooster.name} just body-slammed a ${nm}. I take back everything I said about 5am. <i>Tip: roosters watch for danger, sound an alarm call, and will often fight to protect their hens.</i>`, 1); }
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
  const h = S.hour;
  if (h === 11 && S.day === 1 && !S.said.tuthawk && hensOut()) { S.said.tuthawk = 1; return dayThreat("hawk"); }
  if (h >= 9 && h <= 16 && (S.day > 1 || h >= 12) && Math.random() < 0.12) return dayThreat(pickW(DAY_T));
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
  if (s.rooster) { s.rooster.run = false; s.rooster.next = 0; }
  (s.bugs || []).forEach(b => b.claimed = 0); if (!s.speed) s.speed = 1; return s;
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
window.shareFarm = () => shareOut("My Coop City farm", `Come visit my chicken farm in Coop City! 🐔`, `${baseURL()}#visit=${mkCode("CCV", farmSnap())}`);
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
window.shareGift = url => shareOut("A Coop City gift", "I sent you a gift for your Coop City farm! 🎁🐔", url);
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
  $("#goalTxt").textContent = g ? `${g[1]} ${g[2]} · +${g[4]}🪙` : "🏆 All badges earned!";
  $("#dqN").textContent = dqLeft ? `🎯${dqLeft}` : "🎯✓";
  $("#evChip").textContent = (S.event ? EVENTS[S.event][0] : "") + (HOL ? HOL.hat : "") + "";
}
let gTab = "today";
function goalsModal() {
  const tabs = [["today", "🎯 Today"], ["badges", "🏅 Badges"], ["book", "📖 Book"], ["trade", "🎁 Trade"], ["me", "⚙️ Me"]].map(([k, l]) => `<button class="${gTab === k ? "on" : ""}" onclick="gTabSet('${k}')">${l}</button>`).join("");
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
    <p>Brayden is your clueless neighbor and guide. You're the one in charge.</p>
    <button class="act big" onclick="toggleMusic()">${musicOn ? "🎵 Music on" : "🎵 Music off"}</button>
    <button class="act big" onclick="toggleSound()">${soundOn ? "🔊 Farm sounds on" : "🔇 Farm sounds off"}</button>
    <button class="act big" onclick="resetGame()">🗑️ Start a new farm</button><p style="font-size:12px">Progress saves automatically on this device.</p>`;
  modal(`<h2>🐔 ${esc(S.player ? S.player + "'s farm" : "My farm")}</h2><div class="tabs">${tabs}</div>${body}<button class="act big" onclick="closeModal()">Close</button>`);
}
window.goalsModal = goalsModal; window.gTabSet = k => { gTab = k; goalsModal(); };
window.setPlayer = () => { S.player = $("#playerIn").value.trim().slice(0, 24); toast(S.player ? `Hi, ${S.player}!` : "Name cleared"); gbSig = ""; renderAll(); goalsModal(); };
window.resetGame = () => modal(`<h2>Start over?</h2><p>This erases your farm on this device.</p><button class="buy big cull" onclick="doReset()">Yes, start fresh</button><button class="act big" onclick="goalsModal()">Cancel</button>`);
window.doReset = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} location.hash = ""; location.reload(); };

/* ---------- INPUT ---------- */
$("#tools").addEventListener("click", e => { const b = e.target.closest(".tool"); if (!b) return; tool = b.dataset.t; renderTools(); if (ITEMS[tool].tip) say(`${ITEMS[tool].name}: ${ITEMS[tool].tip}`, 1); });
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
    if (g) { S.coins += Math.floor(ITEMS[g.type].cost / 2); S.grid[i] = null; floatAt(i, "removed"); renderAll(); } return; }
  if (g) return toast("Something's already there");
  const it = ITEMS[tool];
  if (it.max && tilesOf(tool).length >= it.max) return toast(`One ${it.name.toLowerCase()} is plenty for now`);
  if (S.coins < it.cost) return toast("Not enough coins. Sell some eggs!");
  S.coins -= it.cost; S.grid[i] = { type: tool, lvl: 100 }; floatAt(i, `-${it.cost}🪙`); if (tool !== "run") S.bugs = S.bugs.filter(b => b.tile !== i);
  if (!S.said["built_" + tool]) { S.said["built_" + tool] = 1; say(`${it.joke} <i>${it.tip}</i>`, 1); }
  renderAll(); wander();
}
function collect(k) {
  const e = S.ground.splice(k, 1)[0]; S.basket.push(e); S.lifetime++; bump("eggs"); xp(2);
  S.collection[e.color] = (S.collection[e.color] || 0) + 1; floatAt(e.tile, "+1 🥚"); sfx("egg");
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
  modal(`<h2>💰 Farmers market</h2><p>Brayden set up a folding table outside his apartment. Fancy colors sell for more.</p>${S.event === "market" || S.event === "contest" ? `<p class="demo">${EVENTS[S.event].join(" ")}</p>` : ""}
   ${Object.keys(c).map(k => `<div class="row">${eggSVG(k)}<div class="t"><b>${EGG_COLORS[k].label}</b> × ${c[k]}<br>${eggPrice({ color: k })}🪙 each</div></div>`).join("") || "<p><i>Your basket is empty. Tap eggs in the yard to collect them.</i></p>"}
   <button class="buy big" ${total ? "" : "disabled"} onclick="sellAll()">Sell all for ${total}🪙</button>
   <button class="buy big" onclick="shareCard()">📸 Share my egg rainbow</button>
   <button class="act big" onclick="closeModal()">Close</button>`);
};
window.sellAll = () => { const t = S.basket.reduce((a, e) => a + eggPrice(e), 0), n = S.basket.length; if (!n) return;
  const fancy = S.event === "contest" && !S.contestWon && S.basket.some(e => !["white", "brown"].includes(e.color));
  S.stats.sold += n; bump("sell", n); xp(Math.ceil(n / 2)); S.basket = []; closeModal(); gain(t, `Sold ${n} egg${n > 1 ? "s" : ""}! +${t}🪙`);
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
window.cleanChick = id => { const c = S.chicks.find(x => x.id == id); if (!c) return; c.pasty = false; S.stats.cared++; toast("Chick cleaned up! 🐥");
  sayOnce("pasty", "I just gave a baby chicken a butt bath with a warm washcloth. This is my life now. <i>Tip: 'pasty butt' is when droppings dry over a young chick's vent. Gently clean it with warm water; it can be serious if left.</i>", 1); incubatorModal(); renderAll(); };
window.sellChick = id => { const c = S.chicks.find(x => x.id == id); if (!c) return; const v = chickValue(c);
  S.chicks = S.chicks.filter(x => x !== c); S.coins += v; toast(`Sold a chick! +${v}🪙`);
  sayOnce("chicksale", "A family bought a chick for their kids. It's like a tiny adoption. <i>Tip: chicks need a warm brooder for their first few weeks.</i>", 1); incubatorModal(); renderAll(); };

/* ---------- START ---------- */
function title() {
  const sv = loadSave();
  modal(`<div class="title"><h1>Coop City</h1><div class="sub">Chickens for people who can't have chickens (yet).</div><div class="ver">build 8 · tap fix + music</div>
   <div style="width:80px;margin:6px auto">${guySVG}</div>
   ${sv && sv.hens ? `<button class="buy big" onclick="continueGame()">▶️ Continue${sv.player ? " as " + esc(sv.player) : ""} · Day ${sv.day}</button><p style="font-size:12px;margin:4px 0">or start a new farm:</p>` : ""}
   <p>"Hi, I'm Brayden, your neighbor. I just got chickens too and I have NO idea what I'm doing. What's your name?"</p>
   <div class="namerow"><input id="playerIn" maxlength="24" placeholder="Your farmer name"></div>
   <p><b>Pick your first hen:</b></p>
   ${["leghorn","barred"].map(k=>`<div class="row">${henSVG(k)}<div class="t"><b>${CH[k].name}</b><br>${CH[k].blurb}</div><button class="buy" onclick="start('${k}')">Adopt</button></div>`).join("")}
   <p style="font-size:12px;opacity:.7">🎯 First goals: collect an egg, sell it, and protect your hens. ${realSeason()[0]} ${realSeason()[1]} now${HOL ? " · " + HOL.name : ""}.</p></div>`);
}
const pendingCode = (location.hash.match(/#(?:visit|gift)=(.+)$/) || [])[1];
function afterLoad() { if (pendingCode) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} setTimeout(() => redeem(pendingCode), 2600); } }
window.start = k => { const nm = $("#playerIn") ? $("#playerIn").value.trim().slice(0, 24) : ""; fresh(k); S.player = nm; S.started = true; S.login.last = new Date().toDateString(); S.login.days = 1;
  ["beetle", "cricket", "worm", "beetle"].forEach(b => spawnBug(b)); closeModal(); renderTools(); renderAll(); wander(); recenter();
  say(`${nm ? `Hi ${esc(nm)}! ` : ""}Grandma left you a coop, a feeder, and a waterer. Now what? <i>Tip: tap the feeder or waterer to refill them, and lock the coop at night. Drag the yard to look around.</i>`, 1); save(); loop(); afterLoad(); };
window.continueGame = () => { const sv = loadSave(); if (!sv) return; S = migrate(sv); S.started = true; henEls.forEach(el => el.remove()); henEls.clear(); henbarSig = "";
  closeModal(); renderTools(); renderAll(); wander(); recenter(); loginBonus(); awayGift(); say(`Welcome back${S.player ? ", " + esc(S.player) : ""}! The hens missed you. Probably. ${HOL ? HOL.line : ""}`, 1); loop(); afterLoad(); };
let timer, wtimer;
// Daytime hours last longer than night hours so players have time to build
const hourMs = () => (isNight() ? 2000 : 4500) / S.speed;
function step() { tick(); if (S.speed) timer = setTimeout(step, hourMs()); }
function loop() { startLoop(); clearTimeout(timer); clearInterval(timer); if (S.speed) timer = setTimeout(step, hourMs()); clearInterval(wtimer); wtimer = setInterval(wanderTick, 400); }
$("#guyArt").innerHTML = guySVG; initParticles(); initPan(); audioBtns(); $("#goalbar").onclick = goalsModal; $("#recenter").onclick = e => { e.stopPropagation(); recenter(); };

// Demo states for screenshots: ?demo=yard|night|shop|hensshop|coopshop|guardshop|henmodal|incubator|share|title|hawk|predator|goals|book|trade|land|barn|care|visit
const demo = new URLSearchParams(location.search).get("demo");
fresh("leghorn"); renderTools();
if (!demo) { renderAll(); say("Welcome to Coop City!"); title(); startLoop(); }
else {
  demoMode = true; S.started = true; S.coins = 48; S.day = 4; S.speed = 0; S.player = "Bill"; S.lvl = 3; S.xp = 22;
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
  if (/^(yard|hawk|predator|night|barn)$/.test(demo)) { clearInterval(wtimer); wtimer = setInterval(wanderTick, 400); }
}
// test hooks (read-only debugging)
window.__cc = { get S() { return S; }, pan, dayThreat, nightThreat, mkCode, readCode, farmSnap, frameLog: () => frameLog, SAVE_KEY, audio: () => ({ state: AC && AC.state, musicOn, soundOn, day: dayBus && +dayBus.gain.value.toFixed(2), night: nightBus && +nightBus.gain.value.toFixed(2), dayQ: { sec: DAYQ.sec, bar: DAYQ.bar, loop: DAYQ.loop, on: DAYQ.on }, nightQ: { on: NIGHTQ.on } }) };
})();
