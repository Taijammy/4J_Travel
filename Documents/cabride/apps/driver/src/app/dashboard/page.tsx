"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useDriver } from "@/hooks/useDriver";
import { useGeolocation } from "@/hooks/useGeolocation";
import { rideService } from "@/services/ride.service";
import { RideRequest } from "@/types";
import { formatCurrency } from "@/utils";
import { getSocket } from "@/lib/socket";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const { driver, fetchProfile, goOnline, goOffline } = useDriver();
  const router = useRouter();

  const [incomingRide, setIncomingRide] = useState<RideRequest | null>(null);
  const [accepting,    setAccepting]    = useState(false);
  const [statusMsg,    setStatusMsg]    = useState("");
  const socketInitialized = useRef(false);

  const driverId = driver?._id;
  const isOnline = driver?.isOnline || false;

  const { coords } = useGeolocation(isOnline, 3000);

  useEffect(() => { if (!loading && !user) router.replace("/auth"); }, [user, loading]);

  // Fetch profile first
  useEffect(() => { fetchProfile(); }, []);

  // Initialize socket ONLY after we have driverId
  useEffect(() => {
    if (!user?.id || !driverId || socketInitialized.current) return;
    socketInitialized.current = true;

    const socket = getSocket(user.id, driverId);

    socket.on("connect", () => {
      console.log("✅ Driver socket connected:", socket.id);
    });

    socket.on("ride:incoming", (data: RideRequest) => {
      console.log("🚖 Incoming ride:", data);
      setIncomingRide(data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Driver socket disconnected");
      socketInitialized.current = false;
    });

    return () => {
      socket.off("ride:incoming");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user?.id, driverId]);

  // Emit location updates
  useEffect(() => {
    if (!coords || !isOnline || !user?.id || !driverId) return;
    const socket = getSocket(user.id, driverId);
    socket.emit("location:update", { ...coords, rideId: null });
  }, [coords, isOnline, user?.id, driverId]);

  const handleToggle = async () => {
    try {
      if (!user?.id || !driverId) return;
      const socket = getSocket(user.id, driverId);

      if (isOnline) {
        await goOffline();
        socket.emit("driver:offline", { driverId });
        setStatusMsg("You are now offline");
      } else {
        await goOnline();
        socket.emit("driver:online", { driverId });
        setStatusMsg("You are now online");
      }
      setTimeout(() => setStatusMsg(""), 3000);
    } catch {}
  };

  const handleAccept = async () => {
    if (!incomingRide || !user?.id || !driverId) return;
    try {
      setAccepting(true);
      await rideService.acceptRide(incomingRide.rideId);
      const socket = getSocket(user.id, driverId);
      socket.emit("ride:accept", { rideId: incomingRide.rideId, driverId });
      setIncomingRide(null);
      router.push("/ride");
    } catch (err: any) {
      setIncomingRide(null);
    } finally { setAccepting(false); }
  };

  const handleDecline = () => setIncomingRide(null);

  if (loading || !driver) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <span className="spinner" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20 md:pb-8 md:pt-14">
      <Navbar />

      {/* Incoming ride popup */}
      {incomingRide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(4px)" }}>
          <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
            <div className="bg-yellow-400 px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">🚖</span>
              <div>
                <p className="font-bold text-black">New Ride Request!</p>
                <p className="text-black/70 text-xs">Respond now</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-green-400" />
                  <div className="w-px h-5 bg-[#2a2a2a]" />
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">Pickup</p>
                    <p className="text-sm text-white font-medium truncate">{incomingRide.pickup.address}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">Dropoff</p>
                    <p className="text-sm text-white font-medium truncate">{incomingRide.dropoff.address}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-gray-500">Fare</p>
                  <p className="text-lg font-bold text-yellow-400">{formatCurrency(incomingRide.fare.estimated)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="danger" size="lg" onClick={handleDecline} className="flex-1">Decline</Button>
                <Button size="lg" onClick={handleAccept} loading={accepting} className="flex-1">Accept ✓</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-gray-500 text-sm">Driver Dashboard</p>
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          </div>
          <Logo size="sm" />
        </div>

        {statusMsg && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <p className="text-green-400 text-sm font-medium">{statusMsg}</p>
          </div>
        )}

        {/* Online/Offline toggle */}
        <Card padding="none">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">
                {isOnline ? "You're Online" : "You're Offline"}
              </p>
              <p className="text-xs text-gray-500">
                {isOnline ? "Waiting for ride requests" : "Go online to receive rides"}
              </p>
            </div>
            <button onClick={handleToggle}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isOnline ? "bg-yellow-400" : "bg-[#2a2a2a]"}`}>
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${isOnline ? "left-7" : "left-0.5"}`} />
            </button>
          </div>
          {isOnline && (
            <div className="border-t border-[#252525] px-5 py-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${coords ? "bg-green-400" : "bg-yellow-400"}`} />
              <p className="text-xs text-gray-500">
                {coords ? `Location active · ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : "Getting location..."}
              </p>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Rides", value: driver?.totalRides || 0 },
            { label: "Rating",      value: driver ? `★ ${driver.rating.toFixed(1)}` : "—" },
            { label: "Status",      value: isOnline ? "Online" : "Offline", color: isOnline ? "text-green-400" : "text-gray-500" },
          ].map(({ label, value, color }) => (
            <Card key={label} padding="sm" className="text-center">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-base font-bold ${color || "text-white"}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Vehicle info */}
        <Card padding="none">
          <div className="px-5 py-3 border-b border-[#252525]">
            <p className="text-sm font-semibold text-white">Vehicle Info</p>
          </div>
          <div className="px-5 py-4 space-y-2">
            {driver?.vehicleModel ? (
              <>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Model</span><span className="text-white">{driver.vehicleModel}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Color</span><span className="text-white">{driver.vehicleColor || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Plate</span><span className="text-white font-mono">{driver.vehicleNumber || "—"}</span></div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No vehicle info added yet</p>
            )}
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="ml-auto text-xs text-gray-500 hover:text-red-400 transition-colors shrink-0">Sign out</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
