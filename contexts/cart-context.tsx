"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Product, CartItem, CartContextType, ProductVariant } from "@/lib/types"

import { getProductById } from "@/services/nexus/products"
import { normalizeProduct } from "@/lib/normalizers/product"
import { availableCartStock } from "@/lib/cart-stock"

const CartContext = createContext<CartContextType | undefined>(undefined)

const getCartItemKey = (
  productId: string,
  selectedSize?: string | null,
  selectedColor?: string | null,
  selectedVariantId?: string | null,
) => `${productId}:${selectedVariantId || "base"}:${selectedSize || "no-size"}:${selectedColor || "no-color"}`

const resolveCartItemKey = (item: CartItem) =>
  item.cartKey ?? getCartItemKey(item.id, item.selectedSize, item.selectedColor, item.selectedVariantId)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const itemsRef = useRef(items)
  const commitItems = (next: CartItem[]) => { itemsRef.current = next; setItems(next) }

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("trascendencia-cart")
    if (savedCart) {
      try {
        const restored: CartItem[] = []
        for (const raw of JSON.parse(savedCart) as CartItem[]) {
          const item = { ...raw, cartKey: resolveCartItemKey(raw), selectedVariantId: raw.selectedVariantId ?? null }
          const quantity = Math.min(Math.max(0, Math.floor(item.quantity)), availableCartStock(restored, item))
          if (quantity > 0) restored.push({ ...item, quantity })
        }
        commitItems(restored)
      } catch { localStorage.removeItem("trascendencia-cart") }
    }
  }, [])

  // Refresh stock snapshots from Nexus, including carts saved before a stock change.
  useEffect(() => {
    let active = true
    let refreshing = false
    const refreshStock = async () => {
      if (refreshing || document.visibilityState === "hidden") return
      refreshing = true
      try {
        const ids = [...new Set(itemsRef.current.map(item => item.id))]
        const results = await Promise.allSettled(ids.map(async id => ({ id, product: normalizeProduct(await getProductById(id)) })))
        if (!active) return
        const products = new Map(results.flatMap(result => result.status === "fulfilled" ? [[result.value.id, result.value.product] as const] : []))
        const refreshed: CartItem[] = []
        for (const item of itemsRef.current) {
          const product = products.get(item.id)
          const next = product ? { ...item, stock: product.stock, inStock: product.inStock,
            variants: product.variants, selectedVariantStock: item.selectedVariantId
              ? product.variants?.find(variant => variant.id === item.selectedVariantId && variant.isActive)?.stock ?? 0
              : undefined } : item
          const quantity = Math.min(next.quantity, availableCartStock(refreshed, next))
          if (quantity > 0) refreshed.push({ ...next, quantity })
        }
        commitItems(refreshed)
      } finally { refreshing = false }
    }
    void refreshStock()
    window.addEventListener("focus", refreshStock)
    document.addEventListener("visibilitychange", refreshStock)
    return () => {
      active = false
      window.removeEventListener("focus", refreshStock)
      document.removeEventListener("visibilitychange", refreshStock)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("trascendencia-cart", JSON.stringify(items))
  }, [items])

  const addToCart = (
    product: Product,
    selectedSize?: string | null,
    selectedColor?: string | null,
    selectedVariant?: ProductVariant | null,
  ) => {
    const selectedVariantId = selectedVariant?.id ?? null
    const cartKey = getCartItemKey(product.id, selectedSize, selectedColor, selectedVariantId)

    const currentItems = itemsRef.current
    const candidate: CartItem = { ...product, cartKey, selectedVariantId, selectedVariantStock: selectedVariant?.stock, quantity: 1 }
    const existing = currentItems.find(item => resolveCartItemKey(item) === cartKey)
    if ((existing?.quantity ?? 0) >= availableCartStock(currentItems, candidate)) return false
    commitItems((() => {
      const existingItem = currentItems.find((item) => resolveCartItemKey(item) === cartKey)

      if (existingItem) {
        return currentItems.map((item) =>
          resolveCartItemKey(item) === cartKey
            ? { ...item, ...candidate, selectedSize, selectedColor, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...currentItems,
        {
          ...product,
          cartKey,
          quantity: 1,
          selectedSize,
          selectedColor,
          selectedVariantId,
          selectedVariantStock: selectedVariant?.stock,
          selectedVariantName: selectedVariant?.name ?? null,
          selectedVariantOptions: selectedVariant?.selections ?? [],
        },
      ]
    })())
    return true
  }

  const removeFromCart = (cartKey: string) => {
    commitItems(itemsRef.current.filter((item) => resolveCartItemKey(item) !== cartKey && item.id !== cartKey))
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey)
      return
    }

    if (!Number.isSafeInteger(quantity)) return
    commitItems(itemsRef.current.map(item => resolveCartItemKey(item) === cartKey || item.id === cartKey
      ? { ...item, quantity: Math.min(quantity, availableCartStock(itemsRef.current, item)) } : item).filter(item => item.quantity > 0))
  }

  const clearCart = () => {
    commitItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
