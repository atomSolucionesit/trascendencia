import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/types"
import { productService } from "@/services/nexus/products"
import { extractProductsArray, normalizeProduct } from "@/lib/normalizers/product"

async function loadFeatured(): Promise<Product[]> {
  try {
    const response = await productService.getFeaturedProducts()
    const candidates = extractProductsArray(response)

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
            Piezas cuidadosamente seleccionadas que reflejan nuestra pasión por la excelencia
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
