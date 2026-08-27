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

export function buildAvailableSlots({
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
  const occupiedTimes = new Set(
    occupied.map((item) => normalizeSlotDate(item).getTime())
  );
  const slots: Date[] = [];
  const step = interval * 60 * 1000;

  let current = normalizeSlotDate(open);

  while (current.getTime() + step <= close.getTime()) {
    const isOccupied = occupiedTimes.has(current.getTime());
    const isPast = current.getTime() <= now.getTime();

    if (!isOccupied && !isPast) {
      slots.push(new Date(current));
    }

    current = new Date(current.getTime() + step);
  }

  return slots;
}

export function isSameSlot(left: Date, right: Date) {
  return normalizeSlotDate(left).getTime() === normalizeSlotDate(right).getTime();
}
