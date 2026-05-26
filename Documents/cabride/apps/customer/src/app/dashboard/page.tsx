"use client";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useRide } from "@/hooks/useRide";
import { formatCurrency } from "@/utils";

function DashboardContent() {
  const { user, loading } = useAuth();
  const { ride, fetchActiveRide, cancelRide } = useRide();

  useEffect(() => { fetchActiveRide(); }, []);

  if (loading) return <DashboardSkeleton />;

  const hasActive = ride && !["completed", "cancelled"].includes(ride.status);

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* Greeting */}
        <div className="mb-2">
          <p className="text-gray-500 text-sm">Good day,</p>
          <h1 className="text-xl font-bold text-white">{user?.name || "Traveller"}</h1>
        </div>

        {/* Book CTA or Active ride */}
        {!hasActive ? (
          <Card padding="none" className="overflow-hidden">
            <div className="bg-yellow-400 px-5 py-6">
              <p className="text-black/60 text-xs font-medium uppercase tracking-wider mb-1">Ready to go?</p>
              <h2 className="text-black text-xl font-bold mb-4">Where are you going?</h2>
              <Link href="/book">
                <Button variant="primary" full size="lg"
                  className="!bg-black !text-white hover:!bg-gray-900">
                  🚖 Book a Ride
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525]">
              <span className="text-sm font-semibold text-white">Active Ride</span>
              <Badge status={ride!.status} />
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-green-400" />
                  <div className="w-px h-5 bg-[#2a2a2a]" />
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">Pickup</p>
                    <p className="text-sm text-white font-medium truncate">{ride!.pickup.address}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">Dropoff</p>
                    <p className="text-sm text-white font-medium truncate">{ride!.dropoff.address}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-gray-500 mb-0.5">Fare</p>
                  <p className="text-base font-bold text-yellow-400">{formatCurrency(ride!.fare.estimated)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-5 pb-4">
              <Link href={`/track/${ride!._id}`} className="flex-1">
                <Button full>Track Ride →</Button>
              </Link>
              {["requested", "accepted"].includes(ride!.status) && (
                <Button variant="danger" onClick={() => cancelRide("Customer cancelled")}>Cancel</Button>
              )}
            </div>
          </Card>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/book">
            <Card className="hover:border-yellow-400/30 transition-colors cursor-pointer !p-4">
              <p className="text-2xl mb-2">🗺️</p>
              <p className="text-sm font-semibold text-white">New Ride</p>
              <p className="text-xs text-gray-500 mt-0.5">Book now</p>
            </Card>
          </Link>
          <Link href="/history">
            <Card className="hover:border-yellow-400/30 transition-colors cursor-pointer !p-4">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm font-semibold text-white">History</p>
              <p className="text-xs text-gray-500 mt-0.5">Past rides</p>
            </Card>
          </Link>
        </div>

        {/* User info */}
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <span className="ml-auto shrink-0 text-xs bg-yellow-400/10 text-yellow-400 px-2.5 py-1 rounded-full font-medium">
              Customer
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <DashboardContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
