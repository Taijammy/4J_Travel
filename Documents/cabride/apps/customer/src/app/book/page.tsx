"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { HistorySkeleton } from "@/components/ui/Skeleton";
import { rideService } from "@/services/ride.service";
import { Ride } from "@/types";
import { formatCurrency, formatTime } from "@/utils";

function HistoryContent() {
  const [rides,   setRides]   = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rideService.getRideHistory().then(setRides).finally(() => setLoading(false));
  }, []);

  if (loading) return <HistorySkeleton />;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Ride History</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rides.length} trips total</p>
        </div>

        {rides.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚖</p>
            <p className="text-white font-semibold mb-1">No rides yet</p>
            <p className="text-gray-500 text-sm">Your completed trips will appear here</p>
          </div>
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
