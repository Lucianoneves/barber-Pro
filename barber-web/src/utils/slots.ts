export type SlotStatus = "available" | "occupied" | "past";

export interface SlotItem {
  at: string;
  status: SlotStatus;
}

export function normalizeDaySlots(data: unknown): {
  closed: boolean;
  slots: SlotItem[];
} {
  if (Array.isArray(data)) {
    return {
      closed: false,
      slots: data.map((item) =>
        typeof item === "string"
          ? { at: item, status: "available" as const }
          : {
              at: String((item as SlotItem)?.at || ""),
              status: (item as SlotItem)?.status || "available",
            }
      ),
    };
  }

  const payload = data as { closed?: boolean; slots?: unknown[] } | null;
  const rawSlots = Array.isArray(payload?.slots) ? payload.slots : [];

  return {
    closed: Boolean(payload?.closed),
    slots: rawSlots.map((item) =>
      typeof item === "string"
        ? { at: item, status: "available" as const }
        : {
            at: String((item as SlotItem)?.at || ""),
            status: (item as SlotItem)?.status || "available",
          }
    ),
  };
}
