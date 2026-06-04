import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { ErrorState } from "@/components/error-state"

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ErrorState
          code="404"
          title="No encontramos esta pieza"
          description="El producto o la seccion que estas buscando ya no esta disponible o cambio de ubicacion."
        />
      </main>
      <Footer />
    </div>
  )
}
