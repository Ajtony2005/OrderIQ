# OrderIq Frontend

## Áttekintés

Ez a Vite + React + TypeScript frontend az OrderIq pénztár felülethez.

## Követelmények

- Node.js 18+ (ajánlott)
- npm

## Telepítés

```bash
npm install
```

## Fejlesztői szerver

```bash
npm run dev
```

A szerver alapértelmezett címe: `http://localhost:5177`

## Környezeti változók

Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=IDE_JON_A_GOOGLE_CLIENT_ID
```

Másolhatod is a minta fájlt:

```bash
cp .env.example .env.local
```

### VITE_API_BASE_URL

A backend API alap URL-je. Ha nincs megadva, az alapértelmezett: `/api` (Vite proxyval a `http://localhost:3000` felé).

### VITE_ADMIN_EMAIL

Ha megadod, ez az e-mail kap admin jogosultságot:

```env
VITE_ADMIN_EMAIL=admin@orderiq.com
```

### VITE_GOOGLE_CLIENT_ID

Google OAuth kliens ID a bejelentkezéshez/registrációhoz.

## Google OAuth beállítás

A Google Cloud Console-ban add hozzá:

- Authorized JavaScript origins: `http://localhost:5177`
- Authorized redirect URIs: `http://localhost:5177`

## Backend kapcsolat előkészítve

A backend eléréshez készült egy közös helper:

`/Users/zsumberaoliver/Documents/OrderIq/OrderIQ/frontend/src/lib/api.ts`

Példa használat:

```ts
import { apiRequest } from "./lib/api";

const data = await apiRequest<{ ok: boolean }>("/health");
```

## Backend implementációs útmutató

Részletes backend endpoint specifikáció (admin + core):

`/Users/zsumberaoliver/Documents/OrderIq/OrderIQ/frontend/BACKEND_GUIDE.md`

### Javasolt backend endpointok

A frontendhez előkészített endpointok listája és TypeScript típusai itt találhatók:

`/Users/zsumberaoliver/Documents/OrderIq/OrderIQ/frontend/src/lib/endpoints.ts`

Alapértelmezett útvonalak:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/google`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /products`
- `GET /categories`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /admin/products`
- `POST /admin/products`
- `PUT /admin/products/:id`
- `DELETE /admin/products/:id`
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `GET /admin/orders`
- `GET /admin/orders/:id`

Példa:

```ts
import { endpoints } from "./lib/endpoints";

const auth = await endpoints.auth.login({ email, password });
const products = await endpoints.catalog.products();
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

# OrderIq Backend Guide (Admin + Core)

Ez a dokumentum leírja a frontend által elvárt backend endpointokat, a request/response szerkezeteket, és a szükséges autentikációs viselkedést.

## Alapok

- API base URL: `/api` (Vite proxy a `http://localhost:3000` felé)
- Auth: Bearer token a `Authorization` headerben
  - `Authorization: Bearer <token>`
- JSON formátum

## Auth

### POST `/auth/login`

**Body**

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response 200**

```json
{
  "token": "jwt-or-session-token",
  "user": {
    "id": "u_1",
    "name": "Alex Johnson",
    "email": "user@example.com",
    "role": "staff"
  }
}
```

### POST `/auth/register`

**Body**

```json
{
  "name": "Alex Johnson",
  "email": "user@example.com",
  "password": "secret"
}
```

**Response 200** ugyanaz, mint login.

### POST `/auth/google`

**Body**

```json
{
  "accessToken": "google-access-token"
}
```

**Response 200** ugyanaz, mint login.

### GET `/auth/me`

**Headers**
`Authorization: Bearer <token>`

**Response 200**

```json
{
  "id": "u_1",
  "name": "Alex Johnson",
  "email": "user@example.com",
  "role": "admin"
}
```

### POST `/auth/logout`

**Headers**
`Authorization: Bearer <token>`

**Response 204**

---

## Katalógus

### GET `/products`

**Response 200**

```json
[
  {
    "id": "p_1",
    "name": "Espresso",
    "price": 990,
    "category": "Kávé",
    "image": "https://..."
  }
]
```

### GET `/categories`

**Response 200**

```json
[
  { "id": "c_1", "name": "Kávé" },
  { "id": "c_2", "name": "Italok" }
]
```

---

## Rendelések

### POST `/orders`

**Headers**
`Authorization: Bearer <token>`

**Body**

```json
{
  "items": [{ "productId": "p_1", "quantity": 2 }],
  "tipPercent": 0.1,
  "paymentMethod": "card"
}
```

**Response 200**

```json
{
  "id": "o_1",
  "total": 2500,
  "createdAt": "2026-04-13T10:20:30.000Z"
}
```

### GET `/orders`

**Headers**
`Authorization: Bearer <token>`

**Response 200**

```json
[{ "id": "o_1", "total": 2500, "createdAt": "..." }]
```

### GET `/orders/:id`

**Headers**
`Authorization: Bearer <token>`

**Response 200**

```json
{ "id": "o_1", "total": 2500, "createdAt": "..." }
```

---

## Admin (csak admin)

Minden admin endpoint **csak admin szerepkörrel** legyen elérhető.

### GET `/admin/products`

**Response 200** ugyanaz, mint `/products`.

### POST `/admin/products`

**Body**

```json
{
  "name": "Új termék",
  "price": 990,
  "category": "Kávé",
  "image": "https://..."
}
```

**Response 200**

```json
{
  "id": "p_1",
  "name": "Új termék",
  "price": 990,
  "category": "Kávé",
  "image": "https://..."
}
```

### PUT `/admin/products/:id`

**Body** megegyezik a create payload-dal.

**Response 200** a frissített termék.

### DELETE `/admin/products/:id`

**Response 204**

### GET `/admin/users`

**Response 200**

```json
[{ "id": "u_1", "name": "Alex", "email": "a@b.com", "role": "admin" }]
```

### PATCH `/admin/users/:id`

**Body**

```json
{ "role": "admin" }
```

**Response 200**

```json
{ "id": "u_1", "name": "Alex", "email": "a@b.com", "role": "admin" }
```

### GET `/admin/orders`

**Response 200** ugyanaz, mint `/orders`.

### GET `/admin/orders/:id`

**Response 200** ugyanaz, mint `/orders/:id`.

---

## Megjegyzések

- A frontend automatikusan hozzáadja a `Authorization` header-t, ha van `auth_token` a localStorage-ben.
- Ha a backend JWT-t használ, a token payload-ban szerepeljen a `role` mező (`admin` / `staff`).
- CORS helyett dev környezetben Vite proxy megy `/api` útvonallal.
