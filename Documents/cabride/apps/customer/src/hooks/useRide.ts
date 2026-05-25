"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { rideService } from "@/services/ride.service";
import { Ride, Location } from "@/types";

export const useRide = () => {
  const [ride,    setRide]    = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const router = useRouter();

  const requestRide = useCallback(async (pickup: Location, dropoff: Location) => {
    try {
      setLoading(true);
      setError(null);
      const r = await rideService.requestRide(pickup, dropoff);
      setRide(r);
      return r;
    } catch (err: any) {
      // 409 = already has active ride → redirect to it
      if (err.response?.status === 409) {
        const existingId = err.response?.data?.data?.rideId;
        if (existingId) {
          router.push(`/track/${existingId}`);
          return;
        }
      }
      const msg = err.response?.data?.message || "Failed to request ride";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchActiveRide = useCallback(async () => {
    const r = await rideService.getActiveRide();
    setRide(r);
    return r;
  }, []);

  const cancelRide = useCallback(async (reason?: string) => {
    if (!ride) return;
    const r = await rideService.cancelRide(ride._id, reason);
    setRide(r);
  }, [ride]);

  return { ride, setRide, loading, error, requestRide, fetchActiveRide, cancelRide };
};