import { getYear, parseISO } from 'date-fns'

import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'

type PersonFields = Pick<DTSI_StateSpecificInformationQuery['people'][0], 'roles' | 'slug'>

export function formatSpecificRoleDTSIPersonAU<P extends PersonFields>(
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
    const currentSpecificRole = roles.find(role => {
      return (
        role.roleCategory === DTSI_PersonRoleCategory.GOVERNOR &&
        role.status === DTSI_PersonRoleStatus.HELD
      )
    })

    const runningForSpecificRole = roles.find(role => {
      return (
        role.roleCategory === DTSI_PersonRoleCategory.GOVERNOR &&
        role.status === DTSI_PersonRoleStatus.RUNNING_FOR
      )
    })

    const isIncumbent = currentSpecificRole?.roleCategory === runningForSpecificRole?.roleCategory

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
      role.status === DTSI_PersonRoleStatus.HELD &&
      (role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS ||
        role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS)
    )
  })
  const runningForSpecificRole = roles.find(role => {
    return (
      role.status === DTSI_PersonRoleStatus.RUNNING_FOR &&
      (role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS ||
        role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS)
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

export type SpecificRoleDTSIPersonAU<P extends PersonFields> = ReturnType<
  typeof formatSpecificRoleDTSIPersonAU<P>
>
