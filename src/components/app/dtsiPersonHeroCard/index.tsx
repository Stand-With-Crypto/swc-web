import React, { ReactNode } from 'react'
import { User } from 'lucide-react'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
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
import { pluralize } from '@/utils/shared/pluralize'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface Props {
  person: DTSI_PersonCardFragment
  countryCode: SupportedCountryCodes
  subheader: 'role' | 'role-w-state' | string
  isRecommended?: boolean
  footer?: React.ReactNode
  isClickable?: boolean
  forceMobile?: boolean
  target?: React.HTMLAttributeAnchorTarget
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

function DTSIPersonHeroCardFooter({
  isRecommended,
  children,
  className,
  forceMobile = false,
}: {
  className?: string
  children: React.ReactNode
  isRecommended?: boolean
  forceMobile?: boolean
}) {
  const recommendedClasses = 'bg-primary-cta text-primary-cta-foreground antialiased'
  const notRecommendedClasses = forceMobile ? 'hidden' : 'hidden sm:block'

  return (
    <div
      className={cn(
        'p-4 text-center font-bold text-fontcolor',
        isRecommended ? recommendedClasses : notRecommendedClasses,
        !forceMobile && 'sm:px-3 sm:py-6 sm:text-sm xl:p-5 xl:text-lg',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DTSIPersonHeroCard(props: Props) {
  const {
    person,
    countryCode,
    isRecommended,
    footer,
    isClickable = true,
    forceMobile = false,
    target,
  } = props
  const politicalAffiliationCategoryAbbreviation =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
  const subheaderString = getSubHeaderString(props)
  const politicalAbbrDisplayName = politicalAffiliationCategoryAbbreviation
    ? ` (${politicalAffiliationCategoryAbbreviation})`
    : ''
  const displayName = `${dtsiPersonFullName(person)}${politicalAbbrDisplayName}`

  return (
    <DtsiPersonHeroCardWrapper
      countryCode={countryCode}
      forceMobile={forceMobile}
      isClickable={isClickable}
      person={person}
      target={target}
    >
      <div className={cn(forceMobile ? 'flex' : 'max-sm:flex')}>
        <div
          className={cn(
            'relative h-36 w-36 shrink-0',
            person.profilePictureUrl || 'bg-black',
            !forceMobile && 'sm:h-52 sm:w-52 xl:h-72 xl:w-72',
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
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                !forceMobile && 'sm:pb-20',
              )}
            >
              <User className="h-20 w-20 text-white xl:h-40 xl:w-40" />
            </div>
          )}
          {/* Hidden on mobile */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 px-3 pb-3 pt-16',
              forceMobile ? 'hidden' : 'max-sm:hidden',
            )}
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
            }}
          >
            <div className="flex flex-grow flex-col justify-end overflow-hidden">
              {' '}
              <div
                className={cn(
                  'block truncate text-sm font-bold text-white',
                  !forceMobile && 'lg:text-base',
                )}
              >
                {displayName}
              </div>
              <div className="text-xs text-white">
                {person.stanceCount}{' '}
                {pluralize({ count: person.stanceCount || 0, singular: 'statement' })}
              </div>
              {subheaderString && (
                <div className="mt-2">
                  <div
                    className={cn(
                      'inline-block truncate rounded-full bg-muted/20 px-2 py-2 text-sm text-white',
                      !forceMobile && 'lg:px-3 xl:px-5',
                    )}
                  >
                    {subheaderString}
                  </div>
                </div>
              )}
            </div>
            <div className="ml-auto h-12 w-10 flex-shrink-0">
              <DTSIFormattedLetterGrade className="h-full w-full" person={person} />
            </div>
          </div>
        </div>

        {/* Hidden on desktop */}
        <div
          className={cn(
            'flex flex-col justify-between p-4 text-sm text-fontcolor',
            !forceMobile && 'sm:hidden',
          )}
        >
          <div>
            <div className="font-bold">{displayName}</div>
            {subheaderString && <div className="mt-2 text-fontcolor-muted">{subheaderString}</div>}
          </div>
          {footer !== undefined ? (
            footer
          ) : (
            <div>
              <div className="mb-2 text-xs">
                {person.stanceCount}{' '}
                {pluralize({ count: person.stanceCount || 0, singular: 'statement' })}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted p-1 text-xs">
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
        <div className={cn('hidden', !forceMobile && 'sm:block')}>{footer}</div>
      ) : (
        <DTSIPersonHeroCardFooter forceMobile={forceMobile} isRecommended={isRecommended}>
          {isRecommended ? (
            <>
              Recommended{' '}
              <span className={cn('sm:hidden', !forceMobile && 'xl:inline')}>candidate</span>
            </>
          ) : (
            convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(person)
          )}
        </DTSIPersonHeroCardFooter>
      )}
    </DtsiPersonHeroCardWrapper>
  )
}

export function DtsiPersonHeroCardWrapper({
  person,
  countryCode,
  isClickable,
  children,
  forceMobile = false,
  target = '_self',
}: {
  isClickable: boolean
  children: ReactNode
  person: DTSI_PersonCardFragment
  countryCode: SupportedCountryCodes
  forceMobile?: boolean
  target?: React.HTMLAttributeAnchorTarget
}) {
  const className = cn(
    'block shrink-0 overflow-hidden bg-white text-left shadow-md hover:!no-underline ',
    !isClickable && 'hover:cursor-default',
    forceMobile
      ? 'rounded-3xl border'
      : 'max-sm:rounded-3xl max-sm:border sm:inline-block sm:w-52 xl:w-72',
  )

  if (!isClickable) {
    return <div className={className}>{children}</div>
  }

  return (
    <InternalLink
      className={className}
      href={getIntlUrls(countryCode).politicianDetails(person.slug)}
      target={target}
    >
      {children}
    </InternalLink>
  )
}
