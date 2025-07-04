import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { Politicians } from '@/components/app/politiciansGrid/politiciansGrid'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const MIN_SCORES = 3

type Scores = ReturnType<typeof sortDTSIPersonDataTable>

interface PoliticiansGridProps {
  CryptoStanceGrade: React.ComponentType<{
    className?: string
    person: DTSI_PersonCardFragment
  }>
  countryCode: SupportedCountryCodes
  highestScores: Scores
  minScores?: number
  lowestScores: Scores
  showGroupTitle?: boolean
  stateCode?: string
}

export function PoliticiansGrid({
  CryptoStanceGrade,
  countryCode,
  highestScores,
  minScores = MIN_SCORES,
  lowestScores,
  showGroupTitle = true,
  stateCode,
}: PoliticiansGridProps) {
  const urls = getIntlUrls(countryCode)

  return (
    <Politicians>
      {highestScores.length >= minScores && (
        <Politicians.Group>
          {showGroupTitle && <Politicians.GroupTitle stanceScore={100} text="Pro-crypto" />}
          <Politicians.GroupContent
            CryptoStanceGrade={CryptoStanceGrade}
            countryCode={countryCode}
            scores={highestScores}
          />
        </Politicians.Group>
      )}

      {lowestScores.length >= minScores && (
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
        href={urls.politiciansHomepage(
          stateCode
            ? {
                filters: { state: stateCode.toUpperCase() },
                hash: 'table',
              }
            : {},
        )}
      >
        View all
      </Politicians.Button>
    </Politicians>
  )
}
