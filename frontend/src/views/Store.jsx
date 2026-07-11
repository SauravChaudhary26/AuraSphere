import { useState, useEffect, useCallback } from "react";
import { Sparkles, ShoppingBag, Check, Zap, Palette } from "lucide-react";
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
import { handleError, handleSuccess } from "../utils/ToastMessages";

/* Friendly labels + icons for the known categories; unknown ones fall back. */
const CATEGORY_META = {
  "power-ups": { label: "Power-ups", icon: <Zap size={16} /> },
  cosmetics: { label: "Cosmetics", icon: <Palette size={16} /> },
};

function categoryMeta(key) {
  return (
    CATEGORY_META[key] || {
      label: key ? key.replace(/(^|[-_])(\w)/g, (_, __, c) => " " + c.toUpperCase()).trim() : "Other",
      icon: <ShoppingBag size={16} />,
    }
  );
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

function StoreItemCard({ item, balance, onRedeem }) {
  const owned = !!item.owned;
  const affordable = balance >= item.cost;
  const short = Math.max(0, item.cost - balance);
  const disabled = owned || !affordable;

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-[34px] leading-none"
          style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
          aria-hidden="true"
        >
          {item.icon || "✨"}
        </div>
        {owned && (
          <Badge variant="jade">
            <Check size={13} /> Owned
          </Badge>
        )}
      </div>

      <h3 className="mt-4 text-base font-bold text-ink">{item.name}</h3>
      {item.description && (
        <p className="mt-1 flex-1 text-sm text-muted">{item.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-primary">
          <Sparkles size={15} />
          <span className="mono text-lg font-extrabold leading-none">
            {Number(item.cost).toLocaleString()}
          </span>
        </span>

        <Button
          size="sm"
          variant={disabled ? "subtle" : "primary"}
          disabled={disabled}
          onClick={() => onRedeem(item)}
          aria-label={owned ? `${item.name} already owned` : `Redeem ${item.name} for ${item.cost} Aura`}
        >
          {owned ? "Owned" : affordable ? "Redeem" : `Need ${short.toLocaleString()} more`}
        </Button>
      </div>
    </Card>
  );
}

export default function Store() {
  const [balance, setBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/store");
      setBalance(data?.balance ?? 0);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      handleError("Couldn't load the Aura Store");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmPurchase = async () => {
    if (!selected) return;
    setPurchasing(true);
    try {
      const { data } = await api.post("/store/purchase", { itemKey: selected.key });
      handleSuccess(data?.message || `Redeemed ${selected.name}!`);
      if (typeof data?.balance === "number") setBalance(data.balance);
      setSelected(null);
      load();
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't complete that purchase");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <LoadingScreen label="Opening the Aura Store…" />;

  // Group items by category, preserving a sensible order.
  const groups = items.reduce((acc, item) => {
    const key = item.category || "other";
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
  const order = ["power-ups", "cosmetics"];
  const categoryKeys = [
    ...order.filter((k) => groups[k]),
    ...Object.keys(groups).filter((k) => !order.includes(k)),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Rewards"
        title="Aura Store"
        subtitle="Spend the Aura you've earned on power-ups and cosmetics."
        actions={<BalancePill balance={balance} />}
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groups[key].map((item) => (
                    <StoreItemCard
                      key={item.key}
                      item={item}
                      balance={balance}
                      onRedeem={setSelected}
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
    </>
  );
}
