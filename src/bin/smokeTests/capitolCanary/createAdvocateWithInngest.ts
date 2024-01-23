import { inngest } from '@/inngest/inngest'
import { faker } from '@faker-js/faker'
import { runBin } from '@/bin/binUtils'
import { capitolCanaryCampaignId } from '@/utils/server/capitolCanary/capitolCanaryCampaigns'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 */

async function smokeTestCreateAdvocateWithInngest() {
  const inngestResponse = await inngest.send({
    name: 'capitol.canary/create.advocate', // TODO: Use Travis' fix for environment variables when implemented.
    data: {
      campaignId: capitolCanaryCampaignId.TESTING,
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
        opts: {
          isEmailOptIn: true,
        },
      },
    },
  })

  console.log(inngestResponse)
}

runBin(smokeTestCreateAdvocateWithInngest)
