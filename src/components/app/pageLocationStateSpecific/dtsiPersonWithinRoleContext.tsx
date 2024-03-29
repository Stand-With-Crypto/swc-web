import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { FormattedPerson } from '@/components/app/pageLocationStateSpecific/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { pluralize } from '@/utils/shared/pluralize'

export function DTSIPersonCardForLocation({ person }: { person: FormattedPerson }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-row items-center gap-3">
        <DTSIAvatar person={person} size={120} />
        <div>
          <div className="font-bold">{dtsiPersonFullName(person)} </div>
          <div className="text-fontcolor-muted">
            {person.stanceCount || 0} crypto{' '}
            {pluralize({
              singular: 'statement',
              plural: 'statements',
              count: person.stanceCount || 0,
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
