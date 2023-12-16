import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'

export const dtsiPersonFullName = (
  person: Pick<DTSI_Person, 'firstName' | 'lastName' | 'firstNickname' | 'nameSuffix'>,
) => {
  return `${person.firstNickname || person.firstName} ${person.lastName}${
    person.nameSuffix && ` ${person.nameSuffix}`
  }`
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
