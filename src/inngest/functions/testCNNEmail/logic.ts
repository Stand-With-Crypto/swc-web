import { CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { EmailViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'

export async function testCNNEmailSend() {
  const user = mockUser()
  const address = mockAddress()
  const emailAddress = mockUserEmailAddress()

  const payload: EmailViaCapitolCanaryPayloadRequirements = {
    campaignId: CapitolCanaryCampaignId.CNN_EMAIL,
    user: {
      ...user,
      address,
    },
    userEmailAddress: emailAddress,
    opts: {
      isEmailOptin: true,
    },
    emailSubject: `Test CNN subject - ${user.firstName} ${user.lastName}`,
    emailMessage: 'Test CNN Message',
  }
  await inngest.send({
    name: CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME,
    data: payload,
  })
}
