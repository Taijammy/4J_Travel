"use client";
import { useEffect, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  Polyline, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types";

// ── Fix Next.js icon paths ────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom icons ──────────────────────────────────────
const mkIcon = (color: string, size: [number, number] = [25, 41]) =>
  new L.Icon({
    iconUrl:   `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize:      size,
    iconAnchor:    [size[0] / 2, size[1]],
    popupAnchor:   [1, -34],
    shadowSize:    [41, 41],
  });

const pickupIcon  = mkIcon("green");
const dropoffIcon = mkIcon("orange");

// Custom cab icon using DivIcon
const cabIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:36px; height:36px;
      background:#FACC15;
      border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.4);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
      line-height:1;
    ">🚖</div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
  popupAnchor:[0, -20],
});

// ── Auto-fit bounds ───────────────────────────────────
interface FitProps {
  points:         [number, number][];
  driverLocation: { latitude: number; longitude: number } | null;
}

function BoundsFitter({ points, driverLocation }: FitProps) {
  const map     = useMap();
  const fittedRef = useRef(false);

  // Fit all markers on first load
  useEffect(() => {
    if (fittedRef.current) return;
    const allPoints: [number, number][] = [...points];
    if (driverLocation) allPoints.push([driverLocation.latitude, driverLocation.longitude]);
    if (allPoints.length < 2) return;

    const bounds = L.latLngBounds(allPoints.map(p => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    fittedRef.current = true;
  }, [map, points, driverLocation]);

  return null;
}

// ── Smooth driver marker pan ──────────────────────────
function DriverPanner({ lat, lng }: { lat: number; lng: number }) {
  const map    = useMap();
  const prevRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    const next: [number, number] = [lat, lng];
    if (
      prevRef.current &&
      prevRef.current[0] === lat &&
      prevRef.current[1] === lng
    ) return; // no change
    map.panTo(next, { animate: true, duration: 0.8, easeLinearity: 0.5 });
    prevRef.current = next;
  }, [lat, lng, map]);

  return null;
}

// ── Main component ────────────────────────────────────
interface Props {
  pickup:         Location;
  dropoff:        Location;
  driverLocation: { latitude: number; longitude: number } | null;
  showRoute?:     boolean;
}

export default function RideMap({
  pickup,
  dropoff,
  driverLocation,
  showRoute = true,
}: Props) {
  const center: [number, number] = [pickup.latitude, pickup.longitude];

  const staticPoints: [number, number][] = [
    [pickup.latitude,  pickup.longitude],
    [dropoff.latitude, dropoff.longitude],
  ];

  // Route line: pickup → driver (if available) → dropoff
  const routeLine: [number, number][] = driverLocation
    ? [
        [pickup.latitude,          pickup.longitude],
        [driverLocation.latitude,  driverLocation.longitude],
        [dropoff.latitude,         dropoff.longitude],
      ]
    : staticPoints;

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full"
      zoomControl={false}
      scrollWheelZoom={true}
    >
      {/* Dark-ish tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Auto-fit on load */}
      <BoundsFitter points={staticPoints} driverLocation={driverLocation} />

      {/* Dashed route polyline */}
      {showRoute && (
        <Polyline
          positions={routeLine}
          pathOptions={{
            color:     "#FACC15",
            weight:    3,
            opacity:   0.7,
            dashArray: "8 6",
          }}
        />
      )}

      {/* Pickup marker */}
      <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon}>
        <Popup>
          <div style={{ fontFamily:"Inter,sans-serif", fontSize:13 }}>
            <strong>📍 Pickup</strong><br />
            {pickup.address}
          </div>
        </Popup>
      </Marker>

      {/* Dropoff marker */}
      <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
        <Popup>
          <div style={{ fontFamily:"Inter,sans-serif", fontSize:13 }}>
            <strong>🎯 Dropoff</strong><br />
            {dropoff.address}
          </div>
        </Popup>
      </Marker>

      {/* Driver marker — updates in real time */}
      {driverLocation && (
        <>
          <Marker
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={cabIcon}
          >
            <Popup>
              <div style={{ fontFamily:"Inter,sans-serif", fontSize:13 }}>
                <strong>🚖 Your driver</strong><br />
                On the way!
              </div>
            </Popup>
          </Marker>

          {/* Smooth pan toward driver */}
          <DriverPanner
            lat={driverLocation.latitude}
            lng={driverLocation.longitude}
          />
        </>
      )}
    </MapContainer>
  );
}