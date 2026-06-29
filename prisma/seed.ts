import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding Akiba Shop...")

  // ── Categories ──────────────────────────────────────────
  const figures = await prisma.category.upsert({
    where: { slug: "figures" },
    update: {},
    create: { name: "Figures", slug: "figures", description: "Scale figures, nendoroids, and statues" },
  })
  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: {},
    create: { name: "Apparel", slug: "apparel", description: "Hoodies, tees, and wearables" },
  })
  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", description: "Plushies, keychains, and more" },
  })

  console.log("✅ Categories created")

  // ── Admin user ───────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin1234", 12)
  await prisma.user.upsert({
    where: { email: "admin@akiba.shop" },
    update: {},
    create: {
      email: "admin@akiba.shop",
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })

  // ── Demo customer ────────────────────────────────────────
  const customerHash = await bcrypt.hash("demo1234", 12)
  const customer = await prisma.user.upsert({
    where: { email: "demo@akiba.shop" },
    update: {},
    create: {
      email: "demo@akiba.shop",
      name: "Demo User",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  })

  console.log("✅ Users created — admin@akiba.shop / admin1234")

  // ── Products ─────────────────────────────────────────────
  const products = [
    {
      name: "Demon Slayer — Tanjiro Kamado 1/7 Scale",
      slug: "tanjiro-kamado-1-7-scale",
      description: "A breathtaking 1/7 scale figure of Tanjiro Kamado in his signature Water Breathing stance. Sculpted by renowned artist Takashi Komori, this premium collectible features exceptional paint work and an elaborate water-effect base. Stands approximately 24cm tall.",
      brand: "Good Smile Company",
      categoryId: figures.id,
      variants: [
        { sku: "GSC-DMS-TKM-17-STD", price: 18900, stock: 12, isDefault: true, label: "Standard Edition" },
        { sku: "GSC-DMS-TKM-17-DLX", price: 24900, stock: 4, isDefault: false, label: "Deluxe Edition" },
      ],
    },
    {
      name: "Jujutsu Kaisen — Gojo Satoru Nendoroid",
      slug: "gojo-satoru-nendoroid",
      description: "The beloved Gojo Satoru joins the Nendoroid lineup! This chibi-style figure comes with three face plates (standard, smiling, and blindfold), alternate hand parts, and special effect accessories for recreating iconic scenes.",
      brand: "Good Smile Company",
      categoryId: figures.id,
      variants: [
        { sku: "GSC-JJK-GJO-NDR-001", price: 8500, stock: 34, isDefault: true, label: "Standard" },
      ],
    },
    {
      name: "Attack on Titan — Survey Corps Hoodie",
      slug: "survey-corps-hoodie",
      description: "Officially licensed Survey Corps hoodie featuring embroidered regiment wings on the back. Made from 80% cotton / 20% polyester blend for maximum comfort. Includes drawstring hood and front kangaroo pocket.",
      brand: "Akiba Originals",
      categoryId: apparel.id,
      variants: [
        { sku: "AKB-AOT-SCH-S", price: 6800, stock: 45, isDefault: false, size: "S", label: "S" },
        { sku: "AKB-AOT-SCH-M", price: 6800, stock: 89, isDefault: true, size: "M", label: "M" },
        { sku: "AKB-AOT-SCH-L", price: 6800, stock: 67, isDefault: false, size: "L", label: "L" },
        { sku: "AKB-AOT-SCH-XL", price: 6800, stock: 23, isDefault: false, size: "XL", label: "XL" },
      ],
    },
    {
      name: "Chainsaw Man — Pochita Plush Premium",
      slug: "pochita-plush-premium",
      description: "Super-soft premium plush of everyone's favourite chainsaw devil. Approximately 25cm tall with chain detail and embroidered eyes. Comes with collector's tag.",
      brand: "Bandai",
      categoryId: accessories.id,
      variants: [
        { sku: "BDI-CSM-PCT-PLX-001", price: 4200, compareAt: 5500, stock: 6, isDefault: true, label: "Standard" },
      ],
    },
    {
      name: "Naruto — Sage Mode 1/4 Scale Statue",
      slug: "naruto-sage-mode-1-4-scale",
      description: "An epic 1/4 scale statue of Naruto in full Sage Mode, standing 52cm tall on an elaborate rock-and-toads base. Hand-painted and crafted from premium polystone resin. Certificate of authenticity included.",
      brand: "Prime 1 Studio",
      categoryId: figures.id,
      isPreOrder: true,
      preOrderDate: new Date("2024-12-01"),
      variants: [
        { sku: "P1S-NRT-SGM-14-001", price: 42000, stock: 0, isDefault: true, label: "Standard Edition" },
        { sku: "P1S-NRT-SGM-14-EX", price: 58000, stock: 0, isDefault: false, label: "Exclusive Edition" },
      ],
    },
    {
      name: "My Hero Academia — Deku Full Cowling Figure",
      slug: "deku-full-cowling-figure",
      description: "Deku mid-air in Full Cowling 100% stance — lightning effects and dynamic posing make this a must-have for MHA collectors. Approx 21cm, PVC/ABS construction.",
      brand: "Kotobukiya",
      categoryId: figures.id,
      variants: [
        { sku: "KBY-MHA-DKU-FC-001", price: 15500, compareAt: 18000, stock: 21, isDefault: true, label: "Standard" },
      ],
    },
    {
      name: "Demon Slayer — Breath of the Sun Tee",
      slug: "breath-of-sun-tee",
      description: "Premium graphic tee featuring original Breath of the Sun artwork. 100% ringspun cotton, pre-shrunk, available in all sizes. Unisex fit.",
      brand: "Akiba Originals",
      categoryId: apparel.id,
      variants: [
        { sku: "AKB-DMS-BST-S", price: 3500, stock: 80, isDefault: false, size: "S", label: "S" },
        { sku: "AKB-DMS-BST-M", price: 3500, stock: 145, isDefault: true, size: "M", label: "M" },
        { sku: "AKB-DMS-BST-L", price: 3500, stock: 110, isDefault: false, size: "L", label: "L" },
        { sku: "AKB-DMS-BST-XL", price: 3500, stock: 55, isDefault: false, size: "XL", label: "XL" },
      ],
    },
    {
      name: "One Piece — Gear 5 Luffy POP! Figure",
      slug: "luffy-gear5-pop-figure",
      description: "Funko POP! Luffy in full Gear 5 Nika form — the wildest transformation in One Piece history immortalised in vinyl. Stands 9cm tall.",
      brand: "Funko",
      categoryId: figures.id,
      variants: [
        { sku: "FNK-OP-LFY-G5-001", price: 2800, stock: 203, isDefault: true, label: "Standard" },
      ],
    },
    {
      name: "Spy × Family — Anya Forger Nendoroid",
      slug: "anya-forger-nendoroid",
      description: "Anya Forger brings her iconic smug face (and many more!) to the Nendoroid lineup. Includes three face plates, peanut accessory, and mini Eden Academy bag.",
      brand: "Good Smile Company",
      categoryId: figures.id,
      variants: [
        { sku: "GSC-SPY-ANY-NDR-001", price: 7800, stock: 28, isDefault: true, label: "Standard" },
      ],
    },
    {
      name: "Akiba Shop Tote Bag — Logo Edition",
      slug: "akiba-tote-bag-logo",
      description: "Heavy-duty canvas tote bag with embroidered Akiba Shop logo. Perfect for carrying your haul home from the store. 38cm × 40cm, reinforced straps.",
      brand: "Akiba Originals",
      categoryId: accessories.id,
      variants: [
        { sku: "AKB-ACC-TOT-001", price: 1800, stock: 500, isDefault: true, label: "One Size" },
      ],
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand,
        isActive: true,
        isPreOrder: p.isPreOrder ?? false,
        preOrderDate: p.preOrderDate ?? null,
        categories: { create: { categoryId: p.categoryId } },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            price: v.price,
            compareAt: (v as { compareAt?: number }).compareAt ?? null,
            stock: v.stock,
            isDefault: v.isDefault,
            size: (v as { size?: string }).size ?? null,
          })),
        },
      },
    })
    console.log(`  ✅ ${product.name}`)
  }

  // ── Coupons ──────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "AKIBA10" },
    update: {},
    create: {
      code: "AKIBA10",
      type: "PERCENTAGE",
      value: 10,
      minOrderCents: 5000,
      isActive: true,
    },
  })
  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 0,
      isActive: true,
    },
  })
  await prisma.coupon.upsert({
    where: { code: "SAVE20" },
    update: {},
    create: {
      code: "SAVE20",
      type: "FIXED_AMOUNT",
      value: 2000,
      minOrderCents: 15000,
      isActive: true,
    },
  })

  // ── Demo order ───────────────────────────────────────────
  const firstProduct = await prisma.product.findFirst({ where: { slug: "gojo-satoru-nendoroid" }, include: { variants: true } })
  if (firstProduct && firstProduct.variants[0]) {
    await prisma.order.upsert({
      where: { orderNumber: "AKB-00001" },
      update: {},
      create: {
        orderNumber: "AKB-00001",
        userId: customer.id,
        status: "DELIVERED",
        subtotalCents: 8500,
        shippingCents: 0,
        discountCents: 0,
        taxCents: 680,
        totalCents: 9180,
        stripePaymentId: "pi_demo_001",
        items: {
          create: {
            productId: firstProduct.id,
            variantId: firstProduct.variants[0].id,
            productName: firstProduct.name,
            variantLabel: "Standard",
            quantity: 1,
            unitPriceCents: 8500,
            totalCents: 8500,
          },
        },
        shippingAddress: {
          create: {
            name: "Demo User",
            line1: "123 Akihabara St",
            city: "Tokyo",
            state: "Tokyo",
            zip: "101-0021",
            country: "JP",
          },
        },
      },
    })
  }

  console.log("\n✅ Coupons: AKIBA10 (10% off), FREESHIP, SAVE20 ($20 off $150+)")
  console.log("\n🎉 Seed complete!")
  console.log("   Admin login: admin@akiba.shop / admin1234")
  console.log("   Demo login:  demo@akiba.shop  / demo1234")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
