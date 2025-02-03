/*
Utility for accessing country code from context in client components

NOTE: Do not convert a SSR component to a client component just to
use this hook. Instead, pass locale directly in as a prop.
This hook should only be used as a convenience for components
that are going to be client components no matter what.
*/

import React, { useContext } from 'react'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const CountryCodeContext = React.createContext(SupportedCountryCodes.US)
export const useCountryCode = () => {
  return useContext(CountryCodeContext)
}
