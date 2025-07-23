import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  filterDTSIPeopleByAUPoliticalCategory,
  getAUPoliticianCategoryDisplayName,
  YourPoliticianCategory as AUYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/au'
import {
  filterDTSIPeopleByCAPoliticalCategory,
  getCAPoliticianCategoryDisplayName,
  YourPoliticianCategory as CAYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/ca'
import {
  filterDTSIPeopleByGBPoliticalCategory,
  getGBPoliticianCategoryDisplayName,
  YourPoliticianCategory as GBYourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/gb'
import {
  filterDTSIPeopleByUSPoliticalCategory,
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
export function filterDTSIPeopleByPoliticalCategory(args: Props) {
  const { countryCode, category } = args

  switch (countryCode) {
    case SupportedCountryCodes.US: {
      return filterDTSIPeopleByUSPoliticalCategory(category as USYourPoliticianCategory)
    }
    case SupportedCountryCodes.AU: {
      return filterDTSIPeopleByAUPoliticalCategory(category as AUYourPoliticianCategory)
    }
    case SupportedCountryCodes.CA: {
      return filterDTSIPeopleByCAPoliticalCategory(category as CAYourPoliticianCategory)
    }
    case SupportedCountryCodes.GB: {
      return filterDTSIPeopleByGBPoliticalCategory(category as GBYourPoliticianCategory)
    }
  }
}
