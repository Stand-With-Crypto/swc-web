import { runBin } from '@/bin/runBin'
import { buildGetSumDonationsByUserCache } from '@/data/aggregations/getSumDonationsByUser'

async function vercelPrebuild() {
  await buildGetSumDonationsByUserCache()
}

void runBin(vercelPrebuild)
