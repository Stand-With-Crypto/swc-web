import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'

type PersonFields = Pick<DTSI_StateSpecificInformationQuery['people'][0], 'roles' | 'slug'>

export function auFormatSpecificRoleDTSIPerson<P extends PersonFields>(person: P) {
  const { roles, ...rest } = person
  const currentSpecificRole = roles.find(role => {
    return (
      role.status === DTSI_PersonRoleStatus.HELD &&
      (role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS ||
        role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS ||
        role?.roleCategory === DTSI_PersonRoleCategory.CONGRESS ||
        role?.roleCategory === DTSI_PersonRoleCategory.SENATE)
    )
  })
  const runningForSpecificRole = roles.find(role => {
    return (
      role.status === DTSI_PersonRoleStatus.RUNNING_FOR &&
      (role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_COMMONS ||
        role?.roleCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS ||
        role?.roleCategory === DTSI_PersonRoleCategory.CONGRESS ||
        role?.roleCategory === DTSI_PersonRoleCategory.SENATE)
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

export type AUSpecificRoleDTSIPerson<P extends PersonFields> = ReturnType<
  typeof auFormatSpecificRoleDTSIPerson<P>
>
