import { createSalesClient, getSale } from "@/services/sales"

type CheckoutRequest = {
  saleId: string
  total: number
  buyer: Record<string, string>
  existingUrl?: string
}

export function validateCheckoutUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("Mercado Pago no devolvió un enlace de pago")
  const url = new URL(value)
  if (url.protocol !== "https:" || url.username || url.password || url.port ||
    !["www.mercadopago.com.ar", "sandbox.mercadopago.com.ar"].includes(url.hostname)) {
    throw new Error("El enlace de pago de Mercado Pago no es válido")
  }
  return url.toString()
}

export async function reconcileMercadoPagoPayment(saleId: string): Promise<string> {
  const client = await createSalesClient()
  const response = await client.post(`/mercadopago/payment/${encodeURIComponent(saleId)}/sync`, {}, { timeout: 30000 })
  const result = response.data?.info ?? response.data
  if (result?.status !== 200 || typeof result?.data?.status !== "string") {
    throw new Error("No pudimos verificar el estado de Mercado Pago. Si ya pagaste, no vuelvas a pagar.")
  }
  return result.data.status
}

export async function createMercadoPagoCheckout({ saleId, total, buyer, existingUrl }: CheckoutRequest) {
  const companyId = Number(process.env.NEXT_PUBLIC_COMPANY_ID)
  if (!Number.isSafeInteger(companyId) || companyId <= 0) throw new Error("Empresa no configurada")
  if (!Number.isFinite(total) || total <= 0) throw new Error("El total del pedido debe ser mayor a cero")
  const sale = await getSale(saleId)
  if (sale?.payment?.status === "PAID") throw new Error("Este pedido ya está pagado. No vuelvas a pagar; contactanos si necesitás ayuda.")
  if (Number(sale?.total) !== total) throw new Error("El total registrado no coincide con el checkout. Contactanos para revisar tu pedido.")
  // Puede haber un pago aprobado que todavía no llegó por webhook.
  if (await reconcileMercadoPagoPayment(saleId) === "approved") {
    throw new Error("Este pedido ya está pagado. No vuelvas a pagar; contactanos si necesitás ayuda.")
  }
  if (existingUrl) return validateCheckoutUrl(existingUrl)
  const client = await createSalesClient()
  try {
    const response = await client.post("/mercadopago/payment", {
      companyId,
      externalReference: `order-${saleId}`,
      // Nexus genera el importe a partir de product; total por sí solo no modifica la preferencia.
      // Una línea por pedido conserva exactamente envío y descuentos, sin redondeo por unidad.
      product: [{ id: saleId, name: "Pedido Trascendencia", price: total, quantity: 1 }],
      total,
      client: {
        name: `${buyer.firstName} ${buyer.lastName}`,
        email: buyer.email,
        phone: buyer.phone,
        zip_code: buyer.zip,
        street_name: buyer.address,
      },
    })
    const result = response.data?.info ?? response.data
    return validateCheckoutUrl(result?.redirectUrl)
  } catch {
    throw new Error("No se pudo iniciar Mercado Pago. Tu pedido sigue pendiente; intentá nuevamente.")
  }
}
