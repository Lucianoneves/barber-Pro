const LAST_SHOP_KEY = "barberpro:lastShop";

interface LastShop {
  slug: string;
  name: string;
}

export function saveLastShop(shop: LastShop) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LAST_SHOP_KEY, JSON.stringify(shop));
}

export function readLastShop(): LastShop | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(LAST_SHOP_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as LastShop;

    if (!parsed?.slug || !parsed?.name) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
