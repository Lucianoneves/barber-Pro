export function normalizePhone(value: string) {
  return (value || "").replace(/\D/g, "");
}

export function isValidPhone(phone: string) {
  return phone.length >= 10 && phone.length <= 13;
}
