/*
Utility for accessing locale from context in client components

NOTE: Do not convert a SSR component to a client component just to 
use this hook. Instead, pass locale directly in as a prop.
This hook should only be used as a convenience for components 
that are going to be client components no matter what.
*/

import { SupportedLocale } from '@/intl/locales'
import React from 'react'
import { useContext } from 'react'

export const LocaleContext = React.createContext(SupportedLocale.EN_US)
export const useLocale = () => {
  return useContext(LocaleContext)
}
