import { User, Address, UserEmailAddress } from '@prisma/client'
import {
  CapitolCanaryCampaignId,
  SandboxCapitolCanaryCampaignId,
} from '@/utils/server/capitolCanary/campaigns'
import { CapitolCanaryOpts } from '@/utils/server/capitolCanary/opts'
import { CapitolCanaryMetadata } from '@/utils/server/capitolCanary/metadata'

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
