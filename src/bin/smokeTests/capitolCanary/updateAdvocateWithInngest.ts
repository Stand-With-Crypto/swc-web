import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpdateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { mockUser } from '@/mocks/models/mockUser'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { runBin } from '@/bin/runBin'
import { CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/updateAdvocateInCapitolCanary'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/updateAdvocateWithInngest.ts
 *
 * Verify that the advocate is updated in Capitol Canary with an administrator.
 * https://admin.phone2action.com/advocates/68251920 - SANDBOX ACCOUNT
 */

async function smokeTestUpdateAdvocateWithInngest() {
  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  const payload: UpdateAdvocateInCapitolCanaryPayloadRequirements = {
    advocateId: 68251920, // This is the advocate ID for the test user in Capitol Canary.
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
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
    name: CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })
}

runBin(smokeTestUpdateAdvocateWithInngest)
