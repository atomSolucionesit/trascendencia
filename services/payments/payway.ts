const API_URL = process.env.NEXT_PUBLIC_API_URL
const COMPANY_TOKEN = process.env.NEXT_PUBLIC_COMPANY_TOKEN
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID

export type PaywayPaymentPayload = {
  token: string
  amount: number // el backend convierte este valor a centavos para Payway
  saleId: string
  deviceFingerprintId?: string
  companyId?: number
}

type PaywayPublicConfig = {
  env: string
  publicKey: string
  companyId: string
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

let paywayPublicConfigPromise: Promise<PaywayPublicConfig> | null = null

function getApiUrl(path: string) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no configurado")
  }

  return `${API_URL.replace(/\/$/, "")}${path}`
}

async function getPaywayPublicConfig() {
  if (!COMPANY_ID) {
    throw new Error("NEXT_PUBLIC_COMPANY_ID no configurado")
  }

  if (!paywayPublicConfigPromise) {
    const url = `${getApiUrl("/payway/public-config")}?companyId=${encodeURIComponent(COMPANY_ID)}`

    paywayPublicConfigPromise = fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Error obteniendo configuracion Payway: ${res.status}`)
      }

      const data = await res.json()
      const config = (data?.info ?? data) as Partial<PaywayPublicConfig>

      if (!config.publicKey) {
        throw new Error("Payway publicKey no configurada en backend")
      }

      return config as PaywayPublicConfig
    })
  }

  try {
    return await paywayPublicConfigPromise
  } catch (error) {
    paywayPublicConfigPromise = null
    throw error
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

  const res = await fetch(getApiUrl("/payway/payment"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Error Payway: ${res.status}`)
  }

  return res.json() as Promise<{ success: boolean; data?: unknown; error?: unknown }>
}

export async function createPaywayToken(payload: PaywayTokenRequest) {
  const { publicKey } = await getPaywayPublicConfig()

  const res = await fetch("https://developers.decidir.com/api/v2/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publicKey,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Error tokenizando tarjeta: ${res.status}`)
  }

  return res.json() as Promise<{ id: string }>
}
