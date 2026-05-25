"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { authService } from "@/services/auth.service";
import { rideService } from "@/services/ride.service";
import { driverService } from "@/services/driver.service";
import { formatCurrency } from "@/utils";
import { haversineDistance } from "@/utils/haversine";

// ── Mumbai locations matching customer app ────────────
const MUMBAI_LOCATIONS = [
  { address: "Gateway of India, Mumbai",     latitude: 18.9220, longitude: 72.8347 },
  { address: "Bandra Kurla Complex, Mumbai", latitude: 19.0596, longitude: 72.8656 },
  { address: "Juhu Beach, Mumbai",           latitude: 19.0883, longitude: 72.8264 },
  { address: "Chhatrapati Shivaji Terminal", latitude: 18.9398, longitude: 72.8355 },
  { address: "Powai Lake, Mumbai",           latitude: 19.1197, longitude: 72.9051 },
  { address: "Andheri West, Mumbai",         latitude: 19.1307, longitude: 72.8297 },
  { address: "Dadar Station, Mumbai",        latitude: 19.0178, longitude: 72.8478 },
  { address: "Navi Mumbai, Vashi",           latitude: 19.0771, longitude: 73.0007 },
];

// ── Start 1-2 km away from a given point ─────────────
function startNearby(target: { latitude: number; longitude: number }) {
  const offsetLat = (Math.random() - 0.5) * 0.018; // ~1-2km
  const offsetLng = (Math.random() - 0.5) * 0.018;
  return {
    latitude:  parseFloat((target.latitude  + offsetLat).toFixed(6)),
    longitude: parseFloat((target.longitude + offsetLng).toFixed(6)),
  };
}

// ── Interpolate toward target ─────────────────────────
function moveToward(
  current: { latitude: number; longitude: number },
  target:  { latitude: number; longitude: number },
  step = 0.0008 // ~80m per tick
) {
  const dLat = target.latitude  - current.latitude;
  const dLng = target.longitude - current.longitude;
  const dist  = Math.sqrt(dLat * dLat + dLng * dLng);

  if (dist < step) return { ...target }; // arrived

  const ratio = step / dist;
  // Add tiny jitter for realistic GPS wobble
  const jitter = () => (Math.random() - 0.5) * 0.00005;

  return {
    latitude:  parseFloat((current.latitude  + dLat * ratio + jitter()).toFixed(6)),
    longitude: parseFloat((current.longitude + dLng * ratio + jitter()).toFixed(6)),
  };
}

type Phase = "idle" | "to_pickup" | "to_dropoff" | "done";

interface LogEntry { time: string; msg: string; type: "info"|"success"|"warn"|"error"; }

export default function SimulatorPage() {
  const user   = authService.getStoredUser();
  const userId = user?.id;

  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [activeRide,    setActiveRide]    = useState<any>(null);
  const [phase,         setPhase]         = useState<Phase>("idle");
  const [coords,        setCoords]        = useState<{ latitude: number; longitude: number } | null>(null);
  const [running,       setRunning]       = useState(false);
  const [log,           setLog]           = useState<LogEntry[]>([]);
  const [tickCount,     setTickCount]     = useState(0);
  const [distance,      setDistance]      = useState<string>("");

  const intervalRef  = useRef<NodeJS.Timeout | null>(null);
  const phaseRef     = useRef<Phase>("idle");
  const coordsRef    = useRef<{ latitude: number; longitude: number } | null>(null);
  const rideRef      = useRef<any>(null);

  phaseRef.current  = phase;
  coordsRef.current = coords;
  rideRef.current   = activeRide;

  const addLog = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLog(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  }, []);

  // Load driver profile and active ride
  const loadData = useCallback(async () => {
    try {
      const profile = await driverService.getProfile();
      setDriverProfile(profile);

      const ride = await rideService.getActiveRide();
      if (ride) {
        setActiveRide(ride);
        rideRef.current = ride;
        addLog(`Active ride found: ${ride._id.slice(-6).toUpperCase()}`, "success");
        addLog(`Pickup: ${ride.pickup.address}`, "info");
        addLog(`Dropoff: ${ride.dropoff.address}`, "info");
      } else {
        addLog("No active ride. Accept a ride first.", "warn");
      }
    } catch (err: any) {
      addLog(`Load failed: ${err.message}`, "error");
    }
  }, [addLog]);

  useEffect(() => { loadData(); }, []);

  const startSimulation = useCallback(() => {
    const ride = rideRef.current;
    if (!ride) { addLog("No active ride to simulate", "error"); return; }
    if (!userId) { addLog("Not logged in", "error"); return; }

    // Start near pickup point
    const startPos = startNearby(ride.pickup);
    setCoords(startPos);
    coordsRef.current = startPos;
    setPhase("to_pickup");
    phaseRef.current = "to_pickup";
    setRunning(true);
    setTickCount(0);
    addLog("🚖 Simulator started — driving to pickup", "success");

    const socket = getSocket(userId, driverProfile?._id);

    intervalRef.current = setInterval(() => {
      const current = coordsRef.current;
      const currentRide = rideRef.current;
      const currentPhase = phaseRef.current;

      if (!current || !currentRide) return;

      let target: { latitude: number; longitude: number };
      let nextPhase: Phase | null = null;

      if (currentPhase === "to_pickup") {
        target = currentRide.pickup;
        const dist = haversineDistance(current, target);
        if (dist.metres < 80) {
          nextPhase = "to_dropoff";
          addLog("📍 Arrived at pickup — driving to dropoff", "success");
        }
      } else if (currentPhase === "to_dropoff") {
        target = currentRide.dropoff;
        const dist = haversineDistance(current, target);
        if (dist.metres < 80) {
          nextPhase = "done";
          addLog("🏁 Arrived at dropoff!", "success");
        }
      } else {
        return;
      }

      const newCoords = moveToward(current, target);
      setCoords(newCoords);
      coordsRef.current = newCoords;
      setTickCount(t => t + 1);

      // Calculate and show distance
      const distToTarget = haversineDistance(newCoords, target);
      setDistance(distToTarget.display);

      // Emit to Socket.IO
      socket.emit("location:update", {
        rideId:    currentRide._id,
        latitude:  newCoords.latitude,
        longitude: newCoords.longitude,
        speed:     25 + Math.random() * 10, // 25-35 km/h
        heading:   0,
        accuracy:  5,
      });

      addLog(`📡 lat:${newCoords.latitude.toFixed(5)} lng:${newCoords.longitude.toFixed(5)} · ${distToTarget.display} to ${currentPhase === "to_pickup" ? "pickup" : "dropoff"}`, "info");

      if (nextPhase) {
        setPhase(nextPhase);
        phaseRef.current = nextPhase;
        if (nextPhase === "done") {
          stopSimulation();
        }
      }
    }, 3000);
  }, [userId, driverProfile, addLog]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    addLog("⏹ Simulator stopped", "warn");
  }, [addLog]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const logColors: Record<string, string> = {
    info:    "text-gray-400",
    success: "text-green-400",
    warn:    "text-yellow-400",
    error:   "text-red-400",
  };

  const phaseLabels: Record<Phase, string> = {
    idle:        "Idle",
    to_pickup:   "→ Driving to pickup",
    to_dropoff:  "→ Driving to dropoff",
    done:        "✓ Journey complete",
  };

  const phaseColors: Record<Phase, string> = {
    idle:       "text-gray-500",
    to_pickup:  "text-yellow-400",
    to_dropoff: "text-blue-400",
    done:       "text-green-400",
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-10">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#252525] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xs">4J</span>
              </div>
              <span className="font-bold text-white">4jtravel</span>
              <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Demo Simulator
              </span>
            </div>
            <p className="text-xs text-gray-500">Driver location simulator for interview demo</p>
          </div>
          <button onClick={loadData}
            className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a]">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* Active Ride Card */}
        {activeRide ? (
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525] bg-[#161616]">
              <span className="text-sm font-semibold text-white">Active Ride</span>
              <span className="text-xs font-mono text-gray-500">#{activeRide._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-green-400" />
                  <div className="w-px h-5 bg-[#2a2a2a]" />
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pickup</p>
                    <p className="text-sm text-white">{activeRide.pickup.address}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Dropoff</p>
                    <p className="text-sm text-white">{activeRide.dropoff.address}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-500">Fare</p>
                  <p className="font-bold text-yellow-400">{formatCurrency(activeRide.fare?.estimated || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 text-center">
            <p className="text-yellow-400 font-medium mb-1">No active ride found</p>
            <p className="text-gray-500 text-sm">Book a ride from the customer app and accept it from the driver app first</p>
          </div>
        )}

        {/* Status panel */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Phase</p>
            <p className={`text-sm font-semibold ${phaseColors[phase]}`}>{phaseLabels[phase]}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Distance to target</p>
            <p className="text-sm font-semibold text-white">{distance || "—"}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Location updates</p>
            <p className="text-sm font-semibold text-white">{tickCount} sent</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Coordinates</p>
            <p className="text-xs font-mono text-white truncate">
              {coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : "—"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={running ? stopSimulation : startSimulation}
            disabled={!activeRide}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${running
                ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                : "bg-yellow-400 hover:bg-yellow-300 text-black"}`}>
            {running ? "⏹ Stop Simulator" : "▶ Start Simulator"}
          </button>
          <button
            onClick={() => { setLog([]); setTickCount(0); setDistance(""); setPhase("idle"); setCoords(null); }}
            className="px-5 py-3.5 rounded-2xl text-sm font-medium bg-[#1a1a1a] border border-[#252525] text-gray-400 hover:text-white transition-colors">
            Reset
          </button>
        </div>

        {/* How to use */}
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-3">📋 Demo steps</p>
          <ol className="space-y-2 text-xs text-gray-400 list-none">
            {[
              "Customer app → Book a ride",
              "Driver app → Go online → Accept the ride",
              "Come to this page → Click Start Simulator",
              "Customer app → Track page → Watch driver move on map",
              "Driver app → Click 'I'm Arriving' → 'Start Ride' → 'Complete'",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-yellow-400/10 text-yellow-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Log */}
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525]">
            <p className="text-sm font-semibold text-white">Live log</p>
            <span className="text-xs text-gray-600">{log.length} entries</span>
          </div>
          <div className="p-3 space-y-1 max-h-64 overflow-y-auto font-mono">
            {log.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">Start the simulator to see logs</p>
            ) : log.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-gray-600 shrink-0">{entry.time}</span>
                <span className={logColors[entry.type]}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
