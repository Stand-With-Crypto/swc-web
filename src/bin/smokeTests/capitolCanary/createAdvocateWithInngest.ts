import { inngest } from '@/inngest/inngest'
import { faker } from '@faker-js/faker'
import { runBin } from '@/bin/binUtils'
import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 */

async function smokeTestCreateAdvocateWithInngest() {
  const inngestResponse = await inngest.send({
    name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
    data: {
      campaignId: CapitolCanaryCampaignId.TESTING,
      user: {
        fullName: faker.person.fullName(),
        address: {
          postalCode: faker.location.zipCode(),
        },
        emailAddress: {
          emailAddress: faker.internet.email({
            provider: 'example.fakerjs.dev',
          }),
        },
      },
      opts: {
        isEmailOptIn: true,
      },
      metadata: {
        tags: ['Smoke Test User'],
      },
    },
  })

  console.log(inngestResponse)
}

runBin(smokeTestCreateAdvocateWithInngest)
