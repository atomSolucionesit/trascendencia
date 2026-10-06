"use client"

import { availableCartStock } from "@/lib/cart-stock"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format-price"

// Helper function to convert color string to CSS value
const getColorValue = (color: string): string => {
  if (color.startsWith("#")) {
    return color
  }
  const colorMap: Record<string, string> = {
    oro: "#D4AF37",
    gold: "#D4AF37",
    plata: "#C0C0C0",
    silver: "#C0C0C0",
    rose: "#E8B4B8",
    rosa: "#E8B4B8",
    blanco: "#FFFFFF",
    white: "#FFFFFF",
    negro: "#000000",
    black: "#000000",
  }
  return colorMap[color.toLowerCase()] || color
}

export function CartContent() {
  const { items, removeFromCart, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="font-serif text-2xl mb-4">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-8">Agrega algunos productos para comenzar</p>
        <Link href="/productos">
          <Button size="lg">Explorar Productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        {items.map((item) => {
          const cartKey = item.cartKey ?? item.id
          return (
            <div key={cartKey} className="flex gap-6 pb-6 border-b border-border">
              <div className="relative w-24 h-32 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/productos/${item.id}`}>
                    <h3 className="font-serif text-xl mb-1 hover:text-muted-foreground transition-colors">{item.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground uppercase mb-2">{item.category}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {item.selectedVariantName && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Variante:</span>
                      <span className="px-2 py-0.5 border border-border rounded">{item.selectedVariantName}</span>
                    </span>
                  )}
                  {item.selectedVariantOptions?.map((option) => (
                    <span key={`${cartKey}-${option.groupId}`} className="flex items-center gap-1.5">
                      <span className="font-medium">{option.groupName || "Opcion"}:</span>
                      <span className="px-2 py-0.5 border border-border rounded">{option.optionName}</span>
                    </span>
                  ))}
                  {item.selectedSize && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Talla:</span>
                      <span className="px-2 py-0.5 border border-border rounded">{item.selectedSize}</span>
                    </span>
                  )}
                  {item.selectedColor && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Color:</span>
                      <span
                        className="w-4 h-4 rounded-sm border border-border"
                        style={{ backgroundColor: getColorValue(item.selectedColor) }}
                        aria-label={`Color ${item.selectedColor}`}
                      />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => updateQuantity(cartKey, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    disabled={item.quantity >= availableCartStock(items, item)}
                    onClick={() => updateQuantity(cartKey, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(cartKey)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-secondary/20 rounded-lg p-6 sticky top-24">
          <h2 className="font-serif text-2xl mb-6">Resumen del Pedido</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>{total >= 150 ? "Gratis" : "$15.00"}</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatPrice(total >= 150 ? total : total + 15)}</span>
              </div>
            </div>
          </div>

          {total < 150 && (
            <p className="text-xs text-muted-foreground mb-6">
              Agrega {formatPrice(150 - total)} más para obtener envío gratuito
            </p>
          )}

          <Link href="/checkout">
            <Button size="lg" className="w-full mb-4">
              Proceder al Pago
            </Button>
          </Link>

          <Link href="/productos">
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
