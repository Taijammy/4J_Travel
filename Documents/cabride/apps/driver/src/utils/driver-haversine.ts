export interface Coords { latitude: number; longitude: number; }

export interface DistanceResult {
  metres:     number;
  kilometres: number;
  display:    string;
  isNearby:   boolean;
}

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineDistance(from: Coords, to: Coords): DistanceResult {
  const dLat = toRad(to.latitude  - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) *
    Math.sin(dLon / 2) ** 2;
  const km = EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const m  = km * 1000;
  return {
    metres:     Math.round(m),
    kilometres: Math.round(km * 100) / 100,
    display:    km < 1 ? `${Math.round(m)} m` : `${km.toFixed(1)} km`,
    isNearby:   km < 1,
  };
}
