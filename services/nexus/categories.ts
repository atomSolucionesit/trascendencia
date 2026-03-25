import type { Category } from "@/lib/types"
import { api } from "."

export const getCategories = async (): Promise<any> => {
  try {
    const response = await api.get("/category/all", {
      params: {
        page: 1,
        size: 0,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const response = await api.get("/category/all", {
      params: {
        page: 1,
        size: 0,
      },
    })

    const categories = response.data?.info?.data
    if (!Array.isArray(categories)) {
      return null
    }

    return categories.find((category: { id?: string | number }) => String(category.id) === String(id)) ?? null
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error)
    throw error
  }
}

export const categoryService = {
  getCategories,
  getCategoryById,
}
