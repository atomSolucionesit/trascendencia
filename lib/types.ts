export interface Product {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  category: string
  description: string
  inStock: boolean
  stock?: number
  hasVariants?: boolean
  variantGroups?: ProductVariantGroup[]
  variants?: ProductVariant[]
  sizes?: string[]
  colors?: string[]
  purchaseInfo?: {
    shipping?: string
    returns?: string
    warranty?: string
    packaging?: string
  }
}

export interface ProductVariantOption {
  id: string
  groupId: string
  name: string
  colorHex?: string | null
  imageUrl?: string | null
  imageUrls?: string[] | null
  price?: number
  position?: number
  isActive?: boolean
}

export interface ProductVariantGroup {
  id: string
  name: string
  kind?: string | null
  position?: number
  options: ProductVariantOption[]
}

export interface ProductVariantSelection {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
}

export interface ProductVariant {
  id: string
  name: string
  sku?: string | null
  stock: number
  isActive: boolean
  optionIds: string[]
  selections: ProductVariantSelection[]
}

export interface CartItem extends Product {
  cartKey?: string
  quantity: number
  selectedSize?: string | null
  selectedColor?: string | null
  selectedVariantId?: string | null
  selectedVariantName?: string | null
  selectedVariantOptions?: ProductVariantSelection[]
}

export interface CartContextType {
  items: CartItem[]
  addToCart: (
    product: Product,
    selectedSize?: string | null,
    selectedColor?: string | null,
    selectedVariant?: ProductVariant | null,
  ) => void
  removeFromCart: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  image?: string
  categories?: Category[]
  products?: Product[]
}

export interface ProductCombination {
  id: string
  title?: string
  description?: string
  products?: Product[]
  relatedProductId?: string
}
