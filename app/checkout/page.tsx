import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout-form"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl mb-12">Finalizar Compra</h1>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
