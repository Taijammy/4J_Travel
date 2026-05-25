import api from "@/lib/axios";
import { Ride } from "@/types";

export const rideService = {
  getActiveRide: async (): Promise<Ride | null> => {
    try {
      const res = await api.get("/rides/active");
      return res.data.data.ride;
    } catch { return null; }
  },
  getPendingRides: async (): Promise<Ride[]> => {
    const res = await api.get("/rides/pending");
    return res.data.data.rides;
  },
  acceptRide: async (id: string): Promise<Ride> => {
    const res = await api.patch(`/rides/${id}/accept`);
    return res.data.data.ride;
  },
  updateStatus: async (id: string, status: string): Promise<Ride> => {
    const res = await api.patch(`/rides/${id}/status`, { status });
    return res.data.data.ride;
  },
  getRideHistory: async (): Promise<Ride[]> => {
    const res = await api.get("/rides/history");
    return res.data.data.rides;
  },
};
