import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { FavoritesContent } from "@/components/favorites-content"

export default function FavoritesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">
              Mis Favoritos
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Tus piezas favoritas guardadas para más tarde
            </p>
          </div>

          <FavoritesContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
