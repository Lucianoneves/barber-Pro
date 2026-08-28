export function normalizePhone(value: string) {
  return (value || "").replace(/\D/g, "").slice(0, 11);
}

export function isValidPhone(phone: string) {
  return phone.length >= 10 && phone.length <= 11;
}
