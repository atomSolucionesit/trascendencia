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
  purchaseInfo?: Product["purchaseInfo"] | null
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
    purchaseInfo: item?.purchaseInfo ?? undefined,
  }
}

export const toProductTimestamp = (item: RawProduct): number => {
  const dateValue = item?.createdAt ?? item?.created_at
  const parsed = dateValue ? Date.parse(dateValue) : NaN
  if (!Number.isNaN(parsed)) return parsed
  const numericId = typeof item?.id === "string" ? Number(item.id) : item?.id
  return typeof numericId === "number" && Number.isFinite(numericId) ? numericId : 0
}

export type RawProductCombination = {
  id?: string | number | null
  title?: string | null
  description?: string | null
  products?: RawProduct[] | null
}

export const extractCombinationsArray = (response: unknown): RawProductCombination[] => {
  if (Array.isArray(response)) return response as RawProductCombination[]
  const withData = (response as { data?: unknown })?.data
  if (Array.isArray(withData)) return withData as RawProductCombination[]
  const withInfoData = (response as { info?: { data?: unknown } }).info?.data
  if (Array.isArray(withInfoData)) return withInfoData as RawProductCombination[]
  return []
}

export const normalizeCombination = (item: RawProductCombination) => {
  if (!item) return null
  const id = item.id !== undefined && item.id !== null ? String(item.id) : ""
  if (!id) return null
  const normalizedProducts = Array.isArray(item.products)
    ? item.products
        .map((p) => normalizeProduct(p))
        .filter((p): p is Product => p !== null)
    : []

  return {
    id,
    title: item.title ?? "",
    description: item.description ?? "",
    products: normalizedProducts,
  }
}

export type RawSuggestionGroup = {
  label?: string | null
  items?: RawProduct[] | null
}

export type RawSuggestionsResponse = {
  productId?: string | number | null
  suggestions?: RawSuggestionGroup[]
  info?: { data?: RawSuggestionGroup[] }
  data?: RawSuggestionGroup[]
}

export const extractSuggestionGroups = (response: unknown): RawSuggestionGroup[] => {
  const res = response as RawSuggestionsResponse
  if (Array.isArray(res?.suggestions)) return res.suggestions as RawSuggestionGroup[]
  if (Array.isArray(res?.data)) return res.data as RawSuggestionGroup[]
  if (Array.isArray(res?.info?.data)) return res.info?.data as RawSuggestionGroup[]

  // Si viene como objeto con propiedad suggestions dentro de data/info.data
  const infoData = res?.info?.data
  if (infoData && !Array.isArray(infoData) && Array.isArray((infoData as any).suggestions)) {
    return (infoData as any).suggestions as RawSuggestionGroup[]
  }
  if (res?.data && !Array.isArray(res.data) && Array.isArray((res.data as any).suggestions)) {
    return (res.data as any).suggestions as RawSuggestionGroup[]
  }
  return []
}

export type SuggestionGroupNormalized = {
  label: string
  products: Product[]
}

export const normalizeSuggestionGroup = (group: RawSuggestionGroup): SuggestionGroupNormalized | null => {
  if (!group) return null
  const label = group.label ?? "Sugerencias"
  const products = Array.isArray(group.items)
    ? group.items.map((item) => normalizeProduct(item)).filter((p): p is Product => p !== null)
    : []
  if (!products.length) return null
  return { label, products }
}
