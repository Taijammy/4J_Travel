export const formatCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const formatTime = (date: string) =>
  new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }).format(new Date(date));

export const STATUS_LABELS: Record<string, string> = {
  requested:  "New Request",
  accepted:   "Accepted",
  arriving:   "Arriving",
  started:    "In Progress",
  completed:  "Completed",
  cancelled:  "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  requested:  "text-yellow-400",
  accepted:   "text-blue-400",
  arriving:   "text-orange-400",
  started:    "text-green-400",
  completed:  "text-emerald-400",
  cancelled:  "text-red-400",
};