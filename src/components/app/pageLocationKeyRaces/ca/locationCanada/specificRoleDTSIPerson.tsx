import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'

type PersonFields = Pick<DTSI_StateSpecificInformationQuery['people'][0], 'roles' | 'slug'>

export function caFormatSpecificRoleDTSIPerson<P extends PersonFields>(person: P) {
  const { roles, ...rest } = person

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

export type CASpecificRoleDTSIPerson<P extends PersonFields> = ReturnType<
  typeof caFormatSpecificRoleDTSIPerson<P>
>
