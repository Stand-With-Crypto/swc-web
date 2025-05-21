import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { Politicians } from '@/components/app/politiciansGrid/components'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

type Scores = ReturnType<typeof sortDTSIPersonDataTable>

interface PoliticiansGridProps {
  CryptoStanceGrade: React.ComponentType<{
    className?: string
    person: DTSI_PersonCardFragment
  }>
  countryCode: SupportedCountryCodes
  highestScores: Scores
  lowestScores: Scores
  showGroupTitle?: boolean
  stateCode?: string
}

export function PoliticiansGrid({
  CryptoStanceGrade,
  countryCode,
  highestScores,
  lowestScores,
  showGroupTitle = true,
  stateCode,
}: PoliticiansGridProps) {
  const urls = getIntlUrls(countryCode)

  return (
    <Politicians>
      {highestScores.length >= 3 && (
        <Politicians.Group>
          {showGroupTitle && <Politicians.GroupTitle stanceScore={100} text="Pro-crypto" />}
          <Politicians.GroupContent
            CryptoStanceGrade={CryptoStanceGrade}
            countryCode={countryCode}
            scores={highestScores}
          />
        </Politicians.Group>
      )}

      {lowestScores.length >= 3 && (
        <Politicians.Group>
          {showGroupTitle && <Politicians.GroupTitle stanceScore={0} text="Anti-crypto" />}
          <Politicians.GroupContent
            CryptoStanceGrade={CryptoStanceGrade}
            countryCode={countryCode}
            scores={lowestScores}
          />
        </Politicians.Group>
      )}

      <Politicians.Button
        href={`${urls.politiciansHomepage(stateCode ? { state: stateCode.toUpperCase() } : {})}#table`}
      >
        View all
      </Politicians.Button>
    </Politicians>
  )
}
