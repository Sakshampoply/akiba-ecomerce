# AKIBA. — Anime Merchandise E-Commerce Platform

> A production-grade, full-stack e-commerce store for anime figures, apparel, and collectibles — built to demonstrate real-world commerce engineering.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=flat-square)

---

## Overview

Akiba Shop is a full-featured anime merchandise platform demonstrating production-ready e-commerce engineering. It covers the complete commerce stack: product catalog, variant management, cart, Stripe-powered checkout, order management, coupon system, image uploads via CDN, and a role-based admin dashboard — deployed to Vercel with a Neon serverless PostgreSQL database.

The architecture mirrors patterns used in enterprise platforms like Salesforce Commerce Cloud (SFCC): feature-based module structure, repository pattern, edge-safe middleware, and ISR-first rendering.

---

## Features

### Storefront
- Product catalog with category filters, full-text search, and price/date sorting
- Product detail pages with image gallery, variant selection, and stock indicators
- Persistent shopping cart (localStorage via Zustand)
- Multi-step checkout: shipping address → Stripe payment → order confirmation
- Coupon/promo code support (percentage, fixed amount, free shipping)
- User account: order history, saved addresses

### Admin Dashboard (`/admin`)
- Real-time analytics: revenue, orders, new customers, top products
- Full product CRUD with image upload (Vercel Blob CDN)
- Inventory management with inline stock editing
- Order management with status updates
- Coupon management: create, toggle, delete

### Platform
- Role-based auth (ADMIN / CUSTOMER) via NextAuth v5 + JWT
- Edge middleware for route protection
- ISR + static generation for storefront performance
- Stripe webhook + direct confirm endpoint for reliable order creation
- Responsive dark anime-themed UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript 5 |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 beta (JWT, CredentialsProvider) |
| Payments | Stripe (PaymentIntent + Elements) |
| Cart State | Zustand 5 with persist middleware |
| File Storage | Vercel Blob |
| Styling | Tailwind CSS 4 + Radix UI |
| Deployment | Vercel |

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Sakshampoply/akiba-ecomerce.git
cd akiba-ecomerce/akiba-shop
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local — see docs/local-setup.md for the full guide

# 3. Migrate database and seed demo data
npx prisma migrate deploy
npm run seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@akiba.shop` | `admin1234` |
| Customer | `demo@akiba.shop` | `demo1234` |

**Stripe test card:** `4242 4242 4242 4242` — any future expiry, any CVC.

**Test coupons:** `AKIBA10` (10% off), `FREESHIP` (free shipping), `SAVE20` ($20 off).

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](./docs/architecture.md) | Folder structure, repository pattern, design decisions, key conventions |
| [Database](./docs/database.md) | Full Prisma schema, all models, indexes, entity relationships, design rationale |
| [Rendering Strategy](./docs/rendering.md) | RSC vs client components, ISR, static generation, force-dynamic, Suspense |
| [Authentication](./docs/auth.md) | NextAuth v5, JWT strategy, edge-safe middleware split, role enforcement |
| [Checkout Flow](./docs/checkout.md) | End-to-end Stripe payment, webhook, idempotency, order creation |
| [API Reference](./docs/api.md) | All API routes with methods, auth requirements, request/response shapes |
| [State Management](./docs/state-management.md) | Zustand cart store, persistence, fine-grained subscriptions |
| [Image Upload](./docs/image-upload.md) | Vercel Blob upload flow, admin UI, storefront display |
| [Performance](./docs/performance.md) | Latency optimisations, lazy loading, caching, connection pooling |
| [Scalability](./docs/scalability.md) | Async workers, queue architecture, DB scaling, multi-region, search |
| [Local Setup](./docs/local-setup.md) | Prerequisites, full env var guide, Neon setup, Stripe setup, seeding |

---

## Project Structure

```
akiba-shop/
├── prisma/
│   ├── schema.prisma       # Database models
│   ├── seed.ts             # Demo data seeder
│   └── migrations/         # SQL migration history
├── src/
│   ├── app/                # Next.js App Router (pages + API routes)
│   ├── components/         # Shared UI and layout components
│   ├── features/           # Feature-scoped modules (cart, catalog)
│   ├── lib/                # Singletons: Prisma, Auth, Stripe, utils
│   ├── middleware.ts        # Edge route protection
│   └── types/              # TypeScript type augmentations
└── docs/                   # Project documentation
```

See [Architecture](./docs/architecture.md) for the full breakdown.

---

## Deployment

Deployed on Vercel. Build command:

```
npx prisma generate && next build
```

See [Local Setup](./docs/local-setup.md) for the full Vercel deployment checklist and all required environment variables.
