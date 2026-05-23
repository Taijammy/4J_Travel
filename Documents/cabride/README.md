# CabRide — Monorepo

## Apps
- `apps/customer` — Next.js customer booking app (port 3000)
- `apps/driver`   — Next.js driver app (port 3001)
- `apps/server`   — Express.js API + Socket.IO (port 4000)

## Packages
- `packages/types`     — Shared TypeScript types
- `packages/constants` — Socket event names, status enums
- `packages/utils`     — Shared formatters and validators
- `packages/config`    — API base URLs and env config

## Getting started
```bash
cp .env.example .env
npm install
npm run dev
```
