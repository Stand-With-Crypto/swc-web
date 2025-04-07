import { ContentSection, ContentSectionProps } from '@/components/app/ContentSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserAddressVoterGuideInputSection } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/userAddressVoterGuideInput'
import { InternalLink, InternalLinkProps } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

import { ViewKeyRacesActionRegisterer } from './actionRegisterer'
import { LocationRacesDetailedCandidateListItem } from './detailedCandidateListItem'

export function LocationRaces({
  children,
  disableVerticalSpacing = false,
}: React.PropsWithChildren<{ disableVerticalSpacing?: boolean }>) {
  return <div className={cn(!disableVerticalSpacing && 'space-y-20')}>{children}</div>
}

LocationRaces.ActionRegisterer = ViewKeyRacesActionRegisterer

function LocationRacesContent({ children }: React.PropsWithChildren) {
  return <div className="container space-y-20 xl:space-y-28">{children}</div>
}
LocationRaces.Content = LocationRacesContent

function LocationRacesDetailedCandidateListContainer({ children }: React.PropsWithChildren) {
  return <div>{children}</div>
}
LocationRaces.DetailedCandidateListContainer = LocationRacesDetailedCandidateListContainer
LocationRaces.DetailedCandidateListItem = LocationRacesDetailedCandidateListItem

function LocationRacesEmptyMessage({
  children,
  gutterTop = false,
}: React.PropsWithChildren<{ gutterTop?: boolean }>) {
  return (
    <PageTitle as="h3" className={gutterTop ? 'mt-20' : undefined} size="sm">
      {children}
    </PageTitle>
  )
}
LocationRaces.EmptyMessage = LocationRacesEmptyMessage

function LocationRacesViewRaceCTA(props: InternalLinkProps) {
  return <InternalLink {...props}>View Race</InternalLink>
}
LocationRaces.ViewRaceCTA = LocationRacesViewRaceCTA

function LocationKeyRacesVoterGuideInput({ countryCode }: { countryCode: SupportedCountryCodes }) {
  return <UserAddressVoterGuideInputSection countryCode={countryCode} />
}
LocationRaces.VoterGuideInput = LocationKeyRacesVoterGuideInput

function LocationKeyRacesPacFooter() {
  return <PACFooter className="container" />
}
LocationRaces.PacFooter = LocationKeyRacesPacFooter

function LocationKeyRaces({ children }: React.PropsWithChildren) {
  return <div className="container flex flex-col items-center">{children}</div>
}
LocationRaces.KeyRaces = LocationKeyRaces

function LocationKeyRacesStates({
  children,
  useFlexBox = false,
  ...props
}: React.PropsWithChildren<ContentSectionProps & { useFlexBox?: boolean }>) {
  return (
    <ContentSection
      className="container"
      subtitle="Dive deeper and discover races in other states."
      title="Other states"
      {...props}
    >
      <div
        className={cn(
          'gap-3 text-center',
          useFlexBox
            ? 'flex flex-wrap justify-around'
            : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
        )}
      >
        {children}
      </div>
    </ContentSection>
  )
}
LocationRaces.KeyRacesStates = LocationKeyRacesStates
