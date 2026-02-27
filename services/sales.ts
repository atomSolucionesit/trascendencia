import { api } from "@/services/nexus"

export async function createSale(payload: any) {
  const response = await api.post("/sales", payload)
  return response.data
}

export async function updateSaleStatus(id: string, payload: any) {
  const response = await api.patch(`/sales/${id}/status`, payload)
  return response.data
}
