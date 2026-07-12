const {
  STORE_CATALOG,
  getStoreItem,
  PREMIUM_REACTION_EMOJIS,
  MYSTERY_PRIZES,
  rollMysteryPrize,
} = require("../services/storeCatalog");
const { REACTION_EMOJIS } = require("../sockets/studyRoom/constants");

const KINDS = ["consumable", "unlock", "equippable"];
const CATEGORIES = ["power-ups", "cosmetics", "fun"];
const SLOTS = ["badge", "frame", "nameEffect"];

describe("storeCatalog", () => {
  it("has unique keys", () => {
    const keys = STORE_CATALOG.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every item is well-formed", () => {
    for (const item of STORE_CATALOG) {
      expect(typeof item.key).toBe("string");
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(Number.isInteger(item.cost)).toBe(true);
      expect(item.cost).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(item.category);
      expect(KINDS).toContain(item.kind);
    }
  });

  it("equippables have a valid slot; nothing else does", () => {
    for (const item of STORE_CATALOG) {
      if (item.kind === "equippable") expect(SLOTS).toContain(item.slot);
      else expect(item.slot).toBeUndefined();
    }
  });

  it("themes carry the theme id their CSS is keyed on", () => {
    const themes = STORE_CATALOG.filter((i) => i.key.startsWith("theme_"));
    expect(themes.length).toBeGreaterThanOrEqual(3);
    for (const t of themes) expect(t.effect?.theme).toBeTruthy();
  });

  it("getStoreItem resolves known keys and rejects unknown ones", () => {
    expect(getStoreItem("mystery_box")?.name).toBe("Mystery Box");
    expect(getStoreItem("nope")).toBeNull();
  });

  it("premium reactions never overlap the free set", () => {
    for (const emoji of PREMIUM_REACTION_EMOJIS) {
      expect(REACTION_EMOJIS).not.toContain(emoji);
    }
  });

  describe("mystery box economics", () => {
    it("chances sum to exactly 1", () => {
      const total = MYSTERY_PRIZES.reduce((s, p) => s + p.chance, 0);
      expect(total).toBeCloseTo(1, 9);
    });

    it("keeps a house edge (EV below the ticket price)", () => {
      const ticket = getStoreItem("mystery_box").cost;
      const ev = MYSTERY_PRIZES.reduce((s, p) => s + p.chance * p.prize, 0);
      expect(ev).toBeLessThan(ticket);
      expect(ev).toBeGreaterThan(ticket * 0.5); // still generous enough to be fun
    });

    it("all prizes are positive integers", () => {
      for (const { prize } of MYSTERY_PRIZES) {
        expect(Number.isInteger(prize)).toBe(true);
        expect(prize).toBeGreaterThan(0);
      }
    });

    it("rolls deterministically across the cumulative boundaries", () => {
      expect(rollMysteryPrize(0)).toBe(20);
      expect(rollMysteryPrize(0.3499)).toBe(20);
      expect(rollMysteryPrize(0.35)).toBe(50);
      expect(rollMysteryPrize(0.649)).toBe(50);
      expect(rollMysteryPrize(0.65)).toBe(100);
      expect(rollMysteryPrize(0.85)).toBe(150);
      expect(rollMysteryPrize(0.95)).toBe(400);
      expect(rollMysteryPrize(0.999999)).toBe(400);
      expect(rollMysteryPrize(1)).toBe(400); // defensive: rand01 should be < 1
    });

    it("random rolls always land on a defined prize", () => {
      const allowed = new Set(MYSTERY_PRIZES.map((p) => p.prize));
      for (let i = 0; i < 500; i++) expect(allowed.has(rollMysteryPrize())).toBe(true);
    });
  });
});
