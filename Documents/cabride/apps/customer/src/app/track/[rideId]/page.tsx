"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import { useRide } from "@/hooks/useRide";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { getSocket } from "@/lib/socket";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils";

const RideMap = dynamic(() => import("@/components/map/RideMap"), { ssr: false });

const STEPS = ["requested", "accepted", "arriving", "started", "completed"];

const STATUS_MESSAGES: Record<string, string> = {
  requested:  "Looking for a driver...",
  accepted:   "Driver accepted your ride!",
  arriving:   "Driver is arriving at pickup!",
  started:    "You're on your way!",
  completed:  "Ride completed! 🎉",
  cancelled:  "Ride was cancelled",
};

export default function TrackPage() {
  const { rideId }  = useParams<{ rideId: string }>();
  const { user }    = useAuth();
  const { ride, setRide, fetchActiveRide, cancelRide } = useRide();
  const driverLoc   = useDriverLocation(rideId, user?.id ?? null);
  const router      = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const socketRef = useState<any>(null);

  useEffect(() => { if (rideId) fetchActiveRide(); }, [rideId]);

  // Setup socket and join ride room
  useEffect(() => {
    if (!user?.id || !rideId) return;

    const socket = getSocket(user.id);

    // Join the ride room so we receive events
    socket.emit("ride:subscribe", { rideId });
    console.log("📡 Customer subscribed to ride:", rideId);

    socket.on("ride:accepted", (data: any) => {
      console.log("✅ ride:accepted", data);
      setDriver(data.driver);
      setRide((p: any) => p ? { ...p, status: "accepted" } : p);
    });

    socket.on("ride:arriving", () => {
      console.log("✅ ride:arriving");
      setRide((p: any) => p ? { ...p, status: "arriving" } : p);
    });

    socket.on("ride:started", () => {
      console.log("✅ ride:started");
      setRide((p: any) => p ? { ...p, status: "started" } : p);
    });

    socket.on("ride:completed", () => {
      console.log("✅ ride:completed");
      setRide((p: any) => p ? { ...p, status: "completed" } : p);
    });

    socket.on("ride:cancelled", () => {
      console.log("✅ ride:cancelled");
      setRide((p: any) => p ? { ...p, status: "cancelled" } : p);
    });

    return () => {
      socket.off("ride:accepted");
      socket.off("ride:arriving");
      socket.off("ride:started");
      socket.off("ride:completed");
      socket.off("ride:cancelled");
    };
  }, [user?.id, rideId]);

  if (!ride) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <span className="spinner" />
    </div>
  );

  const isDone    = ["completed", "cancelled"].includes(ride.status);
  const stepIdx   = STEPS.indexOf(ride.status);
  const canCancel = ["requested", "accepted"].includes(ride.status);

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <RideMap pickup={ride.pickup} dropoff={ride.dropoff} driverLocation={driverLoc} />

        {/* Back button */}
        <button onClick={() => router.push("/dashboard")}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 bg-[#0f0f0f]/90 backdrop-blur-sm border border-[#1e1e1e] rounded-xl text-sm font-medium text-white hover:bg-[#1e1e1e] transition-colors">
          ← Back
        </button>

        {/* Live status floating badge */}
        <div className="absolute top-4 right-4 z-10 px-3 py-2 bg-[#0f0f0f]/90 backdrop-blur-sm border border-[#1e1e1e] rounded-xl">
          <Badge status={ride.status} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="bg-[#0f0f0f] border-t border-[#1e1e1e] rounded-t-2xl overflow-y-auto"
        style={{ maxHeight: "55vh" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[#2a2a2a]" />
        </div>

        <div className="px-4 pb-6 pt-2 space-y-4">

          {/* Status message */}
          <div className={`px-4 py-3 rounded-xl border text-sm font-medium
            ${ride.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400"
            : ride.status === "cancelled" ? "bg-red-500/10 border-red-500/20 text-red-400"
            : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"}`}>
            {STATUS_MESSAGES[ride.status]}
          </div>

          {/* Progress bar */}
          {!isDone && (
            <div>
              <div className="flex justify-between text-[11px] text-gray-600 mb-1.5">
                {STEPS.slice(0, -1).map((s, i) => (
                  <span key={s} className={i <= stepIdx ? "text-yellow-400" : ""}>{s}</span>
                ))}
              </div>
              <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(5, (stepIdx / (STEPS.length - 2)) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Driver card — shown after acceptance */}
          {driver && (
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#252525] rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                {driver.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{driver.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {[driver.vehicleColor, driver.vehicleModel, driver.vehicleNumber].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs text-yellow-400 font-semibold">★ {driver.rating?.toFixed(1)}</p>
                {driver.phone && (
                  <a href={`tel:${driver.phone}`} className="text-xs text-gray-500 hover:text-yellow-400 block transition-colors">Call</a>
                )}
              </div>
            </div>
          )}

          {/* Route summary */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-green-400" />
              <div className="w-px h-5 bg-[#2a2a2a]" />
              <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">From</p>
                <p className="text-sm text-white truncate">{ride.pickup.address}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">To</p>
                <p className="text-sm text-white truncate">{ride.dropoff.address}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-gray-500">Fare</p>
              <p className="text-base font-bold text-yellow-400">{formatCurrency(ride.fare?.estimated || 0)}</p>
            </div>
          </div>

          {/* Ride ID */}
          <p className="text-[11px] text-gray-600 font-mono text-center">
            Ride #{rideId?.slice(-8).toUpperCase()}
          </p>

          {/* CTA */}
          {isDone ? (
            <Button full size="lg" onClick={() => router.push("/dashboard")}>
              Back to Home
            </Button>
          ) : canCancel && (
            <Button full size="lg" variant="danger" onClick={() => cancelRide("Customer cancelled")}>
              Cancel Ride
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
