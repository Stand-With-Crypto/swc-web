import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  getAUPoliticianCategoryDisplayName,
  YourPoliticianCategory as AUYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/au'
import {
  getCAPoliticianCategoryDisplayName,
  YourPoliticianCategory as CAYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/ca'
import {
  getGBPoliticianCategoryDisplayName,
  YourPoliticianCategory as GBYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/gb'
import {
  getUSPoliticianCategoryDisplayName,
  YourPoliticianCategory as USYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/us'

interface Props {
  countryCode: SupportedCountryCodes
  category:
    | USYourPoliticianCategory
    | AUYourPoliticianCategory
    | CAYourPoliticianCategory
    | GBYourPoliticianCategory
}
export function getYourPoliticianCategoryDisplayName(props: Props) {
  const { countryCode, category } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return getUSPoliticianCategoryDisplayName(category as USYourPoliticianCategory)
    case SupportedCountryCodes.AU:
      return getAUPoliticianCategoryDisplayName(category as AUYourPoliticianCategory)
    case SupportedCountryCodes.CA:
      return getCAPoliticianCategoryDisplayName(category as CAYourPoliticianCategory)
    case SupportedCountryCodes.GB:
      return getGBPoliticianCategoryDisplayName(category as GBYourPoliticianCategory)
  }
}
