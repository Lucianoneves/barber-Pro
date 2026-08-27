export const ALLOWED_INTERVALS = [15, 20, 30, 45, 60];

export function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidHourInput(value?: string | null) {
  if (!value) {
    return false;
  }

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function toLocalDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function weekdayFromDate(date: string) {
  return new Date(`${date}T12:00:00`).getDay();
}

export function dayRange(date: string) {
  return {
    start: new Date(`${date}T00:00:00`),
    end: new Date(`${date}T23:59:59.999`),
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
  const open = new Date(`${date}T${opens_at}:00`);
  const close = new Date(`${date}T${closes_at}:00`);
  const slots: { at: Date; status: SlotStatus }[] = [];
  const step = interval * 60 * 1000;

  let current = normalizeSlotDate(open);

  while (current.getTime() + step <= close.getTime()) {
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
