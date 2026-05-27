"use client";
import { useEffect, useRef, useState } from "react";
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
const mkIcon = (color: string) =>
  new L.Icon({
    iconUrl:   `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
  });

const pickupIcon  = mkIcon("green");
const dropoffIcon = mkIcon("orange");

const cabIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:36px;height:36px;background:#FACC15;
    border-radius:50%;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.5);
    display:flex;align-items:center;justify-content:center;
    font-size:18px;line-height:1;">🚖</div>`,
  iconSize: [36,36], iconAnchor: [18,18], popupAnchor: [0,-20],
});

// ── OSRM road routing ─────────────────────────────────
async function fetchOSRMRoute(
  from: { latitude: number; longitude: number },
  to:   { latitude: number; longitude: number }
): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;

    const res  = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) return [];

    // GeoJSON coords are [lng, lat] — flip to [lat, lng] for Leaflet
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );
  } catch {
    return []; // fallback to straight line if OSRM fails
  }
}

// ── Auto-fit bounds ───────────────────────────────────
function BoundsFitter({ points, driverLocation }: {
  points:         [number, number][];
  driverLocation: { latitude: number; longitude: number } | null;
}) {
  const map    = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;
    const all: [number,number][] = [...points];
    if (driverLocation) all.push([driverLocation.latitude, driverLocation.longitude]);
    if (all.length < 2) return;
    map.fitBounds(L.latLngBounds(all.map(p => L.latLng(p[0], p[1]))),
      { padding:[60,60], maxZoom:14, animate:true });
    fitted.current = true;
  }, [map, points, driverLocation]);

  return null;
}

// ── Smooth driver pan ─────────────────────────────────
function DriverPanner({ lat, lng }: { lat: number; lng: number }) {
  const map  = useMap();
  const prev = useRef<[number,number] | null>(null);

  useEffect(() => {
    if (prev.current?.[0] === lat && prev.current?.[1] === lng) return;
    map.panTo([lat, lng], { animate:true, duration:0.8, easeLinearity:0.5 });
    prev.current = [lat, lng];
  }, [lat, lng, map]);

  return null;
}

// ── Route loader component ────────────────────────────
function OSRMRoute({ from, to, driver }: {
  from:   { latitude: number; longitude: number };
  to:     { latitude: number; longitude: number };
  driver: { latitude: number; longitude: number } | null;
}) {
  const [routeToPickup,  setRouteToPickup]  = useState<[number,number][]>([]);
  const [routeToDropoff, setRouteToDropoff] = useState<[number,number][]>([]);

  // Pickup → Dropoff route (static, load once)
  useEffect(() => {
    fetchOSRMRoute(from, to).then(coords => {
      if (coords.length > 0) setRouteToPickup(coords);
      else setRouteToPickup([[from.latitude, from.longitude], [to.latitude, to.longitude]]);
    });
  }, []);

  // Driver → Pickup route (updates as driver moves)
  useEffect(() => {
    if (!driver) return;
    fetchOSRMRoute(driver, from).then(coords => {
      if (coords.length > 0) setRouteToDropoff(coords);
      else setRouteToDropoff([[driver.latitude, driver.longitude], [from.latitude, from.longitude]]);
    });
  }, [driver?.latitude, driver?.longitude]);

  return (
    <>
      {/* Full pickup → dropoff route (dim) */}
      {routeToPickup.length > 1 && (
        <Polyline
          positions={routeToPickup}
          pathOptions={{ color:"#FACC15", weight:4, opacity:0.25 }}
        />
      )}

      {/* Driver → pickup route (bright) */}
      {driver && routeToDropoff.length > 1 && (
        <Polyline
          positions={routeToDropoff}
          pathOptions={{ color:"#FACC15", weight:4, opacity:0.9, dashArray:"10 6" }}
        />
      )}

      {/* Fallback straight lines if OSRM returns nothing */}
      {routeToPickup.length === 0 && (
        <Polyline
          positions={[[from.latitude, from.longitude], [to.latitude, to.longitude]]}
          pathOptions={{ color:"#FACC15", weight:3, opacity:0.3, dashArray:"8 6" }}
        />
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────
interface Props {
  pickup:         Location;
  dropoff:        Location;
  driverLocation: { latitude: number; longitude: number } | null;
}

export default function RideMap({ pickup, dropoff, driverLocation }: Props) {
  const center: [number,number] = [pickup.latitude, pickup.longitude];

  const staticPoints: [number,number][] = [
    [pickup.latitude,  pickup.longitude],
    [dropoff.latitude, dropoff.longitude],
  ];

  return (
    <>
      <style>{`
        .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7) !important;
        }
        .leaflet-container { background: #0f0f0f !important; }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-popup-content-wrapper {
          background: #1a1a1a !important;
          border: 1px solid #252525 !important;
          color: #f5f5f5 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip { background: #1a1a1a !important; }
        .leaflet-popup-close-button { color: #6b6b6b !important; }
      `}</style>

      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />

        <BoundsFitter points={staticPoints} driverLocation={driverLocation} />

        {/* OSRM road-following routes */}
        <OSRMRoute from={pickup} to={dropoff} driver={driverLocation} />

        {/* Pickup marker */}
        <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon}>
          <Popup>
            <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"#f5f5f5" }}>
              <strong style={{ color:"#4ade80" }}>📍 Pickup</strong><br/>
              {pickup.address}
            </div>
          </Popup>
        </Marker>

        {/* Dropoff marker */}
        <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
          <Popup>
            <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"#f5f5f5" }}>
              <strong style={{ color:"#fb923c" }}>🎯 Dropoff</strong><br/>
              {dropoff.address}
            </div>
          </Popup>
        </Marker>

        {/* Driver cab marker */}
        {driverLocation && (
          <>
            <Marker
              position={[driverLocation.latitude, driverLocation.longitude]}
              icon={cabIcon}>
              <Popup>
                <div style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"#f5f5f5" }}>
                  <strong style={{ color:"#facc15" }}>🚖 Your driver</strong><br/>
                  On the way!
                </div>
              </Popup>
            </Marker>
            <DriverPanner lat={driverLocation.latitude} lng={driverLocation.longitude} />
          </>
        )}
      </MapContainer>
    </>
  );
}