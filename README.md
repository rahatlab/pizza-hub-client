# PizzaHub Client — Web App

Frontend for **PizzaHub**, a pizza ordering & delivery platform (Assignment 9, Category 009).
Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Three.js, Framer Motion.

## Tech stack

- **Framework**: Next.js 16.4 (App Router, Turbopack, React Compiler)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Animation**: Framer Motion
- **3D**: Three.js via @react-three/fiber + @react-three/drei
- **Charts**: Recharts
- **Theme**: next-themes (dark/light/system)
- **Toasts**: Sonner
- **Auth**: Better Auth client + JWT (stored client-side, sent as Bearer)

### npm packages used

`next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@tailwindcss/turbopack`,
`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`,
`@react-three/fiber`, `@react-three/drei`, `three`, `framer-motion`,
`next-themes`, `recharts`, `sonner`, `@types/node`, `@types/react`,
`@types/react-dom`, `@types/three`, `eslint`, `eslint-config-next`.

## Live site

- Live: _to be added after deployment_
- Client repo: https://github.com/rahatlab/pizza-hub-client
- Server repo: https://github.com/rahatlab/pizza-hub-server

## Getting started

```bash
cd pizza-hub-client
cp .env .env.local   # create from your own values; see table below
npm install
npm run dev                   # http://localhost:3000
```

### Environment variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | API base URL (default `http://localhost:5000`) |
| `NEXT_PUBLIC_APP_URL` | Client base URL (default `http://localhost:3000`) |

Create `.env.local` (or `.env`) with these two values. Never commit real secrets.

## Stripe test card

Use Stripe's test card to complete the Premium upgrade flow:

- Card number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
- ZIP: any 5 digits

## Features

### Public
- **Home** — hero with floating 3D pizza, featured menu, categories, how-it-works
- **Menu browse** — full-text search, category chips, price range filter, sort (newest/price/name/rating), pagination
- **Item detail** — image gallery, rating, reviews, order form
- **Auth** — sign up (customer/vendor role selection), sign in, Google OAuth, password strength rules

### Customer
- Place orders (quantity, delivery date, address, notes)
- Order list + detail with status timeline
- Cancel placed/accepted orders
- Review menu items (star rating + comment)
- Profile editing (name, phone, address, avatar via ImgBB)

### Vendor
- Menu CRUD with ImgBB image upload
- Free plan: max 3 active items (enforced server-side)
- Upgrade to Premium via Stripe Checkout
- Order management (accept → prepare → out for delivery → delivered / reject)
- Stats dashboard

### Admin
- Platform overview (users, items, orders, transactions)
- User management with search, role changes, block/unblock
- Menu moderation (approve/reject/delete)
- Transaction audit

## Challenge requirements (assignment)

1. **Advanced search + price sort** — `/menu` page has a debounced search input, category filter chips, min/max price inputs, and a sort dropdown (newest, price low→high, price high→low, name A–Z, top rated). All filters are sent to `GET /api/menu` as query params (`search`, `category`, `location`, `minPrice`, `maxPrice`, `sort`) which apply them server-side with Mongoose text search, `$gte`/`$lte` price range, and `.sort()`.
2. **JWT middleware** — the client stores the JWT in `localStorage` and sends it as `Authorization: Bearer <token>` on every protected API call. The server verifies the token in `requireAuth` middleware, enforces roles via `requireRole`, and re-reads the user (including `isBlocked`) from the database on each request. Invalid/expired tokens return 401, missing roles return 403.
3. **Professional appearance** — consistent design tokens (light/dark), Fraunces headings in both themes, shadcn/ui components, toast notifications (no `alert()`), AlertDialog for destructive actions, responsive layout, loading skeletons, empty states.

## Design system

Tokens are defined in `src/app/globals.css` and mapped to Tailwind via `@theme inline`. Light and dark palettes swap automatically through `next-themes`. Headings use Fraunces in **both** themes for a consistent heading style; body uses Plus Jakarta Sans.

## 3D pizza hero

The hero pizza is built from procedural Three.js geometry (no downloaded model) so it stays original, themeable and lightweight. It lazy-loads on the client only (`pizza-3d-loader.tsx`) and degrades gracefully when WebGL is unavailable or `prefers-reduced-motion` is set.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build + type-check |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## License

MIT