import type { Category } from "@/lib/types"
import { api } from "."

export const getCategories = async (): Promise<any> => {
  try {
    const response = await api.get("/category")
    return response.data
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await api.get(`/category/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error)
    throw error
  }
}

export const categoryService = {
  getCategories,
  getCategoryById,
}
