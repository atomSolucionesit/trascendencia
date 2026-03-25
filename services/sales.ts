import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COMPANY_TOKEN = process.env.NEXT_PUBLIC_COMPANY_TOKEN

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL")
}

if (!COMPANY_TOKEN) {
  throw new Error("Missing NEXT_PUBLIC_COMPANY_TOKEN")
}

const getEcommerceAccessToken = async () => {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/auth/ecommerce/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyToken: COMPANY_TOKEN,
    }),
  })

  if (!response.ok) {
    throw new Error(`No se pudo autenticar ecommerce: ${response.status}`)
  }

  const data = await response.json()
  const accessToken =
    data?.info?.access_token ||
    data?.info?.user?.access_token ||
    data?.access_token ||
    null

  if (!accessToken) {
    throw new Error("No se recibió access_token de ecommerce")
  }

  return accessToken
}

const createSalesClient = async () => {
  const accessToken = await getEcommerceAccessToken()

  return axios.create({
    baseURL: API_URL.replace(/\/$/, ""),
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function createSale(payload: any) {
  const client = await createSalesClient()
  const response = await client.post("/sales", payload)
  return response.data
}

export async function updateSaleStatus(id: string, payload: any) {
  const client = await createSalesClient()
  const response = await client.patch(`/sales/${id}/status`, payload)
  return response.data
}
