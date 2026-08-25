import { Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl mb-4">Trascendencia</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Creando momentos inolvidables a través de piezas únicas que trascienden el tiempo.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm tracking-widest mb-4 uppercase">Tienda</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/productos" className="hover:text-primary-foreground transition-colors">
                  New In
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="hover:text-primary-foreground transition-colors">
                  Colecciones
                </Link>
              </li>
              <li>
                <Link href="/#lo-nuevo" className="hover:text-primary-foreground transition-colors">
                  Lo nuevo
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm tracking-widest mb-4 uppercase">Información</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/#nosotros" className="hover:text-primary-foreground transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="hover:text-primary-foreground transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm tracking-widest mb-4 uppercase">Síguenos</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/tdc.tiendadediseno/" className="hover:text-primary-foreground/60 transition-colors" aria-label="Instagram"  target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>&copy; 2026 Trascendencia. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
