export const DEFAULT_SLOT_INTERVAL = 30;

export function getDefaultBusinessHours() {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
    const closed = weekday === 0 || weekday === 1;

    return {
      weekday,
      closed,
      opens_at: closed ? null : "09:00",
      closes_at: closed ? null : "19:00",
    };
  });
}
