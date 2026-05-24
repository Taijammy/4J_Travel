"use client";
import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";

interface DriverCoords {
  latitude:  number;
  longitude: number;
  heading?:  number;
  speed?:    number;
  timestamp: number;
}

export const useDriverLocation = (rideId: string | null, userId: string | null) => {
  const [location, setLocation] = useState<DriverCoords | null>(null);

  useEffect(() => {
    if (!rideId || !userId) return;

    const socket = getSocket(userId);

    // Join the ride room
    socket.emit("ride:subscribe", { rideId });

    // Listen for location updates
    socket.on("location:update", (data: DriverCoords) => {
      setLocation(data);
    });

    return () => {
      socket.off("location:update");
    };
  }, [rideId, userId]);

  return location;
};
