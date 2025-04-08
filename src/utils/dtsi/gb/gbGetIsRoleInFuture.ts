import { isBefore, parseISO } from 'date-fns'

import { DTSI_PersonRole } from '@/data/dtsi/generated'

type FuturePrefixRole = Pick<DTSI_PersonRole, 'roleCategory' | 'title' | 'status' | 'dateStart'> & {
  group: null | undefined | { groupInstance: string }
}

export const gbGetIsRoleInFuture = (role: FuturePrefixRole) => {
  if (role.dateStart && isBefore(parseISO(role.dateStart), new Date())) {
    return false
  }
  return null
}
