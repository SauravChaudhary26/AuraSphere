const { dayString, daysBetween, nextStreak, effectiveStreak } = require("../services/streakService");

describe("streakService", () => {
  describe("dayString / daysBetween", () => {
    it("formats as YYYY-MM-DD", () => {
      expect(dayString(new Date("2026-07-12T10:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("counts whole days between day strings", () => {
      expect(daysBetween("2026-07-10", "2026-07-11")).toBe(1);
      expect(daysBetween("2026-07-10", "2026-07-10")).toBe(0);
      expect(daysBetween("2026-06-30", "2026-07-02")).toBe(2);
      expect(daysBetween("2026-07-11", "2026-07-10")).toBe(-1);
    });
  });

  describe("nextStreak", () => {
    it("starts a streak on first-ever activity", () => {
      expect(nextStreak(null, "2026-07-12")).toEqual({
        current: 1,
        longest: 1,
        lastDay: "2026-07-12",
        freezes: 0,
        changed: true,
      });
    });

    it("is a no-op when today already counted", () => {
      const s = { current: 4, longest: 6, lastDay: "2026-07-12", freezes: 2 };
      expect(nextStreak(s, "2026-07-12")).toEqual({ ...s, changed: false });
    });

    it("ignores activity dated before lastDay (clock oddities)", () => {
      const s = { current: 4, longest: 6, lastDay: "2026-07-12", freezes: 2 };
      expect(nextStreak(s, "2026-07-11")).toEqual({ ...s, changed: false });
    });

    it("increments on a consecutive day and tracks longest", () => {
      const next = nextStreak(
        { current: 3, longest: 3, lastDay: "2026-07-11", freezes: 0 },
        "2026-07-12"
      );
      expect(next).toMatchObject({ current: 4, longest: 4, lastDay: "2026-07-12" });
    });

    it("keeps a larger historical longest", () => {
      const next = nextStreak(
        { current: 2, longest: 10, lastDay: "2026-07-11", freezes: 0 },
        "2026-07-12"
      );
      expect(next).toMatchObject({ current: 3, longest: 10 });
    });

    it("bridges one missed day by consuming one freeze", () => {
      const next = nextStreak(
        { current: 5, longest: 5, lastDay: "2026-07-10", freezes: 1 },
        "2026-07-12"
      );
      expect(next).toMatchObject({ current: 6, longest: 6, freezes: 0 });
    });

    it("bridges multiple missed days when enough freezes are stocked", () => {
      const next = nextStreak(
        { current: 5, longest: 5, lastDay: "2026-07-09", freezes: 3 },
        "2026-07-12"
      );
      expect(next).toMatchObject({ current: 6, freezes: 1 });
    });

    it("resets when the gap exceeds the freeze stock — and KEEPS the freezes", () => {
      const next = nextStreak(
        { current: 9, longest: 9, lastDay: "2026-07-05", freezes: 2 },
        "2026-07-12"
      );
      expect(next).toMatchObject({ current: 1, longest: 9, freezes: 2 });
    });

    it("resets with zero freezes after a single missed day", () => {
      const next = nextStreak(
        { current: 7, longest: 7, lastDay: "2026-07-10", freezes: 0 },
        "2026-07-12"
      );
      expect(next).toMatchObject({ current: 1, longest: 7 });
    });
  });

  describe("effectiveStreak (display only)", () => {
    it("is 0 with no history", () => {
      expect(effectiveStreak(null, "2026-07-12")).toMatchObject({ current: 0, earnedToday: false });
    });

    it("reports earnedToday when today already counted", () => {
      const s = { current: 4, longest: 6, lastDay: "2026-07-12", freezes: 1 };
      expect(effectiveStreak(s, "2026-07-12")).toEqual({
        current: 4,
        longest: 6,
        freezes: 1,
        earnedToday: true,
      });
    });

    it("stays alive (at risk) when last activity was yesterday", () => {
      const s = { current: 4, longest: 6, lastDay: "2026-07-11", freezes: 0 };
      expect(effectiveStreak(s, "2026-07-12")).toMatchObject({ current: 4, earnedToday: false });
    });

    it("stays alive when freezes cover the gap", () => {
      const s = { current: 4, longest: 6, lastDay: "2026-07-09", freezes: 2 };
      expect(effectiveStreak(s, "2026-07-12")).toMatchObject({ current: 4 });
    });

    it("shows 0 when the gap is beyond the freeze stock", () => {
      const s = { current: 4, longest: 6, lastDay: "2026-07-08", freezes: 2 };
      expect(effectiveStreak(s, "2026-07-12")).toMatchObject({ current: 0, longest: 6 });
    });
  });
});
