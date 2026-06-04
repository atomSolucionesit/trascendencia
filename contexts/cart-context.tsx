"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, CartItem, CartContextType, ProductVariant } from "@/lib/types"

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("trascendencia-cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
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

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => resolveCartItemKey(item) === cartKey)

      if (existingItem) {
        return currentItems.map((item) =>
          resolveCartItemKey(item) === cartKey
            ? { ...item, quantity: item.quantity + 1 }
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
          selectedVariantName: selectedVariant?.name ?? null,
          selectedVariantOptions: selectedVariant?.selections ?? [],
        },
      ]
    })
  }

  const removeFromCart = (cartKey: string) => {
    setItems((currentItems) => currentItems.filter((item) => resolveCartItemKey(item) !== cartKey && item.id !== cartKey))
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) => (resolveCartItemKey(item) === cartKey || item.id === cartKey ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
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
