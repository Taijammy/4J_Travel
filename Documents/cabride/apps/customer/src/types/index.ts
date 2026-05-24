export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      "customer" | "driver";
  phone?:    string;
}

export interface Location {
  address:   string;
  latitude:  number;
  longitude: number;
}

export type RideStatus =
  | "requested"
  | "accepted"
  | "arriving"
  | "started"
  | "completed"
  | "cancelled";

export interface Driver {
  id:            string;
  name:          string;
  phone:         string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleNumber?:string;
  rating:        number;
}

export interface Ride {
  _id:         string;
  customer:    User;
  driver?:     { _id: string; user: { name: string; phone: string } };
  pickup:      Location;
  dropoff:     Location;
  status:      RideStatus;
  fare:        { estimated: number; final?: number; currency: string };
  createdAt:   string;
  acceptedAt?: string;
  startedAt?:  string;
  completedAt?:string;
}

export interface AuthResponse {
  token: string;
  user:  User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}
