import { Header } from "@/components/header"
import Hero from "@/components/hero"
import { NewArrivals } from "@/components/new-arrivals"
import { FeaturedProducts } from "@/components/featured-products"
import { OurStory } from "@/components/our-story"
import { CategoryGrid } from "@/components/category-grid"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <NewArrivals />
        <FeaturedProducts />
        <OurStory />
        <CategoryGrid />
        <ContactSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
