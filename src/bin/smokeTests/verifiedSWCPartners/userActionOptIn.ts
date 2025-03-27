import { faker } from '@faker-js/faker'
import { UserActionOptInType } from '@prisma/client'

import { runBin } from '@/bin/runBin'
import { verifiedSWCPartnersUserActionOptIn } from '@/data/verifiedSWCPartners/userActionOptIn'
import { createBasicAuthHeader } from '@/utils/server/basicAuth'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

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
          'VERIFIED_SWC_PARTNER_SECRET_COINBASE',
        ),
      }),
    },
    body: JSON.stringify({
      address: {
        streetNumber: faker.location.buildingNumber(),
        route: faker.location.street(),
        subpremise: '',
        locality: faker.location.city(),
        administrativeAreaLevel1: faker.location.state(),
        administrativeAreaLevel2: '',
        postalCode: faker.location.zipCode('#####'),
        postalCodeSuffix: faker.location.zipCode('####'),
        countryCode: 'US',
      },
      emailAddress: faker.internet.email(),
      phoneNumber: '',
      optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      isVerifiedEmailAddress: true,
      campaignName: 'foobar',
      hasOptedInToEmails: true,
      countryCode: SupportedCountryCodes.US,
    } satisfies Omit<Parameters<typeof verifiedSWCPartnersUserActionOptIn>[0], 'partner'>),
  }).catch(e => {
    console.error(e)
    return null
  })
}

void runBin(smokeTestUserActionOptIn)
