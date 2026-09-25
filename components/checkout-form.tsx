"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, MessageCircle } from "lucide-react"
import Image from "next/image"
import { createMercadoPagoCheckout } from "@/services/payments/mercadopago"
import { prepareCheckoutSession, saveCheckoutSession } from "@/services/payments/checkout-session"
import { createSale } from "@/services/sales"
import { getEcommercePaymentDiscounts, type PaymentDiscount } from "@/services/nexus/payment-discounts"
import { formatPrice } from "@/lib/format-price"

const getColorValue = (color: string): string => {
  if (color.startsWith("#")) {
    return color
  }
  const colorMap: Record<string, string> = {
    oro: "#D4AF37",
    gold: "#D4AF37",
    plata: "#C0C0C0",
    silver: "#C0C0C0",
    rose: "#E8B4B8",
    rosa: "#E8B4B8",
    blanco: "#FFFFFF",
    white: "#FFFFFF",
    negro: "#000000",
    black: "#000000",
  }
  return colorMap[color.toLowerCase()] || color
}

const MERCADO_PAGO_KEY = "mercadopago"

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

type CheckoutPaymentOption = {
  key: string
  label: string
  type: "online"
  discount?: PaymentDiscount
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [paymentDiscounts, setPaymentDiscounts] = useState<PaymentDiscount[]>([])
  const [selectedPaymentKey, setSelectedPaymentKey] = useState(MERCADO_PAGO_KEY)
  const shippingRef = useRef<HTMLFieldSetElement>(null)
  const processingRef = useRef(false)
  const [shippingComplete, setShippingComplete] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  const shippingInputs = () => Array.from(shippingRef.current?.querySelectorAll("input") ?? [])
  const validateShipping = () => shippingInputs().every((input) => input.value.trim() && input.validity.valid)

  const shippingCost = total >= 150 ? 0 : 15
  const baseTotal = roundMoney(total + shippingCost)
  const paymentOptions = useMemo<CheckoutPaymentOption[]>(() => {
    const activeDiscounts = paymentDiscounts.filter(
      (discount) => discount.isActive && discount.isEcommerceEnabled && discount.percentage !== 0,
    )
    const mercadoPagoDiscount = activeDiscounts.find((discount) => /mercado\s*pago/i.test(discount.paymentTypeName))

    return [
      {
        key: MERCADO_PAGO_KEY,
        label: "Mercado Pago",
        type: "online",
        discount: mercadoPagoDiscount,
      },
    ]
  }, [paymentDiscounts])
  const selectedPayment = paymentOptions.find((option) => option.key === selectedPaymentKey) ?? paymentOptions[0]
  const paymentAdjustmentPercentage = selectedPayment?.discount?.percentage ?? 0
  const paymentAdjustmentAmount = roundMoney((baseTotal * paymentAdjustmentPercentage) / 100)
  const finalTotal = roundMoney(Math.max(baseTotal + paymentAdjustmentAmount, 0))
  const hasPaymentAdjustment = paymentAdjustmentAmount !== 0
  const selectedPaymentTypeId = selectedPayment?.discount?.paymentTypeId ?? null
  const isOnlinePayment = selectedPayment?.type === "online"

  const handleSubmit = async (e: React.FormEvent, viaWhatsapp = false) => {
    e.preventDefault()
    if (processingRef.current || items.length === 0) return
    if (!validateShipping()) {
      setShippingComplete(false)
      const invalidInput = shippingInputs().find((input) => !input.value.trim() || !input.validity.valid)
      invalidInput?.focus()
      invalidInput?.reportValidity()
      return
    }
    if (viaWhatsapp && whatsappUrl) {
      window.location.assign(whatsappUrl)
      return
    }
    let createdSaleId: string | null = null
    const orderTotal = viaWhatsapp ? baseTotal : finalTotal
    const buyer = Object.fromEntries(shippingInputs().map((input) => [input.id, input.value.trim()]))
    const productLines = items.map((item) => {
      const variants = [
        item.selectedVariantName,
        ...(item.selectedVariantOptions?.map((option) => `${option.groupName}: ${option.optionName}`) ?? []),
        item.selectedSize && `Talle: ${item.selectedSize}`,
        item.selectedColor && `Color: ${item.selectedColor}`,
      ].filter(Boolean).join(", ")
      return `• ${item.name}${variants ? ` (${variants})` : ""}\nCantidad: ${item.quantity} · Precio unitario: ${formatPrice(item.price)} · Subtotal: ${formatPrice(item.price * item.quantity)}`
    })

    processingRef.current = true
    setIsProcessing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isOnlinePayment && !viaWhatsapp && finalTotal <= 0) {
        throw new Error("El total debe ser mayor a cero para pagar con Mercado Pago")
      }
      const checkoutSession = isOnlinePayment && !viaWhatsapp
        ? await prepareCheckoutSession({ items, buyer, total: finalTotal, selectedPaymentTypeId }, items)
        : null
      const salePayload = {
        ...(checkoutSession ? { clientOperationId: checkoutSession.operationId } : {}),
        total: orderTotal,
        subTotal: total,
        taxAmount: 0,
        status: "PENDING",
        origin: "TIENDA",
        customerName: `${buyer.firstName} ${buyer.lastName}`,
        preferredPaymentMethod: viaWhatsapp ? "A coordinar por WhatsApp" : selectedPayment.label,
        notes: [
          `Email: ${buyer.email} · Teléfono: ${buyer.phone}`,
          `Envío: ${buyer.address}, ${buyer.city}, ${buyer.state}, CP ${buyer.zip}`,
        ].join("\n"),
        receiptTypeId: 1,
        documentTypeId: 1,
        currencyId: 1,
        paymentCharge: {
          amountPaid: 0,
          turned: 0,
          isCredit: true,
          date: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          outstandingBalance: orderTotal,
          details: !viaWhatsapp && selectedPaymentTypeId
            ? [
                {
                  paymentTypeId: selectedPaymentTypeId,
                  amount: baseTotal,
                },
              ]
            : [],
        },
        details: items.map((item) => ({
          productId: item.id,
          productVariantId: item.selectedVariantId ?? null,
          quantity: item.quantity,
          price: item.price,
          discount: 0,
        })),
      }

      const saleResponse = checkoutSession?.saleId
        ? { id: checkoutSession.saleId }
        : await createSale(salePayload)
      const saleIdentifier =
        (saleResponse as any)?.info?.id ||
        (saleResponse as any)?.id ||
        (saleResponse as any)?.info?.saleId ||
        null
      if (!saleIdentifier) {
        throw new Error("No se pudo obtener el ID de la venta")
      }
      createdSaleId = String(saleIdentifier)
      if (checkoutSession) {
        checkoutSession.saleId = createdSaleId
        saveCheckoutSession(checkoutSession)
      }

      if (viaWhatsapp) {
        const saleCorrelative = saleResponse?.info?.correlative || saleResponse?.correlative || "Sin correlativo"
        const message = [
          "¡Hola Trascendencia! Quiero finalizar mi compra por WhatsApp.",
          `Pedido: ${saleCorrelative}`,
          "",
          "Datos del comprador:",
          `Nombre: ${buyer.firstName} ${buyer.lastName}`,
          `Correo electrónico: ${buyer.email}`,
          `Teléfono: ${buyer.phone}`,
          `Dirección: ${buyer.address}`,
          `Ciudad: ${buyer.city} · Estado/Provincia: ${buyer.state} · Código postal: ${buyer.zip}`,
          "",
          "Productos:",
          ...productLines,
          "",
          `Subtotal: ${formatPrice(total)}`,
          `Envío: ${shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}`,
          `Total: ${formatPrice(orderTotal)}`,
          "Pedido pendiente de confirmación. Forma de pago y descuentos a coordinar.",
        ].join("\n")
        const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "543772449820").replace(/\D/g, "")
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        setWhatsappUrl(url)
        setSuccessMessage("Pedido pendiente registrado. Continuá por WhatsApp para coordinar el pago.")
        window.location.assign(url)
        return
      }

      if (!isOnlinePayment) {
        setSuccessMessage("Pedido registrado")
        clearCart()
        router.push("/confirmacion")
        return
      }

      const redirectUrl = await createMercadoPagoCheckout({
        saleId: createdSaleId,
        total: finalTotal,
        buyer,
        existingUrl: checkoutSession?.redirectUrl,
      })
      if (checkoutSession) saveCheckoutSession({ ...checkoutSession, redirectUrl })
      window.location.assign(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago con Mercado Pago")
    } finally {
      processingRef.current = false
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/carrito")
    }
  }, [items.length, router])

  useEffect(() => {
    let isMounted = true

    getEcommercePaymentDiscounts()
      .then((discounts) => {
        if (isMounted) {
          setPaymentDiscounts(discounts)
        }
      })
      .catch((error) => {
        console.error("Error fetching ecommerce payment discounts:", error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <fieldset ref={shippingRef} disabled={isProcessing || !!whatsappUrl} className="space-y-6" onChange={() => setShippingComplete(validateShipping())}>
            <h2 className="font-serif text-2xl">Información de Envío</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" required />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Código Postal</Label>
                <Input id="zip" required />
              </div>
            </div>
          </fieldset>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl">Información de Pago</h2>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <Label>Forma de pago</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentOptions.map((option) => {
                  const isSelected = option.key === selectedPaymentKey
                  const percentage = option.discount?.percentage ?? 0

                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={isProcessing || !!whatsappUrl}
                      onClick={() => setSelectedPaymentKey(option.key)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:border-foreground/50"
                      }`}
                    >
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className={`mt-1 block text-xs ${isSelected ? "text-background/75" : "text-muted-foreground"}`}>
                        {percentage
                          ? `${percentage > 0 ? "Incremento" : "Descuento"} ${percentage > 0 ? "+" : ""}${percentage}%`
                          : option.type === "online"
                            ? "Pagá de forma segura con Mercado Pago"
                            : "Pago a coordinar"}
                      </span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  disabled={!shippingComplete || isProcessing}
                  onClick={(event) => void handleSubmit(event, true)}
                  aria-describedby="whatsapp-help"
                  className="rounded-lg border border-green-700/40 bg-green-50 p-4 text-left text-green-900 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Finalizar la compra por WhatsApp
                  </span>
                  <span className="mt-1 block text-xs">Coordiná el pago con nosotros</span>
                </button>
              </div>
              <p id="whatsapp-help" className="text-xs text-muted-foreground">
                Completá la información de envío para continuar por WhatsApp. El medio de pago y sus descuentos se coordinan por chat.
              </p>
            </div>
            {isOnlinePayment && (
              <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                Te vamos a redirigir a Mercado Pago para elegir el medio de pago y completar tu compra.
                El pedido se confirmará cuando Mercado Pago acredite el pago.
              </div>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {successMessage && <p role="status" className="text-sm text-green-600">{successMessage}</p>}
            {whatsappUrl && <a href={whatsappUrl} className="block text-sm underline">Abrir WhatsApp para continuar con el pedido</a>}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary/20 rounded-lg p-6 sticky top-24">
            <h2 className="font-serif text-2xl mb-6">Resumen del Pedido</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.cartKey ?? item.id} className="flex gap-3">
                  <div className="relative w-16 h-20 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.selectedVariantName && (
                        <span className="text-[10px] text-muted-foreground">
                          Variante: <span className="font-medium">{item.selectedVariantName}</span>
                        </span>
                      )}
                      {item.selectedVariantOptions?.map((option) => (
                        <span key={`${item.cartKey ?? item.id}-${option.groupId}`} className="text-[10px] text-muted-foreground">
                          {option.groupName || "Opcion"}: <span className="font-medium">{option.optionName}</span>
                        </span>
                      ))}
                      {item.selectedSize && (
                        <span className="text-[10px] text-muted-foreground">
                          Talla: <span className="font-medium">{item.selectedSize}</span>
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          Color:
                          <span
                            className="w-3 h-3 rounded-sm border border-border"
                            style={{ backgroundColor: getColorValue(item.selectedColor) }}
                            aria-label={`Color ${item.selectedColor}`}
                          />
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Forma de pago</span>
                <span>{selectedPayment.label}</span>
              </div>
              {hasPaymentAdjustment && (
                <div className="flex justify-between text-sm">
                  <span className={paymentAdjustmentAmount < 0 ? "text-green-600" : "text-destructive"}>
                    {paymentAdjustmentAmount < 0 ? "Descuento por pago" : "Incremento por pago"}
                  </span>
                  <span className={paymentAdjustmentAmount < 0 ? "text-green-600" : "text-destructive"}>
                    {paymentAdjustmentAmount < 0 ? "-" : "+"}{formatPrice(Math.abs(paymentAdjustmentAmount))}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing || !!whatsappUrl}>
              {isProcessing ? "Procesando..." : isOnlinePayment ? "Pagar con Mercado Pago" : "Confirmar Pedido"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">Tu información está protegida y segura</p>
          </div>
        </div>
      </div>
    </form>
  )
}
