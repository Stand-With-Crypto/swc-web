import { runBin } from '@/bin/runBin'
import { getGoogleCivicDataFromAddress } from '@/utils/shared/googleCivicInfo'
import { prettyLog } from '@/utils/shared/prettyLog'

async function smokeTestCivicApi() {
  const result = await getGoogleCivicDataFromAddress(
    '1600 Amphitheatre Parkway, Mountain View, CA 94043',
  )
  prettyLog(result)
}

void runBin(smokeTestCivicApi)
