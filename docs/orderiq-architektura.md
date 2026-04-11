# OrderIQ architektúra

Ez a dokumentum az OrderIQ rendszer magas szintű architektúráját írja le. A cél egy nagy teljesítményű, többrétegű webalkalmazás kialakítása, amely offline működésre is képes, és jól skálázható marad backend, frontend és infrastruktúra szinten is.

## Rendszeráttekintés

Az OrderIQ egy modern, monorepo-jellegű webalkalmazás, amely szétválasztja a szerveroldali üzleti logikát, a kliensoldali felhasználói élményt és a közös típusdefiníciókat. Az architektúra úgy épül fel, hogy a rendelésfelvétel, a konyhai megjelenítés, az adminisztráció és az offline adatkezelés egyetlen egységes rendszerben működjön.

## Főbb technológiai pillérek

- Backend: NestJS keretrendszer Fastify adapterrel.
- Frontend: React Vite-tel, Tailwind CSS és Framer Motion.
- Adatkezelés: PostgreSQL Prisma ORM-mel és IndexedDB Dexie.js-szel.
- Infrastruktúra: Docker konténerizáció Caddy webszerverrel.

## Backend architektúra

A szerveroldal a NestJS moduláris felépítését követi, hogy a rendszer skálázható és karbantartható maradjon.

### Runtime és framework

A backend Node.js környezetben futó NestJS alkalmazás, ahol a Fastify biztosítja az alacsonyabb overheadet a HTTP kérések feldolgozásakor.

### Hitelesítés és biztonság

- Passport.js: JWT alapú munkamenet-kezelés és OAuth támogatás.
- RBAC: Szerepkör alapú hozzáférés az adminisztrátor, általános és konyhai felhasználók között.
- Zod: Runtime típusellenőrzés és adatvalidáció minden bejövő kérésnél.

### Adatréteg

- PostgreSQL: Relációs adatbázis a tranzakcionális adatok, például rendelések és receptúrák tárolására.
- Prisma: Típusbiztos ORM, amely közvetlen kapcsolatot teremt a kód és az adatbázis séma között.

## Frontend architektúra

A kliensoldal egy Single Page Application, amely a felhasználói élményre, a sebességre és az offline működésre fókuszál.

### Állapotkezelés

- Zustand: Könnyűsúlyú globális store a kosár és a UI állapot kezeléséhez.
- TanStack Query: Szerveroldali állapot cache-elése és automatikus újraszinkronizálás.

### Offline stratégia

- Dexie.js: Az IndexedDB adatbázis kezelése a böngészőben.
- Szinkronizáció: Internetkapcsolat helyreállásakor egy egyedi szinkronizációs réteg feltölti a lokálisan tárolt adatokat a központi szerverre.

### UI és UX

- Tailwind CSS: Reszponzív, utility-first formázás.
- Framer Motion: Animációk a folyamatok, például a sikeres rendelésrögzítés vizuális visszajelzéséhez.

## Adatfolyam és integráció

1. Rendelésfelvétel: A felhasználó a POS felületen rögzíti a tételeket.
2. Validáció: A frontend és a backend is ellenőrzi az adatokat.
3. Feldolgozás: A backend kiszámítja a receptúrák alapján a készletcsökkenést.
4. Konyhai értesítés: A rendelés valós időben megjelenik a konyhai kijelzőn.
5. Külső kapcsolatok: A rendszer API-n keresztül felkészített külső számlázó és ételrendelő rendszerek fogadására.

## Infrastruktúra és DevOps

A teljes környezet Docker konténerekben fut, így a fejlesztői és az éles környezet viselkedése közelebb kerül egymáshoz.

- Caddy: Modern webszerver, amely automatikusan kezeli az SSL tanúsítványokat és reverse proxy-ként szolgál az API és a web kliens előtt.
- Redis terv: Későbbi fázisban szerveroldali cache-eléshez és szinkronizációs sorok kezeléséhez.

## Kapcsolódó dokumentumok

- [Mappa struktúra](orderiq-mappa-struktura.md)
