import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/nexus/products"
import type { Product } from "@/lib/types"
import { extractProductsArray, normalizeProduct } from "@/lib/normalizers/product"

export const revalidate = 0

async function loadProducts(): Promise<Product[]> {
  try {
    const response = await productService.getProducts(1, 20)
    const candidates = extractProductsArray(response)

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
