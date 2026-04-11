# Fejlesztés elkezdése

Ez az útmutató annak szól, aki most csatlakozik az OrderIQ projekthez, és gyorsan szeretné elkezdeni a fejlesztést helyi környezetben.

## 1. Előfeltételek

A fejlesztéshez az alábbi eszközök szükségesek:

- Node.js 22 vagy újabb
- Yarn 1.22.x
- PostgreSQL 16 vagy újabb, helyben telepítve
- Git

## 2. Projekt letöltése

Másold le a repót, majd lépj be a gyökérkönyvtárba:

```bash
git clone <repo-url>
cd OrderIQ
```

## 3. Környezeti változók beállítása

A projekt gyökerében található `.env.example` fájlt másold át `.env` néven, majd állítsd be a szükséges értékeket.

A legfontosabb változók:

- `PORT`: a backend portja
- `DATABASE_URL`: PostgreSQL kapcsolati string
- `JWT_SECRET`: JWT aláírási kulcs
- `APP_ENV`: futtatási környezet

Fejlesztésnél a `DATABASE_URL` a helyben futó PostgreSQL példányra mutasson.

## 4. Függőségek telepítése

Telepítsd a workspace csomagok függőségeit:

```bash
yarn install
```

## 5. Adatbázis indítása

Fejlesztéshez nem kell Docker. Indítsd el a helyben telepített PostgreSQL szolgáltatást, majd hozd létre benne az `orderiq` adatbázist.

Példa lokális kapcsolati string:

```bash
postgresql://postgres:postgres@localhost:5432/orderiq
```

Ha még nincs létrehozva az adatbázis, hozd létre manuálisan vagy psql-ből.

## 6. Prisma előkészítés

Telepítsd a Prisma kliensséget és generáld le az ORM réteget:

```bash
yarn workspace @orderiq/backend prisma generate
```

Ha az adatmodell már kész, futtasd a migrációkat is:

```bash
yarn workspace @orderiq/backend prisma migrate dev
```

## 7. Fejlesztői futtatás

A jelenlegi scaffold alapján külön érdemes indítani a backend és a frontend szolgáltatást.

Backend:

```bash
yarn workspace @orderiq/backend dev
```

Frontend:

```bash
yarn workspace @orderiq/frontend dev
```

Ha csak a root parancsot akarod használni a backendhez:

```bash
yarn dev
```

## 8. Ellenőrzés

Backend health ellenőrzés:

```bash
GET http://localhost:3000/health
```

A frontend alapértelmezés szerint a Vite fejlesztői szerveren érhető el.

## 9. Hasznos parancsok

- `yarn build`: a workspace buildelése.
- `yarn lint`: linter futtatása a fő csomagokon.
- `yarn format`: formázás a backend és frontend fájlokon.

## 10. Projektszerkezet röviden

- `backend/`: API, üzleti logika, adatbázis és validáció.
- `frontend/`: felhasználói felület és kliensoldali logika.
- `types/`: közös TypeScript típusok és sémák.
- `docs/`: leírások, architektúra és onboarding anyagok.
- `docker/`: Caddy és konténeres konfigurációk.

## 11. Első fejlesztői feladat javaslat

Ha most csatlakoztál, a legjobb első lépések általában ezek:

1. Indítsd el a backend health endpointot.
2. Nézd át a docs mappát.
3. Készíts egy egyszerű feature-t a frontendben vagy a backendben, és ellenőrizd, hogyan illeszkedik a monorepo struktúrába.
