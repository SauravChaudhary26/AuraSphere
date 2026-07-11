const { STORE_CATALOG, getStoreItem } = require("../services/storeCatalog");
const { getBalance, spendPoints } = require("../services/pointsService");
const Redemption = require("../models/Redemption");

// Catalog + the viewer's balance and what they already own.
const listStore = async (req, res, next) => {
  try {
    const [balance, redemptions] = await Promise.all([
      getBalance(req.userId),
      Redemption.find({ userId: req.userId }).select("itemKey").lean(),
    ]);
    const owned = new Set(redemptions.map((r) => r.itemKey));
    res.json({
      balance,
      items: STORE_CATALOG.map((i) => ({ ...i, owned: owned.has(i.key) })),
    });
  } catch (err) {
    next(err);
  }
};

// Purchase an item: server looks up the price and spends aura atomically.
const purchase = async (req, res, next) => {
  try {
    const { itemKey } = req.body;
    const item = getStoreItem(itemKey);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const alreadyOwned =
      item.category === "cosmetics" && (await Redemption.exists({ userId: req.userId, itemKey }));
    if (alreadyOwned) {
      return res.status(400).json({ success: false, message: "You already own this item" });
    }

    const balance = await spendPoints(req.userId, item.cost, "store_purchase", {
      model: "StoreItem",
    });
    await Redemption.create({ userId: req.userId, itemKey: item.key, name: item.name, cost: item.cost });

    res.json({ success: true, message: `Redeemed ${item.name}`, balance });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

const myRedemptions = async (req, res, next) => {
  try {
    const redemptions = await Redemption.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({ redemptions });
  } catch (err) {
    next(err);
  }
};

module.exports = { listStore, purchase, myRedemptions };
