import { runBin } from '@/bin/binUtils'
import { verifiedSWCPartnersUserActionOptIn } from '@/data/verifiedSWCPartners/userActionOptIn'
import { createBasicAuthHeader } from '@/utils/server/basicAuth'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { faker } from '@faker-js/faker'
import { UserActionOptInType } from '@prisma/client'

/*
Run this script only after you have the app running on localhost:3000
*/

async function smokeTestUserActionOptIn() {
  await fetchReq(`http://localhost:3000/api/verified-swc-partner/user-action-opt-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: createBasicAuthHeader({
        username: VerifiedSWCPartner.COINBASE,
        password: requiredEnv(
          process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE,
          'process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE',
        ),
      }),
    },
    body: JSON.stringify({
      emailAddress: faker.internet.email(),
      optInType: UserActionOptInType.SWC_SIGN_UP_AS_MEMBER,
      isVerifiedEmailAddress: true,
      campaignName: 'foobar',
    } satisfies Omit<Parameters<typeof verifiedSWCPartnersUserActionOptIn>[0], 'partner'>),
  }).catch(e => {
    console.error(e)
    return null
  })
}

runBin(smokeTestUserActionOptIn)
