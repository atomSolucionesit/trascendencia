import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/nexus/products"
import type { Product } from "@/lib/types"

const normalizeProduct = (item: any): Product | null => {
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

export const revalidate = 0

async function loadProducts(): Promise<Product[]> {
  try {
    const response = await productService.getProducts(1, 20)
    const candidates =
      (Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: unknown }).data)
          ? (response as { data: unknown[] }).data
          : Array.isArray((response as { items?: unknown }).items)
            ? (response as { items: unknown[] }).items
            : Array.isArray((response as { info?: { data?: unknown } }).info?.data)
              ? (response as { info: { data: unknown[] } }).info.data
              : []) as any[]

    return candidates
      .map((item) => normalizeProduct(item))
      .filter((item): item is Product => item !== null)
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await loadProducts()
  const hasProducts = products.length > 0

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">
              Todos los Productos
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              El catalogo se mostrara aqui en cuanto llegue desde Nexus.
            </p>
          </div>

          {hasProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Aun no hay productos disponibles.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
