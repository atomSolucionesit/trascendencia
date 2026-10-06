"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product, ProductVariant } from "@/lib/types"
import { formatPrice } from "@/lib/format-price"
import {
  Check,
  ShoppingBag,
  ArrowLeft,
  Heart,
  Truck,
  RefreshCw,
  ShieldCheck,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [imageError, setImageError] = useState(false)
  const [selectedImage, setSelectedImage] = useState(product.image || product.images?.[0] || "/placeholder.svg")
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const { addToCart } = useCart()
  const { toast } = useToast()

  const variantGroups = product.hasVariants ? product.variantGroups ?? [] : []
  const variants = product.hasVariants ? product.variants ?? [] : []
  const hasVariantOptions = variantGroups.length > 0 && variants.length > 0

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!hasVariantOptions) return null
    const selectedOptionIds = Object.values(selectedOptions)
    if (selectedOptionIds.length !== variantGroups.length) return null

    return (
      variants.find(
        (variant) =>
          variant.isActive &&
          selectedOptionIds.every((optionId) => variant.optionIds.includes(optionId)) &&
          variant.optionIds.length === selectedOptionIds.length,
      ) ?? null
    )
  }, [hasVariantOptions, selectedOptions, variantGroups.length, variants])

  const selectedVariantOptions = selectedVariant?.selections ?? []
  const selectedOptionImages = useMemo(() => {
    return variantGroups.flatMap((group) => {
      const selectedOptionId = selectedOptions[group.id]
      const option = group.options.find((candidate) => candidate.id === selectedOptionId)
      if (!option) return []

      return Array.from(
        new Set(
          [...(option.imageUrls ?? []), option.imageUrl]
            .filter((image): image is string => typeof image === "string" && image.length > 0),
        ),
      )
    })
  }, [selectedOptions, variantGroups])

  const variantExtraPrice = selectedVariantOptions.reduce((sum, selection) => {
    const option = variantGroups
      .find((group) => group.id === selection.groupId)
      ?.options.find((groupOption) => groupOption.id === selection.optionId)
    return sum + (option?.price ?? 0)
  }, 0)
  const selectedPrice = product.price + variantExtraPrice
  const hasCompleteVariantSelection = !hasVariantOptions || Object.keys(selectedOptions).length === variantGroups.length
  const selectedVariantHasStock = !hasVariantOptions || (!!selectedVariant && selectedVariant.stock > 0)

  const handleOptionSelect = (groupId: string, optionId: string, optionImages: string[]) => {
    setSelectedOptions((current) => ({
      ...current,
      [groupId]: optionId,
    }))

    const firstOptionImage = optionImages.find((image) => image.length > 0)
    if (firstOptionImage) {
      setSelectedImage(firstOptionImage)
      setImageError(false)
    }
  }

  const handleAddToCart = () => {
    if (hasVariantOptions && !hasCompleteVariantSelection) {
      toast({
        title: "Selecciona las variantes",
        description: "Completa todas las opciones antes de agregar el producto al carrito",
      })
      return
    }

    if (hasVariantOptions && !selectedVariant) {
      toast({
        title: "Combinacion no disponible",
        description: "La combinacion seleccionada no esta disponible",
      })
      return
    }

    if (hasVariantOptions && selectedVariant && selectedVariant.stock <= 0) {
      toast({
        title: "Sin stock",
        description: "La variante seleccionada no tiene stock disponible",
      })
      return
    }

    if (!addToCart({ ...product, price: selectedPrice }, selectedSize, selectedColor, selectedVariant)) {
      toast({ title: "Stock máximo alcanzado", description: "Ya agregaste todas las unidades disponibles" })
      return
    }
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
      azul: "#2563EB",
      blue: "#2563EB",
      rojo: "#DC2626",
      red: "#DC2626",
      verde: "#16A34A",
      green: "#16A34A",
      amarillo: "#FACC15",
      yellow: "#FACC15",
      naranja: "#F97316",
      orange: "#F97316",
      violeta: "#7C3AED",
      morado: "#7C3AED",
      purple: "#7C3AED",
      marron: "#78350F",
      brown: "#78350F",
      gris: "#6B7280",
      gray: "#6B7280",
      grey: "#6B7280",
      beige: "#D6C6A8",
    }
    const normalizedColor = color.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return colorMap[normalizedColor] || color
  }

  const getContrastColor = (color: string): "#000000" | "#FFFFFF" => {
    const hex = color.replace("#", "")
    if (!/^[0-9a-f]{6}$/i.test(hex)) return "#000000"

    const red = Number.parseInt(hex.slice(0, 2), 16)
    const green = Number.parseInt(hex.slice(2, 4), 16)
    const blue = Number.parseInt(hex.slice(4, 6), 16)
    return red * 0.299 + green * 0.587 + blue * 0.114 > 160 ? "#000000" : "#FFFFFF"
  }

  const availableSizes = product.sizes && product.sizes.length ? product.sizes : []
  const availableColors = product.colors && product.colors.length ? product.colors : []

  const safeCategory =
    typeof product.category === "string" && product.category ? product.category : "sin categoria"
  const safeName = product.name || "Producto sin nombre"
  const priceValue = typeof selectedPrice === "number" && Number.isFinite(selectedPrice) ? selectedPrice : 0
  const galleryImages = useMemo(
    () =>
      Array.from(
        new Set(
          [...selectedOptionImages, product.image, ...(product.images ?? [])]
            .filter((image): image is string => !!image),
        ),
      ),
    [product.image, product.images, selectedOptionImages],
  )
  const imageSrc = imageError ? "/placeholder.svg" : selectedImage || galleryImages[0] || "/placeholder.svg"

  const showRelativeImage = useCallback((offset: number) => {
    if (galleryImages.length < 2) return

    const currentIndex = galleryImages.indexOf(selectedImage)
    const safeIndex = currentIndex >= 0 ? currentIndex : 0
    const nextIndex = (safeIndex + offset + galleryImages.length) % galleryImages.length
    setSelectedImage(galleryImages[nextIndex])
    setImageError(false)
  }, [galleryImages, selectedImage])

  useEffect(() => {
    if (!isLightboxOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false)
      if (event.key === "ArrowLeft") showRelativeImage(-1)
      if (event.key === "ArrowRight") showRelativeImage(1)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isLightboxOpen, showRelativeImage])

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
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="block h-full w-full cursor-zoom-in"
                aria-label={`Ampliar imagen de ${safeName}`}
              >
                <img
                  src={imageSrc}
                  alt={safeName}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                  loading="eager"
                />
              </button>
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => showRelativeImage(-1)}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-2.5 shadow-md backdrop-blur-sm transition hover:bg-background"
                    aria-label="Ver imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showRelativeImage(1)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-2.5 shadow-md backdrop-blur-sm transition hover:bg-background"
                    aria-label="Ver imagen siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {product.inStock && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="Agregar a favoritos"
                  >
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5">
                {galleryImages.map((image, index) => {
                  const isSelected = image === selectedImage
                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedImage(image)
                        setImageError(false)
                      }}
                      className={`relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all ${
                        isSelected
                          ? "border-foreground ring-2 ring-foreground/20"
                          : "border-border hover:border-foreground/50"
                      }`}
                      aria-label={`Ver imagen ${index + 1} de ${safeName}`}
                    >
                      <img src={image} alt={`${safeName} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            )}
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
                  {priceValue ? formatPrice(priceValue) : "Precio no disponible"}
                </p>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>
                      {hasVariantOptions && selectedVariant
                        ? `Disponible (${selectedVariant.stock})`
                        : "Disponible"}
                    </span>
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

            {hasVariantOptions && (
              <div className="space-y-5 pt-6 border-t border-border">
                {variantGroups.map((group) => {
                  const isColorGroup =
                    group.kind?.toLowerCase() === "color" || group.name.toLowerCase().includes("color")

                  return <div key={group.id} className="space-y-2">
                    <h3 className="text-xs sm:text-sm tracking-widest uppercase text-foreground">{group.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedOptions[group.id] === option.id
                        const optionColor = isColorGroup ? option.colorHex || getColorValue(option.name) : undefined
                        const optionImages = Array.from(
                          new Set(
                            [...(option.imageUrls ?? []), option.imageUrl]
                              .filter((image): image is string => typeof image === "string" && image.length > 0),
                          ),
                        )
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleOptionSelect(group.id, option.id, optionImages)}
                            className={`min-h-9 px-3 py-2 text-xs font-medium border-2 transition-all ${
                              isColorGroup
                                ? isSelected
                                  ? "border-foreground ring-2 ring-foreground/20 ring-offset-2"
                                  : "border-border hover:border-foreground/60"
                                : isSelected
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-foreground border-border hover:border-foreground/50"
                            }`}
                            style={
                              optionColor
                                ? { backgroundColor: optionColor, color: getContrastColor(optionColor) }
                                : undefined
                            }
                          >
                            <span>{option.name}</span>
                            {option.price ? (
                              <span className="ml-2 opacity-70">+{formatPrice(option.price)}</span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                })}
                {hasCompleteVariantSelection && selectedVariant && (
                  <p className="text-sm text-muted-foreground">
                    Variante: <span className="text-foreground">{selectedVariant.name}</span>
                    <span className={selectedVariant.stock > 0 ? "ml-2 text-green-600" : "ml-2 text-destructive"}>
                      Stock: {selectedVariant.stock}
                    </span>
                  </p>
                )}
                {hasCompleteVariantSelection && !selectedVariant && (
                  <p className="text-sm text-destructive">La combinacion seleccionada no esta disponible.</p>
                )}
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
                    {hasVariantOptions && selectedVariant
                      ? selectedVariant.stock > 0
                        ? `En Stock (${selectedVariant.stock})`
                        : "Agotado"
                      : product.inStock
                        ? "En Stock"
                        : "Agotado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Precio:</span>
                  <span>{priceValue ? formatPrice(priceValue) : "No disponible"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 pt-6 border-t border-border">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 md:px-12 text-xs sm:text-sm tracking-wide"
                onClick={handleAddToCart}
                disabled={!product.inStock || !hasCompleteVariantSelection || !selectedVariantHasStock}
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {!product.inStock || (hasVariantOptions && hasCompleteVariantSelection && !selectedVariantHasStock)
                  ? "No Disponible"
                  : hasVariantOptions && !hasCompleteVariantSelection
                    ? "Selecciona opciones"
                    : "Agregar al Carrito"}
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

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería ampliada de ${safeName}`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25"
            aria-label="Cerrar imagen ampliada"
          >
            <X className="h-6 w-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showRelativeImage(-1)
                }}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 sm:left-6"
                aria-label="Ver imagen anterior"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showRelativeImage(1)
                }}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 sm:right-6"
                aria-label="Ver imagen siguiente"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div className="flex h-full w-full items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <img
              src={imageSrc}
              alt={safeName}
              className="max-h-full max-w-full object-contain"
              onError={() => setImageError(true)}
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
              {Math.max(galleryImages.indexOf(selectedImage), 0) + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
