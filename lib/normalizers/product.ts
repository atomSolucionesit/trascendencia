import type { Product } from "@/lib/types"

export type RawProduct = Omit<Partial<Product>, "images" | "variants" | "variantGroups" | "hasVariants" | "stock"> & {
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
  stock?: number | string | null
  hasVariants?: boolean | null
  variantGroups?: Array<{
    id?: string | number | null
    name?: string | null
    kind?: string | null
    position?: number | null
    isActive?: boolean | null
    options?: Array<{
      id?: string | number | null
      groupId?: string | number | null
      name?: string | null
      colorHex?: string | null
      imageUrl?: string | null
      imageUrls?: string[] | null
      price?: number | string | null
      position?: number | null
      isActive?: boolean | null
    }> | null
  }> | null
  variants?: Array<{
    id?: string | number | null
    name?: string | null
    sku?: string | null
    stock?: number | string | null
    isActive?: boolean | null
    optionLinks?: Array<{
      group?: { id?: string | number | null; name?: string | null; position?: number | null } | null
      option?: { id?: string | number | null; name?: string | null } | null
    }> | null
  }> | null
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
  const hasStockValue = item?.stock !== undefined && item?.stock !== null
  const stockNumber =
    typeof item?.stock === "number"
      ? item.stock
      : typeof item?.stock === "string"
        ? Number(item.stock)
        : 0

  const images = Array.isArray(item?.images)
    ? item.images
        .map((image) => {
          if (typeof image === "string") return image
          if (image && typeof image.url === "string") return image.url
          return null
        })
        .filter((image): image is string => !!image)
    : []

  const productImage = item?.image ?? undefined
  const normalizedImages = Array.from(new Set([productImage, ...images].filter((image): image is string => !!image)))

  const categories = Array.isArray(item?.CategoryProduct) ? item.CategoryProduct : []
  const firstCategory = categories.length ? categories[0] : null
  const categoryName =
    firstCategory && firstCategory.category && typeof firstCategory.category.name === "string"
      ? firstCategory.category.name
      : item?.category ?? "sin-categoria"

  const variantGroups = Array.isArray(item?.variantGroups)
    ? item.variantGroups
        .map((group) => {
          const groupId = group?.id !== undefined && group?.id !== null ? String(group.id) : ""
          const groupName = group?.name ?? ""
          if (!groupId || !groupName || group?.isActive === false) return null

          const options = Array.isArray(group.options)
            ? group.options
                .map((option) => {
                  const optionId = option?.id !== undefined && option?.id !== null ? String(option.id) : ""
                  const optionName = option?.name ?? ""
                  const optionGroupId =
                    option?.groupId !== undefined && option?.groupId !== null ? String(option.groupId) : groupId
                  if (!optionId || !optionName || option?.isActive === false) return null
                  const optionPrice =
                    typeof option?.price === "number"
                      ? option.price
                      : typeof option?.price === "string"
                        ? Number(option.price)
                        : 0

                  return {
                    id: optionId,
                    groupId: optionGroupId,
                    name: optionName,
                    colorHex: option?.colorHex ?? null,
                    imageUrl: option?.imageUrl ?? null,
                    imageUrls: Array.isArray(option?.imageUrls) ? option.imageUrls : null,
                    price: Number.isFinite(optionPrice) ? optionPrice : 0,
                    position: option?.position ?? 0,
                    isActive: option?.isActive ?? true,
                  }
                })
                .filter((option): option is NonNullable<typeof option> => option !== null)
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            : []

          return {
            id: groupId,
            name: groupName,
            kind: group?.kind ?? null,
            position: group?.position ?? 0,
            options,
          }
        })
        .filter((group): group is NonNullable<typeof group> => group !== null)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    : []

  const variants = Array.isArray(item?.variants)
    ? item.variants
        .map((variant) => {
          const variantId = variant?.id !== undefined && variant?.id !== null ? String(variant.id) : ""
          if (!variantId) return null
          const variantStock =
            typeof variant?.stock === "number"
              ? variant.stock
              : typeof variant?.stock === "string"
                ? Number(variant.stock)
                : 0
          const selections = Array.isArray(variant.optionLinks)
            ? variant.optionLinks
                .map((link) => {
                  const groupId = link?.group?.id !== undefined && link?.group?.id !== null ? String(link.group.id) : ""
                  const optionId =
                    link?.option?.id !== undefined && link?.option?.id !== null ? String(link.option.id) : ""
                  if (!groupId || !optionId) return null
                  return {
                    groupId,
                    groupName: link?.group?.name ?? "",
                    optionId,
                    optionName: link?.option?.name ?? "",
                  }
                })
                .filter((selection): selection is NonNullable<typeof selection> => selection !== null)
            : []

          return {
            id: variantId,
            name: variant?.name ?? selections.map((selection) => selection.optionName).filter(Boolean).join(" / "),
            sku: variant?.sku ?? null,
            stock: Number.isFinite(variantStock) ? variantStock : 0,
            isActive: variant?.isActive ?? true,
            optionIds: selections.map((selection) => selection.optionId),
            selections,
          }
        })
        .filter((variant): variant is NonNullable<typeof variant> => variant !== null)
    : []

  return {
    id,
    name,
    price: Number.isFinite(priceNumber) ? priceNumber : 0,
    image: normalizedImages[0] ?? "/placeholder.svg",
    images: normalizedImages.length ? normalizedImages : ["/placeholder.svg"],
    category: categoryName,
    description: item?.description ?? "",
    inStock:
      item?.inStock ??
      (variants.length ? variants.some((variant) => variant.isActive && variant.stock > 0) : hasStockValue ? stockNumber > 0 : true),
    stock: Number.isFinite(stockNumber) ? stockNumber : 0,
    hasVariants: item?.hasVariants ?? variants.length > 0,
    variantGroups,
    variants,
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
