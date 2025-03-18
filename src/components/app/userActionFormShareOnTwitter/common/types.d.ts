import { UseSectionsReturn } from '@/hooks/useSections'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type ShareOnXSectionProps<T extends string = string> = UseSectionsReturn<T> & {
  countryCode: SupportedCountryCodes
}

export interface UserActionTweetCountryConfig<
  SectionKeys extends readonly string[] = readonly string[],
> {
  sections: SectionKeys
  initialSection: SectionKeys[number]
  analyticsName: string
  sectionComponents: Record<SectionKeys[number], React.ComponentType<any>>
  meta: {
    title: string
    subtitle: string
    followUrl: string
    followText: string
    benefits: string[]
  }
}
