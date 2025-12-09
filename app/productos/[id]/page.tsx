import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { RelatedProducts } from "@/components/related-products"
import { productService } from "@/services/nexus/products"
import type { Product } from "@/lib/types"

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

async function loadProduct(id: string): Promise<Product | null> {
  try {
    const response = await productService.getProductById(id)
    const dataSection = (response as { data?: unknown })?.data
    const infoData = (response as { info?: { data?: unknown } }).info?.data

    const candidate =
      dataSection && typeof dataSection === "object"
        ? (dataSection as RawProduct)
        : Array.isArray(infoData) && infoData.length
          ? (infoData[0] as RawProduct)
          : (response as RawProduct)

    return normalizeProduct(candidate)
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
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

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ProductDetail product={product} />
        <RelatedProducts currentProductId={product.id} category={product.category} products={[]} />
      </main>
      <Footer />
    </div>
  )
}
