import { Header } from "./header"
import { fetchCategories } from "./category-grid"

export default async function HeaderWithData() {
  const categories = await fetchCategories()
  return <Header categories={categories} />
}
