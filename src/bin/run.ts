import { runBin } from '@/bin/binUtils'
import { PopularCryptoAddress } from '@/mocks/models/mockUserCryptoAddress'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prettyLog } from '@/utils/shared/prettyLog'

async function run() {
  /*
    This file is committed to the repo to allow engineers to easily run one off node logic leveraging our codebase. Add any code below to test what you need, than delete it before committing
    command for reference: npm run ts src/bin/run.ts
    */
  prettyLog(
    await getENSDataMapFromCryptoAddressesAndFailGracefully([
      PopularCryptoAddress.BRIAN_ARMSTRONG,
      PopularCryptoAddress.CHRIS_DIXON,
      process.env.LOCAL_USER_CRYPTO_ADDRESS as any,
    ]),
  )
}

runBin(run)
