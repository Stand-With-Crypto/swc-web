import { getYear, parseISO } from 'date-fns'

import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'
import {
  CURRENT_SESSION_OF_CONGRESS,
  NEXT_SESSION_OF_CONGRESS,
} from '@/utils/dtsi/dtsiPersonRoleUtils'

type PersonFields = Pick<DTSI_StateSpecificInformationQuery['people'][0], 'roles' | 'slug'>

export function formatSpecificRoleDTSIPerson<P extends PersonFields>(
  person: P,
  { specificRole }: { specificRole?: DTSI_PersonRoleCategory } = {},
) {
  const { roles, ...rest } = person
  if (specificRole === DTSI_PersonRoleCategory.PRESIDENT) {
    const currentSpecificRole = roles.find(role => {
      return (
        role.roleCategory === DTSI_PersonRoleCategory.PRESIDENT && person.slug === 'joseph---biden'
      )
    })
    const runningForSpecificRole = roles.find(role => {
      return (
        role.roleCategory === DTSI_PersonRoleCategory.PRESIDENT &&
        getYear(parseISO(role.dateStart)) === 2025
      )
    })!
    return {
      ...rest,
      roles,
      isIncumbent: currentSpecificRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT,
      currentSpecificRole,
      runningForSpecificRole,
    }
  }

  if (specificRole === DTSI_PersonRoleCategory.GOVERNOR) {
    const currentSpecificRole =
      roles.find(role => {
        return role.roleCategory === DTSI_PersonRoleCategory.GOVERNOR
      }) ?? null

    const runningForSpecificRole = roles.find(role => {
      return (
        role.roleCategory === DTSI_PersonRoleCategory.GOVERNOR &&
        role.status === DTSI_PersonRoleStatus.RUNNING_FOR
      )
    })

    const isIncumbent =
      (currentSpecificRole &&
        runningForSpecificRole &&
        currentSpecificRole?.roleCategory === runningForSpecificRole?.roleCategory) ??
      false

    return {
      ...rest,
      roles,
      isIncumbent,
      currentSpecificRole,
      runningForSpecificRole,
    }
  }

  const currentSpecificRole = roles.find(role => {
    return (
      role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
      role.group.groupInstance === `${CURRENT_SESSION_OF_CONGRESS}` &&
      (!specificRole || role.roleCategory === specificRole)
    )
  })
  const runningForSpecificRole = roles.find(role => {
    return (
      role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
      role.group.groupInstance === `${NEXT_SESSION_OF_CONGRESS}` &&
      (!specificRole || role.roleCategory === specificRole)
    )
  })!

  return {
    ...rest,
    roles,
    isIncumbent:
      currentSpecificRole &&
      currentSpecificRole.roleCategory === runningForSpecificRole.roleCategory,
    currentSpecificRole,
    runningForSpecificRole,
  }
}

export type SpecificRoleDTSIPerson<P extends PersonFields> = ReturnType<
  typeof formatSpecificRoleDTSIPerson<P>
>
