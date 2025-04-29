import {
  DTSI_Person,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'

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
      return 'Liberal Nationals'
    case DTSI_PersonPoliticalAffiliationCategory.NDP:
      return 'NDP'
    case DTSI_PersonPoliticalAffiliationCategory.REFORM:
      return 'Reform'
    case DTSI_PersonPoliticalAffiliationCategory.SOCIALIST:
      return 'Socialist'
    case DTSI_PersonPoliticalAffiliationCategory.NATIONALS:
      return 'National Party'
    case DTSI_PersonPoliticalAffiliationCategory.ONE_NATION:
      return 'One Nation'
  }
}

const STATE_SPECIFIC_PRIMARY_ROLES = [
  DTSI_PersonRoleCategory.GOVERNOR,
  DTSI_PersonRoleCategory.ATTORNEY_GENERAL,
]

export function shouldPersonHaveStanceScoresHidden(person: {
  slug: string
  primaryRole: Pick<DTSI_PersonRole, 'roleCategory' | 'primaryCountryCode'> | null | undefined
}) {
  // We don't want any person on the US site, who's primary role is a state level role, to have their stance scores visible. Examples include Governors (and people running for governor), Attorney Generals, etc.
  // if someone is running for one of these roles, but has an existing federal role, we will show their stance scores.
  const primaryRoleIsUSStateLevelRole = Boolean(
    person.primaryRole?.roleCategory &&
      STATE_SPECIFIC_PRIMARY_ROLES.includes(person.primaryRole?.roleCategory) &&
      person.primaryRole.primaryCountryCode === 'US',
  )
  return primaryRoleIsUSStateLevelRole
}
