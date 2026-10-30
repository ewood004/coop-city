// Species config. Add a new bird species by adding an entry here (art palette, product, breeds).
// Game code reads only this file for bird data, so pigeons, ducks, quail etc. can drop in later.
window.SPECIES = {
  chicken: {
    name: "Chickens", icon: "🐔", product: "egg", available: true,
    breeds: {
      leghorn: { name: "Leghorn", price: 0, layRate: 0.85, eggs: ["white"],
        art: { body: "#fbfaf3", wing: "#e9e6d8", comb: "#e53935", combSize: 1.3, legs: "#f6c343", beak: "#f2b134" },
        blurb: "Skinny, speedy, dramatic. An egg-laying machine.",
        fact: "Leghorns lay white eggs, and lots of them." },
      barred: { name: "Barred Rock", price: 25, layRate: 0.75, eggs: ["brown"],
        art: { body: "#e8e8e8", wing: "#cfcfcf", comb: "#e53935", pattern: "barred", legs: "#f6c343", beak: "#f2b134" },
        blurb: "Striped like a referee. Calm, friendly, nosy.",
        fact: "Barred Rocks (Plymouth Rocks) lay brown eggs." },
      wyandotte: { name: "Wyandotte", price: 30, layRate: 0.7, eggs: ["brown"],
        art: { body: "#f4f4f4", wing: "#e2e2e2", comb: "#e53935", combSize: 0.7, pattern: "laced", legs: "#f6c343", beak: "#f2b134" },
        blurb: "Fluffy, laced feathers. Handles cold like a champ.",
        fact: "Wyandottes lay brown eggs and have a small rose comb that resists frostbite." },
      lavender: { name: "Lavender Orpington", price: 40, layRate: 0.6, eggs: ["lightbrown"],
        art: { body: "#b7adc7", wing: "#a297b5", comb: "#e53935", fluffy: true, legs: "#d8cfc0", beak: "#e8d9b5" },
        blurb: "A giant lavender pillow with legs. Loves hugs. Mostly.",
        fact: "Lavender Orpingtons are big, fluffy, docile hens with soft lavender-grey feathers. They lay light brown eggs." },
      easter: { name: "Easter Egger", price: 45, layRate: 0.7, eggs: ["blue", "green"],
        art: { body: "#b98657", wing: "#8d5d36", comb: "#e57373", combSize: 0.6, muffs: true, legs: "#9aa38f", beak: "#c9a26b" },
        blurb: "Has a beard. Lays pastel eggs. Very Instagram.",
        fact: "Easter Eggers lay blue or green eggs. Each hen sticks to her own shade." },
      legbar: { name: "Cream Legbar", price: 55, layRate: 0.65, eggs: ["blue"],
        art: { body: "#e9e2d0", wing: "#c8bba2", comb: "#e53935", crest: "#d9cdb4", legs: "#f6c343", beak: "#f2b134" },
        blurb: "Has a little feather hat. Lays sky-blue eggs. Very fashion.",
        fact: "Cream Legbars lay blue eggs and are auto-sexing: you can tell boy and girl chicks apart by their down color at hatch." },
      // Hatch-only: not sold in the shop. Bill's nickname for an Ayam Cemani rooster x Leghorn hen cross.
      zombie: { name: "Zombie Chicken", price: 50, layRate: 0.7, eggs: ["white", "cream"], hatchOnly: true,
        art: { body: "#1e1e1e", wing: "#2a2a2a", comb: "#5a2f3c", pattern: "patchy", face: "#3a3a3a", legs: "#4a4a4a", beak: "#555", eye: "#111" },
        blurb: "Mostly black with spooky white patches. Rare hatch!",
        fact: "\"Zombie Chicken\" is a fun nickname for an Ayam Cemani x Leghorn cross. Crossbred chicks vary, and the Ayam Cemani's all-black skin and organs (fibromelanosis) don't reliably pass on in a cross. Egg color varies in crosses too: usually white or cream." },
      // Hatch-only: Bill's homegrown Ayam Cemani rooster x Laced Wyandotte hen cross. Not an official breed.
      mime: { name: "Mime chicken", price: 55, layRate: 0.65, eggs: ["brown", "cream"], hatchOnly: true,
        art: { body: "#1c1c1c", wing: "#262626", comb: "#4a2633", combSize: 0.7, pattern: "darklaced", face: "#2e2e2e", legs: "#3e3e3e", beak: "#4a4a4a", eye: "#111" },
        blurb: "Black-and-white lacing, like a tiny mime. Homegrown!",
        fact: "The \"Mime\" chicken is a homegrown Ayam Cemani x Laced Wyandotte cross, not an official recognized breed. Crossbred chicks vary, and so does egg color: usually brown or tinted." },
      marans: { name: "Marans", price: 60, layRate: 0.6, eggs: ["chocolate"], speckled: true,
        art: { body: "#2a2a2a", wing: "#3a3a3a", comb: "#e53935", hackle: "#b8642a", legs: "#cfc9b8", beak: "#d9c49a" },
        blurb: "Copper-necked and fancy. Famous for very dark eggs.",
        fact: "Marans lay the darkest chocolate-brown eggs, often speckled." },
      ayam: { name: "Ayam Cemani", price: 80, layRate: 0.3, eggs: ["cream"],
        art: { body: "#141414", wing: "#232323", comb: "#2b1f2e", legs: "#222", beak: "#333", eye: "#111" },
        blurb: "Black feathers, black skin, black comb. Goth icon.",
        fact: "MYTH BUSTED: Ayam Cemanis are black inside and out, but their eggs are cream. Not black! They're kept for looks, not eggs: about 80 to 120 a year." }
    },
    // Roosters don't lay. One is needed for fertile eggs (chicks). Chick breed = hen x rooster.
    roosters: {
      barnyard: { name: "Barnyard rooster", price: 15, guard: { alarm: 0.6, fight: 0.45 },
        art: { body: "#b5532a", wing: "#8f3d1e", comb: "#e53935", combSize: 1.5, hackle: "#e39a2e", tail: "#1f2b20", tail2: "#2f5a3a", legs: "#e0b13a", beak: "#e2a53a" },
        blurb: "Mixed breed, free spirit, zero chill. Thinks every crow (the bird) is a personal insult." },
      leghorn: { name: "Leghorn rooster", price: 35, guard: { alarm: 0.75, fight: 0.35 },
        art: { body: "#fbfaf3", wing: "#e9e6d8", comb: "#e53935", combSize: 1.6, hackle: "#f3ecd2", tail: "#f4f1e6", tail2: "#e2ddcc", legs: "#f6c343", beak: "#f2b134" },
        blurb: "Loud, proud, and convinced the sun rises because he yells at it. Spots hawks first, screams about it." },
      ayam: { name: "Ayam Cemani rooster", price: 90, guard: { alarm: 0.55, fight: 0.65 },
        art: { body: "#141414", wing: "#232323", comb: "#2b1f2e", combSize: 1.6, tail: "#101010", tail2: "#1d3a2f", legs: "#222", beak: "#333", eye: "#111" },
        blurb: "All black, all drama. Looks like he's headed to a goth concert. Will absolutely fight a hawk." }
    },
    roosterFact: "Hens lay eggs without a rooster. You only need a rooster for fertile eggs that can hatch into chicks."
  },
  pigeon: { name: "Pigeons", icon: "🕊️", product: "egg", available: false, comingSoon: true,
    teaser: "Rooftop pigeon lofts for true city birds. Coming soon!", breeds: {} }
};
window.EGG_COLORS = {
  white:     { fill: "#f7f4ea", label: "White", value: 4 },
  brown:     { fill: "#c98d5a", label: "Brown", value: 5 },
  lightbrown:{ fill: "#e0b98e", label: "Light brown", value: 5 },
  cream:     { fill: "#eedfc0", label: "Cream", value: 6 },
  blue:      { fill: "#a8d4e2", label: "Blue", value: 8 },
  green:     { fill: "#a9c49a", label: "Green", value: 8 },
  chocolate: { fill: "#6a3a24", label: "Chocolate", value: 10 },
  golden:    { fill: "#f5c518", label: "Golden (just for fun)", value: 40 }
};
