import type { Product } from "@/lib/types"
import type { SuggestionGroupNormalized } from "@/lib/normalizers/product"
import { ProductCard } from "./product-card"

type ProductCombinationsProps = {
  suggestions: SuggestionGroupNormalized[]
}

export function ProductCombinations({ suggestions }: ProductCombinationsProps) {
  if (!suggestions.length) return null

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-secondary/15 rounded-2xl mt-10 space-y-8">
      {suggestions.map((group) => (
        <div key={group.label} className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl">{group.label}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {group.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
