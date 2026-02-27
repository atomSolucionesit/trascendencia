import type { Category } from "@/lib/types"

export type RawCategory = Partial<Category> & {
  id?: string | number | null
  name?: string | null
  image?: string | null
  description?: string | null
}

export const extractCategoriesArray = (response: unknown): RawCategory[] => {
  if (Array.isArray(response)) return response as RawCategory[]
  const withData = (response as { data?: unknown })?.data
  if (Array.isArray(withData)) return withData as RawCategory[]
  const withInfoData = (response as { info?: { data?: unknown } }).info?.data
  if (Array.isArray(withInfoData)) return withInfoData as RawCategory[]
  return []
}

export const normalizeCategory = (item: RawCategory): Category | null => {
  const id = item?.id !== undefined && item?.id !== null ? String(item.id) : ""
  const name = item?.name ?? ""
  if (!id || !name) return null

  return {
    id,
    name,
    description: item?.description ?? "",
    image: item?.image ?? undefined,
  }
}
