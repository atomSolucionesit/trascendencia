import type { Product } from "@/lib/types"
import { api, ensureEcommerceCompanyId } from "."

interface AxiosError {
  response?: {
    data?: unknown;
    status?: number;
  };
  request?: unknown;
  message?: string;
}

export const getProducts = async (
  page = 1,
  size = 10,
  extraParams: Record<string, string | number | undefined> = {}
): Promise<any> => {
  try {
    const companyId = await ensureEcommerceCompanyId()
    const response = await api.get(`/products/ecommerce/${companyId}`, {
      params: { page, size, ...extraParams },
    })
    return response.data.info ?? response.data
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export const getLatestProducts = async (size = 4): Promise<any> => {
  try {
    const companyId = await ensureEcommerceCompanyId()
    const response = await api.get(`/products/ecommerce/${companyId}`, {
      params: {
        page: 1,
        size,
        orderKey: "createdAt",
        orderBy: "desc",
      },
    })
    return response.data.info ?? response.data
  } catch (error) {
    console.error("Error fetching latest products:", error)
    throw error
  }
}

export const getFeaturedProducts = async (): Promise<any> => {
  try {
    const companyId = await ensureEcommerceCompanyId()
    const response = await api.get(`/products/ecommerce/${companyId}/outstanding`)
    return response.data.info ?? response.data
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export const getProductById = async (id: any): Promise<any> => {
  try {
    const companyId = await ensureEcommerceCompanyId()
    const response = await api.get(`/products/ecommerce/${companyId}/product/${id}`)
    return response.data.info?.data ?? response.data.data ?? response.data
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}

export const getProductCombinations = async (
  id: string,
  options: { limit?: number; strategy?: string; excludeOutOfStock?: boolean } = {}
): Promise<any> => {
  try {
    const { limit = 10, strategy = "all", excludeOutOfStock = true } = options
    const response = await api.get(`/products/${id}/combinations`, {
      params: {
        limit,
        strategy,
        excludeOutOfStock,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching combinations for product ${id}:`, error)
    throw error
  }
}

export const createProduct = async (
  productData: any
): Promise<Product> => {
  try {
    const response = await api.post("/products", productData)
    return response.data
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export const updateProduct = async (
  id: string,
  productData: Partial<any>
): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`)
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

export const uploadProductImage = async (
  file: File
): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    for (const pair of formData.entries()) {
      console.log("[DEBUG] FormData:", pair[0], pair[1])
    }

    const response = await api.post("/products/upload-image", formData)

    if (response.data && typeof response.data === "object") {
      return response.data
    } else {
      throw new Error("Respuesta inesperada del servidor")
    }
  } catch (error: unknown) {
    console.error("Error uploading image:", error)

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError
      const serverError = axiosError.response?.data as
        | { message?: string }
        | undefined
      if (serverError && serverError.message) {
        throw new Error(serverError.message)
      } else if (axiosError.response?.status === 400) {
        throw new Error("Archivo no vÃ¡lido o faltante")
      } else if (axiosError.response?.status === 413) {
        throw new Error("Archivo demasiado grande")
      } else if (
        axiosError.response?.status &&
        axiosError.response.status >= 500
      ) {
        throw new Error("Error interno del servidor")
      } else {
        throw new Error(
          `Error del servidor: ${axiosError.response?.status || "Desconocido"}`
        )
      }
    } else if (error && typeof error === "object" && "request" in error) {
      throw new Error("Error de conexiÃ³n. Verifica tu internet.")
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Error al subir la imagen"
      throw new Error(errorMessage)
    }
  }
}

export const getProductByCategory = async (categoryId: any): Promise<any> => {
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

    return categories.find((category: { id?: string | number }) => String(category.id) === String(categoryId)) ?? null
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error)
    throw error
  }
}

export const productService = {
  getProducts,
  getLatestProducts,
  getFeaturedProducts,
  getProductById,
  getProductCombinations,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductByCategory
}
