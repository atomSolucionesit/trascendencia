const priceFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number): string {
  return `$${priceFormatter.format(value)}`
}
