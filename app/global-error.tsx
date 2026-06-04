"use client"

import "./globals.css"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <section className="mx-auto max-w-xl text-center">
            <p className="mb-4 text-xs tracking-[0.35em] text-muted-foreground uppercase">Error</p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">No pudimos cargar la tienda</h1>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Ocurrio un problema inesperado. Reintenta en unos segundos.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
