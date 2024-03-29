import { orderBy } from 'lodash-es'
import { Globe } from 'lucide-react'

import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { ScoreExplainer } from '@/components/app/pagePoliticianDetails/scoreExplainer'
import { Button } from '@/components/ui/button'
import { MaybeNextImg, NextImage } from '@/components/ui/image'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { SupportedLocale } from '@/intl/locales'
import {
  getDTSIPersonRoleCategoryDisplayName,
  getDTSIPersonRoleLocation,
  getFormattedDTSIPersonRoleDateRange,
  getHasDTSIPersonRoleEnded,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
  getDTSIPersonProfilePictureUrlDimensions,
} from '@/utils/dtsi/dtsiPersonUtils'
import { dtsiTwitterAccountUrl } from '@/utils/dtsi/dtsiTwitterAccountUtils'
import { cn } from '@/utils/web/cn'
import { Questionnaire } from '@/utils/server/contentful/questionnaire'
import { Entry } from 'contentful'

const POLITICIAN_IMAGE_SIZE_PX = 230

export function PagePoliticianDetails({
  person,
  locale,
  questionnaire,
}: {
  person: DTSIPersonDetails
  locale: SupportedLocale
  questionnaire: Entry<Questionnaire, undefined>
}) {
  const stances = orderBy(person.stances, x => -1 * new Date(x.dateStanceMade).getTime())
  return (
    <div className="container max-w-3xl">
      <section>
        {person.profilePictureUrl ? (
          <div
            className="mx-auto mb-6 overflow-hidden rounded-xl"
            style={{ maxWidth: POLITICIAN_IMAGE_SIZE_PX }}
          >
            <MaybeNextImg
              alt={`profile picture of ${dtsiPersonFullName(person)}`}
              sizes={`${POLITICIAN_IMAGE_SIZE_PX}px`}
              {...(getDTSIPersonProfilePictureUrlDimensions(person) || {})}
              className="w-full"
              src={person.profilePictureUrl}
            />
          </div>
        ) : (
          <div className="mx-auto mb-6 max-w-[100px]">
            <InitialsAvatar
              firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
              lastInitial={person.lastName.slice(0, 1)}
              size={100}
            />
          </div>
        )}
        <PageTitle className="mb-3" size="md">
          {dtsiPersonFullName(person)}
        </PageTitle>
        <PageSubTitle className="mb-3">
          {person.primaryRole && (
            <>
              <PageSubTitle>
                {person.politicalAffiliationCategory && (
                  <>
                    {dtsiPersonPoliticalAffiliationCategoryDisplayName(
                      person.politicalAffiliationCategory,
                    )}{' '}
                  </>
                )}
                {getDTSIPersonRoleCategoryDisplayName(person.primaryRole)}
                {getDTSIPersonRoleLocation(person.primaryRole) && (
                  <span className="font-normal text-gray-500">
                    {' '}
                    from {getDTSIPersonRoleLocation(person.primaryRole)}
                  </span>
                )}
              </PageSubTitle>
              {getHasDTSIPersonRoleEnded(person.primaryRole) && (
                <div className="text-gray-500">
                  {getFormattedDTSIPersonRoleDateRange(person.primaryRole)}
                </div>
              )}
            </>
          )}
        </PageSubTitle>
        <div className="flex items-center justify-center gap-3">
          {person.donationUrl && (
            <Button asChild>
              <ExternalLink href={person.donationUrl}>Donate</ExternalLink>
            </Button>
          )}
          {Boolean(person.officialUrl) && (
            <Button asChild className="h-11 w-11 rounded-full p-3" variant="secondary">
              <ExternalLink href={person.officialUrl}>
                <Globe className="h-6 w-6" />
                <span className="sr-only">{person.officialUrl}</span>
              </ExternalLink>
            </Button>
          )}

          {person.twitterAccounts.slice(0, 1).map(account => (
            <Button
              asChild
              // we want the X to look the same size as the globe, so we're adding a bit more padding to make it appear the same
              className="h-11 w-11 rounded-full p-[14px]"
              key={account.id}
              variant="secondary"
            >
              <ExternalLink href={dtsiTwitterAccountUrl(account)}>
                <NextImage alt="x.com logo" height={20} src={'/misc/xDotComLogo.svg'} width={20} />
                <span className="sr-only">{dtsiTwitterAccountUrl(account)}</span>
              </ExternalLink>
            </Button>
          ))}
        </div>
        <ScoreExplainer person={person} />
      </section>
      <section>
        <PageTitle as="h2" className="mb-4 text-left" size="sm">
          SWC Candidate Questionnaire
        </PageTitle>
      </section>
      <article className={cn('rounded-3xl bg-secondary p-4 md:p-6')}>
        Responses
        {!questionnaire.fields && <div>No recent statements.</div>}
        <div className="flex flex-col space-y-4">xxx</div>
      </article>
      <section>
        <PageTitle as="h2" className="mb-4 text-left" size="sm">
          Notable statements
        </PageTitle>
        <div className="flex flex-col space-y-4">
          {!stances.length && <div>No recent statements.</div>}
          {stances.map(stance => {
            return (
              <article className={cn('rounded-3xl bg-secondary p-4 md:p-6')} key={stance.id}>
                <DTSIStanceDetails locale={locale} person={person} stance={stance} />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
