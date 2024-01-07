import { SumDonations } from '@/data/aggregations/getSumDonations'

export const getMockSumDonations = async () => {
  const result: SumDonations = { amountUsd: new Date().getTime() / 100 }
  return result
}
