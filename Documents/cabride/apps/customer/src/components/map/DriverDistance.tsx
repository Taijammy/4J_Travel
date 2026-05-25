"use client";
import { useMemo } from "react";
import { haversineDistance, estimateETA, Coords } from "@/utils/haversine";

interface Props {
  pickup:         Coords;
  driverLocation: Coords | null;
  rideStatus:     string;
}

/**
 * Shows live distance and ETA from driver to pickup point.
 * Only visible when driver is en route (accepted / arriving).
 */
export default function DriverDistance({ pickup, driverLocation, rideStatus }: Props) {
  const showDistance = ["accepted", "arriving"].includes(rideStatus) && driverLocation;

  const distance = useMemo(() => {
    if (!driverLocation) return null;
    return haversineDistance(driverLocation, pickup);
  }, [driverLocation, pickup]);

  const eta = useMemo(() => {
    if (!driverLocation) return null;
    return estimateETA(driverLocation, pickup);
  }, [driverLocation, pickup]);

  if (!showDistance || !distance || !eta) return null;

  return (
    <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#252525] rounded-xl px-4 py-3">
      {/* Distance */}
      <div className="flex items-center gap-2 flex-1">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          distance.isNearby ? "bg-green-400 animate-pulse" : "bg-yellow-400"
        }`} />
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">Driver distance</p>
          <p className={`text-sm font-bold ${
            distance.isNearby ? "text-green-400" : "text-white"
          }`}>
            {distance.display}
            {distance.isNearby && (
              <span className="ml-1.5 text-xs font-normal text-green-400/70">Nearly there!</span>
            )}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#252525]" />

      {/* ETA */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg shrink-0">⏱</span>
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide">ETA to pickup</p>
          <p className="text-sm font-bold text-white">{eta.display}</p>
        </div>
      </div>
    </div>
  );
}
