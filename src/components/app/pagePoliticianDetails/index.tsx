import React from 'react'
import { Entry } from 'contentful'
import { orderBy } from 'lodash-es'
import { Globe } from 'lucide-react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
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
import { QuestionnaireEntrySkeleton } from '@/utils/server/contentful/questionnaire'

const POLITICIAN_IMAGE_SIZE_PX = 230

export function PagePoliticianDetails({
  person,
  locale,
  questionnaire,
}: {
  person: DTSIPersonDetails
  locale: SupportedLocale
  questionnaire: Entry<QuestionnaireEntrySkeleton, undefined> | null
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

      {questionnaire && (
        <div>
          <section>
            <PageTitle as="h2" className="mb-4 text-left" size="sm">
              SWC Candidate Questionnaire
            </PageTitle>
          </section>
          <article className="space-y-7 rounded-3xl bg-secondary p-4 md:p-6">
            <p className="font-bold">Responses</p>
            {questionnaire.fields.q1 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>Do you have experience buying, selling, or
                  using blockchain technology assets or investment tools?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q1 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q2 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>Do you believe blockchain technology and
                  digital assets, including cryptocurrency like Bitcoin, will play a major role in
                  the next wave of technological innovation globally?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q2 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q3 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>Do you believe the American cryptocurrency
                  and digital asset industry is driving economic growth and supporting millions of
                  jobs across the country?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q3 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q4 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>Do you believe US competitiveness and
                  American national security are at risk if the digital asset industry is pushed
                  overseas?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q4 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q5 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>Do you believe it is important for the
                  United States to modernize the regulatory environment for crypto and digital
                  assets to ensure proper consumer protection while also fostering responsible
                  innovation?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q5 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q6 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>If you are currently a Member of Congress or
                  are elected to Congress, would you vote in favor of legislation that creates a
                  comprehensive regulatory framework for digital assets like HR 4763, the “Financial
                  Innovation and Technology for the 21st Century Act”, a bipartisan bill?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q6 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q7 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>If you are currently a Member of Congress or
                  are elected to Congress, would you vote in favor of legislation to create clear
                  rules for payment stablecoins (i.e., digital assets that are redeemable for U.S.
                  dollars 1:1) like HR 4766, “Clarity for Payment Stablecoins Act of 2023”, a
                  bipartisan bill?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q7 ? 'yes' : 'no'}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
            {questionnaire.fields.q8 !== undefined && (
              <div>
                <p>
                  <span className="font-bold">Q: </span>Please share any other positions or opinions
                  that you have on how crypto and digital assets should be regulated?
                </p>
                <p className="space-y-7 font-bold">A: {questionnaire.fields.q8}</p>
                <hr className="my-4 border" style={{ width: '100%' }} />
              </div>
            )}
          </article>
        </div>
      )}
      <section>
        <PageTitle as="h2" className="mb-4 text-left" size="sm">
          Notable statements
        </PageTitle>
        <div className="space-y-14 md:space-y-16">
          {!stances.length && <div>No recent statements.</div>}
          {stances.map(stance => {
            return (
              <div key={stance.id}>
                <DTSIStanceDetails locale={locale} person={person} stance={stance} />
                <CryptoSupportHighlight
                  className="mx-auto mt-2"
                  stanceScore={stance.computedStanceScore || null}
                />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
