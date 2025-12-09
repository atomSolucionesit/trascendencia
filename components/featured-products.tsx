import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/types"
import { productService } from "@/services/nexus/products"

type RawProduct = Partial<Product> & {
  id?: string | number | null
  name?: string | null
  price?: number | string | null
  sellingPrice?: number | string | null
  category?: string | null
  image?: string | null
  description?: string | null
  inStock?: boolean | null
  sizes?: string[] | null
  colors?: string[] | null
  images?: Array<{ url?: string } | string> | null
  CategoryProduct?: Array<{ category?: { name?: string } }>
}

const normalizeProduct = (item: RawProduct): Product | null => {
  const id = item?.id !== undefined && item?.id !== null ? String(item.id) : ""
  const name = item?.name ?? ""

  if (!id || !name) return null

  const rawPrice = item?.sellingPrice ?? item?.price
  const priceNumber =
    typeof rawPrice === "number"
      ? rawPrice
      : typeof rawPrice === "string"
        ? Number(rawPrice)
        : 0

  const firstImage = Array.isArray(item?.images) && item.images.length ? item.images[0] : null
  const imageUrl =
    typeof firstImage === "string"
      ? firstImage
      : firstImage && typeof firstImage.url === "string"
        ? firstImage.url
        : undefined

  const categories = Array.isArray(item?.CategoryProduct) ? item.CategoryProduct : []
  const firstCategory = categories.length ? categories[0] : null
  const categoryName =
    firstCategory && firstCategory.category && typeof firstCategory.category.name === "string"
      ? firstCategory.category.name
      : item?.category ?? "sin-categoria"

  return {
    id,
    name,
    price: Number.isFinite(priceNumber) ? priceNumber : 0,
    image: imageUrl ?? "/placeholder.svg",
    category: categoryName,
    description: item?.description ?? "",
    inStock: item?.inStock ?? true,
    sizes: Array.isArray(item?.sizes) ? item.sizes : [],
    colors: Array.isArray(item?.colors) ? item.colors : [],
  }
}

async function loadFeatured(): Promise<Product[]> {
  try {
    const response = await productService.getFeaturedProducts()
    const candidates =
      (Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: unknown }).data)
          ? (response as { data: unknown[] }).data
          : Array.isArray((response as { info?: { data?: unknown } }).info?.data)
            ? (response as { info: { data: unknown[] } }).info.data
            : []) as RawProduct[]

    return candidates
      .map((item) => normalizeProduct(item))
      .filter((item): item is Product => item !== null)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export async function FeaturedProducts() {
  const featuredProducts = await loadFeatured()
  const hasProducts = featuredProducts.length > 0

  return (
    <section className="py-12 md:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4 text-balance">
            Coleccion Destacada
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto text-pretty">
            Piezas seleccionadas
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {hasProducts ? (
            featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-center text-muted-foreground text-sm md:text-base">
              Aun no hay productos destacados disponibles.
            </p>
          )}
        </div>

        {hasProducts && (
          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/productos"
              className="inline-block text-xs sm:text-sm tracking-wide border-b-2 border-primary pb-1 hover:border-secondary transition-colors"
            >
              VER TODA LA COLECCION
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
