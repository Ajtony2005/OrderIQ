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
