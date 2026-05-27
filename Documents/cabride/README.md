# 4jtravel — Cab Booking App

A full-stack real-time cab booking application built as a technical assessment project.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, React Leaflet |
| Backend | Express.js, Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Maps | Leaflet + OpenStreetMap + OSRM Routing |
| Monorepo | npm workspaces + Turborepo |

## Project Structure

```
cabride/
├── apps/
│   ├── customer/        # Next.js customer app (port 3000)
│   ├── driver/          # Next.js driver app (port 3001)
│   └── server/          # Express.js API + Socket.IO (port 4000)
└── packages/
    ├── types/           # Shared TypeScript interfaces
    ├── constants/       # Socket event names, status enums
    ├── utils/           # Shared formatters and validators
    └── config/          # API base URLs and env config
```

## Features

### Customer App
- Register / Login with JWT auth
- Protected routes — redirects to login if no token
- Book a ride with pickup and dropoff (Arunachal Pradesh locations)
- Real-time driver tracking on Leaflet map
- OSRM road-following route (no API key needed)
- Live distance and ETA using Haversine formula
- Ride status updates via Socket.IO
- Toast notifications for all actions
- Loading skeletons — no blank flash on load
- Error boundary — no white screen crashes
- Ride history with stats (total / completed / cancelled)
- Empty states with action buttons
- Cancel ride
- INR currency (₹)

### Driver App
- Register / Login (driver-only accounts)
- Online / Offline toggle
- Incoming ride request popup (accept or decline)
- Active ride page with dark Leaflet map
- OSRM road routing
- Haversine distance + ETA to pickup/dropoff
- Status flow: Accepted → Arriving → Started → Completed
- Ride history with total earnings
- **Demo simulator** at `/simulator` — no real GPS needed

### Backend
- REST API with JWT protection
- Role-based access control (customer / driver)
- Socket.IO rooms per ride (rideId-based)
- MongoDB models: User, Driver, Ride, DriverLocation
- Ride status enum: requested → accepted → arriving → started → completed
- DriverLocation with TTL index (auto-deletes after 1 hour)
- Global error handler (Mongoose, JWT, duplicate key)
- Graceful shutdown on SIGTERM/SIGINT

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/4J_Travel.git
cd 4J_Travel
npm install
```

### 2. Setup environment variables

```bash
cp apps/server/.env.example apps/server/.env
cp apps/customer/.env.local.example apps/customer/.env.local
cp apps/driver/.env.local.example apps/driver/.env.local
```

Fill in `apps/server/.env`:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cabride
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CUSTOMER_URL=http://localhost:3000
DRIVER_URL=http://localhost:3001
```

### 3. Install app dependencies

```bash
cd apps/server   && npm install && cd ../..
cd apps/customer && npm install --legacy-peer-deps && cd ../..
cd apps/driver   && npm install --legacy-peer-deps && cd ../..
```

### 4. Run all three apps

Open **3 terminals**:

```bash
# Terminal 1 — Backend API
cd apps/server && npm run dev
# → http://localhost:4000/api/v1/health

# Terminal 2 — Customer App
cd apps/customer && npm run dev
# → http://localhost:3000

# Terminal 3 — Driver App
cd apps/driver && npm run dev
# → http://localhost:3001
```

## Demo Flow

### Full end-to-end test

```
1. localhost:3001  → Register as driver → Login
2. Dashboard       → Toggle Online
3. localhost:3000  → Register as customer → Login
4. Book Ride       → Select pickup + dropoff → Confirm
5. localhost:3001  → Ride request popup → Accept
6. localhost:3001/simulator → Click Start Simulator
7. localhost:3000/track/.. → Watch driver move on map (road route!)
8. localhost:3001/ride → Arriving → Start Ride → Complete
9. localhost:3000  → Ride completed ✅
```

### Demo Simulator

The driver app includes a built-in location simulator at:
```
http://localhost:3001/simulator
```

- Starts driver 1-2 km away from pickup
- Moves toward pickup → then toward dropoff every 3 seconds
- Emits `location:update` via Socket.IO on each tick
- Customer map updates in real time with road-following route
- Shows live Haversine distance and ETA
- Live log with timestamps
- No real GPS used — purely simulated coordinates

## API Reference

### Auth
```
POST /api/v1/auth/register   → Register (customer or driver)
POST /api/v1/auth/login      → Login → returns JWT token
GET  /api/v1/auth/me         → Get current user (protected)
```

### Rides
```
POST   /api/v1/rides              → Customer creates ride request
GET    /api/v1/rides/active       → Get current active ride
GET    /api/v1/rides/pending      → Driver gets open requests
GET    /api/v1/rides/history      → Past rides
GET    /api/v1/rides/:id          → Get ride by ID
PATCH  /api/v1/rides/:id/accept   → Driver accepts ride
PATCH  /api/v1/rides/:id/status   → Driver updates status
PATCH  /api/v1/rides/:id/cancel   → Cancel ride
```

### Drivers
```
GET   /api/v1/drivers/available   → List online drivers
GET   /api/v1/drivers/profile     → Driver own profile
PATCH /api/v1/drivers/online      → Go online
PATCH /api/v1/drivers/offline     → Go offline
PATCH /api/v1/drivers/vehicle     → Update vehicle info
```

## Socket.IO Events

### Customer emits
| Event | Payload | Description |
|-------|---------|-------------|
| `ride:request` | `{ rideId, pickup, dropoff, fare }` | Broadcast new ride to drivers |
| `ride:subscribe` | `{ rideId }` | Join ride room |
| `ride:cancel` | `{ rideId, reason }` | Cancel ride |

### Driver emits
| Event | Payload | Description |
|-------|---------|-------------|
| `driver:online` | `{ driverId }` | Mark online |
| `driver:offline` | `{ driverId }` | Mark offline |
| `location:update` | `{ rideId, latitude, longitude }` | Live GPS every 3s |
| `ride:accept` | `{ rideId, driverId }` | Accept ride |
| `ride:arriving` | `{ rideId }` | Driver near pickup |
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
