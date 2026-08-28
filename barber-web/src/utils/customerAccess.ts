const CUSTOMER_ACCESS_PREFIX = "barberpro:customerAccess:";

export interface CustomerAccess {
  token: string;
  name: string;
  phone: string;
}

function storageKey(slug: string) {
  return `${CUSTOMER_ACCESS_PREFIX}${slug}`;
}

export function customerAuthHeaders(token: string) {
  return {
    "X-Customer-Token": token,
  };
}

export function saveCustomerAccess(slug: string, access: CustomerAccess) {
  if (typeof window === "undefined" || !slug || !access?.token) {
    return;
  }

  localStorage.setItem(
    storageKey(slug),
    JSON.stringify({
      token: access.token,
      name: access.name,
      phone: access.phone,
    })
  );
}

export function readCustomerAccess(slug: string): CustomerAccess | null {
  if (typeof window === "undefined" || !slug) {
    return null;
  }

  try {
    const raw = localStorage.getItem(storageKey(slug));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CustomerAccess;

    if (!parsed?.token || !parsed?.name || !parsed?.phone) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearCustomerAccess(slug: string) {
  if (typeof window === "undefined" || !slug) {
    return;
  }

  localStorage.removeItem(storageKey(slug));
}
