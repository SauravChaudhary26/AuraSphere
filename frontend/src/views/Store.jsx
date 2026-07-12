import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { Sparkles, ShoppingBag, Check, Zap, Palette, Gift, Flame, Crown } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Modal,
  EmptyState,
  LoadingScreen,
} from "../components/ui";
import api from "../lib/http";
import { fetchPoints } from "../utils/redux/pointsSlice";
import { invalidateOwnedItems } from "../lib/useOwnedItems";
import { applyTheme, currentTheme, PREMIUM_THEMES } from "../lib/cosmetics";
import { fireConfetti } from "../components/StudyRoom/confetti";
import { useAuth } from "../contexts/AuthContext";
import { handleError, handleSuccess } from "../utils/ToastMessages";

/* Friendly labels + icons for the known categories; unknown ones fall back. */
const CATEGORY_META = {
  "power-ups": { label: "Power-ups", icon: <Zap size={16} /> },
  themes: { label: "Themes", icon: <Palette size={16} /> },
  cosmetics: { label: "Cosmetics", icon: <Crown size={16} /> },
  fun: { label: "Fun & Goodies", icon: <Gift size={16} /> },
};

function categoryMeta(key) {
  return (
    CATEGORY_META[key] || {
      label: key ? key.replace(/(^|[-_])(\w)/g, (_, __, c) => " " + c.toUpperCase()).trim() : "Other",
      icon: <ShoppingBag size={16} />,
    }
  );
}

/** "23h 12m" until a date, or null once it has passed. */
function timeLeft(until) {
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h <= 0 && m <= 0) return "<1m";
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* A gold pill showing the current Aura balance. */
function BalancePill({ balance }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold"
      style={{
        color: "var(--primary)",
        borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)",
        background: "color-mix(in srgb, var(--primary) 14%, transparent)",
      }}
    >
      <Sparkles size={17} />
      <span className="mono text-lg font-extrabold leading-none">
        {Number(balance || 0).toLocaleString()}
      </span>
      <span className="text-xs uppercase tracking-wide opacity-80">Aura</span>
    </div>
  );
}

/* Small status pills for streak / active boost. */
function StatusPill({ children, tone = "var(--warning)", title }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
      style={{ color: tone, background: `color-mix(in srgb, ${tone} 14%, transparent)` }}
      title={title}
    >
      {children}
    </span>
  );
}

/* Mini app mock-up painted with a theme's own palette — shown on theme cards. */
function ThemePreview({ preview }) {
  return (
    <div
      className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
      style={{ background: preview.bg, border: "1px solid var(--border)" }}
      aria-hidden="true"
    >
      <div
        className="flex h-10 w-11 flex-col gap-1 rounded-lg p-1.5"
        style={{ background: preview.card, boxShadow: "0 1px 4px rgba(0,0,0,.25)" }}
      >
        <span className="block h-1.5 w-6 rounded-full" style={{ background: preview.ink }} />
        <span className="block h-1.5 w-4 rounded-full opacity-40" style={{ background: preview.ink }} />
        <span className="mt-auto block h-2 w-2 self-end rounded-full" style={{ background: preview.accent }} />
      </div>
    </div>
  );
}

function StoreItemCard({ item, balance, themeNow, busyKey, onRedeem, onEquip, onApplyTheme }) {
  const owned = !!item.owned;
  const oneTime = item.kind !== "consumable";
  const affordable = balance >= item.cost;
  const short = Math.max(0, item.cost - balance);
  const busy = busyKey === item.key;

  const boostLeft = item.activeUntil ? timeLeft(item.activeUntil) : null;
  const themeId = item.effect?.theme;
  const themeApplied = themeId && themeNow === themeId;

  // Primary (purchase) button: consumables can always be re-bought (until a
  // server-side cap), one-time items only before they're owned.
  const showBuy = !oneTime || !owned;
  const buyDisabled = !item.purchasable || !affordable;
  const buyLabel = !item.purchasable
    ? item.note || "Unavailable"
    : !affordable
    ? `Need ${short.toLocaleString()} more`
    : owned && !oneTime
    ? "Redeem again"
    : "Redeem";

  const themePreview = PREMIUM_THEMES[item.key]?.preview;

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        {themePreview ? (
          <ThemePreview preview={themePreview} />
        ) : (
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-[34px] leading-none"
            style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
            aria-hidden="true"
          >
            {item.icon || "✨"}
          </div>
        )}
        <div className="flex flex-col items-end gap-1.5">
          {owned && oneTime && (
            <Badge variant="jade">
              <Check size={13} /> Owned
            </Badge>
          )}
          {item.key === "streak_freeze" && item.stock > 0 && (
            <Badge variant="jade">❄️ ×{item.stock} stocked</Badge>
          )}
          {item.key === "double_aura" && boostLeft && (
            <Badge variant="gold">⚡ Active · {boostLeft} left</Badge>
          )}
          {item.equipped && <Badge variant="gold">Equipped</Badge>}
          {themeApplied && <Badge variant="gold">In use</Badge>}
        </div>
      </div>

      <h3 className="mt-4 text-base font-bold text-ink">{item.name}</h3>
      {item.description && (
        <p className="mt-1 flex-1 text-sm text-muted">{item.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-primary">
          <Sparkles size={15} />
          <span className="mono text-lg font-extrabold leading-none">
            {Number(item.cost).toLocaleString()}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {/* Secondary action for owned cosmetics: equip / apply theme. */}
          {owned && item.slot && (
            <Button
              size="sm"
              variant={item.equipped ? "subtle" : "ghost"}
              loading={busy}
              onClick={() => onEquip(item, item.equipped ? null : item.key)}
              aria-label={item.equipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
            >
              {item.equipped ? (
                <>
                  <Check size={14} /> Equipped
                </>
              ) : (
                "Equip"
              )}
            </Button>
          )}
          {owned && themeId && (
            <Button
              size="sm"
              variant={themeApplied ? "subtle" : "ghost"}
              disabled={themeApplied}
              onClick={() => onApplyTheme(themeId)}
              aria-label={`Apply the ${item.name}`}
            >
              {themeApplied ? (
                <>
                  <Check size={14} /> Applied
                </>
              ) : (
                "Apply"
              )}
            </Button>
          )}

          {showBuy && (
            <Button
              size="sm"
              variant={buyDisabled ? "subtle" : "primary"}
              disabled={buyDisabled}
              onClick={() => onRedeem(item)}
              aria-label={`Redeem ${item.name} for ${item.cost} Aura`}
            >
              {buyLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/* The Mystery Box reveal: shake… then pop the prize.
   Tier thresholds mirror MYSTERY_PRIZES in backend/services/storeCatalog.js. */
const PRIZE_JACKPOT = 600; // the top prize
const PRIZE_BIG = 225; // beats the ticket price
function MysteryReveal({ reveal, onClose, onAgain, canAfford }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!reveal) return undefined;
    setShown(false);
    const t = setTimeout(() => {
      setShown(true);
      if (reveal.prize >= PRIZE_BIG) fireConfetti();
    }, 1100);
    return () => clearTimeout(t);
  }, [reveal]);

  if (!reveal) return null;
  return (
    <Modal open onClose={shown ? onClose : undefined} title="Mystery Box" size="sm">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        {!shown ? (
          <>
            <div className="animate-box-shake text-[72px] leading-none" aria-hidden="true">
              🎁
            </div>
            <p className="text-sm text-muted">Shaking it a little…</p>
          </>
        ) : (
          <>
            <div className="animate-prize-pop text-[56px] leading-none" aria-hidden="true">
              {reveal.prize >= PRIZE_JACKPOT ? "🌟" : reveal.prize >= PRIZE_BIG ? "💰" : "✨"}
            </div>
            <div className="animate-prize-pop">
              <div className="mono text-3xl font-extrabold text-primary">+{reveal.prize}</div>
              <div className="mt-1 text-sm text-muted">
                {reveal.prize >= PRIZE_JACKPOT
                  ? "JACKPOT! The box was feeling generous."
                  : reveal.prize >= PRIZE_BIG
                  ? "Nice pull — that beats the ticket price!"
                  : "The box giveth… modestly."}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Done
              </Button>
              <Button onClick={onAgain} disabled={!canAfford}>
                <Gift size={15} /> Open another
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function Store() {
  const dispatch = useDispatch();
  const { refresh: refreshAuth } = useAuth();
  const [balance, setBalance] = useState(0);
  const [streak, setStreak] = useState(null);
  const [boost, setBoost] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [themeNow, setThemeNow] = useState(currentTheme());
  const mysteryCost = useRef(150);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/store");
      setBalance(data?.balance ?? 0);
      setStreak(data?.streak ?? null);
      setBoost(data?.boost ?? null);
      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
      const box = list.find((i) => i.key === "mystery_box");
      if (box) mysteryCost.current = box.cost;
    } catch (err) {
      handleError("Couldn't load the Aura Store");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const afterPurchase = (data) => {
    if (typeof data?.balance === "number") setBalance(data.balance);
    invalidateOwnedItems();
    dispatch(fetchPoints());
    load();
  };

  const buy = async (item) => {
    const { data } = await api.post("/store/purchase", { itemKey: item.key });
    afterPurchase(data);
    return data;
  };

  const confirmPurchase = async () => {
    if (!selected) return;
    setPurchasing(true);
    try {
      const data = await buy(selected);
      if (selected.key === "mystery_box") {
        setReveal({ prize: data?.prize ?? 0 });
      } else {
        handleSuccess(data?.message || `Redeemed ${selected.name}!`);
      }
      setSelected(null);
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't complete that purchase");
    } finally {
      setPurchasing(false);
    }
  };

  const openAnotherBox = async () => {
    try {
      const data = await buy({ key: "mystery_box" });
      setReveal({ prize: data?.prize ?? 0, at: Date.now() });
    } catch (err) {
      setReveal(null);
      handleError(err?.response?.data?.message || "Couldn't open another box");
    }
  };

  const equip = async (item, itemKey) => {
    setBusyKey(item.key);
    try {
      await api.post("/store/equip", { slot: item.slot, itemKey });
      handleSuccess(itemKey ? `${item.name} equipped` : `${item.name} unequipped`);
      refreshAuth(); // profile header reads equipped off the auth user
      await load();
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't update your cosmetics");
    } finally {
      setBusyKey(null);
    }
  };

  const onApplyTheme = (themeId) => {
    applyTheme(themeId);
    setThemeNow(themeId);
    handleSuccess("Theme applied ✨");
  };

  if (loading) return <LoadingScreen label="Opening the Aura Store…" />;

  // Group items by category, preserving a sensible order.
  const groups = items.reduce((acc, item) => {
    const key = item.category || "other";
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
  const order = ["power-ups", "themes", "cosmetics", "fun"];
  const categoryKeys = [
    ...order.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !order.includes(k)),
  ];

  const boostLeft = boost?.active && boost.until ? timeLeft(boost.until) : null;

  return (
    <>
      <PageHeader
        eyebrow="Rewards"
        title="Aura Store"
        subtitle="Spend the Aura you've earned on power-ups, themes, cosmetics and fun."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {streak && (
              <StatusPill
                tone="var(--warning)"
                title={
                  streak.earnedToday
                    ? "You've kept your streak alive today"
                    : "Earn Aura today to keep your streak"
                }
              >
                <Flame size={15} /> {streak.current} day{streak.current === 1 ? "" : "s"}
              </StatusPill>
            )}
            {boostLeft && (
              <StatusPill tone="var(--primary)" title="Double Aura is active">
                <Zap size={15} /> 2× · {boostLeft}
              </StatusPill>
            )}
            <BalancePill balance={balance} />
          </div>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={40} />}
          title="The store is empty"
          subtitle="Check back soon — new rewards are on the way."
        />
      ) : (
        <div className="space-y-8">
          {categoryKeys.map((key) => {
            const meta = categoryMeta(key);
            return (
              <section key={key}>
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-lg text-primary"
                    style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
                    aria-hidden="true"
                  >
                    {meta.icon}
                  </span>
                  <h2 className="text-lg font-bold">{meta.label}</h2>
                  <span className="text-sm text-faint">({groups[key].length})</span>
                </div>
                {/* Themes is a big section — allow a 4th column on wide screens. */}
                <div
                  className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                    key === "themes" ? "xl:grid-cols-4" : ""
                  }`}
                >
                  {groups[key].map((item) => (
                    <StoreItemCard
                      key={item.key}
                      item={item}
                      balance={balance}
                      themeNow={themeNow}
                      busyKey={busyKey}
                      onRedeem={setSelected}
                      onEquip={equip}
                      onApplyTheme={onApplyTheme}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => !purchasing && setSelected(null)}
        title="Confirm redemption"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)} disabled={purchasing}>
              Cancel
            </Button>
            <Button onClick={confirmPurchase} loading={purchasing}>
              <Sparkles size={16} /> Redeem
            </Button>
          </>
        }
      >
        {selected && (
          <div className="flex items-center gap-4">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-[34px] leading-none"
              style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
              aria-hidden="true"
            >
              {selected.icon || "✨"}
            </div>
            <div>
              <div className="font-bold text-ink">{selected.name}</div>
              <p className="mt-0.5 text-sm text-muted">
                Spend{" "}
                <span className="mono font-bold text-primary">
                  {Number(selected.cost).toLocaleString()}
                </span>{" "}
                Aura? You'll have{" "}
                <span className="mono font-bold text-ink">
                  {Math.max(0, balance - selected.cost).toLocaleString()}
                </span>{" "}
                left.
              </p>
            </div>
          </div>
        )}
      </Modal>

      <MysteryReveal
        reveal={reveal}
        onClose={() => setReveal(null)}
        onAgain={openAnotherBox}
        canAfford={balance >= mysteryCost.current}
      />
    </>
  );
}
