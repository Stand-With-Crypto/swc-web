import type { DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import type { DTSI_AllPeopleQuery, DTSI_Person } from '@/data/dtsi/generated'

export type DTSI_Candidate = DTSIAvatarProps['person'] &
  Pick<
    DTSI_AllPeopleQuery['people'][number],
    | 'id'
    | 'politicalAffiliationCategory'
    | 'computedStanceScore'
    | 'computedSumStanceScoreWeight'
    | 'manuallyOverriddenStanceScore'
    | 'firstName'
    | 'lastName'
    | 'firstNickname'
    | 'politicalAffiliationCategory'
    | 'slug'
    | 'primaryRole'
  > & {
    isRecommended?: boolean
  }
