export const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export const formatTime = (date: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }).format(new Date(date));

export const STATUS_LABELS: Record<string, string> = {
  requested:  "Finding your driver...",
  accepted:   "Driver accepted!",
  arriving:   "Driver is arriving!",
  started:    "On the way!",
  completed:  "Ride completed",
  cancelled:  "Ride cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  requested:  "text-yellow-400",
  accepted:   "text-blue-400",
  arriving:   "text-orange-400",
  started:    "text-emerald-400",
  completed:  "text-emerald-400",
  cancelled:  "text-red-400",
};
