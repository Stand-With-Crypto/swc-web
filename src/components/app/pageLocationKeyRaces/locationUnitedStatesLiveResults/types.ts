import type { DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import type { DTSI_Person } from '@/data/dtsi/generated'
import { Candidate, ElectoralCandidate } from '@/utils/server/decisionDesk/types'

export type DTSI_Candidate = DTSIAvatarProps['person'] &
  Pick<
    DTSI_Person,
    | 'politicalAffiliationCategory'
    | 'computedStanceScore'
    | 'computedSumStanceScoreWeight'
    | 'manuallyOverriddenStanceScore'
  >

export type DTSI_DDHQ_Candidate = DTSI_Candidate & Candidate
export type DTSI_DDHQ_PresidentCandidate = DTSI_Candidate & ElectoralCandidate
