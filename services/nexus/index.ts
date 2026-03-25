import axios from "axios"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const companyToken = process.env.NEXT_PUBLIC_COMPANY_TOKEN
const companyId = process.env.NEXT_PUBLIC_COMPANY_ID

if (!apiUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_URL")
}

if (!companyToken) {
  throw new Error("Missing NEXT_PUBLIC_COMPANY_TOKEN")
}

if (!companyId) {
  throw new Error("Missing NEXT_PUBLIC_COMPANY_ID")
}

export const ensureEcommerceCompanyId = async (): Promise<string> => companyId

export const api = axios.create({
  baseURL: apiUrl.replace(/\/$/, ""),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${companyToken}`,
  },
})

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }

  return config
})
