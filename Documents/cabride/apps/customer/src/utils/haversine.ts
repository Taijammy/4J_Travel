/**
 * Haversine formula — calculates great-circle distance
 * between two coordinates on Earth.
 */

export interface Coords {
  latitude:  number;
  longitude: number;
}

export interface DistanceResult {
  metres:      number;
  kilometres:  number;
  display:     string;   // "320 m" or "4.2 km"
  isNearby:    boolean;  // true if under 1km
}

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Calculate distance between two coordinate points.
 *
 * @example
 * const result = haversineDistance(
 *   { latitude: 18.9220, longitude: 72.8347 }, // Gateway of India
 *   { latitude: 19.0596, longitude: 72.8656 }  // BKC
 * );
 * // → { metres: 15432, kilometres: 15.43, display: "15.4 km", isNearby: false }
 */
export function haversineDistance(from: Coords, to: Coords): DistanceResult {
  const dLat = toRad(to.latitude  - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
    Math.cos(toRad(to.latitude))   *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c  = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = EARTH_RADIUS_KM * c;
  const m  = km * 1000;

  const display  = km < 1
    ? `${Math.round(m)} m`
    : `${km.toFixed(1)} km`;

  return {
    metres:     Math.round(m),
    kilometres: Math.round(km * 100) / 100,
    display,
    isNearby:   km < 1,
  };
}

/**
 * Estimate ETA in minutes based on distance and speed.
 * Default speed: 30 km/h (city traffic).
 */
export function estimateETA(
  from: Coords,
  to:   Coords,
  speedKmh = 30
): { minutes: number; display: string } {
  const { kilometres } = haversineDistance(from, to);
  const minutes = Math.ceil((kilometres / speedKmh) * 60);
  const display = minutes < 1 ? "< 1 min" : `${minutes} min`;
  return { minutes, display };
}
