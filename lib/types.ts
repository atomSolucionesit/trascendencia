export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  inStock: boolean
  sizes?: string[]
  colors?: string[]
}

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string | null
  selectedColor?: string | null
}

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, selectedSize?: string | null, selectedColor?: string | null) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
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
