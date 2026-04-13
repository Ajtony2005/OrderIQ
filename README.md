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

## Confluence dokumentáció szinkron

A `docs/` mappában lévő markdown fájlok automatikusan feltölthetők Confluence-be.
Jelenleg ez a szinkron ideiglenesen ki van kapcsolva a CI-ben.

### GitHub Actions automata feltöltés

A `.github/workflows/confluence-docs-sync.yml` workflow akkor fut, ha változik a `docs/` mappa tartalma (main/master branch), vagy manuálisan indítod `workflow_dispatch`-sel.

Szükséges repository secret-ek:

- `CONFLUENCE_BASE_URL`: pl. `https://sajat-ceg.atlassian.net/wiki`
- `CONFLUENCE_EMAIL`: Confluence felhasználó e-mail címe
- `CONFLUENCE_API_TOKEN`: Atlassian API token
- `CONFLUENCE_SPACE_KEY`: cél Space kulcsa
- `CONFLUENCE_PARENT_PAGE_ID`: szülő oldal ID, ami alá a docs oldalak kerülnek

Opcionális Swagger szinkron secret-ek:

- `CONFLUENCE_SWAGGER_JSON_URL`: publikus vagy elérhető Swagger JSON URL (pl. `https://api.domain.tld/docs-json`)
- `CONFLUENCE_SWAGGER_PAGE_TITLE`: Confluence oldalcím a Swagger tartalomhoz (alapértelmezett: `OrderIQ API Swagger`)

### Kézi futtatás lokálisan

PowerShell példában:

```powershell
$env:CONFLUENCE_BASE_URL="https://sajat-ceg.atlassian.net/wiki"
$env:CONFLUENCE_EMAIL="user@company.com"
$env:CONFLUENCE_API_TOKEN="***"
$env:CONFLUENCE_SPACE_KEY="DOCS"
$env:CONFLUENCE_PARENT_PAGE_ID="123456"
$env:CONFLUENCE_SWAGGER_JSON_URL="http://localhost:3000/docs-json"
$env:CONFLUENCE_SWAGGER_PAGE_TITLE="OrderIQ API Swagger"
yarn docs:confluence:sync
```

Dry run (csak logolás, feltöltés nélkül):

```powershell
$env:CONFLUENCE_DRY_RUN="true"
yarn docs:confluence:sync
```

## Fejlesztés

- `yarn install`
- Helyi PostgreSQL indítása és az `orderiq` adatbázis létrehozása
- `yarn workspace @orderiq/backend prisma generate`
- `yarn dev`
