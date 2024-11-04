import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { DTSI_DDHQ_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/useCandidateSelection'
import { getPoliticalCategoryAbbr } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { InternalLink } from '@/components/ui/link'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'

interface AvatarBoxProps {
  dtsiCandidate: DTSI_Candidate
  ddhqCandidate: DTSI_DDHQ_Candidate | undefined
  locale: SupportedLocale
  className?: string
}

export function AvatarBox(props: AvatarBoxProps) {
  const { dtsiCandidate, ddhqCandidate, locale, className } = props
  const candidate = ddhqCandidate || dtsiCandidate

  if (!candidate) {
    return null
  }

  return (
    <div className={className}>
      <div className="relative w-fit">
        <InternalLink href={getIntlUrls(locale).politicianDetails(candidate.slug)}>
          <DTSIAvatar person={candidate} size={125} />
          <DTSIFormattedLetterGrade
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
            person={candidate}
          />
        </InternalLink>
      </div>
      <div className="mt-6 space-y-2">
        <p className="font-semibold">
          {dtsiPersonFullName(candidate)}
          {!!candidate.politicalAffiliationCategory &&
            ` (${getPoliticalCategoryAbbr(candidate.politicalAffiliationCategory)})`}
        </p>
        <p className="text-xs text-fontcolor-muted">
          {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidate)}
        </p>
      </div>
    </div>
  )
}
