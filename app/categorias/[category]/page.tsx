import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/nexus/products"
import type { Product } from "@/lib/types"
import { extractProductsArray, normalizeProduct } from "@/lib/normalizers/product"

async function loadCategoryProducts(categoryId: string): Promise<Product[]> {
  try {
    const response = await productService.getProducts(1, 40, { categoryIds: categoryId })
    const candidates = extractProductsArray(response)
    return candidates
      .map((item) => normalizeProduct(item))
      .filter((item): item is Product => item !== null)
  } catch (error) {
    console.error("Error fetching category products:", error)
    return []
  }
}

async function loadCategoryInfo(categoryId: string) {
  try {
    const category = await productService.getProductByCategory(categoryId)
    return category
  } catch (error) {
    console.error("Error fetching category info:", error)
    return null
  }
}

export const revalidate = 0

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }> | { category: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const categoryId = resolvedParams.category

  const [categoryInfo, products] = await Promise.all([loadCategoryInfo(categoryId), loadCategoryProducts(categoryId)])

  if (!categoryInfo) {
    notFound()
  }

  const hasProducts = products.length > 0

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">{categoryInfo.name}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {categoryInfo.description || "Productos disponibles en esta categoria."}
            </p>
          </div>

          {hasProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No hay productos disponibles en esta categoria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
