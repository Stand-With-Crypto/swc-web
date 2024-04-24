import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_EndorsedCandidatesQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { getDTSIPersonRoleCategoryWithStateDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface LocationStateSpecificProps extends DTSI_EndorsedCandidatesQuery {
  locale: SupportedLocale
}

export function PageEndorsedCandidates({ people, locale }: LocationStateSpecificProps) {
  const urls = getIntlUrls(locale)
  return (
    <div className="container">
      <PageTitle as="h1">Stand With Crypto PAC 2024 House and Senate Endorsements</PageTitle>
      <h2 className="mx-auto mt-6 space-y-4 text-center text-fontcolor-muted">
        <p>
          2024 will be a monumental election year and Congress holds the power to shape the future
          of crypto in the U.S.
        </p>

        <p>
          Stand With Crypto is committed to supporting pro-crypto candidates and we are proud to
          endorse the candidates below.
        </p>

        <p>
          You can support the candidates directly, or click the donate button below to support the
          SWC PAC that will disburse funds to all the endorsed candidates below.
        </p>
      </h2>
      <PageTitle as="h3" className="mb-6 mt-10" size="md">
        SWC Endorsed Candidates
      </PageTitle>
      <div className="mx-auto max-w-xl space-y-6">
        {people.map(person => {
          const polCategory =
            person.politicalAffiliationCategory &&
            dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
          return (
            <LinkBox
              className={cn(
                'flex flex-col items-center justify-between gap-4 rounded-3xl bg-secondary p-6 text-left transition hover:drop-shadow-lg sm:flex-row',
              )}
              key={person.id}
            >
              <div className={cn('flex w-full flex-row items-center gap-4')}>
                <div className="relative h-[80px] w-[80px]">
                  <DTSIAvatar person={person} size={80} />
                  <div className="absolute bottom-0 right-[-8px]">
                    <DTSIFormattedLetterGrade person={person} size={25} />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">
                    <InternalLink
                      className={linkBoxLinkClassName}
                      href={urls.politicianDetails(person.slug)}
                    >
                      {dtsiPersonFullName(person)} {polCategory ? `(${polCategory})` : ''}
                    </InternalLink>
                  </div>
                  {person.primaryRole && (
                    <div className="text-fontcolor-muted">
                      {getDTSIPersonRoleCategoryWithStateDisplayName(person.primaryRole)}
                    </div>
                  )}
                </div>
              </div>
              {person.donationUrl && (
                <Button asChild className="max-sm:w-full">
                  <ExternalLink href={person.donationUrl}>Donate</ExternalLink>
                </Button>
              )}
            </LinkBox>
          )
        })}
      </div>
    </div>
  )
}
