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

const STEPS = ["requested","accepted","arriving","started","completed"];

export default function TrackPage() {
  const { rideId }  = useParams<{ rideId: string }>();
  const { user }    = useAuth();
  const { ride, setRide, fetchActiveRide, cancelRide } = useRide();
  const driverLoc   = useDriverLocation(rideId, user?.id ?? null);
  const router      = useRouter();
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => { if (rideId) fetchActiveRide(); }, [rideId]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket(user.id);
    socket.on("ride:accepted",  (d: any) => { setDriver(d.driver); setRide((p:any) => p ? {...p, status:"accepted"}  : p); });
    socket.on("ride:arriving",  ()       => setRide((p:any) => p ? {...p, status:"arriving"}  : p));
    socket.on("ride:started",   ()       => setRide((p:any) => p ? {...p, status:"started"}   : p));
    socket.on("ride:completed", ()       => setRide((p:any) => p ? {...p, status:"completed"} : p));
    socket.on("ride:cancelled", ()       => setRide((p:any) => p ? {...p, status:"cancelled"} : p));
    return () => { ["ride:accepted","ride:arriving","ride:started","ride:completed","ride:cancelled"].forEach(e => socket.off(e)); };
  }, [user?.id]);

  if (!ride) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <span className="spinner" />
    </div>
  );

  const isDone    = ["completed","cancelled"].includes(ride.status);
  const stepIdx   = STEPS.indexOf(ride.status);
  const canCancel = ["requested","accepted"].includes(ride.status);

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
      </div>

      {/* Bottom sheet */}
      <div className="bg-[#0f0f0f] border-t border-[#1e1e1e] rounded-t-2xl overflow-y-auto"
        style={{ maxHeight:"50vh" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[#2a2a2a]" />
        </div>

        <div className="px-4 pb-6 pt-3 space-y-4">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <Badge status={ride.status} />
            <span className="text-xs text-gray-600 font-mono">#{rideId?.slice(-8).toUpperCase()}</span>
          </div>

          {/* Progress bar */}
          {!isDone && (
            <div>
              <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                  style={{ width:`${Math.max(10,(stepIdx/(STEPS.length-2))*100)}%` }} />
              </div>
            </div>
          )}

          {/* Driver card */}
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
                <a href={`tel:${driver.phone}`} className="text-xs text-gray-500 hover:text-yellow-400 block transition-colors">
                  Call
                </a>
              </div>
            </div>
          )}

          {/* Route */}
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
              <p className="text-base font-bold text-yellow-400">{formatCurrency(ride.fare?.estimated||0)}</p>
            </div>
          </div>

          {/* CTA */}
          {isDone ? (
            <Button full size="lg" onClick={() => router.push("/dashboard")}>Back to Home</Button>
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
