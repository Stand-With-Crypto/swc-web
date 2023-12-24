import { AggregateDonations } from '@/data/donations/getAggregateDonations'

export const getMockAggregateDonations = async () => {
  const result: AggregateDonations = { amountUsd: new Date().getTime() / 10000 }
  return result
}
