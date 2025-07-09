import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AuLayoutScript } from './au'

type LayoutScriptsMap = Record<SupportedCountryCodes, React.FC>

interface LayoutScriptsProps {
  countryCode: SupportedCountryCodes
}

const layoutScriptsMap: Partial<LayoutScriptsMap> = {
  au: AuLayoutScript,
}

export function LayoutScript({ countryCode }: LayoutScriptsProps) {
  const Component = layoutScriptsMap[countryCode]

  return Component ? <Component /> : null
}
