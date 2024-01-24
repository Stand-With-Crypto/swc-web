import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { MaybeNextImg, NextImage } from '@/components/ui/image'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { SupportedLocale } from '@/intl/locales'
import {
  getDTSIPersonRoleCategoryDisplayName,
  getDTSIPersonRoleLocation,
  getFormattedDTSIPersonRoleDateRange,
  getHasDTSIPersonRoleEnded,
  orderDTSIPersonRolesByImportance,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
  getDTSIPersonProfilePictureUrlDimensions,
} from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { dtsiTwitterAccountUrl } from '@/utils/dtsi/dtsiTwitterAccountUtils'
import { pluralize } from '@/utils/shared/pluralize'
import { externalUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import _ from 'lodash'
import { Globe, MoveUpRight } from 'lucide-react'

export function PagePoliticianDetails({
  person,
  locale,
}: {
  person: DTSIPersonDetails
  locale: SupportedLocale
}) {
  const orderedRoles = orderDTSIPersonRolesByImportance(person.roles)
  const primaryRole = orderedRoles.byImportance[0]
  const stances = _.orderBy(person.stances, x => -1 * new Date(x.dateStanceMade).getTime())
  return (
    <div className="container max-w-3xl">
      <section>
        {person.profilePictureUrl ? (
          <div className="mx-auto mb-6 overflow-hidden rounded-full" style={{ maxWidth: 100 }}>
            <MaybeNextImg
              sizes="100px"
              alt={`profile picture of ${dtsiPersonFullName(person)}`}
              {...(getDTSIPersonProfilePictureUrlDimensions(person) || {})}
              src={person.profilePictureUrl}
            />
          </div>
        ) : (
          <div className="mx-auto mb-6 md:mx-0">
            <InitialsAvatar
              size={100}
              firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
              lastInitial={person.lastName.slice(0, 1)}
            />
          </div>
        )}
        <PageTitle className="mb-3" size="md">
          {dtsiPersonFullName(person)}
        </PageTitle>
        <PageSubTitle className="mb-3">
          {primaryRole && (
            <>
              <PageSubTitle>
                {person.politicalAffiliationCategory && (
                  <>
                    {dtsiPersonPoliticalAffiliationCategoryDisplayName(
                      person.politicalAffiliationCategory,
                    )}{' '}
                  </>
                )}
                {getDTSIPersonRoleCategoryDisplayName(primaryRole)}
                {getDTSIPersonRoleLocation(primaryRole) && (
                  <span className="font-normal text-gray-500">
                    {' '}
                    from {getDTSIPersonRoleLocation(primaryRole)}
                  </span>
                )}
              </PageSubTitle>
              {getHasDTSIPersonRoleEnded(primaryRole) && (
                <div className="text-gray-500">
                  {getFormattedDTSIPersonRoleDateRange(primaryRole)}
                </div>
              )}
            </>
          )}
        </PageSubTitle>
        <div className="flex justify-center gap-3">
          {person.donationUrl && (
            <Button asChild>
              <ExternalLink href={person.donationUrl}>Donate</ExternalLink>
            </Button>
          )}
          {Boolean(person.officialUrl) && (
            <Button variant="secondary" className="rounded-full px-3 py-3" asChild>
              <ExternalLink href={person.officialUrl}>
                <Globe className="h-6 w-6" />
                <span className="sr-only">{person.officialUrl}</span>
              </ExternalLink>
            </Button>
          )}

          {person.twitterAccounts.slice(0, 1).map(account => (
            <Button variant="secondary" className="rounded-full px-3 py-3" asChild key={account.id}>
              <ExternalLink href={dtsiTwitterAccountUrl(account)}>
                <NextImage alt="x.com logo" src={'/misc/xDotComLogo.svg'} width={24} height={24} />
                <span className="sr-only">{dtsiTwitterAccountUrl(account)}</span>
              </ExternalLink>
            </Button>
          ))}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="my-8 flex w-full items-center gap-4 rounded-xl bg-gray-100 p-3 text-left md:my-12">
              <div>
                <DTSIFormattedLetterGrade size={60} person={person} />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-bold">
                  {convertDTSIStanceScoreToCryptoSupportLanguageSentence(person)}
                </h3>
                <h4 className="text-fontcolor-muted">
                  {person.firstNickname || person.firstName} has made{' '}
                  <FormattedNumber amount={stances.length} locale={locale} />{' '}
                  {pluralize({ noun: 'stance', count: stances.length })} about crypto.
                </h4>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="text-center">
                <p className="mb-3 text-sm">
                  <ExternalLink href={externalUrls.dtsi()}>DoTheySupportIt</ExternalLink> generates
                  the score from the member’s public statements. You can change the score by
                  contributing more statements.
                </p>
                <Button variant="secondary" asChild>
                  <ExternalLink href={externalUrls.dtsiCreateStance(person.slug)}>
                    Add Position <MoveUpRight className="ml-2" />
                  </ExternalLink>
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
      <section>
        <PageTitle as="h2" size="sm" className="mb-4 text-left">
          Notable statements
        </PageTitle>
        <div className="flex flex-col space-y-4">
          {!stances.length && <div>No recent statements.</div>}
          {stances.map(stance => {
            return (
              <article key={stance.id} className={cn('rounded-xl bg-gray-100 p-4 md:p-6')}>
                <DTSIStanceDetails locale={locale} stance={stance} person={person} />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
