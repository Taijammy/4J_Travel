"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { authService } from "@/services/auth.service";
import { rideService } from "@/services/ride.service";
import { driverService } from "@/services/driver.service";
import { formatCurrency } from "@/utils";

// ── Haversine inline (no import issues) ──────────────
function haversineDistance(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat  = toRad(to.latitude  - from.latitude);
  const dLon  = toRad(to.longitude - from.longitude);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon/2)**2;
  const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const m  = km * 1000;
  return { metres: Math.round(m), display: km < 1 ? `${Math.round(m)} m` : `${km.toFixed(1)} km` };
}

// ── Start 1-2 km away from target ───────────────────
function startNearby(target: { latitude: number; longitude: number }) {
  const offset = () => (Math.random() - 0.5) * 0.016;
  return { latitude: target.latitude + offset(), longitude: target.longitude + offset() };
}

// ── Move step toward target ──────────────────────────
function moveToward(
  current: { latitude: number; longitude: number },
  target:  { latitude: number; longitude: number },
  step = 0.0009
) {
  const dLat = target.latitude  - current.latitude;
  const dLon = target.longitude - current.longitude;
  const dist = Math.sqrt(dLat**2 + dLon**2);
  if (dist < step) return { ...target };
  const ratio  = step / dist;
  const jitter = () => (Math.random() - 0.5) * 0.00004;
  return {
    latitude:  parseFloat((current.latitude  + dLat * ratio + jitter()).toFixed(6)),
    longitude: parseFloat((current.longitude + dLon * ratio + jitter()).toFixed(6)),
  };
}

type Phase = "idle" | "to_pickup" | "to_dropoff" | "done";

interface Log { time: string; msg: string; type: "info"|"success"|"warn"|"error"; }

export default function SimulatorPage() {
  const user   = authService.getStoredUser();
  const userId = user?.id;

  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [activeRide,    setActiveRide]    = useState<any>(null);
  const [phase,         setPhase]         = useState<Phase>("idle");
  const [coords,        setCoords]        = useState<{ latitude: number; longitude: number } | null>(null);
  const [running,       setRunning]       = useState(false);
  const [log,           setLog]           = useState<Log[]>([]);
  const [tickCount,     setTickCount]     = useState(0);
  const [distDisplay,   setDistDisplay]   = useState("—");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef    = useRef<Phase>("idle");
  const coordsRef   = useRef<{ latitude: number; longitude: number } | null>(null);
  const rideRef     = useRef<any>(null);

  phaseRef.current  = phase;
  coordsRef.current = coords;
  rideRef.current   = activeRide;

  const addLog = useCallback((msg: string, type: Log["type"] = "info") => {
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLog(prev => [{ time, msg, type }, ...prev].slice(0, 60));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const profile = await driverService.getProfile();
      setDriverProfile(profile);
      const ride = await rideService.getActiveRide();
      if (ride) {
        setActiveRide(ride);
        rideRef.current = ride;
        addLog(`✅ Ride loaded: ${ride._id.slice(-6).toUpperCase()}`, "success");
        addLog(`Pickup: ${ride.pickup.address}`, "info");
        addLog(`Dropoff: ${ride.dropoff.address}`, "info");
      } else {
        addLog("⚠️ No active ride. Accept a ride from the driver dashboard first.", "warn");
      }
    } catch (err: any) {
      addLog(`❌ ${err.message}`, "error");
    }
  }, [addLog]);

  useEffect(() => { loadData(); }, []);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setRunning(false);
    addLog("⏹ Simulator stopped", "warn");
  }, [addLog]);

  const startSimulation = useCallback(() => {
    const ride = rideRef.current;
    if (!ride)   { addLog("❌ No active ride", "error"); return; }
    if (!userId) { addLog("❌ Not logged in",  "error"); return; }

    // Start near pickup — purely simulated, no real GPS used
    const start = startNearby(ride.pickup);
    setCoords(start);
    coordsRef.current = start;
    setPhase("to_pickup");
    phaseRef.current = "to_pickup";
    setRunning(true);
    setTickCount(0);
    addLog("🚖 Simulator started — driving to pickup", "success");

    const socket = getSocket(userId, driverProfile?._id);
    // Join the ride room
    socket.emit("ride:subscribe", { rideId: ride._id });

    intervalRef.current = setInterval(() => {
      const current      = coordsRef.current;
      const currentRide  = rideRef.current;
      const currentPhase = phaseRef.current;
      if (!current || !currentRide) return;

      const target = currentPhase === "to_pickup" ? currentRide.pickup : currentRide.dropoff;
      const dist   = haversineDistance(current, target);
      setDistDisplay(dist.display);

      // Arrived?
      if (dist.metres < 80) {
        if (currentPhase === "to_pickup") {
          setPhase("to_dropoff");
          phaseRef.current = "to_dropoff";
          addLog("📍 Arrived at pickup — heading to dropoff", "success");
          return;
        } else {
          setPhase("done");
          phaseRef.current = "done";
          addLog("🏁 Arrived at dropoff — simulation complete!", "success");
          stopSimulation();
          return;
        }
      }

      // Move toward target
      const next = moveToward(current, target);
      setCoords(next);
      coordsRef.current = next;
      setTickCount(t => t + 1);

      // Emit ONLY simulated coordinates — never real GPS
      socket.emit("location:update", {
        rideId:    currentRide._id,
        latitude:  next.latitude,
        longitude: next.longitude,
        speed:     28 + Math.random() * 12,
        accuracy:  4,
      });

      addLog(
        `📡 ${next.latitude.toFixed(5)}, ${next.longitude.toFixed(5)} · ${dist.display} to ${currentPhase === "to_pickup" ? "pickup" : "dropoff"}`,
        "info"
      );
    }, 3000);
  }, [userId, driverProfile, addLog, stopSimulation]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const phaseColors: Record<Phase, string> = {
    idle:       "text-gray-500",
    to_pickup:  "text-yellow-400",
    to_dropoff: "text-blue-400",
    done:       "text-green-400",
  };
  const phaseLabels: Record<Phase, string> = {
    idle:       "Idle — waiting",
    to_pickup:  "Driving to pickup",
    to_dropoff: "Driving to dropoff",
    done:       "Journey complete ✓",
  };
  const logColors: Record<string, string> = {
    info: "text-gray-400", success: "text-green-400",
    warn: "text-yellow-400", error: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-10">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#252525] px-4 py-4 mb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xs">4J</span>
              </div>
              <span className="font-bold">4jtravel</span>
              <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Demo Simulator
              </span>
            </div>
            <p className="text-xs text-gray-500">Simulated driver movement — no real GPS used</p>
          </div>
          <button onClick={loadData}
            className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-[#2a2a2a] transition-colors">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-4">

        {/* Active ride */}
        {activeRide ? (
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525] bg-[#161616]">
              <span className="text-sm font-semibold">Active Ride</span>
              <span className="text-xs font-mono text-gray-500">#{activeRide._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="p-5">
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
                  <p className="font-bold text-yellow-400 text-lg">{formatCurrency(activeRide.fare?.estimated || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 text-center">
            <p className="text-yellow-400 font-semibold mb-1">⚠️ No active ride</p>
            <p className="text-gray-500 text-sm">Book from customer app → accept from driver dashboard → then come here</p>
            <button onClick={loadData} className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 underline">
              Click to refresh
            </button>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Phase</p>
            <p className={`text-sm font-semibold ${phaseColors[phase]}`}>{phaseLabels[phase]}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Distance to target</p>
            <p className="text-sm font-semibold text-white">{distDisplay}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Updates sent</p>
            <p className="text-sm font-semibold text-white">{tickCount}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Current coords</p>
            <p className="text-xs font-mono text-white">
              {coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : "—"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={running ? stopSimulation : startSimulation}
            disabled={!activeRide}
            className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${running
                ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                : "bg-yellow-400 hover:bg-yellow-300 text-black"}`}>
            {running ? "⏹ Stop" : "▶ Start Simulator"}
          </button>
          <button onClick={() => { stopSimulation(); setLog([]); setTickCount(0); setDistDisplay("—"); setPhase("idle"); setCoords(null); setRunning(false); }}
            className="px-5 py-4 rounded-2xl text-sm bg-[#1a1a1a] border border-[#252525] text-gray-400 hover:text-white transition-colors">
            Reset
          </button>
        </div>

        {/* Demo steps */}
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-5">
          <p className="text-sm font-semibold mb-3">📋 Demo steps</p>
          <ol className="space-y-2">
            {[
              "Driver dashboard → Go Online",
              "Customer app → Book a ride",
              "Driver dashboard → Accept the popup",
              "Come here → Click ▶ Start Simulator",
              "Customer track page → Driver marker moves on map",
              "Driver ride page → Arriving → Start → Complete",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="w-5 h-5 rounded-full bg-yellow-400/10 text-yellow-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i+1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* Log */}
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525]">
            <p className="text-sm font-semibold">Live log</p>
            <span className="text-xs text-gray-600">{log.length} entries</span>
          </div>
          <div className="p-3 space-y-1 max-h-60 overflow-y-auto font-mono">
            {log.length === 0
              ? <p className="text-xs text-gray-600 text-center py-6">Start the simulator to see logs</p>
              : log.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-gray-600 shrink-0">{e.time}</span>
                  <span className={logColors[e.type]}>{e.msg}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}