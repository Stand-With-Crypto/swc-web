import { runBin } from '@/bin/runBin'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { logger } from '@/utils/shared/logger'

async function smokeTestGetCryptoToFiatConversion() {
  await getCryptoToFiatConversion('ETH')
    .then(res => logger.info(JSON.stringify(res, null, 4)))
    .catch(e => {
      console.error(e)
      return null
    })
}

void runBin(smokeTestGetCryptoToFiatConversion)
