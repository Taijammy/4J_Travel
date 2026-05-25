export interface User {
  id: string; name: string; email: string; role: string; phone?: string;
}
export interface DriverProfile {
  _id: string; user: User; isAvailable: boolean; isOnline: boolean;
  currentLocation: { latitude: number | null; longitude: number | null };
  vehicleNumber?: string; vehicleModel?: string; vehicleColor?: string;
  totalRides: number; rating: number;
}
export interface Location { address: string; latitude: number; longitude: number; }
export type RideStatus = "requested"|"accepted"|"arriving"|"started"|"completed"|"cancelled";
export interface RideRequest {
  rideId: string; pickup: Location; dropoff: Location;
  fare: { estimated: number; currency: string };
}
export interface Ride {
  _id: string; customer: User; driver?: any;
  pickup: Location; dropoff: Location; status: RideStatus;
  fare: { estimated: number; final?: number; currency: string };
  createdAt: string; acceptedAt?: string; startedAt?: string; completedAt?: string;
}
