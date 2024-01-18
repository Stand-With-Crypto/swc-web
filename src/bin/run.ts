import { runBin } from '@/bin/binUtils'
import { fetchEmbeddedWalletMetadataFromThirdweb } from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'

async function run() {
  /*
    This file is committed to the repo to allow engineers to easily run one off node logic leveraging our codebase. Add any code below to test what you need, than delete it before committing
    command for reference: npm run ts src/bin/run.ts
    */
  await fetchEmbeddedWalletMetadataFromThirdweb('0xd6cf2bbC98d4911785634dB5daDff7985C58005')
}

runBin(run)
