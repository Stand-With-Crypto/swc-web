import Balancer from 'react-wrap-balancer'
import { HelpCircle, LucideIcon, ThumbsDown, ThumbsUp } from 'lucide-react'

import type {
  Statement,
  StatementPosition,
} from '@/app/[locale]/locations/us/state/[stateCode]/getData'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { cn, twNoop } from '@/utils/web/cn'

interface StateHeadsUpProps {
  statements: Statement[]
  stateCode: string
}

export function StateHeadsUp({ statements, stateCode }: StateHeadsUpProps) {
  const stateName = getUSStateNameFromStateCode(stateCode)

  return (
    <div className="container space-y-20">
      <div className="space-y-6">
        <PageTitle size="md">See where {stateName} politicians stand on crypto</PageTitle>
        <PageSubTitle>
          We asked {stateName} politicians for their thoughts on crypto. Here's what they said..
        </PageSubTitle>
      </div>

      {statements.map((statement, index) => (
        <section className="flex flex-col items-center gap-6" key={statement.statement}>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary">
            <p className="text-2xl text-primary-foreground">{index + 1}</p>
          </div>

          <h3 className="text-center text-xl font-medium">
            <Balancer>{statement.statement}</Balancer>
          </h3>

          <div className="flex flex-col gap-5 lg:flex-row">
            {statement.positions.map(({ politician, position }) => (
              <div className="flex flex-col items-center gap-2" key={politician.id}>
                <DTSIAvatar person={politician} size={272} />
                <p className="mt-2 text-center font-medium">{dtsiPersonFullName(politician)}</p>
                <StatementPositionChip position={position} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const POSITION_TO_ICON: Record<StatementPosition['position'], LucideIcon> = {
  agrees: ThumbsUp,
  disagrees: ThumbsDown,
  neutral: HelpCircle,
}

const POSITION_TO_BG_COLOR: Record<StatementPosition['position'], string> = {
  agrees: twNoop('bg-green-500'),
  disagrees: twNoop('bg-red-500'),
  neutral: twNoop('bg-red-500'),
}

const POSITION_TO_TEXT: Record<StatementPosition['position'], string> = {
  agrees: 'AGREES',
  disagrees: 'DISAGREES',
  neutral: 'UNSURE',
}

function StatementPositionChip({ position }: Pick<StatementPosition, 'position'>) {
  const Icon = POSITION_TO_ICON[position]
  const color = POSITION_TO_BG_COLOR[position]
  const text = POSITION_TO_TEXT[position]

  return (
    <div
      className={cn(
        'flex w-fit items-center gap-1 rounded-full px-4 py-2 font-medium text-white',
        color,
      )}
    >
      <Icon size={16} />
      <p className="text-sm">{text}</p>
    </div>
  )
}
