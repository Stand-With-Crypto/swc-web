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
  }
}
