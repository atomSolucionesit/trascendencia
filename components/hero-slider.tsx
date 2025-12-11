"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/types"

type HeroSliderProps = {
  categories: Category[]
}

const marqueeItems: string[] = []
const SLIDE_INTERVAL = 6000

export function HeroSlider({ categories }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const hasCategories = categories.length > 0
  const slides = useMemo(() => (hasCategories ? categories.slice(0, 5) : []), [hasCategories, categories])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, SLIDE_INTERVAL)
    return () => clearInterval(interval)
  }, [slides.length])

  const scrollToStory = () => {
    const storySection = document.getElementById("nosotros")
    if (storySection) {
      storySection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const hasMarquee = marqueeItems.length > 0

  return (
    <>
      <section className="relative bg-muted min-h-[70vh] md:min-h-[80vh] lg:min-h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-background via-muted to-background" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {hasCategories && (
          <div className="absolute inset-0">
            {slides.map((category, index) => (
              <div
                key={category.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
            ))}
          </div>
        )}

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center h-full py-12">
            <div className="max-w-4xl">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-normal tracking-wide text-white drop-shadow">
                    Elegancia que Trasciende el tiempo
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-xl text-pretty">
                    Descubre piezas únicas diseñadas para acompañarte en cada momento especial de tu vida
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-xs sm:text-sm tracking-wide bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                    onClick={scrollToStory}
                  >
                    Conocer mas
                  </Button>
                  <Button size="lg" className="text-xs sm:text-sm tracking-wide" asChild>
                    <Link href="/productos">Ver catalogo</Link>
                  </Button>
                </div>

                {hasCategories && slides.length > 1 && (
                  <div className="flex items-center gap-2 pt-2">
                    {slides.map((category, index) => (
                      <button
                        key={category.id}
                        aria-label={`Ver ${category.name}`}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${index === current ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setCurrent(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {hasMarquee && (
        <div className="bg-black text-white overflow-hidden border-t border-white/10">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <div key={group} className="marquee-group" aria-hidden={group === 1}>
                {marqueeItems.map((item, index) => (
                  <span
                    key={`${item}-${group}-${index}`}
                    className="flex items-center gap-1.5 text-[8px] sm:text-[9px] md:text-[10px] font-light tracking-[0.5em] uppercase whitespace-nowrap text-white/80"
                  >
                    <span>{item}</span>
                    <span className="text-white/30 text-[6px]">-</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
