import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { getProductsByCategory } from "@/lib/products"

export const dynamicParams = true

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }> | { category: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const categoryKey = resolvedParams.category
  const products = getProductsByCategory(categoryKey)

  const readableCategory = categoryKey.replace(/-/g, " ")

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">{readableCategory}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los productos de esta categoria se cargaran desde Nexus.
            </p>
          </div>

          {products.length > 0 ? (
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
