import React, { ReactNode } from 'react'
import { User } from 'lucide-react'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import {
  getDTSIPersonRoleCategoryDisplayName,
  getDTSIPersonRoleCategoryWithStateDisplayName,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToCryptoSupportLanguage,
  convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface Props {
  person: DTSI_PersonCardFragment
  locale: SupportedLocale
  subheader: 'role' | 'role-w-state' | string
  isRecommended?: boolean
  footer?: React.ReactNode
  isClickable?: boolean
}

function getSubHeaderString(props: Props) {
  switch (props.subheader) {
    case 'role':
      return props.person.primaryRole
        ? getDTSIPersonRoleCategoryDisplayName(props.person.primaryRole)
        : ''
    case 'role-w-state':
      return props.person.primaryRole
        ? getDTSIPersonRoleCategoryWithStateDisplayName(props.person.primaryRole)
        : ''
    default:
      return props.subheader
  }
}

export function DTSIPersonHeroCardFooter({
  isRecommended,
  children,
  className,
}: {
  className?: string
  children: React.ReactNode
  isRecommended?: boolean
}) {
  return (
    <div
      className={cn(
        'p-4 text-center font-bold text-fontcolor sm:p-6 md:text-lg',
        isRecommended
          ? 'bg-primary-cta text-primary-cta-foreground antialiased'
          : 'hidden sm:block',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DTSIPersonHeroCard(props: Props) {
  const { person, locale, isRecommended, footer, isClickable = true } = props
  const politicalAffiliationCategoryAbbreviation =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
  const subheaderString = getSubHeaderString(props)
  const politicalAbbrDisplayName = politicalAffiliationCategoryAbbreviation
    ? ` (${politicalAffiliationCategoryAbbreviation})`
    : ''
  const displayName = `${dtsiPersonFullName(person)}${politicalAbbrDisplayName}`

  return (
    <DtsiPersonHeroCardWrapper isClickable={isClickable} locale={locale} person={person}>
      <div className="max-sm:flex">
        <div
          className={cn(
            'relative h-36 w-36 shrink-0 sm:h-52 sm:w-52 xl:h-72 xl:w-72',
            person.profilePictureUrl || 'bg-black',
          )}
        >
          {person.profilePictureUrl ? (
            <NextImage
              alt={`Profile picture of ${dtsiPersonFullName(person)}`}
              fill
              sizes="(max-width: 640px) 144px, (max-width: 1023px) 203px, (max-width: 1279px) 240px, 320px"
              src={person.profilePictureUrl}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center sm:pb-20">
              <User className="h-20 w-20 text-white xl:h-40 xl:w-40" />
            </div>
          )}
          {/* Hidden on mobile */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 px-3 pb-3 pt-16 max-sm:hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
            }}
          >
            <div>
              <div className={cn('block text-sm font-bold text-white lg:text-base')}>
                {displayName}
              </div>
              {subheaderString && (
                <div>
                  <div className="mt-2 inline-block rounded-full bg-muted/20 px-2 py-2 text-sm text-white lg:px-5">
                    {subheaderString}
                  </div>
                </div>
              )}
            </div>
            <div>
              <DTSIFormattedLetterGrade className="h-14 w-14" person={person} />
            </div>
          </div>
        </div>

        {/* Hidden on desktop */}
        <div className="flex flex-col justify-between p-4 text-sm text-fontcolor sm:hidden">
          <div>
            <div className="font-bold">{displayName}</div>
            {subheaderString && <div className="mt-2 text-fontcolor-muted">{subheaderString}</div>}
          </div>
          {footer !== undefined ? (
            footer
          ) : (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted p-2 text-xs">
                <div className="shrink-0">
                  <DTSIFormattedLetterGrade className="h-5 w-5" person={person} />
                </div>
                <div>{convertDTSIPersonStanceScoreToCryptoSupportLanguage(person)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Hidden on mobile for non-recommended */}
      {footer !== undefined ? (
        <div className="hidden sm:block">{footer}</div>
      ) : (
        <DTSIPersonHeroCardFooter isRecommended={isRecommended}>
          {isRecommended ? (
            <>
              Recommended <span className="sm:hidden xl:inline">candidate</span>
            </>
          ) : (
            convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(person)
          )}
        </DTSIPersonHeroCardFooter>
      )}
    </DtsiPersonHeroCardWrapper>
  )
}

function DtsiPersonHeroCardWrapper({
  person,
  locale,
  isClickable,
  children,
}: {
  isClickable: boolean
  children: ReactNode
  person: DTSI_PersonCardFragment
  locale: SupportedLocale
}) {
  const className = cn(
    'block shrink-0 overflow-hidden bg-white text-left shadow-md hover:!no-underline max-sm:rounded-3xl max-sm:border sm:inline-block sm:w-52 xl:w-72',
    !isClickable && 'hover:cursor-default',
  )

  if (!isClickable) {
    return <div className={className}>{children}</div>
  }

  return (
    <InternalLink className={className} href={getIntlUrls(locale).politicianDetails(person.slug)}>
      {children}
    </InternalLink>
  )
}
