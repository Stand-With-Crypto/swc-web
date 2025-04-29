import { isBefore, parseISO } from 'date-fns'

import { DTSI_PersonRole, DTSI_PersonRoleCategory } from '@/data/dtsi/generated'

export const CURRENT_SESSION_OF_CONGRESS = 119
export const NEXT_SESSION_OF_CONGRESS = 119 // TODO update this to 120 when we want to start showing midterm races instead of special elections

type FuturePrefixRole = Pick<DTSI_PersonRole, 'roleCategory' | 'title' | 'status' | 'dateStart'> & {
  group: null | undefined | { groupInstance: string }
}

export const usGetIsRoleInFuture = (role: FuturePrefixRole) => {
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
