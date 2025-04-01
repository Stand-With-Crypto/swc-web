import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'

export const dtsiPersonFullName = (
  person: Pick<DTSI_Person, 'firstName' | 'lastName' | 'firstNickname' | 'nameSuffix'>,
) => {
  const fullNameWithoutSuffix = `${person.firstNickname || person.firstName} ${person.lastName}`

  return person.nameSuffix
    ? `${fullNameWithoutSuffix.replace(person.nameSuffix, '')} ${person.nameSuffix}`
    : fullNameWithoutSuffix
}

export const getDTSIPersonProfilePictureUrlDimensions = (
  person: Pick<DTSI_Person, 'profilePictureUrlDimensions'>,
) => {
  if (person.profilePictureUrlDimensions) {
    return person.profilePictureUrlDimensions as { width: number; height: number }
  }
  return null
}

export const dtsiPersonPoliticalAffiliationCategoryAbbreviation = (
  category: DTSI_PersonPoliticalAffiliationCategory,
) => {
  switch (category) {
    case DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT:
      return 'D'
    case DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN:
      return 'R'
    case DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT:
      return 'I'
  }
}

export const dtsiPersonPoliticalAffiliationCategoryDisplayName = (
  category: DTSI_PersonPoliticalAffiliationCategory,
) => {
  switch (category) {
    case DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT:
      return 'Democratic'
    case DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN:
      return 'Republican'
    case DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT:
      return 'Independent'
    case DTSI_PersonPoliticalAffiliationCategory.CONSERVATIVE:
      return 'Conservative'
    case DTSI_PersonPoliticalAffiliationCategory.DEMOCRATIC_SOCIALIST:
      return 'Democratic Socialist'
    case DTSI_PersonPoliticalAffiliationCategory.GREEN:
      return 'Green'
    case DTSI_PersonPoliticalAffiliationCategory.LABOR:
      return 'Labor'
    case DTSI_PersonPoliticalAffiliationCategory.LIBERAL:
      return 'Liberal'
    case DTSI_PersonPoliticalAffiliationCategory.LIBERAL_DEMOCRAT:
      return 'Liberal Democrat'
    case DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN:
      return 'Libertarian'
    case DTSI_PersonPoliticalAffiliationCategory.NATIONAL_LIBERAL:
      return 'National Liberal'
    case DTSI_PersonPoliticalAffiliationCategory.NDP:
      return 'NDP'
    case DTSI_PersonPoliticalAffiliationCategory.REFORM:
      return 'Reform'
    case DTSI_PersonPoliticalAffiliationCategory.SOCIALIST:
      return 'Socialist'
  }
}

const hideStanceSlugs = new Set<string>([
  'josh---gottheimer',
  'mikie---sherrill',
  'edward---durr',
  'bill---spadea',
  'hans---herberg',
  'jack---ciattarelli',
  'sean---spiller',
  'roger--bacon',
  'stephen---sweeney',
  'ras---baraka',
  'robert---canfield',
  'justin---barbera',
  'jon---bramnick',
  'steven---fulop',
  'james---fazzone',
  'stephen---zielinski',
  'joanne---kuniansky',
  'karen---zaletel',
  'monica---brinson',
  'mario---kranjac',
  'gerardo---cedrone',
  'abigail---spanberger',
  'dave---larock',
  'merle---rutledge',
  'winsome---earle-sears',
  'amanda---chase',
  'andrew---white',
])

export function isPoliticianStanceHidden(dtsiSlug: string) {
  return hideStanceSlugs.has(dtsiSlug.toLowerCase())
}
