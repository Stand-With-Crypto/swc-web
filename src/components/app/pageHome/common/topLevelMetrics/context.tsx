import { createContext, useContext } from 'react'

import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const TopLevelMetricsContext = createContext<{
  countryCode: SupportedCountryCodes
}>({
  countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
})

export const useTopLevelMetricsContext = () => {
  const context = useContext(TopLevelMetricsContext)
  if (!context) {
    throw new Error('useTopLevelMetricsContext must be used within a TopLevelMetricsProvider')
  }
  return context
}
