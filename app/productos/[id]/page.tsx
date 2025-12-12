import { notFound } from "next/navigation"
import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { RelatedProducts } from "@/components/related-products"
import { productService } from "@/services/nexus/products"
import type { Product } from "@/lib/types"
import {
  extractProductsArray,
  extractSuggestionGroups,
  normalizeProduct,
  normalizeSuggestionGroup,
  type SuggestionGroupNormalized,
} from "@/lib/normalizers/product"
import { ProductCombinations } from "@/components/product-combinations"

async function loadProduct(id: string): Promise<Product | null> {
  try {
    const response = await productService.getProductById(id)
    const dataSection = (response as { data?: unknown })?.data
    const infoData = (response as { info?: { data?: unknown } }).info?.data

    const candidate =
      dataSection && typeof dataSection === "object"
        ? dataSection
        : Array.isArray(infoData) && infoData.length
          ? infoData[0]
          : response

    return normalizeProduct(candidate)
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

async function loadCombinations(product: Product): Promise<SuggestionGroupNormalized[]> {
  try {
    const response = await productService.getProductCombinations(product.id, { strategy: "all", excludeOutOfStock: true })
    const groups = extractSuggestionGroups(response)

    const normalizedGroups = groups
      .map((group) => normalizeSuggestionGroup(group))
      .filter((group): group is SuggestionGroupNormalized => !!group && group.products && group.products.length > 0)

    if (normalizedGroups.length) {
      return normalizedGroups
    }

    // Fallback simple: sugerencias por categoría si no hay combos
    const fallbackResponse = await productService.getProducts(1, 4, { categoryIds: product.category })
    const fallbackCandidates = extractProductsArray(fallbackResponse)
      .map((item) => normalizeProduct(item))
      .filter((p): p is Product => !!p && p.id !== product.id)

    if (fallbackCandidates.length) {
      return [
        {
          label: "Productos relacionados",
          products: fallbackCandidates.slice(0, 4),
        },
      ]
    }

    return []
  } catch (error) {
    console.error("Error fetching combinations:", error)
    return []
  }
}

export const revalidate = 0

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const product = await loadProduct(resolvedParams.id)
  const combinations = product ? await loadCombinations(product) : []

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ProductDetail product={product} />
        <ProductCombinations suggestions={combinations} />
        <RelatedProducts currentProductId={product.id} category={product.category} products={[]} />
      </main>
      <Footer />
    </div>
  )
}
