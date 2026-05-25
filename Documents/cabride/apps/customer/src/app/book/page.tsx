"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRide } from "@/hooks/useRide";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { Location } from "@/types";
import { formatCurrency } from "@/utils";

const LOCATIONS: Location[] = [
  { address: "Itanagar, Arunachal Pradesh",       latitude: 27.0844, longitude: 93.6053 },
  { address: "Naharlagun, Arunachal Pradesh",     latitude: 27.1045, longitude: 93.6955 },
  { address: "Pasighat, Arunachal Pradesh",       latitude: 28.0664, longitude: 95.3269 },
  { address: "Ziro, Arunachal Pradesh",           latitude: 27.5903, longitude: 93.8303 },
  { address: "Bomdila, Arunachal Pradesh",        latitude: 27.2645, longitude: 92.4159 },
  { address: "Tawang, Arunachal Pradesh",         latitude: 27.5861, longitude: 91.8594 },
  { address: "Roing, Arunachal Pradesh",          latitude: 28.1420, longitude: 95.8350 },
  { address: "Tezu, Arunachal Pradesh",           latitude: 27.9219, longitude: 96.1697 },
];

function calcFare(p: Location, d: Location) {
  const dist = Math.sqrt((d.latitude-p.latitude)**2 + (d.longitude-p.longitude)**2) * 111;
  return Math.max(50, Math.round((50 + dist * 18) * 100) / 100);
}

function LocationRow({ loc, onSelect }: { loc: Location; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#212121] border border-[#252525] hover:border-yellow-400/30 transition-all text-left group">
      <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center shrink-0 text-sm">📍</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-yellow-400 transition-colors">
          {loc.address}
        </p>
        <p className="text-xs text-gray-600 font-mono mt-0.5">
          {loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E
        </p>
      </div>
      <span className="text-gray-600 group-hover:text-yellow-400 transition-colors shrink-0">›</span>
    </button>
  );
}

export default function BookPage() {
  const { user }    = useAuth();
  const { requestRide, loading, error } = useRide();
  const { emit }    = useSocket(user?.id);
  const router      = useRouter();

  const [pickup,  setPickup]  = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [step,    setStep]    = useState<"pickup" | "dropoff" | "confirm">("pickup");

  const selectLoc = (loc: Location) => {
    if (step === "pickup") { setPickup(loc); setStep("dropoff"); }
    else { setDropoff(loc); setStep("confirm"); }
  };

  const reset = () => { setPickup(null); setDropoff(null); setStep("pickup"); };

  const handleBook = async () => {
    if (!pickup || !dropoff) return;
    try {
      const ride = await requestRide(pickup, dropoff);
      if (ride) {
        emit("ride:request", { rideId: ride._id, pickup: ride.pickup, dropoff: ride.dropoff, fare: ride.fare });
        router.push(`/track/${ride._id}`);
      }
    } catch {}
  };

  const fare = pickup && dropoff ? calcFare(pickup, dropoff) : null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-6">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Book a Ride</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select pickup and dropoff in Arunachal Pradesh</p>
        </div>

        {(pickup || dropoff) && (
          <Card padding="none" className="mb-4">
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1.5">
                <div className="w-2 h-2 rounded-full border-2 border-green-400" />
                <div className="w-px h-4 bg-[#2a2a2a]" />
                <div className="w-2 h-2 rounded-full border-2 border-yellow-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">From</p>
                  <p className="text-sm text-white truncate">{pickup?.address || "Select pickup..."}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">To</p>
                  <p className="text-sm text-white truncate">{dropoff?.address || "Select dropoff..."}</p>
                </div>
              </div>
              <button onClick={reset} className="text-gray-600 hover:text-gray-400 text-lg ml-2">✕</button>
            </div>
            {fare && (
              <div className="border-t border-[#252525] px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500">Estimated fare</span>
                <span className="text-sm font-bold text-yellow-400">{formatCurrency(fare)}</span>
              </div>
            )}
          </Card>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          {["Pickup", "Dropoff", "Confirm"].map((label, i) => {
            const stepMap = ["pickup","dropoff","confirm"];
            const done    = stepMap.indexOf(step) > i;
            const active  = stepMap[i] === step;
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done ? "bg-green-500 text-white" : active ? "bg-yellow-400 text-black" : "bg-[#1e1e1e] text-gray-600 border border-[#2a2a2a]"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium ${active ? "text-white" : done ? "text-green-400" : "text-gray-600"}`}>{label}</span>
                {i < 2 && <div className="w-4 h-px bg-[#2a2a2a] mx-0.5" />}
              </div>
            );
          })}
        </div>

        {step === "confirm" && pickup && dropoff ? (
          <div className="space-y-3">
            <Card padding="md">
              <h3 className="text-sm font-semibold text-white mb-4">Booking Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">From</span>
                  <span className="text-white font-medium text-right max-w-[60%] truncate">{pickup.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">To</span>
                  <span className="text-white font-medium text-right max-w-[60%] truncate">{dropoff.address}</span>
                </div>
                <div className="border-t border-[#252525] pt-3 flex justify-between">
                  <span className="text-gray-500 text-sm">Estimated fare</span>
                  <span className="text-yellow-400 font-bold text-lg">{formatCurrency(fare!)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="text-white">Cash</span>
                </div>
              </div>
            </Card>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={reset} size="lg">← Back</Button>
              <Button full size="lg" loading={loading} onClick={handleBook}>Confirm Booking</Button>
            </div>
          </div>
        ) : step !== "confirm" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              {step === "pickup" ? "Select pickup location" : "Select dropoff location"}
            </p>
            {LOCATIONS.filter(l => l.address !== pickup?.address).map(loc => (
              <LocationRow key={loc.address} loc={loc} onSelect={() => selectLoc(loc)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}