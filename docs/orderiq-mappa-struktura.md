# OrderIQ mappa struktúra

Ez a dokumentum az OrderIQ projekt könyvtárszerkezetét és az egyes modulok technikai felelősségi köreit foglalja össze. A struktúra monorepo-szerű felépítést támogat, külön kezelve a backend, frontend és közös típusdefiníciókat.

## Projekt gyökérkönyvtár

A projekt gyökerében találhatók a futtatáshoz és a fejlesztői környezet kialakításához szükséges globális elemek.

- `backend/`: NestJS alapú szerveroldali alkalmazás.
- `frontend/`: React alapú kliensoldali alkalmazás.
- `types/`: Megosztott TypeScript interfészek és Zod sémák.
- `docs/`: Projekt specifikációk, leírások és hivatkozott dokumentumok.
- `docker/`: Konténerizációs beállítások és Caddy konfiguráció.
- `README.md`: Általános projektleírás és telepítési útmutató.
- `docker-compose.yml`: Multi-konténeres környezet definíciója.
- `.env.example`: Környezeti változók sablonja.

## Backend: NestJS + Fastify

A backend felel az üzleti logikáért, a hitelesítésért és az adatbázis-műveletekért.

- `backend/prisma/`: Adatbázis-séma definíciók és migrációs fájlok.
- `backend/src/config/`: Alkalmazásszintű beállítások és környezeti változók kezelése.
- `backend/src/controllers/`: API végpontok kezelői.
- `backend/src/helpers/`: Általános célú segédfüggvények.
- `backend/src/middlewares/`: Hitelesítés, jogosultságkezelés és naplózás.
- `backend/src/models/`: Az adatstruktúra logikai reprezentációja.
- `backend/src/routes/`: API útvonalak és kontrollerek összerendelése.
- `backend/src/services/`: Az üzleti logika tényleges helye.
- `backend/src/validators/`: Bemeneti adatok ellenőrzése Zod sémákkal.

## Frontend: React + Vite

A kliensoldal biztosítja a felhasználói felületet és az offline működéshez szükséges logikát.

- `frontend/public/`: Statikus erőforrások, például ikonok és logók.
- `frontend/src/api/`: TanStack Query hookok a backenddel való kommunikációhoz.
- `frontend/src/assets/`: Globális stíluslapok és képek.
- `frontend/src/components/`: Újrafelhasználható UI komponensek.
- `frontend/src/context/`: Globális React Context-ek.
- `frontend/src/data/`: Konstansok és statikus szöveges tartalmak.
- `frontend/src/hooks/`: Egyedi React hookok a logika kiszervezéséhez.
- `frontend/src/pages/`: Fő nézetek, például POS, konyha, admin és riportok.
- `frontend/src/redux/`: Globális állapotkezelés.
- `frontend/src/services/`: Külső API hívások és Dexie.js alapú offline adatkezelés.
- `frontend/src/utils/`: Segédfüggvények, például dátum- és pénznemkezelés.

## Megjegyzés

A `types/` mappa a közös szerződések helye, így ide érdemes tenni minden olyan interfészt és sémát, amelyet a backend és a frontend is használ.
