"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product & { isNew?: boolean }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { toast } = useToast()

  const favorite = isFavorite(product.id)
  const priceValue = typeof product.price === "number" && Number.isFinite(product.price) ? product.price : 0
  const categoryLabel =
    typeof product.category === "string" && product.category
      ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
      : "Sin categoria"
  const imageSrc = product.image || "/placeholder.svg"

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    toast({
      title: "Agregado al carrito",
      description: `${product.name} ha sido agregado a tu carrito`,
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favorite) {
      removeFromFavorites(product.id)
      toast({
        title: "Eliminado de favoritos",
        description: `${product.name} ha sido eliminado de tus favoritos`,
      })
    } else {
      addToFavorites(product)
      toast({
        title: "Agregado a favoritos",
        description: `${product.name} ha sido agregado a tus favoritos`,
      })
    }
  }

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <Link href={`/productos/${product.id}`} className="block">
        <div className="relative aspect-[3/4.5] bg-muted mb-2 sm:mb-3 overflow-hidden rounded-2xl">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-medium tracking-widest text-primary-foreground uppercase shadow-lg z-10">
              Nuevo
            </span>
          )}

          {isHovered && (
            <>
              <button
                onClick={handleToggleFavorite}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-300 shadow-lg"
                aria-label={favorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    favorite ? "fill-red-500 text-red-500" : "text-foreground"
                  }`}
                />
              </button>
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity duration-300 z-10 pointer-events-none">
                <div className="pointer-events-auto flex gap-2">
                  <Button size="sm" className="text-xs tracking-wide" onClick={handleAddToCart}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    AGREGAR AL CARRITO
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground uppercase">{categoryLabel}</p>
          <h3 className="font-serif text-sm sm:text-base lg:text-lg leading-tight">{product.name}</h3>
          <p className="text-xs sm:text-sm">{priceValue ? `$${priceValue.toFixed(2)}` : "Precio no disponible"}</p>
          <p className="text-[10px] sm:text-xs text-green-600 font-medium">Hasta 6 cuotas sin interes</p>
        </div>
      </Link>
      <div className="mt-3 md:hidden">
        <Button size="sm" className="w-full text-xs tracking-wide" onClick={handleAddToCart}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          AGREGAR AL CARRITO
        </Button>
      </div>
    </div>
  )
}
