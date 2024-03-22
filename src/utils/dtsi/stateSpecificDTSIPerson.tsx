import {
  DTSI_PersonRoleGroupCategory,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'
import {
  CURRENT_SESSION_OF_CONGRESS,
  NEXT_SESSION_OF_CONGRESS,
} from '@/utils/dtsi/dtsiPersonRoleUtils'

export function formatStateSpecificDTSIPerson(
  person: DTSI_StateSpecificInformationQuery['people'][0],
) {
  const { roles, ...rest } = person
  const currentStateSpecificRole = roles.find(role => {
    return (
      role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
      role.group.groupInstance === `${CURRENT_SESSION_OF_CONGRESS}`
    )
  })
  const runningForStateSpecificRole = roles.find(role => {
    return (
      role.group?.category === DTSI_PersonRoleGroupCategory.CONGRESS &&
      role.group.groupInstance === `${NEXT_SESSION_OF_CONGRESS}`
    )
  })
  return {
    ...rest,
    currentStateSpecificRole,
    runningForStateSpecificRole,
  }
}

export type StateSpecificDTSIPerson = ReturnType<typeof formatStateSpecificDTSIPerson>
