export function OurStory() {
  return (
    <section id="nosotros" className="py-12 md:py-16 lg:py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground">Nuestra Historia</h2>
            <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                Trascendencia nace de una historia familiar y de una pasión que se fue construyendo a lo largo de los años.
              </p>
              <p>
                Detrás de la marca hay una mujer que durante más de 30 años hizo de la moda su oficio, y una nueva generación que decidió tomar ese legado, transformarlo y darle una identidad propia.
              </p>
              <p>
                Así nace Trascendencia, un espacio donde conviven experiencia, diseño y una profunda atención por los detalles.
              </p>
              <p>
                Creemos en una forma de vestir que va más allá de las tendencias y busca piezas con identidad, calidad y personalidad. Prendas que nos acompañen hoy y sigan teniendo sentido con el paso del tiempo…
              </p>
            </div>
          </div>
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px]">
            <img
              src="/elegant-jewelry-workshop-with-artisan-hands-crafti.jpg"
              alt="Nuestro taller artesanal"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
