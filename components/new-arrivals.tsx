import Link from "next/link"
import { ProductCard } from "./product-card"
import { Button } from "./ui/button"
import type { Product } from "@/lib/types"
import { productService } from "@/services/nexus/products"
import { extractProductsArray, normalizeProduct, toProductTimestamp } from "@/lib/normalizers/product"

async function loadNewProducts(): Promise<Product[]> {
  try {
    const response = await productService.getLatestProducts(4)
    const candidates = extractProductsArray(response)

    return candidates
      .map((item) => {
        const normalized = normalizeProduct(item)
        return { product: normalized ? { ...normalized, isNew: true } : null, ts: toProductTimestamp(item) }
      })
      .filter((entry) => entry.product !== null)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 4)
      .map((entry) => entry.product as Product)
  } catch (error) {
    console.error("Error fetching new products:", error)
    return []
  }
}

export async function NewArrivals() {
  const newProducts = await loadNewProducts()
  const hasProducts = newProducts.length > 0

  return (
    <section className="py-12 md:py-16 lg:py-24 px-4 sm:px-6 bg-accent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 md:mb-4">
            Lo Nuevo
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Descubre nuestras ultimas creaciones, listas para llegar desde Nexus.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          {hasProducts ? (
            newProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-center text-muted-foreground text-sm md:text-base">
              Aun no hay productos nuevos disponibles.
            </p>
          )}
        </div>

        {hasProducts && (
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent text-xs sm:text-sm"
              asChild
            >
              <Link href="/productos">Ver Toda la Coleccion</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
