import { CREATE_CAPITOL_CANARY_ADVOCATE_FUNCTION_ID } from '@/inngest/functions/createAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { faker } from '@faker-js/faker'
import { runBin } from '@/bin/binUtils'
import { capitolCanaryCampaignId } from '@/utils/server/capitolCanary/capitolCanaryCampaigns'

import 'dotenv/config'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 */

async function smokeTestCreateAdvocateWithInngest() {
  await inngest.send({
    name: `capitol-canary.create-advocate`,
    data: {
      campaignId: capitolCanaryCampaignId.TESTING,
      user: {
        fullName: faker.person.fullName(),
        emailAddress: {
          emailAddress: faker.internet.email({
            provider: 'example.fakerjs.dev',
          }),
        },
        opts: {
          isEmailOptIn: true,
        },
      },
    },
  })
}

runBin(smokeTestCreateAdvocateWithInngest)
