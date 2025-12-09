import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"

interface RelatedProductsProps {
  currentProductId: string
  category: string
  products?: Product[]
}

export function RelatedProducts({ currentProductId, category, products = [] }: any) {
  const relatedProducts = products.filter((p: any) => p.category === category && p.id !== currentProductId).slice(0, 4)

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Tambien te puede interesar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
