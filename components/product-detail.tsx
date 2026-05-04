"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { Check, ShoppingBag, ArrowLeft, Heart, Truck, RefreshCw, ShieldCheck, Package } from "lucide-react"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [imageError, setImageError] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor)
    toast({
      title: "Agregado al carrito",
      description: `${product.name} ha sido agregado a tu carrito`,
    })
  }

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

  const availableSizes = product.sizes && product.sizes.length ? product.sizes : []
  const availableColors = product.colors && product.colors.length ? product.colors : []

  const safeCategory =
    typeof product.category === "string" && product.category ? product.category : "sin categoria"
  const safeName = product.name || "Producto sin nombre"
  const priceValue = typeof product.price === "number" && Number.isFinite(product.price) ? product.price : 0
  const imageSrc = imageError ? "/placeholder.svg" : product.image || "/placeholder.svg"

  return (
    <section className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a productos</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] md:aspect-square bg-muted rounded-2xl overflow-hidden group">
              <img
                src={imageSrc}
                alt={safeName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="eager"
              />
              {product.inStock && (
                <div className="absolute top-4 right-4">
                  <button
                    className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="Agregar a favoritos"
                  >
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground uppercase">
                {safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-balance">
                {safeName}
              </h1>
              <div className="flex items-baseline gap-4">
                <p className="text-2xl sm:text-3xl font-light">
                  {priceValue ? `$${priceValue.toFixed(2)}` : "Precio no disponible"}
                </p>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Disponible</span>
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm text-destructive">Agotado</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="border-t border-b border-border py-6 md:py-8">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty">
                  {product.description}
                </p>
              </div>
            )}

            {(availableSizes.length > 0 || availableColors.length > 0) && (
              <div className="space-y-4 pt-6 border-t border-border">
                {availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm tracking-widest uppercase text-foreground">Talla</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-2.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wide border transition-all ${
                            selectedSize === size
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background text-foreground border-border hover:border-foreground/50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableColors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm tracking-widest uppercase text-foreground">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color, index) => {
                        const colorValue = typeof color === "string" ? getColorValue(color) : ""
                        return (
                          <button
                            key={`${color}-${index}`}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-sm border-2 transition-all ${
                              selectedColor === color
                                ? "border-foreground scale-110"
                                : "border-border hover:border-foreground/50"
                            }`}
                            style={{ backgroundColor: colorValue }}
                            aria-label={`Color ${color}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-xs sm:text-sm tracking-widest uppercase text-foreground mb-4">
                Detalles del Producto
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span className="font-medium">Categoria:</span>
                  <span>{safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Disponibilidad:</span>
                  <span className={product.inStock ? "text-green-600" : "text-destructive"}>
                    {product.inStock ? "En Stock" : "Agotado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Precio:</span>
                  <span>{priceValue ? `$${priceValue.toFixed(2)}` : "No disponible"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 pt-6 border-t border-border">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 md:px-12 text-xs sm:text-sm tracking-wide"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {product.inStock ? "Agregar al Carrito" : "No Disponible"}
              </Button>

              {product.inStock && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>En stock - Envio inmediato</span>
                </div>
              )}
            </div>

            {product.purchaseInfo && (
              <div className="space-y-3 md:space-y-4 pt-6 border-t border-border">
                <h3 className="text-xs sm:text-sm tracking-widest uppercase text-foreground mb-3 font-medium">
                  Información de Compra
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3 group/item transition-colors hover:text-foreground">
                    <div className="p-2 rounded-full bg-secondary/50 group-hover/item:bg-secondary transition-colors">
                      <Truck className="w-4 h-4 text-primary" />
                    </div>
                    <p className="leading-relaxed">
                      {product.purchaseInfo?.shipping || "Envío gratuito en compras superiores a $150"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 group/item transition-colors hover:text-foreground">
                    <div className="p-2 rounded-full bg-secondary/50 group-hover/item:bg-secondary transition-colors">
                      <RefreshCw className="w-4 h-4 text-primary" />
                    </div>
                    <p className="leading-relaxed">
                      {product.purchaseInfo?.returns || "Devoluciones gratuitas dentro de 30 días"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 group/item transition-colors hover:text-foreground">
                    <div className="p-2 rounded-full bg-secondary/50 group-hover/item:bg-secondary transition-colors">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <p className="leading-relaxed">
                      {product.purchaseInfo?.warranty || "Garantía de autenticidad y calidad"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 group/item transition-colors hover:text-foreground">
                    <div className="p-2 rounded-full bg-secondary/50 group-hover/item:bg-secondary transition-colors">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <p className="leading-relaxed">
                      {product.purchaseInfo?.packaging || "Embalaje elegante incluido"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
