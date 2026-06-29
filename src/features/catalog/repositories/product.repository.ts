import { prisma } from "@/lib/prisma"

export type ProductListItem = Awaited<ReturnType<typeof getProducts>>[0]
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>

export async function getProducts({
  category,
  preorder,
  q,
  page = 1,
  limit = 12,
}: {
  category?: string
  preorder?: boolean
  q?: string
  page?: number
  limit?: number
} = {}) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(preorder ? { isPreOrder: true } : {}),
      ...(category
        ? { categories: { some: { category: { slug: category } } } }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { where: { isDefault: true }, take: 1 },
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      categories: { include: { category: true } },
    },
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })
}
