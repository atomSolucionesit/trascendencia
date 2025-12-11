"use client"

import { ShoppingBag, Menu, X, Heart, ChevronDown } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Category } from "@/lib/types"

type HeaderProps = {
  categories?: Category[]
}

export function Header({ categories = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const { itemCount } = useCart()
  const { favoritesCount } = useFavorites()
  const hasCategories = categories.length > 0

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex-shrink-0 flex items-center" aria-label="Trascendencia">
            <Image
              src="/logoTDCnegro.png"
              alt="Trascendencia tienda de diseño"
              width={168}
              height={36}
              priority
              className="h-12 w-auto object-contain lg:h-16"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/productos" className="text-sm tracking-wide hover:text-secondary transition-colors">
              NEW IN!
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="text-sm tracking-wide hover:text-secondary transition-colors inline-flex items-center gap-1">
                COLECCIONES
                <ChevronDown className="h-4 w-4" />
              </button>

              {megaOpen && hasCategories && (
                <div
                  className="absolute left-0 top-full w-[720px] max-w-[90vw] bg-background shadow-xl border border-border rounded-xl p-6 grid grid-cols-3 gap-4"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categorias/${category.id}`}
                      className="group flex gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
                    >
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary/40 flex-shrink-0">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a href="#nosotros" className="text-sm tracking-wide hover:text-secondary transition-colors">
              NOSOTROS
            </a>
            <a href="#contacto" className="text-sm tracking-wide hover:text-secondary transition-colors">
              CONTACTO
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/favoritos">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
                <span className="sr-only">Favoritos</span>
              </Link>
            </Button>
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Carrito</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menú</span>
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="/productos" className="text-sm tracking-wide hover:text-secondary transition-colors">
                TIENDA
              </Link>
              <Link href="/categorias" className="text-sm tracking-wide hover:text-secondary transition-colors">
                COLECCIONES
              </Link>
              {hasCategories && (
                <div className="space-y-2 pl-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categorias/${category.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              <a href="#nosotros" className="text-sm tracking-wide hover:text-secondary transition-colors">
                NOSOTROS
              </a>
              <a href="#contacto" className="text-sm tracking-wide hover:text-secondary transition-colors">
                CONTACTO
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
