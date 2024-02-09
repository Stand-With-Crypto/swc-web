import {
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroup,
  DTSI_PersonRoleGroupCategory,
} from '@/data/dtsi/generated'
import { parseISO } from 'date-fns'

type PartialGroup = Pick<DTSI_PersonRoleGroup, 'id' | 'category'>
type PartialRole = Pick<DTSI_PersonRole, 'dateStart' | 'roleCategory'>

type DTSI_PersonRoleDomainSubCommitteeDomain<T extends PartialGroup> = {
  subcommittee: T
  committee: T
  congress: T
  rank: 'MEMBER' | 'CHAIR'
  chamber: 'CONGRESS' | 'SENATE' | 'JOINT'
}

type DTSI_PersonRoleDomainCommitteeDomain<T extends PartialGroup> = {
  committee: T
  congress: T
  rank: 'MEMBER' | 'CHAIR'
  chamber: 'CONGRESS' | 'SENATE' | 'JOINT'
}

type DTSI_PersonRoleSeatDomain<T extends PartialGroup> = {
  congress: T
  chamber: 'CONGRESS' | 'SENATE' | 'JOINT'
}

export type DTSI_PersonRoleDomain<T extends PartialGroup> =
  | DTSI_PersonRoleDomainSubCommitteeDomain<T>
  | DTSI_PersonRoleDomainCommitteeDomain<T>
  | DTSI_PersonRoleSeatDomain<T>

type DTSI_PersonRoleWithDomain<
  T extends PartialGroup,
  R extends PartialRole,
  D extends DTSI_PersonRoleDomain<T> | null | undefined,
> = {
  role: R
  domain: D
}

const getCommitteeChamberFromGroupCategory = (category: DTSI_PersonRoleGroupCategory) => {
  switch (category) {
    case DTSI_PersonRoleGroupCategory.CONGRESS_JOINT_COMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_JOINT_SUBCOMMITTEE:
      return 'JOINT' as const
    case DTSI_PersonRoleGroupCategory.CONGRESS_SENATE_COMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_SENATE_SUBCOMMITTEE:
      return 'SENATE' as const
    case DTSI_PersonRoleGroupCategory.CONGRESS_HOUSE_COMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_HOUSE_SUBCOMMITTEE:
      return 'CONGRESS' as const
  }
  throw new Error(`unexpected category ${category} passed to getCommitteeChamberFromGroupCategory`)
}

const getChamberFromRoleCategory = (category: DTSI_PersonRoleCategory | null | undefined) => {
  switch (category) {
    case DTSI_PersonRoleCategory.CONGRESS:
    case DTSI_PersonRoleCategory.SENATE:
      return category
  }
  throw new Error(`unexpected category ${category!} passed to getChamberFromRoleCategory`)
}

const getRankFromRoleCategory = (category: DTSI_PersonRoleCategory | null | undefined) => {
  switch (category) {
    case DTSI_PersonRoleCategory.COMMITTEE_CHAIR:
      return 'CHAIR' as const
    case DTSI_PersonRoleCategory.COMMITTEE_MEMBER:
      return 'MEMBER' as const
  }
  throw new Error(`unexpected category ${category!} passed to getRankFromRoleCategory`)
}

export type DTSI_PersonRoleWithAllSubGroups<T extends PartialGroup, R extends PartialRole> = R & {
  // subcommittee
  group:
    | (T & {
        // committee
        parentGroup:
          | (T & {
              // congress
              parentGroup: T | null | undefined
            })
          | null
          | undefined
      })
    | null
    | undefined
}

export const getDTSIPersonRoleDomain = <T extends PartialGroup, R extends PartialRole>(
  role: DTSI_PersonRoleWithAllSubGroups<T, R>,
): DTSI_PersonRoleDomain<T> | null | undefined => {
  switch (role.group?.category) {
    case null:
    case undefined:
      return null
    case DTSI_PersonRoleGroupCategory.CONGRESS: {
      return {
        chamber: getChamberFromRoleCategory(role.roleCategory),
        congress: role.group,
      }
    }
    case DTSI_PersonRoleGroupCategory.CONGRESS_JOINT_SUBCOMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_SENATE_SUBCOMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_HOUSE_SUBCOMMITTEE: {
      const subcommittee = role.group
      const committee = subcommittee.parentGroup!
      const congress = committee!.parentGroup!
      return {
        chamber: getCommitteeChamberFromGroupCategory(role.group.category),
        committee,
        congress,
        rank: getRankFromRoleCategory(role.roleCategory),
        subcommittee,
      }
    }
    case DTSI_PersonRoleGroupCategory.CONGRESS_JOINT_COMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_SENATE_COMMITTEE:
    case DTSI_PersonRoleGroupCategory.CONGRESS_HOUSE_COMMITTEE: {
      const committee = role.group
      const congress = committee!.parentGroup!
      return {
        chamber: getCommitteeChamberFromGroupCategory(role.group.category),
        committee,
        congress,
        rank: getRankFromRoleCategory(role.roleCategory),
      }
    }
  }
}

type NestedSubCommitteeRoleDomain<T extends PartialGroup> = {
  subcommittee: T
  rank: 'MEMBER' | 'CHAIR'
}

type NestedCommitteeRoleDomain<T extends PartialGroup> = {
  committee: T
  rank: 'MEMBER' | 'CHAIR'
  chamber: 'CONGRESS' | 'SENATE' | 'JOINT'
  subcommittees: NestedSubCommitteeRoleDomain<T>[]
}

type NestedCongressionalRoleDomain<T extends PartialGroup> = {
  congress: T
  committees: NestedCommitteeRoleDomain<T>[]
}

export type DTSI_PersonRoleWithNestedDomain<T extends PartialGroup, R extends PartialRole> = {
  role: R
  domain: NestedCongressionalRoleDomain<T> | null | undefined
}

export const groupDTSIPersonRolesByDomain = <T extends PartialGroup, R extends PartialRole>(
  roles: Array<DTSI_PersonRoleWithAllSubGroups<T, R>>,
) => {
  const rolesWithoutDomain: Array<DTSI_PersonRoleWithNestedDomain<T, R>> = []
  const withNestedDomains: Required<{
    role: R
    domain: NestedCongressionalRoleDomain<T>
  }>[] = []
  const firstRoundToBackfill: DTSI_PersonRoleWithDomain<
    T,
    R,
    DTSI_PersonRoleDomainCommitteeDomain<T> | DTSI_PersonRoleDomainSubCommitteeDomain<T>
  >[] = []
  roles.forEach(role => {
    const domain = getDTSIPersonRoleDomain(role)
    if (!domain) {
      return rolesWithoutDomain.push({ domain, role })
    }
    if ('committee' in domain) {
      firstRoundToBackfill.push({ domain, role })
    } else {
      const { congress } = domain
      withNestedDomains.push({ domain: { committees: [], congress }, role })
    }
  })

  const finalRoundToBackfill: DTSI_PersonRoleWithDomain<
    T,
    R,
    DTSI_PersonRoleDomainSubCommitteeDomain<T>
  >[] = []
  firstRoundToBackfill.forEach(({ role, domain }) => {
    if ('subcommittee' in domain!) {
      return finalRoundToBackfill.push({ domain, role })
    }
    const indexOfCongressionalRole = withNestedDomains.findIndex(
      x => x.domain.congress.id === domain.congress.id,
    )
    const { rank, committee, chamber } = domain
    withNestedDomains[indexOfCongressionalRole].domain.committees.push({
      chamber,
      committee,
      rank,
      subcommittees: [],
    })
  })

  /* LATER-TASK uncomment to enable displaying subcommittees */
  // finalRoundToBackfill.forEach(({ role, domain }) => {
  //   const indexOfCongressionalRole = withNestedDomains.findIndex(
  //     x => x.domain.congress.id === domain.congress.id,
  //   )
  //   const committees = withNestedDomains[indexOfCongressionalRole].domain.committees
  //   const indexOfCommitteeRole = committees.findIndex(x => x.committee.id === domain.committee.id)
  //   const { rank, subcommittee } = domain
  //   committees[indexOfCommitteeRole].subcommittees.push({
  //     rank,
  //     subcommittee,
  //   })
  // })
  const final = [...rolesWithoutDomain, ...withNestedDomains]
  final.sort(({ role: role1 }, { role: role2 }) => {
    return parseISO(role2.dateStart).getTime() - parseISO(role1.dateStart).getTime()
  })
  return final
}
