import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import { Progress } from '@/components/ui/progress'
import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { cn } from '@/utils/web/cn'

const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}

interface PresidentialRaceResultProps {
  candidates: (DTSIAvatarProps['person'] & Pick<DTSI_Person, 'politicalAffiliationCategory'>)[]
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates } = props

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex justify-between">
        <div>
          <DTSIAvatar className="rounded-full" person={candidates[0]} size={100} />
          <p className="font-bold">999</p>
        </div>
        <div>
          <DTSIAvatar className="rounded-full" person={candidates[1]} size={100} />
          <p className="text-right font-bold">999</p>
        </div>
      </div>

      <div className="flex">
        <Progress
          className="h-6 rounded-l-full rounded-r-none bg-gray-800"
          indicatorClassName={cn(
            'bg-none rounded-r-none',
            PARTY_COLOR_MAP[
              candidates[0].politicalAffiliationCategory ||
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
              candidates[1].politicalAffiliationCategory ||
                DTSI_PersonPoliticalAffiliationCategory.OTHER
            ],
          )}
          inverted
          value={50}
        />
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex gap-2">
          <p className="text-center font-bold">50%</p>{' '}
          <span className="text-fontcolor-muted">99,999,999</span>
        </div>

        <p>270 to win</p>

        <div className="flex gap-2">
          <p className="text-center font-bold">50%</p>{' '}
          <span className="text-fontcolor-muted">99,999,999</span>
        </div>
      </div>
    </div>
  )
}
