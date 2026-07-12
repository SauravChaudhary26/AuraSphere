import { useEffect, useState } from "react";
import api from "./http";

/**
 * The set of Aura Store item keys the signed-in user owns.
 * Cached at module level so dashboards/study rooms don't refetch on every
 * mount; the Store page invalidates it after a purchase.
 */

const EMPTY = new Set();
let cache = null;
let inflight = null;

export function invalidateOwnedItems() {
  cache = null;
  inflight = null;
}

export default function useOwnedItems() {
  const [owned, setOwned] = useState(cache || EMPTY);

  useEffect(() => {
    if (cache) {
      setOwned(cache);
      return undefined;
    }
    let active = true;
    inflight =
      inflight ||
      api
        .get("/store/redemptions")
        .then((r) => {
          cache = new Set((r.data?.redemptions || []).map((x) => x.itemKey));
          return cache;
        })
        .catch(() => {
          inflight = null; // allow a retry on next mount
          return EMPTY;
        });
    inflight.then((set) => {
      if (active) setOwned(set);
    });
    return () => {
      active = false;
    };
  }, []);

  return owned;
}
