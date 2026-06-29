import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductEditForm } from "./ProductEditForm"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, categories: { include: { category: true } }, images: { orderBy: { position: "asc" } } },
  })
  if (!product) notFound()

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return <ProductEditForm product={product} categories={categories} />
}
