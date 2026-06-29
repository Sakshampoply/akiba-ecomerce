# Image Upload

## Overview

Product images are stored on **Vercel Blob** — Vercel's managed object storage backed by Cloudflare's global CDN. Images are uploaded from the admin dashboard and served directly from the CDN URL in the storefront.

---

## Upload Flow

```
Admin picks file
      ↓
POST /api/upload  (multipart/form-data)
      ↓
put("products/{timestamp}-{filename}", file, { access: "public" })
      ↓
Vercel Blob CDN  →  returns { url: "https://xxxx.public.blob.vercel-storage.com/..." }
      ↓
Admin saves product  →  POST /api/products/[id]/images  →  creates ProductImage record in DB
```

The image file itself lives on Vercel Blob CDN. The database stores only the URL, alt text, and display position.

---

## Upload API Endpoint

`src/app/api/upload/route.ts`

```ts
import { put } from "@vercel/blob"

export async function POST(req: Request) {
  // Admin-only check
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return new Response("Forbidden", { status: 403 })

  const formData = await req.formData()
  const file = formData.get("file") as File

  const blob = await put(`products/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}
```

The `access: "public"` flag makes the blob URL publicly accessible without authentication — required for storefront display.

---

## ProductImage DB Model

```
ProductImage {
  id        String  @id @default(cuid())
  productId String
  url       String              // CDN URL or external image URL
  altText   String?             // used in <img alt="..."> and for SEO
  position  Int                 // display order, ascending
}
```

When fetching products, images are always ordered by `position asc`:

```ts
images: { orderBy: { position: "asc" } }
```

Position 0 is the primary (thumbnail) image used in the catalog card.

---

## Image Delete

`DELETE /api/products/[id]/images/[imageId]`

```ts
// 1. Fetch the ProductImage record
const image = await prisma.productImage.findUnique({ where: { id: imageId } })

// 2. Delete from Vercel Blob if it's a blob URL
if (image.url.includes("vercel-storage.com")) {
  await del(image.url)
}

// 3. Delete the DB record
await prisma.productImage.delete({ where: { id: imageId } })
```

External image URLs (pasted URLs, not uploaded files) skip the Blob deletion step.

---

## `ImageUploader` Component

`src/components/admin/ImageUploader.tsx`

Reusable client component used by both the new product form (`/admin/products/new`) and the edit form (`/admin/products/[id]/edit`).

**Features:**
- Drag-and-drop or click-to-browse file input
- Instant preview of selected file before upload
- Upload triggers on form submit (not on file selection) to avoid orphaned blob files
- URL paste alternative — admin can enter an external image URL directly
- Existing saved images shown with a hover-to-delete button
- Pending new images shown with a remove button (cancels before upload)

**Props:**
```ts
interface ImageUploaderProps {
  existingImages?: ProductImage[]  // shown for edit forms
  onImagesChange: (images: PendingImage[]) => void  // called when pending list changes
  onDeleteExisting?: (imageId: string) => void  // called when admin deletes saved image
}
```

---

## Storefront Display

### Product Catalog Card (`src/components/catalog/ProductCard.tsx`)

```tsx
{image ? (
  <Image
    src={image.url}
    alt={image.altText ?? product.name}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  />
) : (
  <span className="text-6xl">{emoji}</span>
)}
```

`image` is `product.images[0]` — the first image ordered by position. If no images exist, the emoji fallback is shown.

### Product Detail Page (`src/app/(storefront)/products/[slug]/page.tsx`)

- Main image: `product.images[0]` displayed in a large hero area
- Thumbnail row: shown when `product.images.length > 1`, clicking switches the main image
- Emoji fallback: if no images, a large emoji is shown in the hero area

### Cart (`src/app/(storefront)/cart/page.tsx`)

`item.imageUrl` is set when the user clicks "Add to Cart" on the product detail page:

```tsx
<AddToCartButton
  productId={product.id}
  variantId={selectedVariant.id}
  imageUrl={mainImage?.url}   // passed from the page
  ...
/>
```

`AddToCartButton` passes it to `addItem()` in the Zustand store, where it's persisted in localStorage. The cart page then renders it as a thumbnail.

---

## Next.js Image Configuration

`next.config.ts` must allowlist Vercel Blob's domains for `next/image` to optimize them:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.vercel-storage.com" },
    { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
  ],
}
```

Without this, `next/image` throws a configuration error and refuses to serve the image.

---

## Required Environment Variable

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

This token is issued by Vercel when you create a Blob store and link it to your project. It is automatically injected into Vercel deployments. For local development, copy it from the Vercel dashboard → Storage → your Blob store → `.env.local`.

Without this token, `/api/upload` will throw an authentication error. Image URL paste (external URLs) works without the token.
