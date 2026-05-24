const colors: Record<string, string> = {
  requested: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  accepted:  "bg-blue-400/10  text-blue-400  border-blue-400/20",
  arriving:  "bg-orange-400/10 text-orange-400 border-orange-400/20",
  started:   "bg-green-400/10 text-green-400  border-green-400/20",
  completed: "bg-green-400/10 text-green-400  border-green-400/20",
  cancelled: "bg-red-400/10   text-red-400    border-red-400/20",
};

const labels: Record<string, string> = {
  requested: "Finding driver",
  accepted:  "Accepted",
  arriving:  "Driver arriving",
  started:   "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || "bg-gray-400/10 text-gray-400"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
}
