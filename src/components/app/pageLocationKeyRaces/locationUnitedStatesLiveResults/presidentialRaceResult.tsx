import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { Progress } from '@/components/ui/progress'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { cn } from '@/utils/web/cn'

const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates } = props

  const candidateA = candidates?.[0] || {}
  const candidateB = candidates?.[1] || {}

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex justify-between">
        <AvatarBox candidate={candidateA} />
        <AvatarBox candidate={candidateB} className="flex flex-col items-end text-right" />
      </div>

      <div className="flex">
        <Progress
          className="h-6 rounded-l-full rounded-r-none bg-gray-800"
          indicatorClassName={cn(
            'bg-none rounded-r-none',
            PARTY_COLOR_MAP[
              candidateA.politicalAffiliationCategory ||
                DTSI_PersonPoliticalAffiliationCategory.OTHER
            ],
          )}
          value={50}
        />
        <Progress
          className="h-6 rounded-l-none rounded-r-full border-l bg-gray-800"
          indicatorClassName={cn(
            'bg-none rounded-l-none',
            PARTY_COLOR_MAP[
              candidateB.politicalAffiliationCategory ||
                DTSI_PersonPoliticalAffiliationCategory.OTHER
            ],
          )}
          inverted
          value={50}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">50%</p> <span className="text-fontcolor-muted">99,999,999</span>
        </div>

        <p className="text-sm">270 to win</p>

        <div className="flex items-center gap-2">
          <p className="font-bold">50%</p> <span className="text-fontcolor-muted">99,999,999</span>
        </div>
      </div>
    </div>
  )
}

interface AvatarBoxProps {
  candidate: DTSI_Candidate
  className?: string
}

function AvatarBox(props: AvatarBoxProps) {
  const { candidate, className } = props

  return (
    <div className={className}>
      <DTSIAvatar className="rounded-full" person={candidate} size={125} />
      <p className="font-bold">999</p>
    </div>
  )
}
