import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MaybeNextImg } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { queryDTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { PageProps } from '@/types'
import {
  getDTSIPersonRoleCategoryDisplayName,
  getDTSIPersonRoleLocation,
  getFormattedDTSIPersonRoleDateRange,
  getHasDTSIPersonRoleEnded,
  orderDTSIPersonRolesByImportance,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import { groupDTSIPersonRolesByDomain } from '@/utils/dtsi/dtsiPersonRoleWithDomain'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
  getDTSIPersonProfilePictureUrlDimensions,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIStanceScoreToCryptoSupportLanguage,
  convertDTSIStanceScoreToTextColorClass,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { dtsiTwitterAccountUrl } from '@/utils/dtsi/dtsiTwitterAccountUtils'
import { externalUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { Info, MoveUpRight } from 'lucide-react'

export const revalidate = 60 * 24 * 7
export const dynamic = 'error'
export const dynamicParams = true

// TODO metadata

export async function generateStaticParams() {
  return queryDTSIAllPeopleSlugs().then(x => x.people.map(({ slug: dtsiSlug }) => ({ dtsiSlug })))
}

export default async function PoliticianDetails({ params }: PageProps<{ dtsiSlug: string }>) {
  const { locale } = params
  const person = await queryDTSIPersonDetails(params.dtsiSlug)
  const orderedRoles = orderDTSIPersonRolesByImportance(person.roles)
  const primaryRole = orderedRoles.byImportance[0]
  const rolesWithDomains = groupDTSIPersonRolesByDomain(orderedRoles.byDateStart)
  return (
    <div className="container grid grid-cols-1 space-y-6 md:grid-cols-3 md:space-y-0">
      <aside className="md:col-span-1">
        <div className="sticky top-0 text-center md:mr-6 md:max-h-screen md:min-h-screen md:overflow-y-auto md:border-r md:pr-6 md:text-left">
          <article className="mt-5">
            {person.profilePictureUrl && (
              <div
                className="mx-auto mb-6 overflow-hidden rounded-lg md:mx-0"
                style={{ maxWidth: 200 }}
              >
                <MaybeNextImg
                  sizes="200px"
                  alt={`profile picture of ${dtsiPersonFullName(person)}`}
                  {...(getDTSIPersonProfilePictureUrlDimensions(person) || {})}
                  src={person.profilePictureUrl}
                />
              </div>
            )}
            {primaryRole &&
              (primaryRole.roleCategory === DTSI_PersonRoleCategory.SENATE ||
                primaryRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS) &&
              !getHasDTSIPersonRoleEnded(primaryRole) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className="mb-3 bg-green-100 font-bold text-green-700 hover:bg-green-100/80">
                        Active <Info className="ml-1 h-4 w-4 text-gray-600" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This member is currently a member of Congress</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

            <h1 className="text-xl font-bold">
              {dtsiPersonFullName(person)}{' '}
              {person.politicalAffiliationCategory &&
                `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                  person.politicalAffiliationCategory,
                )})`}
            </h1>

            {primaryRole && (
              <>
                <h3 className="text-xl font-bold md:text-lg lg:text-xl">
                  {getDTSIPersonRoleCategoryDisplayName(primaryRole)}
                  {getDTSIPersonRoleLocation(primaryRole) && (
                    <span className="font-normal text-gray-500">
                      , {getDTSIPersonRoleLocation(primaryRole)}
                    </span>
                  )}
                </h3>
                {getHasDTSIPersonRoleEnded(primaryRole) && (
                  <div className="text-gray-500">
                    {getFormattedDTSIPersonRoleDateRange(primaryRole)}
                  </div>
                )}
              </>
            )}
          </article>
          {rolesWithDomains.length > 1 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button size="sm" className="mt-3">
                  <span className="whitespace-pre-wrap md:hidden lg:inline">Show </span> All
                  Positions
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="AnimateCollapsibleContent">
                <article>
                  <h4 className="mb-2 pt-4 text-xl font-bold lg:pt-6">All Positions</h4>
                  <div className="flex flex-col space-y-6">
                    {rolesWithDomains.map(({ role, domain }) => (
                      <article key={role.id}>
                        <p className="text-lg">{getDTSIPersonRoleCategoryDisplayName(role)}</p>
                        <p className="text-gray-500">{getFormattedDTSIPersonRoleDateRange(role)}</p>
                        {Boolean(domain?.committees.length) && (
                          <>
                            <div className="mb-1 mt-3">Committees</div>
                            <div className="flex flex-col space-y-1">
                              {domain?.committees.map(
                                ({ committee, subcommittees, rank }, index) => (
                                  <div key={index}>
                                    <div className="text-sm text-gray-600">
                                      {committee.displayName}
                                    </div>
                                    {/* uncomment to enable displaying subcommittees */}
                                    {/* {!!subcommittees.length && (
                                        <Box>
                                          <Text fontSize={'sm'}>Subcommittees</Text>
                                          <div className='flex flex-col space-y-1'>
                                            {subcommittees.map(({ subcommittee }, index) => (
                                              <Text key={index} fontSize={'sm'} color="gray.400">
                                                {subcommittee.displayName}
                                              </Text>
                                            ))}
                                          </VStack>
                                        </Box>
                                      )} */}
                                  </div>
                                ),
                              )}
                            </div>
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                </article>
              </CollapsibleContent>
            </Collapsible>
          )}
          <article className="mx-auto mt-4 max-w-xs border-t pt-4 md:mx-0 lg:mt-6 lg:pt-6">
            <h2 className="text-xl font-semibold">Crypto position</h2>
            <div className="mx-auto my-4 flex max-w-[200px] gap-4 md:mx-0">
              <div className="flex-shrink-0">
                <DTSIFormattedLetterGrade size={60} person={person} />
              </div>
              <div
                className={cn(
                  convertDTSIStanceScoreToTextColorClass(person),
                  'text-left text-xl font-semibold',
                )}
              >
                {convertDTSIStanceScoreToCryptoSupportLanguage(person)}
              </div>
            </div>
            <p className="my-4 text-sm text-gray-700">
              DoTheySupportIt generates the score from the member’s public statements. You can
              change the score by contributing more statements.
            </p>
            <Button asChild>
              <ExternalLink href={externalUrls.dtsiCreateStance(person.slug)}>
                Add Position <MoveUpRight className="ml-2" />
              </ExternalLink>
            </Button>
          </article>
          <article className="mt-4 border-t pt-4 lg:mt-6 lg:pt-6">
            <h4 className="mb-2 text-xl font-bold">Links</h4>
            {person.twitterAccounts.map(account => (
              // TODO make this an ellipsis
              <div key={account.id} className="overflow-hidden">
                <ExternalLink href={dtsiTwitterAccountUrl(account)}>
                  {dtsiTwitterAccountUrl(account)}
                </ExternalLink>
              </div>
            ))}

            {Boolean(person.officialUrl) && (
              <div>
                <ExternalLink href={person.officialUrl}>{person.officialUrl}</ExternalLink>
              </div>
            )}
            <Button variant={'outline'} className="mt-3">
              DONATE (TODO)
            </Button>
          </article>
        </div>
      </aside>
      <section className="md:col-span-2">
        <h2 className="mb-6 text-2xl font-extrabold">{person.stances.length} notable statements</h2>
        <div className="flex flex-col space-y-6">
          {!person.stances.length && <div className="text-center">No recent statements.</div>}
          {person.stances.map((stance, index) => {
            return (
              <article key={stance.id} className={cn(!!index && 'border-t pt-6')}>
                <DTSIStanceDetails locale={locale} stance={stance} person={person} />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
