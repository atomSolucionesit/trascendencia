"use client"

import { useEffect, useRef } from "react"

type Brand = {
  name: string
  logo?: string
}

// Sin marcas locales; se poblaran desde Nexus.
const brands: Brand[] = []

export function BrandCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const scrollPositionRef = useRef<number>(0)
  const singleSetWidthRef = useRef<number>(0)

  useEffect(() => {
    if (!brands.length) return

    const scrollContainer = scrollRef.current
    const innerContainer = innerRef.current
    if (!scrollContainer || !innerContainer || typeof window === "undefined") return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (prefersReducedMotion.matches) {
      scrollContainer.scrollLeft = 0
      return
    }

    const calculateSingleSetWidth = () => {
      if (innerContainer.scrollWidth > 0) {
        singleSetWidthRef.current = innerContainer.scrollWidth / 3
      }
    }

    const animate = () => {
      const speed = 0.5
      scrollPositionRef.current += speed

      if (scrollPositionRef.current >= singleSetWidthRef.current) {
        scrollPositionRef.current = scrollPositionRef.current - singleSetWidthRef.current
      }

      scrollContainer.scrollLeft = scrollPositionRef.current
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const initAnimation = () => {
      calculateSingleSetWidth()
      if (singleSetWidthRef.current === 0) {
        setTimeout(initAnimation, 100)
        return
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    setTimeout(initAnimation, 100)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      } else {
        if (!animationFrameRef.current && singleSetWidthRef.current > 0) {
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const duplicatedBrands = brands.length ? [...brands, ...brands, ...brands] : []

  if (duplicatedBrands.length === 0) {
    return null
  }

  return (
    <section className="py-12 lg:py-16 bg-background border-y">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-sm tracking-widest text-muted-foreground uppercase mb-8">
          Trabajamos con las mejores marcas
        </h3>
        <div
          ref={scrollRef}
          className="overflow-hidden focus:outline-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="list"
          aria-label="Marcas asociadas"
        >
          <div ref={innerRef} className="flex gap-12 lg:gap-16" style={{ width: "max-content" }}>
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 flex-shrink-0"
                role="listitem"
              >
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="h-12 w-auto object-contain" loading="lazy" />
                ) : (
                  <span className="text-sm text-muted-foreground">Marca sin logo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
