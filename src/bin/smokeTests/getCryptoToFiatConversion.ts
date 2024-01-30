import { runBin } from '@/bin/runBin'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'

async function smokeTestGetCryptoToFiatConversion() {
  await getCryptoToFiatConversion('ETH')
    .then(res => console.log(JSON.stringify(res, null, 4)))
    .catch(e => {
      console.error(e)
      return null
    })
}

runBin(smokeTestGetCryptoToFiatConversion)
