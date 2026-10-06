import type { CartItem, Product } from './types'
export function cartStock(item: Product & { selectedVariantId?: string | null; selectedVariantStock?: number }) {
  const stock = item.selectedVariantId ? item.selectedVariantStock ?? item.variants?.find(v => v.id === item.selectedVariantId && v.isActive)?.stock : item.stock
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock!)) : item.inStock ? 1 : 0
}
export function availableCartStock(items: CartItem[], item: CartItem) {
  const used = items.filter(other => other.id === item.id && (other.selectedVariantId ?? null) === (item.selectedVariantId ?? null) && other.cartKey !== item.cartKey)
    .reduce((sum, other) => sum + other.quantity, 0)
  return Math.max(0, cartStock(item) - used)
}
