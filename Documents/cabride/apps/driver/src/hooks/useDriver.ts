"use client";
import { useState, useCallback } from "react";
import { driverService } from "@/services/driver.service";
import { DriverProfile } from "@/types";

export const useDriver = () => {
  const [driver,  setDriver]  = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const d = await driverService.getProfile();
      setDriver(d);
      return d;
    } catch { return null; }
    finally { setLoading(false); }
  }, []);

  const goOnline = useCallback(async () => {
    const d = await driverService.goOnline();
    setDriver(d);
  }, []);

  const goOffline = useCallback(async () => {
    const d = await driverService.goOffline();
    setDriver(d);
  }, []);

  return { driver, loading, fetchProfile, goOnline, goOffline };
};
