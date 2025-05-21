import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PoliticiansGroupTitleProps {
  stanceScore?: number | null
  text?: string
}

interface PoliticiansGroupContentProps {
  CryptoStanceGrade: React.ComponentType<{
    className?: string
    person: DTSI_PersonCardFragment
  }>
  countryCode: SupportedCountryCodes
  scores: ReturnType<typeof sortDTSIPersonDataTable>
}

interface PoliticiansButtonProps extends React.PropsWithChildren {
  href: string
}

export function Politicians({ children }: React.PropsWithChildren) {
  return <div className="space-y-6">{children}</div>
}

function PoliticiansGroup({ children }: React.PropsWithChildren) {
  return <div>{children}</div>
}
Politicians.Group = PoliticiansGroup

function PoliticiansGroupTitle({ stanceScore, text }: PoliticiansGroupTitleProps) {
  return (
    <h5 className="container text-center">
      <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={stanceScore} text={text} />
    </h5>
  )
}
Politicians.GroupTitle = PoliticiansGroupTitle

function PoliticiansGroupContent({
  CryptoStanceGrade,
  countryCode,
  scores,
}: PoliticiansGroupContentProps) {
  return (
    <DTSIPersonHeroCardRow>
      {scores.map(person => (
        <DTSIPersonHeroCard
          countryCode={countryCode}
          cryptoStanceGrade={CryptoStanceGrade}
          key={person.id}
          person={person}
          shouldHideStanceScores={false}
          subheader="role-w-state"
        />
      ))}
    </DTSIPersonHeroCardRow>
  )
}
Politicians.GroupContent = PoliticiansGroupContent

function PoliticiansButton({ href, children }: PoliticiansButtonProps) {
  return (
    <div className="container space-x-4 text-center">
      <Button asChild variant="secondary">
        <InternalLink href={href}>{children}</InternalLink>
      </Button>
    </div>
  )
}
Politicians.Button = PoliticiansButton
