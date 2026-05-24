import api from "@/lib/axios";
import { Ride, Location, ApiResponse } from "@/types";

export const rideService = {
  requestRide: async (pickup: Location, dropoff: Location): Promise<Ride> => {
    const res = await api.post<ApiResponse<{ ride: Ride }>>("/rides", { pickup, dropoff });
    return res.data.data.ride;
  },

  getActiveRide: async (): Promise<Ride | null> => {
    try {
      const res = await api.get<ApiResponse<{ ride: Ride }>>("/rides/active");
      return res.data.data.ride;
    } catch {
      return null;
    }
  },

  getRideById: async (id: string): Promise<Ride> => {
    const res = await api.get<ApiResponse<{ ride: Ride }>>(`/rides/${id}`);
    return res.data.data.ride;
  },

  getRideHistory: async (): Promise<Ride[]> => {
    const res = await api.get<ApiResponse<{ rides: Ride[] }>>("/rides/history");
    return res.data.data.rides;
  },

  cancelRide: async (id: string, reason?: string): Promise<Ride> => {
    const res = await api.patch<ApiResponse<{ ride: Ride }>>(`/rides/${id}/cancel`, { reason });
    return res.data.data.ride;
  },
};
