export const CHECKOUT_SESSION_KEY = "trascendencia-mp-checkout"

export type CheckoutSession = {
  fingerprint: string
  operationId: string
  saleId?: string
  redirectUrl?: string
  cartSnapshot: string
}

export function readCheckoutSession(): CheckoutSession | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(CHECKOUT_SESSION_KEY) || "null")
    return value && typeof value.fingerprint === "string" && typeof value.operationId === "string" &&
      typeof value.cartSnapshot === "string" ? value : null
  } catch { return null }
}

export function saveCheckoutSession(value: CheckoutSession) {
  sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(value))
}

export async function prepareCheckoutSession(order: unknown, cart: unknown): Promise<CheckoutSession> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(order)))
  const fingerprint = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("")
  const previous = readCheckoutSession()
  if (previous?.fingerprint === fingerprint) return previous
  const session = { fingerprint, operationId: crypto.randomUUID(), cartSnapshot: JSON.stringify(cart) }
  // Persistir antes de crear el pedido permite reintentar incluso si se pierde la respuesta.
  saveCheckoutSession(session)
  return session
}
