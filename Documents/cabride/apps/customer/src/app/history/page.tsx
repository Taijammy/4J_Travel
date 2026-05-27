"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { HistorySkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { rideService } from "@/services/ride.service";
import { Ride } from "@/types";
import { formatCurrency, formatTime } from "@/utils";

function HistoryContent() {
  const [rides,   setRides]   = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    rideService.getRideHistory().then(setRides).finally(() => setLoading(false));
  }, []);

  if (loading) return <HistorySkeleton />;

  const completed = rides.filter(r => r.status === "completed").length;
  const cancelled = rides.filter(r => r.status === "cancelled").length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Ride History</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rides.length} trips total</p>
        </div>

        {/* Stats row — only show if rides exist */}
        {rides.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total",     value: rides.length,  color: "text-white" },
              { label: "Completed", value: completed,     color: "text-green-400" },
              { label: "Cancelled", value: cancelled,     color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <Card key={label} padding="sm" className="text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {rides.length === 0 ? (
          <EmptyState
            icon="🚖"
            title="No rides yet"
            description="Your completed trips will appear here. Book your first ride to get started!"
            action={{ label: "Book a Ride", onClick: () => router.push("/book") }}
          />
        ) : (
          <div className="space-y-3">
            {rides.map(ride => (
              <Card key={ride._id} padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#252525] bg-[#161616]">
                  <Badge status={ride.status} />
                  <span className="text-xs text-gray-600">{formatTime(ride.createdAt)}</span>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <div className="flex flex-col items-center gap-1 pt-1.5">
                    <div className="w-2 h-2 rounded-full border-2 border-green-400" />
                    <div className="w-px h-4 bg-[#2a2a2a]" />
                    <div className="w-2 h-2 rounded-full border-2 border-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <p className="text-sm text-white truncate">{ride.pickup.address}</p>
                    <p className="text-sm text-white truncate">{ride.dropoff.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-yellow-400">
                      {formatCurrency(ride.fare?.final || ride.fare?.estimated || 0)}
                    </p>
                    <p className="text-[11px] text-gray-600 font-mono mt-0.5">
                      #{ride._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <HistoryContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
