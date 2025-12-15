"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Lock } from "lucide-react"
import Image from "next/image"
import { buildSaleId, createPaywayPayment, createPaywayToken } from "@/services/payments/payway"
import { createSale, updateSaleStatus } from "@/services/sales"

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

export function CheckoutForm() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [docNumber, setDocNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [saleId, setSaleId] = useState<string | null>(null)

  const shippingCost = total >= 150 ? 0 : 15
  const finalTotal = total + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
        throw new Error("Completa los datos de la tarjeta")
      }

      const normalizedMonth = expiryMonth.replace(/\D/g, "").padStart(2, "0").slice(-2)
      const normalizedYear = expiryYear.replace(/\D/g, "").slice(-2).padStart(2, "0")

      if (normalizedMonth.length !== 2 || normalizedYear.length !== 2) {
        throw new Error("Formato de expiración inválido")
      }

      const salePayload = {
        total: finalTotal,
        subTotal: total,
        taxAmount: 0,
        status: "PENDING",
        receiptTypeId: 1,
        documentTypeId: 1,
        currencyId: 1,
        paymentCharge: {
          amountPaid: 0,
          turned: 0,
          isCredit: true,
          date: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          outstandingBalance: 0,
          details: [],
        },
        details: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          discount: 0,
        })),
      }

      const saleResponse = await createSale(salePayload)
      const saleIdentifier =
        (saleResponse as any)?.info?.id ||
        (saleResponse as any)?.id ||
        (saleResponse as any)?.info?.saleId ||
        null
      if (!saleIdentifier) {
        throw new Error("No se pudo obtener el ID de la venta")
      }
      setSaleId(String(saleIdentifier))

      const tokenResponse = await createPaywayToken({
        card_number: cardNumber.replace(/\s+/g, ""),
        card_expiration_month: normalizedMonth,
        card_expiration_year: normalizedYear,
        security_code: cvv,
        card_holder_name: cardName,
        card_holder_identification: {
          type: "dni",
          number: docNumber || "00000000",
        },
      })

      const token = tokenResponse.id
      const saleId = buildSaleId()

      const amountInCents = Math.round(finalTotal * 100)

      const paymentResponse = await createPaywayPayment({
        token,
        amount: amountInCents,
        saleId: String(saleIdentifier),
      })

      if (!paymentResponse.success) {
        throw new Error("Pago rechazado o error al procesar el pago")
      }

      if (paymentResponse.success) {
        await updateSaleStatus(String(saleIdentifier), { status: "COMPLETED" })
        setSuccessMessage("Pago aprobado")
        clearCart()
        router.push("/confirmacion")
      } else {
        await updateSaleStatus(String(saleIdentifier), { status: "FAILED" })
        throw new Error("Pago rechazado o error al procesar el pago")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al procesar el pago"
      setError(message)
      if (saleId) {
        try {
          await updateSaleStatus(saleId, { status: "FAILED" })
        } catch (e) {
          console.error("No se pudo actualizar la venta a FAILED", e)
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/carrito")
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
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
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl">Información de Pago</h2>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
              <Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docNumber">Documento (DNI)</Label>
              <Input
                id="docNumber"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="12345678"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Mes (MM)</Label>
                <Input
                  id="expiryMonth"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  placeholder="12"
                  maxLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Año (YY o YYYY)</Label>
                <Input
                  id="expiryYear"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  placeholder="25"
                  maxLength={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={3}
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary/20 rounded-lg p-6 sticky top-24">
            <h2 className="font-serif text-2xl mb-6">Resumen del Pedido</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-20 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
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
                    <p className="text-sm font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Confirmar Pedido"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">Tu información está protegida y segura</p>
          </div>
        </div>
      </div>
    </form>
  )
}
