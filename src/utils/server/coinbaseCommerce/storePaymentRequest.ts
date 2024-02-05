import { CoinbaseCommercePayment } from '@/utils/server/coinbaseCommerce/paymentRequest'
import { prettyLog } from '@/utils/shared/prettyLog'

export function storePaymentRequest(payment: CoinbaseCommercePayment) {
  prettyLog(payment)
  // TODO (Benson): Implement this logic
}
