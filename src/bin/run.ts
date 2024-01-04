import { runBin } from '@/bin/binUtils'
import { getCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { prettyLog } from '@/utils/shared/prettyLog'

async function run() {
  /*
    This file is committed to the repo to allow engineers to easily run one off node logic leveraging our codebase. Add any code below to test what you need, than delete it before committing
    command for reference: npm run ts src/bin/run.ts
    */
  const results = await getCongressionalDistrictFromAddress(
    '70 West 9rd St, New York, New York 10025',
  )
  prettyLog({ results })
}

runBin(run)
