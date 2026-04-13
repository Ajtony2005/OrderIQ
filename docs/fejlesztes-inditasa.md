# Fejlesztői útmutató

Ez az útmutató az OrderIQ projekt helyi fejlesztéséhez készült. A repository egy monorepo, amelyben a backend, a frontend és a közös TypeScript típusok külön workspace-ekben élnek.

## 1. Technológiai stack

- Frontend: React, TypeScript, Vite, TanStack Query, Zustand, Framer Motion
- Backend: NestJS, Fastify adapter, Prisma ORM, PostgreSQL
- Közös csomag: `types/` workspace a megosztott Zod sémákhoz és TypeScript típusokhoz
- Package manager: Yarn 1.22.x

## 2. Repository struktúra

- `frontend/`: React + Vite kliens
- `backend/`: NestJS API és Prisma réteg
- `types/`: megosztott típusok és validációs sémák
- `docs/`: belső dokumentáció és útmutatók
- `docker/`: konténeres infrastruktúra kiegészítő fájlok

## 3. Előfeltételek

Ajánlott környezet:

- Node.js 22 LTS vagy újabb
- Yarn 1.22.x
- PostgreSQL 16 vagy újabb
- Git
- VS Code

A projekt nem igényel Docker Desktopot a helyi fejlesztéshez.

## 4. Projekt letöltése

```bash
git clone <repo-url>
cd OrderIQ
yarn install
```

A gyökérből futtatott `yarn install` telepíti az összes workspace függőséget.

## 5. Környezeti változók

A gyökérben található `.env.example` alapján hozd létre a `.env` fájlt, majd állítsd be az értékeket.

A backend által használt legfontosabb változók:

- `PORT`: a backend portja, alapértelmezés szerint `3000`
- `DATABASE_URL`: PostgreSQL kapcsolati string
- `JWT_SECRET`: JWT aláírási kulcs
- `APP_ENV`: futtatási környezet
- `GOOGLE_CLIENT_ID`: opcionális, Google bejelentkezéshez szükséges

Példa:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orderiq
JWT_SECRET=change-me
APP_ENV=development
```

## 6. Adatbázis előkészítés

A backend PostgreSQL adatbázist használ. Hozd létre az `orderiq` adatbázist, majd ellenőrizd, hogy a `DATABASE_URL` erre mutat.

Példa lokális kapcsolati string:

```bash
postgresql://postgres:postgres@localhost:5432/orderiq
```

Ha új környezetet állítasz fel, győződj meg róla, hogy a PostgreSQL fut, és a megadott felhasználónak van joga az adatbázis használatához.

## 7. Prisma előkészítés

A backend workspace-ben futtasd a Prisma generálást:

```bash
yarn workspace @orderiq/backend prisma:generate
```

Ha a schema vagy a migrációk változtak, futtasd a migrációt is:

```bash
yarn workspace @orderiq/backend prisma migrate dev
```

A backend `dev` és `build` scriptjei automatikusan meghívják a Prisma generálást, de schema módosítás után külön is érdemes lefuttatni.

## 8. Fejlesztői futtatás

A teljes alkalmazás indítása a gyökérből:

```bash
yarn dev
```

Ez a backend és a frontend futtatását is elindítja.

Külön workspace-ekből is indíthatod:

```bash
yarn backend:dev
```

```bash
yarn frontend:dev
```

Ha workspace-en belül dolgozol:

```bash
cd backend
yarn dev
```

```bash
cd frontend
yarn dev
```

## 9. Elérési pontok

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`
- Health check: `GET http://localhost:3000/api/v1/health`
- Swagger UI: `http://localhost:3000/docs` (csak `APP_ENV=development` esetén)

## 10. Hasznos parancsok

- `yarn build`: a teljes monorepo buildelése
- `yarn lint`: lint futtatása backend és frontend workspace-en
- `yarn format:check`: formázásellenőrzés a repository egészén
- `yarn format`: automatikus formázás a frontend és backend forrásokon
- `yarn workspace @orderiq/backend prisma:generate`: Prisma kliens generálása
- `yarn workspace @orderiq/backend prisma migrate dev`: migrációk futtatása fejlesztés közben

## 11. Konvenciók

- A `.env` fájlt nem commitoljuk.
- Titkos értékek csak környezeti változókban szerepeljenek.
- A backend validációja Zod sémákra és DTO-kra épül.
- A közös típusokat és sémákat a `types/` workspace-ben érdemes tartani.

## 12. Hibaelhárítás

Ha valami nem indul:

- Ellenőrizd a Node verziót: `node -v`
- Ellenőrizd a Yarn verziót: `yarn -v`
- Nézd meg, hogy létezik-e a `.env`
- Ellenőrizd, hogy fut-e a PostgreSQL
- Futtasd újra a Prisma generálást: `yarn workspace @orderiq/backend prisma:generate`

## 13. További dokumentáció

- [Repository áttekintés](../README.md)
- [Confluence szinkron](../README.md#confluence-dokumentacio-szinkron)
