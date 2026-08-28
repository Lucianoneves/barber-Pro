export function normalizePersonName(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function namesMatch(left: string, right: string) {
  const first = normalizePersonName(left);
  const second = normalizePersonName(right);

  return Boolean(first) && first === second;
}
