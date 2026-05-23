# Socket.IO Event Reference

## Connection
Connect with query params:
```
io("http://localhost:4000", {
  query: { userId, role, driverId }
})
```

---

## Driver → Server

| Event           | Payload                                          | Description                    |
|----------------|--------------------------------------------------|--------------------------------|
| driver:online   | `{ driverId }`                                   | Mark driver online + available |
| driver:offline  | `{ driverId }`                                   | Mark driver offline            |
| driver:ping     | `{ driverId }`                                   | Heartbeat every 30s            |
| location:update | `{ rideId, latitude, longitude, speed?, heading?, accuracy? }` | Live coords every 3s |
| ride:accept     | `{ rideId }`                                     | Accept a ride request          |
| ride:arriving   | `{ rideId }`                                     | Driver near pickup             |
| ride:start      | `{ rideId }`                                     | Ride started                   |
| ride:complete   | `{ rideId }`                                     | Ride completed                 |
| ride:cancel     | `{ rideId, reason? }`                            | Cancel ride                    |

---

## Customer → Server

| Event          | Payload          | Description                          |
|---------------|------------------|--------------------------------------|
| ride:request   | `{ rideId, pickup, dropoff, fare }` | Broadcast new ride to drivers |
| ride:subscribe | `{ rideId }`     | Join ride room to receive location   |
| ride:cancel    | `{ rideId, reason? }` | Cancel ride                    |
| location:request | `{ driverId }` | Request latest driver location       |

---

## Server → Client

| Event               | Payload                                      | Sent to         |
|--------------------|----------------------------------------------|-----------------|
| ride:incoming       | `{ rideId, pickup, dropoff, fare }`          | All drivers     |
| ride:accepted       | `{ rideId, driver: {...} }`                  | Ride room       |
| ride:arriving       | `{ rideId, message }`                        | Ride room       |
| ride:started        | `{ rideId, message }`                        | Ride room       |
| ride:completed      | `{ rideId, fare, message }`                  | Ride room       |
| ride:cancelled      | `{ rideId, by, reason }`                     | Ride room       |
| location:update     | `{ latitude, longitude, speed, heading, timestamp }` | Ride room |
| location:ack        | `{ timestamp }`                              | Driver only     |
| driver:status       | `{ isOnline, isAvailable, message }`         | Driver only     |
| driver:pong         | `{ timestamp }`                              | Driver only     |
| driver:disconnected | `{ message }`                                | Ride room       |
| ride:subscribed     | `{ rideId }`                                 | Customer only   |
| error               | `{ message }`                                | Emitting socket |
