"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ErrorState } from "@/components/error-state"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ErrorState
          code="Error"
          title="No pudimos cargar esta vista"
          description="Ocurrio un problema al cargar la informacion. Podes reintentar o volver al catalogo."
          showRetry
          onRetry={reset}
        />
      </main>
      <Footer />
    </div>
  )
}
