import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { CartContent } from "@/components/cart-content"

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 px-4 md:px-8 lg:px-16 min-h-[60vh]">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl mb-12">Carrito de Compras</h1>
          <CartContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
