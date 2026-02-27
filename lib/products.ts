import type { Product } from "./types"

// Catalogo vacio mientras se integra Nexus.
export const products: Product[] = []

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category)
}
