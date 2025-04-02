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

const hideStanceSlugs = [
  {
    isCongressperson: true,
    slug: 'josh---gottheimer',
  },
  {
    isCongressperson: true,
    slug: 'mikie---sherrill',
  },
  {
    isCongressperson: false,
    slug: 'edward---durr',
  },
  {
    isCongressperson: false,
    slug: 'bill---spadea',
  },
  {
    isCongressperson: false,
    slug: 'hans---herberg',
  },
  {
    isCongressperson: false,
    slug: 'jack---ciattarelli',
  },
  {
    isCongressperson: false,
    slug: 'sean---spiller',
  },
  {
    isCongressperson: false,
    slug: 'roger--bacon',
  },
  {
    isCongressperson: false,
    slug: 'stephen---sweeney',
  },
  {
    isCongressperson: false,
    slug: 'ras---baraka',
  },
  {
    isCongressperson: false,
    slug: 'robert---canfield',
  },
  {
    isCongressperson: false,
    slug: 'justin---barbera',
  },
  {
    isCongressperson: false,
    slug: 'jon---bramnick',
  },
  {
    isCongressperson: false,
    slug: 'steven---fulop',
  },
  {
    isCongressperson: false,
    slug: 'james---fazzone',
  },
  {
    isCongressperson: false,
    slug: 'stephen---zielinski',
  },
  {
    isCongressperson: false,
    slug: 'joanne---kuniansky',
  },
  {
    isCongressperson: false,
    slug: 'karen---zaletel',
  },
  {
    isCongressperson: false,
    slug: 'monica---brinson',
  },
  {
    isCongressperson: false,
    slug: 'mario---kranjac',
  },
  {
    isCongressperson: false,
    slug: 'gerardo---cedrone',
  },
  {
    isCongressperson: false,
    slug: 'abigail---spanberger',
  },
  {
    isCongressperson: false,
    slug: 'dave---larock',
  },
  {
    isCongressperson: false,
    slug: 'merle---rutledge',
  },
  {
    isCongressperson: false,
    slug: 'winsome---earle-sears',
  },
  {
    isCongressperson: false,
    slug: 'amanda---chase',
  },
  {
    isCongressperson: false,
    slug: 'andrew---white',
  },
]

export function isPoliticianStanceHidden(dtsiSlug: string) {
  return hideStanceSlugs.some(x => x.slug === dtsiSlug.toLowerCase())
}

export function isPoliticianDetailsStanceHidden(dtsiSlug: string) {
  return hideStanceSlugs.some(x => x.slug === dtsiSlug.toLowerCase() && !x.isCongressperson)
}
