'use client'
import { MoveUpRight } from 'lucide-react'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { ExternalLink } from '@/components/ui/link'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { useLocale } from '@/hooks/useLocale'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { pluralize } from '@/utils/shared/pluralize'
import { externalUrls } from '@/utils/shared/urls'

export function ScoreExplainer({ person }: { person: DTSIPersonDetails }) {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const locale = useLocale()
  return (
    <Popover analytics="Person Score Explainer">
      <PopoverTrigger className="my-8 flex w-full items-center gap-4 rounded-3xl bg-gray-100 p-3 text-left md:my-12">
        <div>
          <DTSIFormattedLetterGrade person={person} size={60} />
        </div>
        <div>
          <h3 className="mb-1 font-bold md:text-xl">
            {convertDTSIStanceScoreToCryptoSupportLanguageSentence(person)}
          </h3>
          <h4 className="text-sm text-fontcolor-muted md:text-base">
            {dtsiPersonFullName(person)} has made{' '}
            <FormattedNumber amount={person.stances.length} locale={locale} />{' '}
            {pluralize({ singular: 'statement', count: person.stances.length })} about crypto.
          </h4>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="p-6 text-center sm:p-0">
          <p className="mb-3 text-sm">
            <ExternalLink href={externalUrls.dtsi()}>DoTheySupportIt</ExternalLink> generates the
            score from the member’s public statements. You can change the score by contributing more
            statements.
          </p>
          <Button asChild variant="secondary">
            <ExternalLink href={externalUrls.dtsiCreateStance(person.slug)}>
              Add Position <MoveUpRight className="ml-2" />
            </ExternalLink>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
