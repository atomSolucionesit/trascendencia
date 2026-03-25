import { nanoid } from "nanoid"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const COMPANY_TOKEN = process.env.NEXT_PUBLIC_COMPANY_TOKEN
const PAYWAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY || process.env.PAYWAY_PUBLIC_KEY

export type PaywayPaymentPayload = {
  token: string
  amount: number // en centavos para Payway
  saleId: string
  deviceFingerprintId?: string
  companyId?: number
}

type PaywayTokenRequest = {
  card_number: string
  card_expiration_month: string
  card_expiration_year: string
  security_code: string
  card_holder_name: string
  card_holder_identification: {
    type: string
    number: string
  }
}

export async function createPaywayPayment(payload: PaywayPaymentPayload) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no configurado")
  }

  if (!COMPANY_TOKEN) {
    throw new Error("NEXT_PUBLIC_COMPANY_TOKEN no configurado")
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${COMPANY_TOKEN}`,
  }

  const url = API_URL.endsWith("/") ? `${API_URL}payway/payment` : `${API_URL}/payway/payment`

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Error Payway: ${res.status}`)
  }

  return res.json() as Promise<{ success: boolean; data?: unknown; error?: unknown }>
}

export function buildSaleId(prefix = "SALE") {
  return `${prefix}-${nanoid()}`
}

export async function createPaywayToken(payload: PaywayTokenRequest) {
  if (!PAYWAY_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_PAYWAY_PUBLIC_KEY no configurado")
  }

  const res = await fetch("https://developers.decidir.com/api/v2/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: PAYWAY_PUBLIC_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Error tokenizando tarjeta: ${res.status}`)
  }

  return res.json() as Promise<{ id: string }>
}
