"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useDriver } from "@/hooks/useDriver";
import { rideService } from "@/services/ride.service";
import { Ride } from "@/types";
import { formatCurrency } from "@/utils";
import { getSocket } from "@/lib/socket";

const RideMap = dynamic(() => import("@/components/map/RideMap"), { ssr: false });

// ── Haversine inline ──────────────────────────────────
function haversineDistance(
  from: { latitude: number; longitude: number },
  to:   { latitude: number; longitude: number }
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat  = toRad(to.latitude  - from.latitude);
  const dLon  = toRad(to.longitude - from.longitude);
  const a = Math.sin(dLat/2)**2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon/2)**2;
  const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const m  = km * 1000;
  const mins = Math.ceil((km / 30) * 60);
  return {
    display:  km < 1 ? `${Math.round(m)} m` : `${km.toFixed(1)} km`,
    eta:      mins < 1 ? "< 1 min" : `${mins} min`,
    isNearby: km < 1,
  };
}

// ── Status flow ───────────────────────────────────────
const STATUS_FLOW: Record<string, { next: string; action: string; socketEvent: string }> = {
  accepted: { next: "arriving",  action: "I'm Arriving →",  socketEvent: "ride:arriving" },
  arriving: { next: "started",   action: "Start Ride →",     socketEvent: "ride:start"    },
  started:  { next: "completed", action: "Complete Ride ✓",  socketEvent: "ride:complete" },
};

export default function RidePage() {
  const { user }  = useAuth();
  const { driver, fetchProfile } = useDriver();
  const router    = useRouter();

  const [ride,     setRide]     = useState<Ride | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);

  // Simulated driver location — starts near pickup, updates from simulator
  const [simCoords, setSimCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const driverId = driver?._id;
  const isActive = ride && !["completed", "cancelled"].includes(ride.status);

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    rideService.getActiveRide()
      .then(r => {
        setRide(r);
        // Set initial position near pickup — no real GPS
        if (r?.pickup) {
          const offset = () => (Math.random() - 0.5) * 0.012;
          setSimCoords({
            latitude:  r.pickup.latitude  + offset(),
            longitude: r.pickup.longitude + offset(),
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for location updates from simulator
  useEffect(() => {
    if (!user?.id || !ride?._id) return;
    const socket = getSocket(user.id, driverId);

    // Subscribe to own ride room to get simulator updates reflected on map
    socket.on("location:update", (data: any) => {
      if (data.latitude && data.longitude) {
        setSimCoords({ latitude: data.latitude, longitude: data.longitude });
      }
    });

    return () => { socket.off("location:update"); };
  }, [user?.id, ride?._id, driverId]);

  const handleStatusUpdate = async () => {
    if (!ride || !user?.id || !driverId) return;
    const flow = STATUS_FLOW[ride.status];
    if (!flow) return;
    try {
      setUpdating(true);
      const updated = await rideService.updateStatus(ride._id, flow.next);
      setRide(updated);
      const socket = getSocket(user.id, driverId);
      socket.emit(flow.socketEvent, { rideId: ride._id });
      if (flow.next === "completed") setTimeout(() => router.push("/dashboard"), 2000);
    } catch {} finally { setUpdating(false); }
  };

  // Distance to relevant target
  const distInfo = useMemo(() => {
    if (!simCoords || !ride) return null;
    const target = ["accepted","arriving"].includes(ride.status)
      ? ride.pickup
      : ride.dropoff;
    return haversineDistance(simCoords, target);
  }, [simCoords, ride]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <span className="spinner" />
    </div>
  );

  if (!ride) return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6 text-center py-16">
        <p className="text-4xl mb-3">🚖</p>
        <p className="text-white font-semibold mb-1">No active ride</p>
        <p className="text-gray-500 text-sm mb-6">Go online to receive ride requests</p>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    </div>
  );

  const flow   = STATUS_FLOW[ride.status];
  const isDone = ride.status === "completed";

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      <Navbar />

      {/* Map — centered on pickup, no real GPS */}
      <div className="flex-1 relative min-h-0 md:mt-14">
        <RideMap
          pickup={ride.pickup}
          dropoff={ride.dropoff}
          driverLocation={simCoords}
        />
        <div className="absolute top-4 left-4 z-10">
          <Badge status={ride.status} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="bg-[#0f0f0f] border-t border-[#1e1e1e] rounded-t-2xl overflow-y-auto"
        style={{ maxHeight:"58vh" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[#2a2a2a]" />
        </div>

        <div className="px-4 pb-6 pt-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Active Ride</p>
            <span className="text-xs text-gray-600 font-mono">#{ride._id.slice(-8).toUpperCase()}</span>
          </div>

          {/* Haversine distance card */}
          {distInfo && isActive && (
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#252525] rounded-xl px-4 py-3">
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                  Distance to {["accepted","arriving"].includes(ride.status) ? "pickup" : "dropoff"}
                </p>
                <p className={`text-sm font-bold ${distInfo.isNearby ? "text-green-400" : "text-white"}`}>
                  {distInfo.display}
                  {distInfo.isNearby && <span className="ml-1.5 text-xs font-normal text-green-400/70">Nearly there!</span>}
                </p>
              </div>
              <div className="w-px h-8 bg-[#252525]" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">ETA</p>
                <p className="text-sm font-bold text-white">{distInfo.eta}</p>
              </div>
            </div>
          )}

          {/* Customer card */}
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 font-bold shrink-0">
                {ride.customer?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{ride.customer?.name}</p>
                <p className="text-xs text-gray-500">{ride.customer?.phone || ride.customer?.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-gray-500">Fare</p>
                <p className="text-base font-bold text-yellow-400">{formatCurrency(ride.fare?.estimated || 0)}</p>
              </div>
            </div>
          </Card>

          {/* Route */}
          <div className="flex items-start gap-3 px-1">
            <div className="flex flex-col items-center gap-1 pt-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-green-400" />
              <div className="w-px h-5 bg-[#2a2a2a]" />
              <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Pickup</p>
                <p className="text-sm text-white truncate">{ride.pickup.address}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Dropoff</p>
                <p className="text-sm text-white truncate">{ride.dropoff.address}</p>
              </div>
            </div>
          </div>

          {/* Simulator hint */}
          {isActive && (
            <div className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-2.5">
              <span className="text-purple-400 text-sm">🎮</span>
              <p className="text-xs text-purple-400">
                Use <span className="font-mono font-bold">localhost:3001/simulator</span> to move the driver marker
              </p>
            </div>
          )}

          {/* Action button */}
          {isDone ? (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
                <p className="text-green-400 font-semibold">Ride Completed! 🎉</p>
                <p className="text-green-400/60 text-xs mt-0.5">Returning to dashboard...</p>
              </div>
              <Button full size="lg" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
          ) : flow ? (
            <Button full size="lg" loading={updating} onClick={handleStatusUpdate}
              variant={flow.next === "completed" ? "success" : "primary"}>
              {flow.action}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}