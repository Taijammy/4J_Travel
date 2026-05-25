"use client";
import { useState, useEffect, useRef } from "react";

interface Coords { latitude: number; longitude: number; speed?: number; heading?: number; accuracy?: number; }

export const useGeolocation = (active: boolean, intervalMs = 3000) => {
  const [coords, setCoords]   = useState<Coords | null>(null);
  const [error,  setError]    = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPosition = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
        speed:     pos.coords.speed    ?? undefined,
        heading:   pos.coords.heading  ?? undefined,
        accuracy:  pos.coords.accuracy ?? undefined,
      }),
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    getPosition();
    intervalRef.current = setInterval(getPosition, intervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, intervalMs]);

  return { coords, error };
};
