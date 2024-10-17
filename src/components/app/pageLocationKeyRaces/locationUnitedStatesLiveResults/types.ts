import type { DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import type { DTSI_Person } from '@/data/dtsi/generated'

export type DTSI_Candidate = DTSIAvatarProps['person'] &
  Pick<
    DTSI_Person,
    | 'id'
    | 'politicalAffiliationCategory'
    | 'computedStanceScore'
    | 'computedSumStanceScoreWeight'
    | 'manuallyOverriddenStanceScore'
    | 'firstName'
    | 'lastName'
    | 'firstNickname'
    | 'politicalAffiliationCategory'
  > & {
    isRecommended?: boolean
  }
