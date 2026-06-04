import { api, ensureEcommerceCompanyId } from "."

export type PaymentDiscount = {
  id: number
  paymentTypeId: number
  paymentTypeName: string
  percentage: number
  description?: string | null
  isActive: boolean
  isEcommerceEnabled: boolean
}

export const getEcommercePaymentDiscounts = async (): Promise<PaymentDiscount[]> => {
  const companyId = await ensureEcommerceCompanyId()
  const response = await api.get(`/payment/discounts/ecommerce/${companyId}`)
  const discounts = response.data?.info ?? response.data?.data ?? []
  return Array.isArray(discounts) ? discounts : []
}

export const paymentDiscountService = {
  getEcommercePaymentDiscounts,
}
