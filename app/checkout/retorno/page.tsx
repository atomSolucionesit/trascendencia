import { Suspense } from "react"
import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { MercadoPagoReturn } from "@/components/mercadopago-return"

export default function PaymentReturnPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <Suspense fallback={<p role="status">Consultando tu pedido...</p>}>
          <MercadoPagoReturn />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
