import Link from "next/link"

type CategoryCard = {
  id: string
  name: string
  image?: string
  description?: string
}

// Colecciones vacias hasta que se carguen desde Nexus.
const categories: CategoryCard[] = []

export function CategoryGrid() {
  const hasCategories = categories.length > 0

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4 text-balance">Explora por Categoria</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Colecciones y categorias pendientes de sincronizar con Nexus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {hasCategories ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.id}`}
                className="group relative aspect-[3/4] overflow-hidden bg-card"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/40">
                    <span className="text-sm text-muted-foreground">Sin imagen</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl lg:text-3xl mb-2">{category.name}</h3>
                  {category.description && <p className="text-sm text-white/90">{category.description}</p>}
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground text-sm md:text-base">
              Aun no hay categorias disponibles.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
