# OrderIQ

Az OrderIQ egy monorepo alapú rendelésfelvételi és adminisztrációs webalkalmazás. A repository frontend, backend, megosztott típusok és konténeres infrastruktúra komponenseket tartalmaz egy helyen.

Ez a README az integrált működési modellt írja le, ahol a React frontend a NestJS backend `api/v1` végpontjaihoz kapcsolódik, a backend pedig PostgreSQL adatbázissal dolgozik.

## Mire való a projekt

Az OrderIQ célja egy olyan egységes rendszer biztosítása, amely egy vendéglátóhely vagy rendeléskezelő operáció mindennapi folyamatait támogatja:

- bejelentkezés email/jelszó vagy Google alapon
- szerepkör alapú hozzáférés kezelése
- termékkatalógus és kategóriák kezelése
- kosár, checkout, fizetési mód és borravaló kezelése
- adminisztrációs felület termékekhez és felhasználókhoz
- közös típusdefiníciók és validáció frontend és backend között
- Docker alapú futtatás reverse proxy mögött

## Főbb képességek

### Frontend

- React 19 + Vite alapú SPA
- login, regisztráció és Google auth flow
- rendelési képernyő kategóriákkal és kosárral
- checkout felület borravaló- és fizetési móddal
- profil oldal
- admin felület termék- és felhasználókezeléshez

### Backend

- NestJS + Fastify API
- globális `api/v1` prefix
- JWT alapú auth
- email/jelszó alapú auth és Google tokenes auth
- Swagger dokumentáció fejlesztői környezetben
- Prisma ORM PostgreSQL adatbázissal

### Közös csomag

- `types/` workspace Zod sémákkal
- közös auth request/response típusok
- frontend és backend közti TypeScript szerződés egy helyen

## Technológiai stack

| Terület | Technológia |
| --- | --- |
| Frontend | React 19, Vite 6, TypeScript, React Router, TanStack Query, Zustand, Framer Motion, Tailwind CSS 4 |
| Backend | NestJS 11, Fastify, Prisma 6, Passport, JWT, Zod |
| Adatbázis | PostgreSQL 16 |
| Infrastruktúra | Docker Compose, Caddy, Nginx |
| Package manager | Yarn 1.22.x workspace monorepo |

## Repository struktúra

```text
.
|-- backend/              NestJS API + Prisma schema
|-- frontend/             React + Vite kliens
|-- types/                megosztott TS típusok és Zod sémák
|-- docs/                 belső architektúra és fejlesztői dokumentáció
|-- docker/               Caddy konfiguráció
|-- docker-compose.yml    teljes lokális stack
`-- README.md
```

## Integrált rendszerkép

Az alkalmazás logikai felépítése a következő:

1. A felhasználó a frontend felületen hitelesít.
2. A frontend a backend `api/v1` végpontjait hívja.
3. A backend JWT tokent ad vissza, amit a frontend a kliensoldalon tárol.
4. A backend Prisma segítségével PostgreSQL-be ír és onnan olvas.
5. Dockeres futtatásnál a Caddy a `/api/*` kéréseket az API felé proxyzza, minden mást a frontend felé.

```mermaid
flowchart LR
    User["Felhasználó"] --> Browser["Böngésző<br/>React frontend"]
    Browser --> Caddy["Caddy reverse proxy"]
    Caddy -->|/api/*| API["NestJS API<br/>/api/v1"]
    Caddy -->|minden más| Web["Frontend statikus build"]
    API --> Prisma["Prisma ORM"]
    Prisma --> DB["PostgreSQL"]
    Types["types/ workspace<br/>közös TS típusok és Zod sémák"]
    Types -.-> API
    Types -.-> Browser
```

## Fő felhasználói folyamatok

### 1. Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`

A rendszer támogatja a klasszikus email + jelszó alapú authot és a Google alapú bejelentkezést. A backend JWT access tokent ad vissza, a válasz tartalmazza a felhasználó szerepkörét és auth providerjeit is.

```mermaid
sequenceDiagram
    participant U as Felhasználó
    participant F as Frontend
    participant A as Backend API
    participant D as PostgreSQL

    U->>F: Bejelentkezési adatok megadása
    F->>A: POST /api/v1/auth/login
    A->>D: Felhasználó és identity lekérdezése
    D-->>A: User + AuthIdentity adatok
    A->>A: Jelszó ellenőrzés + JWT generálás
    A-->>F: accessToken + user payload
    F->>F: Token tárolása és auth state frissítése
    F-->>U: Átirányítás az ordering felületre
```

### 2. Katalógus és rendelés

- `GET /api/v1/products`
- `GET /api/v1/categories`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`

A frontend rendelési flow kategóriák, termékkártyák, kosár és checkout logika köré épül. A checkout képernyő tartalmaz fizetési mód választást és borravaló kezelést.

### 3. Admin funkciók

- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/:id`
- `DELETE /api/v1/admin/products/:id`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/orders/:id`

Az admin UI a frontendben már ezekre a végpontokra szerveződik. A felület termék létrehozást, módosítást, törlést és felhasználói szerepkör módosítást fed le.

### 4. Operációs végpontok

- `GET /api/v1/health`
- `GET /docs` fejlesztői környezetben

## Domain modell

A Prisma séma alapján a rendszer főbb entitásai:

- `User`
- `AuthIdentity`
- `Category`
- `Product`
- `Order`
- `OrderItem`

A backend oldalon a szerepkörök:

- `ADMIN`
- `USER`
- `KITCHEN`

A rendelési oldalon használt fizetési mód modell:

- `CARD`
- `CASH`

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String name
        +String passwordHash
        +Role role
    }

    class AuthIdentity {
        +String id
        +AuthProvider provider
        +String providerUserId
        +String userId
    }

    class Category {
        +String id
        +String name
    }

    class Product {
        +String id
        +String name
        +Int price
        +String image
        +Boolean isAvailable
        +String categoryId
    }

    class Order {
        +String id
        +Int total
        +Float tipPercent
        +PaymentMethod paymentMethod
        +String userId
    }

    class OrderItem {
        +String id
        +Int quantity
        +String orderId
        +String productId
    }

    User "1" --> "0..*" AuthIdentity : identities
    User "1" --> "0..*" Order : orders
    Category "1" --> "0..*" Product : products
    Order "1" --> "1..*" OrderItem : items
    Product "1" --> "0..*" OrderItem : orderItems
```

## Gyors indulás Docker Compose-szal

Ez a legegyszerűbb mód, ha a teljes integrált rendszert egyben akarod elindítani.

### 1. Környezeti fájl létrehozása

```bash
cp .env.example .env
```

### 2. Szükséges változók beállítása

Minimum érdemes ellenőrizni ezeket:

- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `VITE_API_BASE_URL=/api/v1`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_ADMIN_EMAIL`

Ha nincs szükség Google bejelentkezésre, a Google változók üresen hagyhatók.
Az integrált frontend-backend útvonalakhoz a `VITE_API_BASE_URL` értékét állítsd `/api/v1`-re.

### 3. Stack indítása

```bash
docker compose up --build
```

### 4. Elérési pontok

- Web alkalmazás: [http://localhost](http://localhost)
- API reverse proxy mögött: [http://localhost/api/v1](http://localhost/api/v1)
- Health: [http://localhost/api/v1/health](http://localhost/api/v1/health)
- Swagger: [http://localhost/docs](http://localhost/docs) ha `APP_ENV=development`

## Lokális fejlesztés Docker nélkül

Ha külön akarod futtatni a workspace-eket, a következő útvonal ajánlott.

### Előfeltételek

- Node.js 22 vagy újabb
- Yarn 1.22.x
- PostgreSQL 16 vagy újabb
- Git

### 1. Függőségek telepítése

```bash
yarn install
```

### 2. Adatbázis előkészítése

Hozz létre egy `orderiq` adatbázist a lokális PostgreSQL szerverben.

Példa kapcsolati string:

```text
postgresql://postgres:postgres@localhost:5432/orderiq
```

### 3. Környezeti változók beállítása

A backend jelenleg közvetlenül a folyamat környezeti változóit olvassa `process.env` használatával, ezért lokális futtatásnál exportáld őket shellből vagy használj külön env-loader eszközt.

Minta backend értékek:

```bash
export PORT=3000
export APP_ENV=development
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orderiq
export JWT_SECRET=change-me
export JWT_EXPIRES_IN=7d
export GOOGLE_CLIENT_ID=
```

Minta frontend értékek:

```bash
export VITE_API_BASE_URL=/api/v1
export VITE_GOOGLE_CLIENT_ID=
export VITE_ADMIN_EMAIL=admin@orderiq.com
```

Alternatívaként kiindulhatsz ezekből a fájlokból:

- [backend/.env.example](/Users/szotya/OrderIQ/backend/.env.example)
- [frontend/.env.example](/Users/szotya/OrderIQ/frontend/.env.example)
- [.env.example](/Users/szotya/OrderIQ/.env.example)

### 4. Prisma kliens generálása

```bash
yarn workspace @orderiq/backend prisma:generate
```

### 5. Sémaszinkron adatbázisra

Mivel a repository jelenleg Prisma schema fájlt tartalmaz, de migrációs könyvtárat nem, új környezetben praktikus a sémát közvetlenül feltolni:

```bash
yarn workspace @orderiq/backend prisma db push
```

### 6. Frontend és backend indítása együtt

```bash
yarn dev
```

### 7. Elérési pontok lokális fejlesztésnél

- Frontend dev server: [http://localhost:5177](http://localhost:5177)
- Backend API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- Health: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

Megjegyzés: a Vite dev proxy a `/api` prefixű hívásokat a `http://localhost:3000` backend felé továbbítja.

## Környezeti változók

### Gyökér `.env` Docker Compose-hoz

| Változó | Jelentés | Alapértelmezett |
| --- | --- | --- |
| `POSTGRES_DB` | PostgreSQL adatbázis neve | `orderiq` |
| `POSTGRES_USER` | PostgreSQL felhasználó | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL jelszó | `postgres` |
| `DB_PORT` | Host oldali DB port | `5432` |
| `API_PORT` | API port a konténerben | `3000` |
| `APP_ENV` | futtatási környezet | `development` |
| `DATABASE_URL` | backend adatbázis kapcsolat | `postgresql://postgres:postgres@db:5432/orderiq` |
| `JWT_SECRET` | JWT aláíró kulcs | `change-me` |
| `JWT_EXPIRES_IN` | token lejárat | `7d` |
| `GOOGLE_CLIENT_ID` | backend Google auth client ID | üres |
| `VITE_API_BASE_URL` | frontend API base URL, integrált használatnál ajánlott érték | `/api` |
| `VITE_GOOGLE_CLIENT_ID` | frontend Google client ID | üres |
| `VITE_ADMIN_EMAIL` | admin email a frontend oldalon | `admin@orderiq.com` |
| `CADDY_PORT` | publikus HTTP port | `80` |

### Backend-specifikus változók

| Változó | Kötelező | Leírás |
| --- | --- | --- |
| `PORT` | igen | NestJS alkalmazás portja |
| `APP_ENV` | igen | `development` esetén Swagger aktív |
| `DATABASE_URL` | igen | PostgreSQL kapcsolat |
| `JWT_SECRET` | igen | JWT titok |
| `JWT_EXPIRES_IN` | nem | JWT lejárat, pl. `7d` |
| `GOOGLE_CLIENT_ID` | nem | Google loginhoz szükséges |

### Frontend-specifikus változók

| Változó | Kötelező | Leírás |
| --- | --- | --- |
| `VITE_API_BASE_URL` | igen | API base URL, ajánlott érték `/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | nem | Google OAuth kliens ID |
| `VITE_ADMIN_EMAIL` | nem | ez az email admin UI hozzáférést kap |

## Fontos parancsok

### Gyökér

```bash
yarn dev
yarn build
yarn lint
yarn format
yarn format:check
```

### Backend

```bash
yarn workspace @orderiq/backend dev
yarn workspace @orderiq/backend build
yarn workspace @orderiq/backend prisma:generate
yarn workspace @orderiq/backend prisma:format
```

### Frontend

```bash
yarn workspace @orderiq/frontend dev
yarn workspace @orderiq/frontend build
yarn workspace @orderiq/frontend lint
```

### Types

```bash
yarn workspace @orderiq/types build
```

## Docker topológia

A `docker-compose.yml` négy szolgáltatást indít:

- `db`: PostgreSQL 16
- `api`: NestJS backend
- `web`: buildelt frontend Nginx alatt
- `caddy`: reverse proxy a frontend és az API elé

Routing logika:

- `/api/*` -> `api:3000`
- minden más -> `web:80`

## API dokumentáció

Fejlesztői környezetben a Swagger UI elérhető a `/docs` útvonalon. A backend kódban a Swagger csak akkor aktív, ha:

```text
APP_ENV=development
```

Gyors ellenőrzéshez:

```bash
curl http://localhost:3000/api/v1/health
```

## Megosztott típusok és validáció

A `types/` workspace felel a közös auth sémákért és típusokért.

Jelenleg közös szerződések:

- `registerSchema`
- `loginSchema`
- `googleLoginSchema`
- `authUserSchema`
- `authResponseSchema`

Ez biztosítja, hogy a frontend és a backend ugyanarra a validációs modellre épüljön.

## Dokumentációk a repository-ban

- [Gyökér architektúra dokumentáció](docs/orderiq-architektura.md)
- [Fejlesztői indulási útmutató](docs/fejlesztes-inditasa.md)
- [Mappa struktúra](docs/orderiq-mappa-struktura.md)
- [Frontend README](frontend/README.md)
- [Frontend backend guide](frontend/BACKEND_GUIDE.md)

## Confluence dokumentáció szinkron

A `docs/` mappában lévő markdown dokumentációk feltölthetők Confluence-be a repository-ban található szkript segítségével.

### GitHub Actions workflow

A `.github/workflows/confluence-docs-sync.yml` workflow akkor fut, ha a `docs/` tartalma változik a `main` vagy `master` branchen, vagy ha manuálisan indítod.

### Szükséges secret-ek

- `CONFLUENCE_BASE_URL`
- `CONFLUENCE_EMAIL`
- `CONFLUENCE_API_TOKEN`
- `CONFLUENCE_SPACE_KEY`
- `CONFLUENCE_PARENT_PAGE_ID`

Opcionális Swagger kapcsolódó secret-ek:

- `CONFLUENCE_SWAGGER_JSON_URL`
- `CONFLUENCE_SWAGGER_PAGE_TITLE`

### Lokális futtatás

```bash
yarn docs:confluence:sync
```

Dry run:

```bash
CONFLUENCE_DRY_RUN=true yarn docs:confluence:sync
```

## Hibaelhárítás

### A frontend nem éri el a backendet

Ellenőrizd ezeket:

- a backend fut-e a `3000` porton
- a frontend `VITE_API_BASE_URL` értéke helyes-e
- dev módban a Vite proxy aktív-e
- Docker módban a Caddy fut-e

### Swagger nem látszik

Ellenőrizd, hogy:

- `APP_ENV=development`
- a backend újra lett indítva env változás után

### Auth hibák jelentkeznek

Ellenőrizd:

- `JWT_SECRET` be van-e állítva
- a `GOOGLE_CLIENT_ID` és `VITE_GOOGLE_CLIENT_ID` egymáshoz tartoznak-e
- a frontend valóban Bearer tokent küld-e

### Prisma vagy adatbázis hiba van

Tipikus lépések:

```bash
yarn workspace @orderiq/backend prisma:generate
yarn workspace @orderiq/backend prisma db push
```

Ellenőrizd azt is, hogy a `DATABASE_URL` a megfelelő PostgreSQL példányra mutat-e.
