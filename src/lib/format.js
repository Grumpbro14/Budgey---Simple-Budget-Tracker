export function formatCurrency(amount, opts = {}) {
  const { sign = false, compact = false } = opts;
  const value = Number(amount) || 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2
  }).format(Math.abs(value));
  if (sign) {
    const prefix = value >= 0 ? "+" : "-";
    return `${prefix}${formatted}`;
  }
  return value < 0 ? `-${formatted}` : formatted;
}

export function monthKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isInMonth(dateStr, key) {
  if (!dateStr) return false;
  return dateStr.startsWith(key);
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}