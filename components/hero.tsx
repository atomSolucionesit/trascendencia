import { fetchCategories } from "@/components/category-grid"
import { HeroSlider } from "./hero-slider"

export default async function Hero() {
  const categories = await fetchCategories()
  const categoriesWithImage = categories.filter((c) => c.image)

  return <HeroSlider categories={categoriesWithImage} />
}
