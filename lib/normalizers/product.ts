import type { Product } from "@/lib/types"

export type RawProduct = Partial<Product> & {
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
  createdAt?: string | null
  created_at?: string | null
}

export const extractProductsArray = (response: unknown): RawProduct[] => {
  if (Array.isArray(response)) return response as RawProduct[]
  const withData = (response as { data?: unknown })?.data
  if (Array.isArray(withData)) return withData as RawProduct[]
  const withInfoData = (response as { info?: { data?: unknown } }).info?.data
  if (Array.isArray(withInfoData)) return withInfoData as RawProduct[]
  return []
}

export const normalizeProduct = (item: RawProduct): Product | null => {
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

export const toProductTimestamp = (item: RawProduct): number => {
  const dateValue = item?.createdAt ?? item?.created_at
  const parsed = dateValue ? Date.parse(dateValue) : NaN
  if (!Number.isNaN(parsed)) return parsed
  const numericId = typeof item?.id === "string" ? Number(item.id) : item?.id
  return typeof numericId === "number" && Number.isFinite(numericId) ? numericId : 0
}
