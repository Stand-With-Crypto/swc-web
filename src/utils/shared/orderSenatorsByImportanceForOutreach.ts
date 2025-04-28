import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'

const HIGH_PRIORITY_SENATOR_DTSI_SLUGS_FOR_OUTREACH = [
  'tim---scott',
  'sherrod---brown',
  'jack---reed',
  'mike---crapo',
  'robert---menendez---1',
  'mike---rounds',
  'mark---warner',
  'jon---tester',
  'john---kennedy',
  'bill---hagerty',
  'elizabeth---warren',
  'cynthia---lummis',
  'tina---smith',
  'katie---britt',
  'kevin---cramer',
  'raphael---warnock',
  'john---fetterman',
  'steve---daines',
  'laphonza---butler',
  'catherine---cortezmasto',
  'chris---vanhollen',
]

const ROLE_PRIORITY = [
  DTSI_PersonRoleCategory.GOVERNOR,
  DTSI_PersonRoleCategory.ATTORNEY_GENERAL,
  DTSI_PersonRoleCategory.CONGRESS,
  DTSI_PersonRoleCategory.SENATE,
]

/*

*/
export function orderDTSICongressionalDistrictResults<
  T extends {
    slug: string
    primaryRole: { roleCategory: DTSI_PersonRoleCategory | null | undefined } | null | undefined
    lastName: string
  },
>(list: T[]) {
  const orderedList = [...list]
  orderedList.sort((a, b) => {
    const roleIndexA = a.primaryRole?.roleCategory
      ? ROLE_PRIORITY.indexOf(a.primaryRole.roleCategory)
      : -1
    const roleIndexB = b.primaryRole?.roleCategory
      ? ROLE_PRIORITY.indexOf(b.primaryRole.roleCategory)
      : -1
    if (roleIndexA !== roleIndexB) {
      if (roleIndexA !== -1) {
        if (roleIndexB !== -1) {
          return roleIndexA - roleIndexB
        }
        return -1
      }
      if (roleIndexB !== -1) {
        return 1
      }
    }

    const slugIndexA = HIGH_PRIORITY_SENATOR_DTSI_SLUGS_FOR_OUTREACH.indexOf(a.slug)
    const slugIndexB = HIGH_PRIORITY_SENATOR_DTSI_SLUGS_FOR_OUTREACH.indexOf(b.slug)
    if (slugIndexA !== -1) {
      if (slugIndexB !== -1) {
        return slugIndexA - slugIndexB
      }
      return -1
    }
    if (slugIndexB !== -1) {
      return 1
    }
    return a.lastName.localeCompare(b.lastName)
  })
  return orderedList
}
