# PizzaHub — Pizza Ordering & Delivery Platform

## 🍕 Overview

Full-stack pizza ordering & delivery platform with three roles: **Customer**, **Vendor**, **Admin**.

- **Customer**: Browse/search/filter menu, place orders, track order status, cancel pending orders, rate items
- **Vendor**: Manage menu items, accept/reject orders, manage subscription (Free/Premium via Stripe)
- **Admin**: Manage users (block/unblock), review menu items (approve/reject), view transactions

## 🛠 Tech Stack

**Client** (`pizza-hub-client`):
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, ShadCN UI, Framer Motion
- @react-three/fiber + @react-three/drei (3D pizza hero slider)
- TanStack Query, Sonner (toasts), Recharts (dashboard charts)
- Better Auth client, Socket.io-client (realtime reviews)

**Server** (`pizza-hub-server`):
- Express.js, TypeScript, MongoDB (Mongoose)
- Better Auth (MongoDB adapter) + Google OAuth
- JWT (localStorage) + role-based middleware chain
- Stripe Checkout + webhook (vendor premium subscription)
- ImgBB proxy (image upload), Socket.io (realtime reviews)

## 📁 Repo Structure

```
pizza-hub-client/
  src/app/(site)/         # Public pages (home, menu, sign-in, sign-up)
  src/app/(dashboard)/    # Role-based dashboards
  src/app/order/[id]/     # Order form
  src/app/payment/        # Stripe success/cancel
  src/components/ui/      # ShadCN UI components
  src/components/home/    # 3D pizza hero slider
  src/components/order/   # Order timeline
  src/components/layout/  # Navbar, footer, dashboard layout
  src/lib/api.ts          # Fetch wrapper (Bearer JWT)
  src/lib/socket.ts       # Socket.io client
  src/lib/session.ts      # Client session store
  src/lib/theme.ts        # Dark/light mode

pizza-hub-server/
  src/config/env.ts       # Env validation
  src/lib/db.ts           # MongoDB connection
  src/lib/auth.ts         # Better Auth config
  src/lib/jwt.ts          # JWT sign/verify
  src/lib/socket.ts       # Socket.io server
  src/middleware/auth.ts  # verifyJWT → loadUserFresh → blockCheck → requireRole → ownershipCheck
  src/middleware/error.ts # ApiError + asyncHandler + centralized error middleware
  src/models/*.ts         # User, MenuItem, Order, Transaction, Review
  src/routes/*.ts         # All API routes
  scripts/seed-admin.ts   # Admin seed script
```

## 🔑 Environment Variables

### Server (`.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | development/production |
| `CLIENT_URL` | CORS allowlist origin |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `BETTER_AUTH_URL` | Better Auth base URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe premium plan price ID |
| `IMGBB_API_KEY` | ImgBB API key |
| `ADMIN_EMAIL` | Admin email for seeding |

### Client (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SERVER_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL |

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account (for webhook testing)

### Server

```bash
cd pizza-hub-server
cp .env.example .env
# Edit .env with real values
npm install
npm run dev      # http://localhost:5000
npm run seed     # Seed admin user
```

### Client

```bash
cd pizza-hub-client
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
```

## 📋 API Endpoints

### Public
- `GET /api/menu` — search/filter/sort/paginate approved items
- `GET /api/menu/:id` — single item

### Auth (`/api/auth/*`)
- `POST /api/auth/sign-in/email` — sign in
- `POST /api/auth/sign-up/email` — sign up (role: customer/vendor)
- `POST /api/auth/jwt` — issue JWT (Bearer token for protected APIs)

### Customer
- `POST /api/orders` — place order
- `GET /api/customer/orders` — own orders
- `PATCH /api/customer/orders/:id/cancel` — cancel pending order
- `GET /api/customer/stats` — order stats
- `PATCH /api/profile` — update profile
- `POST /api/reviews` — create review
- `GET /api/reviews/:itemId` — reviews + avg rating

### Vendor
- `POST /api/vendor/menu` — create item
- `GET /api/vendor/menu` — own items
- `PUT /api/vendor/menu/:id` — update item
- `DELETE /api/vendor/menu/:id` — delete item
- `PATCH /api/vendor/menu/:id/availability` — toggle availability
- `GET /api/vendor/orders` — received orders
- `PATCH /api/vendor/orders/:id` — accept/reject order
- `GET /api/vendor/stats` — vendor stats
- `POST /api/payment/checkout` — Stripe checkout session

### Admin
- `GET /api/admin/users` — list users
- `PATCH /api/admin/users/:id/block` — block/unblock
- `GET /api/admin/menu` — all items
- `PATCH /api/admin/menu/:id/status` — approve/reject
- `DELETE /api/admin/menu/:id` — delete item
- `GET /api/admin/transactions` — transactions (read-only)
- `GET /api/admin/stats` — overview counts

## 🔐 Auth Flow

1. User signs in/up via Better Auth (session cookie)
2. Client calls `POST /api/auth/jwt` with credentials
3. Server verifies Better Auth session, issues JWT `{ userId, email, role }`
4. Client stores JWT in `localStorage` as `pizzahub_token`
5. Protected APIs require `Authorization: Bearer <jwt>`
6. Middleware: `verifyJWT → loadUserFresh → blockCheck → requireRole → ownershipCheck`

## 🎨 Design

- Light mode (doc default): cream `#FFF8F0` + warm red `#D62839`
- Dark mode: espresso `#14100E` + bright red `#FF4D57`
- WCAG AA contrast in both modes
- Fonts: Sora (headings) + Plus Jakarta Sans (body)
- Fixed type scale, no arbitrary values
- Fully responsive (320–1440px)

## 🧪 Challenge Implementation

1. **Advanced search + sorting**: `GET /api/menu?search=&category=&location=&sort=price_asc\|price_desc`
2. **JWT verification**: Express middleware validates signature + expiry, loads user fresh from DB
3. **Professional appearance**: Consistent spacing, contrast, alignment, equal cards

## 📦 Optional Features (3/3)

1. 🌙 **Dark/Light mode toggle** — `localStorage` persist, no-flash
2. 📜 **Order status timeline** — visual Pending → Accepted/Rejected/Cancelled
3. ⭐ **Reviews & Ratings + Socket.io realtime** — one review per item, live updates

## 🔒 Security

- Server-side role verification on all protected APIs
- Resource ownership check before update/delete
- Stripe premium activated only via verified webhook (not frontend redirect)
- JWT short expiry, role loaded fresh from DB each request
- `.env` / secrets never committed

## 📄 License

MIT
