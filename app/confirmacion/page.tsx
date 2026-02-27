import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 px-4 md:px-8 lg:px-16 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4">¡Pedido Confirmado!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Gracias por tu compra. Recibirás un correo electrónico con los detalles de tu pedido y el seguimiento de
            envío.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <Button size="lg">Seguir Comprando</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-transparent">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
