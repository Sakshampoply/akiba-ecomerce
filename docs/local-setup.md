# Local Setup

## Prerequisites

- **Node.js 18+** — check with `node -v`
- **npm 9+** — check with `npm -v`
- **A Neon account** — free tier at [neon.tech](https://neon.tech) (no credit card required)
- **A Stripe account** — test mode at [stripe.com](https://stripe.com) (no real money)
- **Git**

---

## 1. Clone & Install

```bash
git clone https://github.com/Sakshampoply/akiba-ecomerce.git
cd akiba-ecomerce/akiba-shop
npm install
```

---

## 2. Create `.env.local`

Create a file called `.env.local` in `akiba-shop/` (not the repo root):

```bash
# Database (Neon) — see section 3 below
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# Stripe — see section 4 below
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # optional locally — see note below

# Vercel Blob — optional locally
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."   # image upload won't work without this
```

---

## 3. Neon Database Setup

1. Go to [neon.tech](https://neon.tech) → New Project → give it any name
2. On the dashboard, click **Connection Details**
3. Select **Prisma** from the connection string format dropdown
4. Copy the two connection strings:
   - **`DATABASE_URL`** — this is the pgbouncer pooler URL (contains `?pgbouncer=true`)
   - **`DIRECT_URL`** — this is the direct connection URL (no pgbouncer suffix)
5. Paste both into `.env.local`

**Why two URLs?** The pooler (`DATABASE_URL`) is required for all runtime queries in serverless environments. The direct URL (`DIRECT_URL`) is required for `prisma migrate deploy` because the migration advisory locks don't work through pgbouncer. See [Performance](./performance.md#pgbouncer-connection-pooling) for details.

---

## 4. Stripe Setup

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → sign in (or create account)
2. Make sure you're in **Test Mode** (toggle in the top-right)
3. Go to **Developers → API keys**
4. Copy:
   - **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`

### Stripe webhook (local — optional)

Stripe webhooks require a public URL. Locally, you have two options:

**Option A (easier): Skip the webhook.** The direct confirm endpoint `/api/orders/confirm` handles order creation in development. You don't need the webhook locally.

**Option B: Use Stripe CLI** to forward events to localhost:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret printed by the CLI → STRIPE_WEBHOOK_SECRET
```

---

## 5. Generate `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

Paste the output as `NEXTAUTH_SECRET` in `.env.local`.

---

## 6. Run Migrations

```bash
npx prisma migrate deploy
```

This creates all tables in your Neon database. If you get a `P1002` error (timeout), make sure `DIRECT_URL` is set correctly — it must bypass pgbouncer.

If you want to inspect the database visually:

```bash
npx prisma studio
```

---

## 7. Seed Demo Data

```bash
npm run seed
```

This creates:
- Admin user: `admin@akiba.shop` / `admin1234`
- Demo customer: `demo@akiba.shop` / `demo1234`
- 10 sample products with variants and emojis
- Categories: Figures, Apparel, Plushies, Pre-Order
- 3 test coupons: `AKIBA10`, `FREESHIP`, `SAVE20`

---

## 8. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Access Points

| URL | What it is |
|---|---|
| `http://localhost:3000` | Storefront homepage |
| `http://localhost:3000/products` | Product catalog |
| `http://localhost:3000/admin` | Admin dashboard (requires admin login) |
| `http://localhost:3000/login` | Login page |

---

## Test Checkout

1. Add any product to cart
2. Go to `/cart` → Proceed to Checkout
3. Enter any shipping address
4. Use test card: `4242 4242 4242 4242`, any future expiry, any 3-digit CVC
5. Click "Pay"
6. You should see the order confirmation page

---

## Vercel Deployment Checklist

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com) — set the root directory to `akiba-shop`
3. Add all environment variables from `.env.local` to Vercel → Settings → Environment Variables
4. Add `NEXTAUTH_URL` set to your Vercel deployment URL (e.g. `https://akiba-ecomerce.vercel.app`)
5. Create a Vercel Blob store (Storage tab) and link it to the project — this auto-injects `BLOB_READ_WRITE_TOKEN`
6. Add your Stripe webhook in the Stripe dashboard pointing to `https://your-domain.vercel.app/api/webhooks/stripe`
7. Set the build command to:
   ```
   npx prisma generate && next build
   ```
   (Do **not** include `prisma migrate deploy` in the build command — use `DIRECT_URL` and run migrations manually or via a separate CI step to avoid Vercel build timeouts)

---

## Common Issues

| Error | Cause | Fix |
|---|---|---|
| `P1002` (DB timeout) on migrate | Using pooler URL for migrations | Set `DIRECT_URL` to the direct connection string |
| Admin redirects to login after deploy | `NEXTAUTH_URL` mismatch | Set `NEXTAUTH_URL` to the exact deployed URL (no trailing slash) |
| Image upload fails | Missing `BLOB_READ_WRITE_TOKEN` | Add the token from Vercel Storage dashboard |
| Stripe webhook 400 | Wrong `STRIPE_WEBHOOK_SECRET` | Use the secret from Stripe CLI output (local) or Stripe dashboard (production) |
| `next/image` hostname error | CDN domain not in `remotePatterns` | Add the hostname to `next.config.ts` `images.remotePatterns` |
