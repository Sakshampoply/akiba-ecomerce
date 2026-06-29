# Authentication

## Overview

Akiba Shop uses **NextAuth v5 beta** with a **JWT session strategy** and a single **CredentialsProvider** (email + password). There are no OAuth providers — all users register directly with the app.

---

## Why NextAuth v5?

NextAuth v5 is the App Router-native version. Key differences from v4:

| | v4 | v5 |
|---|---|---|
| Session strategy | Database sessions by default | JWT by default |
| Token format | JWS (signed) | JWE (encrypted) |
| App Router support | Adapter required | First-class |
| Middleware | `getToken()` from `next-auth/jwt` | `auth()` from NextAuth itself |
| Bundle size concern | Lower | Higher (edge needs a split) |

The JWE token format is the most important difference for this project — it means `getToken()` from `next-auth/jwt` **cannot decode NextAuth v5 tokens**. Middleware must use `NextAuth(authConfig).auth` directly.

---

## Two-File Pattern

NextAuth imports Prisma and bcrypt internally. Both are Node.js-only packages — they cannot run in Vercel's Edge Runtime. The Edge Runtime runs middleware (route protection), which has a hard **1MB bundle size limit**.

Importing the full `auth.ts` from middleware would bloat the bundle past 1MB and fail deployment.

**Solution:** split the config into two files.

### `src/lib/auth.config.ts` — Edge-safe

```ts
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "CUSTOMER"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  providers: [], // no providers here — added in auth.ts
}
```

No Prisma, no bcrypt. Safe to import in middleware.

### `src/lib/auth.ts` — Full config (Node.js runtime only)

```ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user?.passwordHash) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
})
```

Only API routes and server components import from `auth.ts`.

---

## Middleware (Edge Route Protection)

`src/middleware.ts` uses only the edge-safe config:

```ts
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url))
    if (session.user?.role !== "ADMIN")
      return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith("/account")) {
    if (!session)
      return NextResponse.redirect(new URL("/login?callbackUrl=/account", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}
```

The middleware runs at the Vercel edge before any page renders — unauthenticated requests to `/admin/*` and `/account/*` are redirected immediately, with no server component ever executing.

---

## JWT Token

The JWT token contains three fields beyond NextAuth defaults:

| Field | Source | Used for |
|---|---|---|
| `sub` | NextAuth default (user ID) | Standard JWT subject |
| `id` | Added in `jwt()` callback | Available on `session.user.id` |
| `role` | Added in `jwt()` callback | Role-based access in middleware + pages |

### TypeScript augmentation

`src/types/next-auth.d.ts` extends the built-in types so `session.user.role` and `session.user.id` are typed correctly:

```ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}
```

---

## Registration Flow

Registration is handled by `POST /api/auth/register` — NextAuth does not provide a built-in registration endpoint.

```
Client form → POST /api/auth/register
  → validate email uniqueness
  → bcrypt.hash(password, 12)
  → prisma.user.create({ email, passwordHash, role: "CUSTOMER" })
  → 201 Created
Client → signIn("credentials", { email, password })
```

After registration, the client calls NextAuth's `signIn()` to issue the JWT.

---

## Admin Account Creation

Admin accounts cannot be self-registered — the `role` field defaults to `CUSTOMER`. To create an admin:

```bash
# In development — run the seed script
npm run seed

# Or directly via Prisma Studio
npx prisma studio
# Edit the user's role to ADMIN
```

The seed script creates `admin@akiba.shop` with role `ADMIN`.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@akiba.shop` | `admin1234` |
| Customer | `demo@akiba.shop` | `demo1234` |
