import type { DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import type { Candidate } from '@/data/decisionDesk/types'
import type { DTSI_Person } from '@/data/dtsi/generated'

export type DTSI_Candidate = DTSIAvatarProps['person'] &
  Pick<
    DTSI_Person,
    | 'politicalAffiliationCategory'
    | 'computedStanceScore'
    | 'computedSumStanceScoreWeight'
    | 'manuallyOverriddenStanceScore'
  >

export type DTSI_DDHQ_Candidate = DTSI_Candidate & Candidate
