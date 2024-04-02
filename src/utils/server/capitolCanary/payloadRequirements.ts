import { Address, User, UserEmailAddress } from '@prisma/client'

import {
  CapitolCanaryCampaignId,
  SandboxCapitolCanaryCampaignId,
} from '@/utils/server/capitolCanary/campaigns'
import { CapitolCanaryMetadata } from '@/utils/server/capitolCanary/metadata'
import { CapitolCanaryOpts } from '@/utils/server/capitolCanary/opts'

export interface UpsertAdvocateInCapitolCanaryPayloadRequirements {
  campaignId: CapitolCanaryCampaignId | SandboxCapitolCanaryCampaignId
  user: User & { address: Address | null }
  userEmailAddress?: UserEmailAddress | null
  opts?: CapitolCanaryOpts
  metadata?: CapitolCanaryMetadata
}
export interface EmailRepViaCapitolCanaryPayloadRequirements
  extends UpsertAdvocateInCapitolCanaryPayloadRequirements {
  emailSubject: string
  emailMessage: string
}

// We at least need campaign ID and phone number from user.
export interface CheckSMSOptInReplyPayloadRequirements {
  campaignId?: CapitolCanaryCampaignId | SandboxCapitolCanaryCampaignId
  user: User
}
