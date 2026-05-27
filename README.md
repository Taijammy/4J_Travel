# 4jtravel — Cab Booking App
| `ride:start` | `{ rideId }` | Ride started |
| `ride:complete` | `{ rideId }` | Ride completed |

### Server → Client
| Event | Sent to | Description |
|-------|---------|-------------|
| `ride:incoming` | All drivers | New ride available |
| `ride:accepted` | Ride room | Driver accepted |
| `ride:arriving` | Ride room | Driver near pickup |
| `ride:started` | Ride room | Ride in progress |
| `ride:completed` | Ride room | Ride done |
| `location:update` | Ride room | Driver coordinates |

## Environment Variables

### apps/server/.env
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cabride
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CUSTOMER_URL=http://localhost:3000
DRIVER_URL=http://localhost:3001
```

### apps/customer/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### apps/driver/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Key Design Decisions

- **Socket rooms per ride** — driver and customer join `ride:{rideId}` room so location broadcasts are isolated per trip
- **OSRM routing** — free public API, no key needed, falls back to straight line if offline
- **Haversine formula** — accurate great-circle distance calculation accounting for Earth's curvature
- **DriverLocation collection** — separate from Driver document to avoid hammering the main document with GPS updates every 3s. TTL index auto-deletes after 1 hour
- **ES Modules** — entire backend uses `"type": "module"` with `.js` imports
- **Role-based middleware** — `protect` + `restrictTo("customer"|"driver")` on every route
- **Protected routes** — client-side token check redirects unauthenticated users to `/auth`
- **Error boundary** — catches any React crash, shows friendly UI instead of white screen
- **Loading skeletons** — animated placeholders prevent blank flash on page load
- **Demo simulator** — simulated GPS movement for interview demos, no real device GPS needed

## Locations (Arunachal Pradesh)

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Itanagar | 27.0844 | 93.6053 |
| Naharlagun | 27.1045 | 93.6955 |
| Pasighat | 28.0664 | 95.3269 |
| Ziro | 27.5903 | 93.8303 |
| Bomdila | 27.2645 | 92.4159 |
| Tawang | 27.5861 | 91.8594 |
| Roing | 28.1420 | 95.8350 |
| Tezu | 27.9219 | 96.1697 |

---

Built with ❤️ — 4jtravel © 2026
