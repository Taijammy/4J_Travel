"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const mkIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function Panner({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.panTo([lat, lng], { animate: true, duration: 0.5 }); }, [lat, lng]);
  return null;
}

interface Props {
  pickup:         { address: string; latitude: number; longitude: number };
  dropoff:        { address: string; latitude: number; longitude: number };
  driverLocation: { latitude: number; longitude: number } | null;
}

export default function RideMap({ pickup, dropoff, driverLocation }: Props) {
  return (
    <MapContainer center={[pickup.latitude, pickup.longitude]} zoom={13} className="w-full h-full" zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[pickup.latitude, pickup.longitude]} icon={mkIcon("green")}>
        <Popup>📍 {pickup.address}</Popup>
      </Marker>
      <Marker position={[dropoff.latitude, dropoff.longitude]} icon={mkIcon("orange")}>
        <Popup>🎯 {dropoff.address}</Popup>
      </Marker>
      {driverLocation && (
        <>
          <Marker position={[driverLocation.latitude, driverLocation.longitude]} icon={mkIcon("yellow")}>
            <Popup>🚖 You</Popup>
          </Marker>
          <Panner lat={driverLocation.latitude} lng={driverLocation.longitude} />
        </>
      )}
    </MapContainer>
  );
}
