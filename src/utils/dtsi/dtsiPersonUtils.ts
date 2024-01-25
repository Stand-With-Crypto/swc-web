import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import _ from 'lodash'

export function dtsiPersonFullName(
  person: Pick<DTSI_Person, 'firstName' | 'lastName' | 'firstNickname' | 'nameSuffix'>,
) {
  return `${person.firstNickname || person.firstName} ${person.lastName}${
    person.nameSuffix && ` ${person.nameSuffix}`
  }`
}

export function getDTSIPersonProfilePictureUrlDimensions(
  person: Pick<DTSI_Person, 'profilePictureUrlDimensions'>,
) {
  if (person.profilePictureUrlDimensions) {
    return person.profilePictureUrlDimensions as { width: number; height: number }
  }
  return null
}

export function dtsiPersonPoliticalAffiliationCategoryAbbreviation(
  category: DTSI_PersonPoliticalAffiliationCategory,
) {
  switch (category) {
    case DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT:
      return 'D'
    case DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN:
      return 'R'
    case DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT:
      return 'I'
  }
}

export function dtsiPersonPoliticalAffiliationCategoryDisplayName(
  category: DTSI_PersonPoliticalAffiliationCategory,
) {
  switch (category) {
    case DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT:
      return 'Democrat'
    case DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN:
      return 'Republican'
    case DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT:
      return 'Independent'
  }
}

type WithComputedStanceScore<P extends Pick<DTSI_Person, 'id' | 'computedStanceScore'>> = Omit<
  P,
  'computedStanceScore'
> & { computedStanceScore: number }

export function groupAndSortDTSIPeopleByCryptoStance<
  P extends Pick<DTSI_Person, 'id' | 'computedStanceScore'>,
>(people: P[]) {
  const proCrypto: WithComputedStanceScore<P>[] = []
  const antiCrypto: WithComputedStanceScore<P>[] = []
  const neutralCrypto: P[] = []
  people.forEach(person => {
    const { computedStanceScore } = person
    if (_.isNil(computedStanceScore) || computedStanceScore === 50) {
      neutralCrypto.push(person)
    } else if (computedStanceScore > 50) {
      proCrypto.push({ ...person, computedStanceScore })
    } else {
      antiCrypto.push({ ...person, computedStanceScore })
    }
  })
  return {
    proCrypto: _.sortBy(proCrypto, x => x.computedStanceScore),
    antiCrypto: _.sortBy(antiCrypto, x => -1 * x.computedStanceScore),
    neutralCrypto: neutralCrypto,
  }
}
