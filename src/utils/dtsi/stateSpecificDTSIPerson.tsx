import {
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'
import {
  CURRENT_SESSION_OF_CONGRESS,
  NEXT_SESSION_OF_CONGRESS,
} from '@/utils/dtsi/dtsiPersonRoleUtils'

type PersonFields = Pick<DTSI_StateSpecificInformationQuery['people'][0], 'roles'>

export function formatStateSpecificDTSIPerson<P extends PersonFields>(
  person: P,
  { specificRole }: { specificRole?: DTSI_PersonRoleCategory } = {},
) {
  const { roles, ...rest } = person
  const currentStateSpecificRole = roles.find(role => {
    return (
      role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
      role.group.groupInstance === `${CURRENT_SESSION_OF_CONGRESS}` &&
      (!specificRole || role.roleCategory === specificRole)
    )
  })
  const runningForStateSpecificRole = roles.find(role => {
    return (
      role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
      role.group.groupInstance === `${NEXT_SESSION_OF_CONGRESS}` &&
      (!specificRole || role.roleCategory === specificRole)
    )
  })!
  return {
    ...rest,
    roles,
    currentStateSpecificRole,
    runningForStateSpecificRole,
  }
}

export type StateSpecificDTSIPerson<P extends PersonFields> = ReturnType<
  typeof formatStateSpecificDTSIPerson<P>
>
