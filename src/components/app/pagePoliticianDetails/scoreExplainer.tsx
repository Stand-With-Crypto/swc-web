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
      <PopoverTrigger className="my-8 flex w-full items-center gap-4 rounded-3xl bg-secondary p-3 text-left md:my-12">
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
      <PopoverContent align="start" className="md:w-full md:max-w-sm">
        <div className="p-6 md:p-0">
          <p className="mb-3 text-sm">
            <ExternalLink href={externalUrls.dtsi()}>DoTheySupportIt</ExternalLink> calculates
            scores based on members' public statements or actions. Press "Add Position" to
            contribute more statements.
          </p>
          <p className="mb-3 text-xs">
            Subject to DoTheySupportIt’s{' '}
            <ExternalLink href={'https://www.dotheysupportit.com/terms-and-conditions'}>
              terms
            </ExternalLink>{' '}
            and{' '}
            <ExternalLink href="https://www.dotheysupportit.com/privacy-policy">
              privacy policy
            </ExternalLink>
            .
          </p>
          <Button asChild className="w-full">
            <ExternalLink href={externalUrls.dtsiCreateStance(person.slug)}>
              Add Position <MoveUpRight className="ml-2" />
            </ExternalLink>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
