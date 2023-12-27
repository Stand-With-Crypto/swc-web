import {
  DTSI_Person,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import _ from 'lodash'

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

export const dtsiPersonPoliticalAffiliationCategoryDisplayName = (
  category: DTSI_PersonPoliticalAffiliationCategory,
) => {
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

export const groupAndSortDTSIPeopleByCryptoStance = <
  P extends Pick<DTSI_Person, 'id' | 'computedStanceScore'>,
>(
  people: P[],
) => {
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

export enum DTSILetterGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}

export const convertDTSIStanceScoreToLetterGrade = (score: number) => {
  if (score >= 90) {
    return DTSILetterGrade.A
  }
  if (score >= 70) {
    return DTSILetterGrade.B
  }
  if (score >= 50) {
    return DTSILetterGrade.C
  }
  if (score >= 30) {
    return DTSILetterGrade.D
  }
  return DTSILetterGrade.F
}

export const getDTSIFormattedShortPersonRole = (
  role: Pick<
    DTSI_PersonRole,
    'status' | 'primaryState' | 'primaryCountryCode' | 'title' | 'roleCategory'
  >,
) => {
  // TODO verify we only need to be vague when referring to roles someone currently does not hold
  if (role.status === DTSI_PersonRoleStatus.RUNNING_FOR) {
    return 'National Political Figure'
  }
  if (role.primaryState && role.primaryCountryCode === 'US') {
    return getUSStateNameFromStateCode(role.primaryState)
  }
  if (role.title && role.roleCategory === DTSI_PersonRoleCategory.PRESIDENT) {
    return role.title
  }
  return gracefullyError({
    msg: `getDTSIFormattedPersonRole returned no role for ${JSON.stringify(role)}`,
    fallback: role.title,
  })
}

export const getDTSIPersonRoleCategoryDisplayName = (
  role: Pick<DTSI_PersonRole, 'roleCategory' | 'title'>,
) => {
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
      return 'Congress'
    case DTSI_PersonRoleCategory.GOVERNOR:
      return 'Governor'
    case DTSI_PersonRoleCategory.MAYOR:
      return 'Mayor'
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'President'
    case DTSI_PersonRoleCategory.SENATE:
      return 'Senate'
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'Vice President'
  }
  return gracefullyError({
    msg: `getDTSIPersonRoleCategoryDisplayName returned no role for ${JSON.stringify(role)}`,
    fallback: role.title,
  })
}
