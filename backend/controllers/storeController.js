const { STORE_CATALOG, getStoreItem, rollMysteryPrize } = require("../services/storeCatalog");
const { awardPoints, spendPoints } = require("../services/pointsService");
const { effectiveStreak } = require("../services/streakService");
const Redemption = require("../models/Redemption");
const User = require("../models/User");

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const activeBoost = (boostUntil, now = Date.now()) => {
  const until = boostUntil ? new Date(boostUntil) : null;
  return until && until.getTime() > now ? until : null;
};

// Catalog + the viewer's balance, streak/boost state and per-item status.
const listStore = async (req, res, next) => {
  try {
    const [user, redemptions] = await Promise.all([
      User.findById(req.userId).select("aura streak boostUntil equipped").lean(),
      Redemption.find({ userId: req.userId }).select("itemKey").lean(),
    ]);

    const counts = {};
    for (const r of redemptions) counts[r.itemKey] = (counts[r.itemKey] || 0) + 1;

    const now = Date.now();
    const boostUntil = activeBoost(user?.boostUntil, now);
    const boost = { active: !!boostUntil, until: boostUntil };
    const streak = effectiveStreak(user?.streak);
    const equipped = user?.equipped || {};

    const items = STORE_CATALOG.map((item) => {
      const ownedCount = counts[item.key] || 0;
      const entry = {
        ...item,
        owned: ownedCount > 0,
        ownedCount,
        equipped: item.slot ? equipped[item.slot] === item.key : false,
        purchasable: true,
        note: null,
      };
      if (item.kind !== "consumable" && ownedCount > 0) {
        entry.purchasable = false;
        entry.note = "Owned";
      }
      if (item.key === "streak_freeze") {
        entry.stock = streak.freezes;
        if (streak.freezes >= item.maxStock) {
          entry.purchasable = false;
          entry.note = `Max ${item.maxStock} stocked`;
        }
      }
      if (item.key === "double_aura" && boostUntil) {
        entry.activeUntil = boostUntil;
        if (boostUntil.getTime() - now > item.effect.maxStackMs - item.effect.durationMs) {
          entry.purchasable = false;
          entry.note = "Stacked to the max";
        }
      }
      return entry;
    });

    res.json({ balance: user?.aura || 0, streak, boost, equipped, items });
  } catch (err) {
    next(err);
  }
};

/**
 * Apply what a freshly-paid item DOES, and write the receipt. Runs after the
 * spend succeeded; anything thrown here triggers a refund in `purchase`.
 * Returns extra response fields (new stock / boost expiry / prize).
 */
async function applyPurchase(userId, item) {
  const receipt = { userId, itemKey: item.key, name: item.name, cost: item.cost };

  switch (item.key) {
    case "streak_freeze": {
      // Conditional $inc guards the stock cap against concurrent purchases
      // ($lt won't match a doc already at the cap; $exists covers legacy docs
      // with no streak block yet, since $lt never matches a missing field).
      const updated = await User.findOneAndUpdate(
        {
          _id: userId,
          $or: [
            { "streak.freezes": { $lt: item.maxStock } },
            { "streak.freezes": { $exists: false } },
          ],
        },
        { $inc: { "streak.freezes": 1 } },
        { new: true }
      )
        .select("streak")
        .lean();
      if (!updated) throw badRequest(`You're already holding ${item.maxStock} Streak Freezes`);
      await Redemption.create(receipt);
      return { freezes: updated.streak?.freezes ?? 1, message: "Streak Freeze stocked ❄️" };
    }

    case "double_aura": {
      // Pipeline update = atomic "max(now, current) + 24h", so stacking two
      // concurrent purchases extends twice instead of clobbering.
      await User.updateOne({ _id: userId }, [
        {
          $set: {
            boostUntil: {
              $add: [{ $max: [{ $ifNull: ["$boostUntil", "$$NOW"] }, "$$NOW"] }, item.effect.durationMs],
            },
          },
        },
      ]);
      const updated = await User.findById(userId).select("boostUntil").lean();
      await Redemption.create(receipt);
      return { boostUntil: updated?.boostUntil || null, message: "Double Aura active ⚡ Everything you earn counts twice." };
    }

    case "mystery_box": {
      const prize = rollMysteryPrize();
      await Redemption.create({ ...receipt, meta: { won: prize } });
      const award = await awardPoints(userId, prize, "mystery_box", { model: "StoreItem" });
      return { prize, balance: award.balance, message: `The box cracks open… +${prize} Aura! 🎁` };
    }

    default: {
      // Unlocks and equippables: the receipt itself is the entitlement.
      await Redemption.create(receipt);
      return {};
    }
  }
}

// Purchase an item: server looks up the price and spends aura atomically.
const purchase = async (req, res, next) => {
  try {
    const { itemKey } = req.body;
    const item = getStoreItem(itemKey);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // One-time items can't be bought twice.
    if (item.kind !== "consumable") {
      const alreadyOwned = await Redemption.exists({ userId: req.userId, itemKey });
      if (alreadyOwned) {
        return res.status(400).json({ success: false, message: "You already own this item" });
      }
    }

    // Friendly pre-checks for consumable caps (the effect application itself
    // re-guards races, so these only exist to fail before taking payment).
    if (item.key === "streak_freeze" || item.key === "double_aura") {
      const user = await User.findById(req.userId).select("streak boostUntil").lean();
      if (item.key === "streak_freeze" && (user?.streak?.freezes || 0) >= item.maxStock) {
        return res
          .status(400)
          .json({ success: false, message: `You're already holding ${item.maxStock} Streak Freezes` });
      }
      if (item.key === "double_aura") {
        const until = activeBoost(user?.boostUntil);
        if (until && until.getTime() - Date.now() > item.effect.maxStackMs - item.effect.durationMs) {
          return res
            .status(400)
            .json({ success: false, message: "Double Aura is already stacked to its 3-day max" });
        }
      }
    }

    const balance = await spendPoints(req.userId, item.cost, "store_purchase", {
      model: "StoreItem",
    });

    let extras;
    try {
      extras = await applyPurchase(req.userId, item);
    } catch (effectErr) {
      // Never keep the aura when the item couldn't be delivered.
      await awardPoints(req.userId, item.cost, "store_refund", { model: "StoreItem" }).catch((e) =>
        console.error("[store] refund failed:", e.message)
      );
      throw effectErr;
    }

    const { message, balance: newBalance, ...rest } = extras;
    res.json({
      success: true,
      message: message || `Redeemed ${item.name}`,
      balance: newBalance ?? balance,
      itemKey: item.key,
      ...rest,
    });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

const EQUIP_SLOTS = ["badge", "frame", "nameEffect"];

// Equip (or unequip with itemKey: null) an owned cosmetic into a slot.
const equip = async (req, res, next) => {
  try {
    const { slot, itemKey } = req.body || {};
    if (!EQUIP_SLOTS.includes(slot)) {
      return res.status(400).json({ success: false, message: "Unknown cosmetic slot" });
    }
    if (itemKey != null) {
      const item = getStoreItem(itemKey);
      if (!item || item.slot !== slot) {
        return res.status(400).json({ success: false, message: "That item doesn't fit this slot" });
      }
      const owned = await Redemption.exists({ userId: req.userId, itemKey });
      if (!owned) {
        return res.status(403).json({ success: false, message: "You don't own that item yet" });
      }
    }
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: { [`equipped.${slot}`]: itemKey || null } },
      { new: true }
    )
      .select("equipped")
      .lean();
    res.json({ success: true, equipped: updated?.equipped || {} });
  } catch (err) {
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

module.exports = { listStore, purchase, equip, myRedemptions };
