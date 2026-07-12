jest.mock("../models/User", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock("../models/AuraTransaction", () => ({ create: jest.fn() }));
jest.mock("../services/streakService", () => ({ recordActivity: jest.fn() }));

const User = require("../models/User");
const AuraTransaction = require("../models/AuraTransaction");
const { recordActivity } = require("../services/streakService");
const { awardPoints } = require("../services/pointsService");

const chain = (result) => ({ select: () => ({ lean: async () => result }) });

describe("awardPoints (Double Aura boost + streak wiring)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AuraTransaction.create.mockResolvedValue({});
    recordActivity.mockResolvedValue(null);
    // The $inc write: resolve with the post-increment balance.
    User.findByIdAndUpdate.mockReturnValue({ select: async () => ({ aura: 999 }) });
  });

  const setBoostUntil = (date) => User.findById.mockReturnValue(chain({ boostUntil: date }));

  it("awards the base amount when no boost is active", async () => {
    setBoostUntil(null);
    const award = await awardPoints("u1", 10, "goal_completed");
    expect(award).toEqual({ balance: 999, amount: 10, boosted: false });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("u1", { $inc: { aura: 10 } }, { new: true });
    expect(recordActivity).toHaveBeenCalledWith("u1");
  });

  it("doubles the amount while the boost is active and records the doubled ledger row", async () => {
    setBoostUntil(new Date(Date.now() + 60_000));
    const award = await awardPoints("u1", 15, "assignment_completed");
    expect(award).toEqual({ balance: 999, amount: 30, boosted: true });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("u1", { $inc: { aura: 30 } }, { new: true });
    expect(AuraTransaction.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 30 }));
  });

  it("does not double once the boost has expired", async () => {
    setBoostUntil(new Date(Date.now() - 1000));
    const award = await awardPoints("u1", 10, "goal_completed");
    expect(award.amount).toBe(10);
    expect(award.boosted).toBe(false);
  });

  it("never doubles mystery-box winnings (and they don't count for streaks)", async () => {
    setBoostUntil(new Date(Date.now() + 60_000));
    const award = await awardPoints("u1", 400, "mystery_box");
    expect(award).toEqual({ balance: 999, amount: 400, boosted: false });
    expect(User.findById).not.toHaveBeenCalled(); // exempt: boost state never read
    expect(recordActivity).not.toHaveBeenCalled();
  });

  it("never doubles store refunds", async () => {
    setBoostUntil(new Date(Date.now() + 60_000));
    const award = await awardPoints("u1", 150, "store_refund");
    expect(award.amount).toBe(150);
    expect(recordActivity).not.toHaveBeenCalled();
  });

  it("still resolves the award when streak bookkeeping fails", async () => {
    setBoostUntil(null);
    recordActivity.mockRejectedValue(new Error("db hiccup"));
    const award = await awardPoints("u1", 10, "goal_completed");
    expect(award.balance).toBe(999);
  });

  it("rejects non-positive or non-numeric amounts", async () => {
    await expect(awardPoints("u1", 0, "goal_completed")).rejects.toThrow();
    await expect(awardPoints("u1", -5, "goal_completed")).rejects.toThrow();
    await expect(awardPoints("u1", "10", "goal_completed")).rejects.toThrow();
  });
});
