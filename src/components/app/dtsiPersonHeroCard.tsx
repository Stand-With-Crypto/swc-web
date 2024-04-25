import { isNil } from 'lodash-es'
import { HelpCircle, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToCryptoSupportLanguage,
  convertDTSIStanceScoreToTextColorClass,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface Props {
  person: DTSI_PersonCardFragment
  stanceCount: number
  locale: SupportedLocale
}

export function DTSIPersonHeroCard(props: Props) {
  const { person, locale, stanceCount } = props
  const politicalAffiliationCategory =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryDisplayName(person.politicalAffiliationCategory)
  const stanceScore = person.manuallyOverriddenStanceScore || person.computedStanceScore
  return (
    <LinkBox className="w-52 border drop-shadow-lg lg:w-60 xl:w-72">
      <div className="relative h-52 w-52 lg:h-60 lg:w-60 xl:h-72 xl:w-72 ">
        <NextImage
          alt={`Profile picture of ${dtsiPersonFullName(person)}`}
          fill
          sizes="(max-width: 1023px) 208px, (max-width: 1279px) 240px, 320px"
          src={person.profilePictureUrl}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-3 xl:p-6">
        <InternalLink
          className={cn('text-base font-bold lg:text-xl', linkBoxLinkClassName)}
          href={getIntlUrls(locale).politicianDetails(person.slug)}
        >
          {dtsiPersonFullName(person)}
        </InternalLink>
        <div className="mt-4 flex items-center justify-between">
          <div className="inline-block rounded-full bg-muted px-5 py-2 text-sm lg:text-base">
            {politicalAffiliationCategory}
          </div>
          <div className="shrink-0">
            <DTSIFormattedLetterGrade person={person} size={56} />
          </div>
        </div>
        <div className="mt-9 text-sm lg:text-base">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div>
                {isNil(stanceScore) || stanceScore === 50 ? (
                  <HelpCircle />
                ) : stanceScore > 50 ? (
                  <ThumbsUp className={convertDTSIStanceScoreToTextColorClass(100)} />
                ) : (
                  <ThumbsDown className={convertDTSIStanceScoreToTextColorClass(0)} />
                )}
              </div>
              <div>{convertDTSIPersonStanceScoreToCryptoSupportLanguage(person)}</div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <MessageSquare className={convertDTSIStanceScoreToTextColorClass(50)} />
              </div>
              <div>
                {stanceCount}
                <span className="max-md:hidden"> crypto</span>{' '}
                {pluralize({ count: stanceCount, singular: 'statement' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LinkBox>
  )
}
