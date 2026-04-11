# OrderIQ

OrderIQ egy monorepo-jellegű webalkalmazás backend, frontend és megosztott types csomagokkal.

## Struktúra

- `backend/`: NestJS + Fastify API.
- `frontend/`: React + Vite kliens.
- `types/`: Közös TypeScript típusok és Zod sémák.
- `docs/`: Architektúra és struktúra dokumentáció.
- `docker/`: Konténerizációs konfigurációk.

## Dokumentáció

- [Mappa struktúra](docs/orderiq-mappa-struktura.md)
- [Architektúra](docs/orderiq-architektura.md)
- [Fejlesztés elkezdése](docs/fejlesztes-inditasa.md)

## Fejlesztés

- `yarn install`
- Helyi PostgreSQL indítása és az `orderiq` adatbázis létrehozása
- `yarn workspace @orderiq/backend prisma generate`
- `yarn dev`
