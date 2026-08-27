export const ALLOWED_INTERVALS = [15, 20, 30, 45, 60];
export const SHOP_TIMEZONE = "America/Sao_Paulo";
const SHOP_OFFSET = "-03:00";

export function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function normalizeHourInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = String(value).trim().match(/^([01]\d|2[0-3]):([0-5]\d)/);

  if (!match) {
    return null;
  }

  return `${match[1]}:${match[2]}`;
}

export function isValidHourInput(value?: string | null) {
  return Boolean(normalizeHourInput(value));
}

export function dateFromShopLocal(date: string, time = "00:00") {
  const hour = normalizeHourInput(time) || "00:00";
  return new Date(`${date}T${hour}:00${SHOP_OFFSET}`);
}

export function toLocalDateInput(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function weekdayFromDate(date: string) {
  return dateFromShopLocal(date, "12:00").getUTCDay();
}

export function dayRange(date: string) {
  return {
    start: dateFromShopLocal(date, "00:00"),
    end: new Date(dateFromShopLocal(date, "23:59").getTime() + 59 * 1000 + 999),
  };
}

export function normalizeSlotDate(value: Date) {
  const slot = new Date(value);
  slot.setSeconds(0, 0);
  return slot;
}

export type SlotStatus = "available" | "occupied" | "past";

export function buildDaySlots({
  date,
  opens_at,
  closes_at,
  interval,
  occupied,
  now = new Date(),
}: {
  date: string;
  opens_at: string;
  closes_at: string;
  interval: number;
  occupied: Date[];
  now?: Date;
}) {
  const open = dateFromShopLocal(date, opens_at);
  const close = dateFromShopLocal(date, closes_at);
  const slots: { at: Date; status: SlotStatus }[] = [];
  const step = interval * 60 * 1000;

  let current = normalizeSlotDate(open);

  while (current.getTime() <= close.getTime()) {
    const isOccupied = occupiesSlotWindow(current, occupied, interval);
    const isPast = current.getTime() <= now.getTime();
    const status: SlotStatus = isPast
      ? "past"
      : isOccupied
        ? "occupied"
        : "available";

    slots.push({
      at: new Date(current),
      status,
    });

    current = new Date(current.getTime() + step);
  }

  return slots;
}

export function buildAvailableSlots(
  params: Parameters<typeof buildDaySlots>[0]
) {
  return buildDaySlots(params)
    .filter((slot) => slot.status === "available")
    .map((slot) => slot.at);
}

export function isSameSlot(left: Date, right: Date) {
  return normalizeSlotDate(left).getTime() === normalizeSlotDate(right).getTime();
}

export function occupiesSlotWindow(
  slot: Date,
  occupied: Date[],
  intervalMinutes: number
) {
  const start = normalizeSlotDate(slot).getTime();
  const end = start + intervalMinutes * 60 * 1000;

  return occupied.some((item) => {
    const taken = normalizeSlotDate(item).getTime();
    return taken >= start && taken < end;
  });
}
