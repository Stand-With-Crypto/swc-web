/* cspell:disable */

import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

const manuallyNormalizedCanadaDistrictsOverrides: Record<string, string> = {
  'Barrie-Springwater-Oro-Medonte': 'Barrie-Springwater-Oro Medonte',
  'Cote-du-Sud-Riviere-du-Loup-Kataskomiq-Temiscouata':
    'Cote-du-Sud-Riviere-du-Loup-Kataskomiq-Temsicouata',
  'Elgin-St. Thomas-London South': 'Elgin-St',
  'Kildonan-St. Paul': 'Kildonan-St Paul',
  "La Pointe-de-l'Ile": "La Pointe-de-L'Ile",
  'LaSalle-Émard-Verdun': 'LaSalle-Emard-Verdun',
  'Megantic-L’Erable-Lotbiniere': "Megantic-L'Erable-Lotbiniere",
  'Mont-Saint-Bruno-L’Acadie': "Mont-Saint-Bruno-L'Acadie",
  'St. Catharines': 'St Catherines',
  'South Shore-St. Margarets': "South Shore-St Margaret's",
  "St. John's East": "St John's East",
  'St. Boniface-St. Vital': 'St Boniface-St Vital',
  'St. Albert-Sturgeon River': 'St Albert-Sturgeon River',
  'Ville-Marie-Le Sud-Ouest-Ile-des-Soeurs': 'Ville-Marie-Le-Sud-Ouest-Ile-Des-Soeurs',
  'Sault Ste. Marie-Algoma': 'Sault Ste',
  "Toronto-St. Paul's": 'Toronto-St',
}

export function normalizeCADistrictName(name: string) {
  let normalized = ''

  normalized = name.replaceAll(/[\u2012\u2013\u2014\u2015]/g, '-')
  normalized = convertToOnlyEnglishCharacters(normalized)

  if (manuallyNormalizedCanadaDistrictsOverrides[normalized]) {
    return manuallyNormalizedCanadaDistrictsOverrides[normalized]
  }

  return normalized
}
