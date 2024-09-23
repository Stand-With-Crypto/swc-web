import { runBin } from '@/bin/runBin'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'

/**
 * Run this script only after you have the server AND Inngest running locally.
 * Please set environment variables as needed.
 * Command: npm run ts src/bin/smokeTests/capitolCanary/updateAdvocateWithInngest.ts
 *
 * Verify that the advocate is updated in Capitol Canary with an administrator.
 * https://admin.phone2action.com/advocates/68251920 - SANDBOX ACCOUNT
 * Updating the database should fail since the mock user does not actually exist in the database.
 */

async function smokeTestUpdateAdvocateWithInngest() {
  const mockedUser = mockUser()
  const mockedAddress = mockAddress()
  const mockedEmailAddress = mockUserEmailAddress()

  mockedUser.capitolCanaryAdvocateId = 68251920 // This is the advocate ID for the test user in Capitol Canary.
  mockedUser.capitolCanaryInstance = 'STAND_WITH_CRYPTO' // This is the instance for the test user in Capitol Canary.

  await inngest.send({
    name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    data: {
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
    },
  })
}

void runBin(smokeTestUpdateAdvocateWithInngest)
