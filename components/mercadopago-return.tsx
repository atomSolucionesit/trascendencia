"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSale } from "@/services/sales"
import { reconcileMercadoPagoPayment } from "@/services/payments/mercadopago"
import { useCart } from "@/contexts/cart-context"
import { CHECKOUT_SESSION_KEY, readCheckoutSession } from "@/services/payments/checkout-session"

export function MercadoPagoReturn() {
  const { items, clearCart } = useCart()
  const params = useSearchParams()
  const reference = params.get("external_reference")
  const saleId = reference?.startsWith("order-") ? reference.slice(6) : null
  const [state, setState] = useState<"loading" | "paid" | "pending" | "rejected" | "error">("loading")
  const [attempt, setAttempt] = useState(0)
  const generation = useRef(0)

  useEffect(() => {
    if (state !== "paid") return
    const session = readCheckoutSession()
    // No borrar productos agregados después de iniciar el pago.
    if (session?.saleId === saleId && session.cartSnapshot === JSON.stringify(items)) {
      clearCart()
      sessionStorage.removeItem(CHECKOUT_SESSION_KEY)
    }
  }, [state, saleId, items, clearCart])

  useEffect(() => {
    const current = ++generation.current
    let timer: ReturnType<typeof setTimeout> | undefined
    setState("loading")
    if (!saleId) {
      setState("error")
      return
    }
    const check = async (remaining: number) => {
      try {
        const providerStatus = await reconcileMercadoPagoPayment(saleId)
        if (current !== generation.current) return
        const sale = await getSale(saleId)
        if (current !== generation.current) return
        // Los parámetros del retorno no prueban que se haya acreditado el pago.
        const paid = sale?.payment?.status === "PAID" &&
          Number(sale.payment.amountPaid) >= Number(sale.total) && Number(sale.total) > 0
        const rejected = ["rejected", "cancelled"].includes(providerStatus)
        setState(paid ? "paid" : rejected ? "rejected" : "pending")
        if (!paid && !rejected && remaining > 0) timer = setTimeout(() => void check(remaining - 1), 5000)
      } catch {
        if (current === generation.current) setState("error")
      }
    }
    void check(5)
    return () => { generation.current++; clearTimeout(timer) }
  }, [saleId, attempt])

  const content = {
    loading: ["Consultando tu pago", "Estamos verificando el estado de tu pedido."],
    paid: ["¡Pago acreditado!", "Tu pedido ya está registrado y pendiente de envío."],
    pending: ["Tu pago todavía no está acreditado", "La confirmación puede demorar unos minutos. Estamos consultando a Mercado Pago. Si ya pagaste, no vuelvas a pagar."],
    rejected: ["El pago no se completó", "Mercado Pago informó que el pago fue rechazado o cancelado. Conservamos tu carrito para que puedas intentarlo nuevamente."],
    error: ["No pudimos verificar el pago", "Si ya pagaste, no vuelvas a pagar. Consultá nuevamente en unos minutos o contactanos con el número de tu pedido."],
  }[state]

  return (
    <section className="max-w-xl text-center space-y-6" aria-live="polite">
      <h1 className="font-serif text-4xl">{content[0]}</h1>
      <p className="text-muted-foreground">{content[1]}</p>
      {saleId && <p className="text-sm break-all">Pedido: {saleId}</p>}
      <div className="flex flex-wrap gap-4 justify-center">
        {(state === "pending" || state === "error") && saleId && (
          <Button onClick={() => setAttempt((value) => value + 1)}>Consultar nuevamente</Button>
        )}
        {state === "rejected" && <Button variant="outline" asChild><Link href="/checkout">Volver al checkout</Link></Button>}
        <Button variant="outline" asChild><Link href="/productos">Seguir comprando</Link></Button>
      </div>
    </section>
  )
}
