import api from "@/lib/axios";
import { DriverProfile } from "@/types";

export const driverService = {
  getProfile: async (): Promise<DriverProfile> => {
    const res = await api.get("/drivers/profile");
    return res.data.data.driver;
  },
  goOnline: async (): Promise<DriverProfile> => {
    const res = await api.patch("/drivers/online");
    return res.data.data.driver;
  },
  goOffline: async (): Promise<DriverProfile> => {
    const res = await api.patch("/drivers/offline");
    return res.data.data.driver;
  },
  updateVehicle: async (data: { vehicleNumber: string; vehicleModel: string; vehicleColor: string }) => {
    const res = await api.patch("/drivers/vehicle", data);
    return res.data.data.driver;
  },
};
