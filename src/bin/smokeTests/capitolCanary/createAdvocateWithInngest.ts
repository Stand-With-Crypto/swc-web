import { inngest } from '@/inngest/inngest'
import { SandboxCapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'
import { mockUser } from '@/mocks/models/mockUser'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { runBin } from '@/bin/runBin'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts
 *
 * Verify that the advocate is created in Capitol Canary with an administrator.
 */

async function smokeTestCreateAdvocateWithInngest() {
  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  const payload: CreateAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: SandboxCapitolCanaryCampaignId.DEFAULT_MEMBERSHIP,
    user: {
      ...mockedUser,
      address: mockedAddress,
    },
    userEmailAddress: mockedEmailAddress,
    opts: {
      isEmailOptin: true,
    },
    metadata: {
      tags: ['C4 Member', 'Smoke Test User'],
    },
  }

  await inngest.send({
    name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })
}

runBin(smokeTestCreateAdvocateWithInngest)
