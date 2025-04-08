import { isBefore, parseISO } from 'date-fns'

import {
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import {
  CURRENT_SESSION_OF_CONGRESS,
  DTSIPersonRoleCategoryDisplayNameProps,
} from '@/utils/dtsi/dtsiPersonRoleUtils'

type FuturePrefixRole = Pick<DTSI_PersonRole, 'roleCategory' | 'title' | 'status' | 'dateStart'> & {
  group: null | undefined | { groupInstance: string }
}

const getIsRoleInFuture = (role: FuturePrefixRole) => {
  if (role.dateStart && isBefore(parseISO(role.dateStart), new Date())) {
    return false
  }
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.SENATE:
    case DTSI_PersonRoleCategory.CONGRESS: {
      const groupInstanceNum = role.group?.groupInstance
        ? parseInt(role.group.groupInstance, 10)
        : null
      return groupInstanceNum ? groupInstanceNum > CURRENT_SESSION_OF_CONGRESS : null
    }
  }
  return null
}

export const usGetDTSIPersonRoleCategoryDisplayName = (
  role: DTSIPersonRoleCategoryDisplayNameProps,
) => {
  if (role.status !== DTSI_PersonRoleStatus.HELD || getIsRoleInFuture(role)) {
    return 'Political Figure'
  }
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
      return 'Congressperson'
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'President'
    case DTSI_PersonRoleCategory.SENATE:
      return 'Senator'
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'Vice President'
    case DTSI_PersonRoleCategory.GOVERNOR:
      return 'Governor'
    case DTSI_PersonRoleCategory.HOUSE_OF_COMMONS:
      return 'House of Commons Member'
    case DTSI_PersonRoleCategory.HOUSE_OF_LORDS:
      return 'House of Lords Member'
    case DTSI_PersonRoleCategory.STATE_CONGRESS:
      return 'State Congressperson'
    case DTSI_PersonRoleCategory.STATE_SENATE:
      return 'State Senator'
    case DTSI_PersonRoleCategory.MAYOR:
      return 'Mayor'
    case DTSI_PersonRoleCategory.COMMITTEE_CHAIR:
      return 'Committee Chair'
    case DTSI_PersonRoleCategory.COMMITTEE_MEMBER:
      return 'Committee Member'
  }
  return 'Political Figure'
}
