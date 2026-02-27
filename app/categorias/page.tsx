import Header from "@/components/header-with-data"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { fetchCategories } from "@/components/category-grid"

export default async function CategoriesPage() {
  const categories = await fetchCategories()
  const hasCategories = categories.length > 0

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">Colecciones</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explora nuestras colecciones cuidadosamente curadas de joyeria elegante</p>
          </div>

          {hasCategories ? (
            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category) => (
                <Link key={category.id} href={`/categorias/${category.id}`}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary/30">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/40">
                        <span className="text-sm text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                      <h2 className="font-serif text-3xl md:text-4xl text-white mb-2">{category.name}</h2>
                      {category.description && <p className="text-white/90 text-sm">{category.description}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Aun no hay categorias disponibles.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
