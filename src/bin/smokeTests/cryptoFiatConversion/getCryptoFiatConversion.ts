import { runBin } from '@/bin/runBin'
import { getCryptoFiatConversion } from '@/hooks/useGetCryptoFiatConversion'

async function smokeTestGetCryptoFiatConversion() {
  await getCryptoFiatConversion('ETH')
    .then(res => console.log(JSON.stringify(res, null, 4)))
    .catch(e => {
      console.error(e)
      return null
    })
}

runBin(smokeTestGetCryptoFiatConversion)
