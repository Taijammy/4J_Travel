"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types";

// Fix default icon paths for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const dropoffIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Auto-pan map when driver moves
function MapPanner({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.5 });
  }, [lat, lng, map]);
  return null;
}

interface Props {
  pickup:         Location;
  dropoff:        Location;
  driverLocation: { latitude: number; longitude: number } | null;
}

export default function RideMap({ pickup, dropoff, driverLocation }: Props) {
  const center: [number, number] = [pickup.latitude, pickup.longitude];

  return (
    <MapContainer center={center} zoom={13} className="w-full h-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Pickup marker */}
      <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon}>
        <Popup>📍 {pickup.address}</Popup>
      </Marker>

      {/* Dropoff marker */}
      <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
        <Popup>🎯 {dropoff.address}</Popup>
      </Marker>

      {/* Driver marker — live updated */}
      {driverLocation && (
        <>
          <Marker
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={driverIcon}>
            <Popup>🚖 Your driver</Popup>
          </Marker>
          <MapPanner lat={driverLocation.latitude} lng={driverLocation.longitude} />
        </>
      )}
    </MapContainer>
  );
}
