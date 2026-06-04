"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Home, RefreshCw, ShoppingBag } from "lucide-react"

type ErrorStateProps = {
  code?: string
  title: string
  description: string
  showRetry?: boolean
  onRetry?: () => void
}

export function ErrorState({ code, title, description, showRetry = false, onRetry }: ErrorStateProps) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[52vh] max-w-3xl flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary/30">
          <AlertCircle className="h-7 w-7 text-muted-foreground" />
        </div>

        {code && <p className="mb-4 text-xs tracking-[0.35em] text-muted-foreground uppercase">{code}</p>}
        <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-7 text-xs font-medium tracking-wide text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-transparent px-7 text-xs font-medium tracking-wide transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            Ver productos
          </Link>
          {showRetry && onRetry && (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-transparent px-7 text-xs font-medium tracking-wide transition-all hover:bg-accent hover:text-accent-foreground"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          )}
        </div>

        <Link
          href="/productos"
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>
      </div>
    </section>
  )
}
