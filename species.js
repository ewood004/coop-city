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
      easter: { name: "Easter Egger", price: 45, layRate: 0.7, eggs: ["blue", "green"],
        art: { body: "#b98657", wing: "#8d5d36", comb: "#e57373", combSize: 0.6, muffs: true, legs: "#9aa38f", beak: "#c9a26b" },
        blurb: "Has a beard. Lays pastel eggs. Very Instagram.",
        fact: "Easter Eggers lay blue or green eggs. Each hen sticks to her own shade." },
      marans: { name: "Marans", price: 60, layRate: 0.6, eggs: ["chocolate"], speckled: true,
        art: { body: "#2a2a2a", wing: "#3a3a3a", comb: "#e53935", hackle: "#b8642a", legs: "#cfc9b8", beak: "#d9c49a" },
        blurb: "Copper-necked and fancy. Famous for very dark eggs.",
        fact: "Marans lay the darkest chocolate-brown eggs, often speckled." },
      ayam: { name: "Ayam Cemani", price: 80, layRate: 0.5, eggs: ["cream"],
        art: { body: "#141414", wing: "#232323", comb: "#2b1f2e", legs: "#222", beak: "#333", eye: "#111" },
        blurb: "Black feathers, black skin, black comb. Goth icon.",
        fact: "MYTH BUSTED: Ayam Cemanis are black inside and out, but their eggs are cream. Not black!" }
    }
  },
  pigeon: { name: "Pigeons", icon: "🕊️", product: "egg", available: false, comingSoon: true,
    teaser: "Rooftop pigeon lofts for true city birds. Coming soon!", breeds: {} }
};
window.EGG_COLORS = {
  white:     { fill: "#f7f4ea", label: "White", value: 2 },
  brown:     { fill: "#c98d5a", label: "Brown", value: 3 },
  cream:     { fill: "#eedfc0", label: "Cream", value: 4 },
  blue:      { fill: "#a8d4e2", label: "Blue", value: 5 },
  green:     { fill: "#a9c49a", label: "Green", value: 5 },
  chocolate: { fill: "#6a3a24", label: "Chocolate", value: 6 }
};
