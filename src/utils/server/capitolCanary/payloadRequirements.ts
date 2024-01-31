import { User, Address, UserEmailAddress } from '@prisma/client'
import {
  CapitolCanaryCampaignId,
  SandboxCapitolCanaryCampaignId,
} from '@/utils/server/capitolCanary/campaigns'
import { CapitolCanaryOpts } from '@/utils/server/capitolCanary/opts'
import { CapitolCanaryMetadata } from '@/utils/server/capitolCanary/metadata'

export interface CreateAdvocateInCapitolCanaryPayloadRequirements {
  campaignId: CapitolCanaryCampaignId | SandboxCapitolCanaryCampaignId
  user: User & { address: Address | null }
  userEmailAddress: UserEmailAddress
  opts?: CapitolCanaryOpts
  metadata?: CapitolCanaryMetadata
  shouldUpdateUserWithAdvocateId?: boolean // Set to true to update the user's database record with the returned advocate ID.
}

export interface EmailRepViaCapitolCanaryPayloadRequirements
  extends CreateAdvocateInCapitolCanaryPayloadRequirements {
  emailSubject: string
  emailMessage: string
}

export interface UpdateAdvocateInCapitolCanaryPayloadRequirements
  extends CreateAdvocateInCapitolCanaryPayloadRequirements {
  advocateId: number
}
