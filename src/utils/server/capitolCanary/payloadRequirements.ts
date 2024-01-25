import { User, Address, UserEmailAddress } from '@prisma/client'
import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { CapitolCanaryOpts } from '@/utils/server/capitolCanary/opts'
import { CapitolCanaryMetadata } from '@/utils/server/capitolCanary/metadata'

export interface CreateAdvocateInCapitolCanaryPayloadRequirements {
  campaignId: CapitolCanaryCampaignId
  user: User & { address: Address | null } & { primaryUserEmailAddress: UserEmailAddress | null }
  opts?: CapitolCanaryOpts
  metadata?: CapitolCanaryMetadata
}

export interface EmailRepViaCapitolCanaryPayloadRequirements
  extends CreateAdvocateInCapitolCanaryPayloadRequirements {
  emailSubject: string
  emailMessage: string
}
