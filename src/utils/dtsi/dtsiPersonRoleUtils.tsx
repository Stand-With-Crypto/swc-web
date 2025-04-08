import { format as dateFormat, isBefore, parseISO } from 'date-fns'
import { compact, isNumber } from 'lodash-es'

import {
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { auGetDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/roleMappings/au/dtsiPersonRoleUtils'
import { usGetDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/roleMappings/us/dtsiPersonRoleUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { withOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'

export const getHasDTSIPersonRoleEnded = ({ dateEnd }: { dateEnd: string | null | undefined }) => {
  if (!dateEnd) {
    return false
  }
  return isBefore(parseISO(dateEnd), new Date())
}

export const CURRENT_SESSION_OF_CONGRESS = 119
export const NEXT_SESSION_OF_CONGRESS = 120

export const getFormattedDTSIPersonRoleDateRange = ({
  dateEnd,
  dateStart,
  format = 'd LLLL, yyyy',
}: {
  dateStart: string
  dateEnd: string | null | undefined
  format?: string
}) => {
  return compact([dateStart, dateEnd])
    .map(date => dateFormat(parseISO(date), format))
    .join(' - ')
}

const GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP = {
  [SupportedCountryCodes.US]: usGetDTSIPersonRoleCategoryDisplayName,
  [SupportedCountryCodes.AU]: auGetDTSIPersonRoleCategoryDisplayName,
}

export const getRoleNameResolver = (countryCode: SupportedCountryCodes) => {
  return (
    GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP[
      countryCode as keyof typeof GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP
    ] || usGetDTSIPersonRoleCategoryDisplayName
  )
}

export type DTSIPersonRoleCategoryDisplayNameProps = Pick<
  DTSI_PersonRole,
  'roleCategory' | 'title' | 'status' | 'primaryState' | 'dateStart'
> & {
  group: null | undefined | { groupInstance: string }
}

export const getDTSIPersonRoleCategoryWithStateDisplayName = (
  role: Pick<
    DTSI_PersonRole,
    'status' | 'primaryState' | 'primaryCountryCode' | 'title' | 'roleCategory' | 'primaryDistrict'
  >,
) => {
  let stateStr = <></>
  if (role.primaryState && role.primaryCountryCode === 'US') {
    stateStr = (
      <>
        , <span className="max-sm:hidden">{role.primaryState}</span>
        <span className="sm:hidden">{getUSStateNameFromStateCode(role.primaryState)}</span>{' '}
        {role.primaryDistrict ? `${role.primaryDistrict} ` : ''}
      </>
    )
  }
  if (role.status !== DTSI_PersonRoleStatus.HELD) {
    return <>Political Figure{stateStr}</>
  }
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
      return <>Rep{stateStr}</>
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'President'
    case DTSI_PersonRoleCategory.SENATE:
      return <>Senator{stateStr}</>
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'Vice President'
  }
  return 'Political Figure'
}

export const getDTSIPersonRoleLocation = (
  role: Pick<
    DTSI_PersonRole,
    'primaryCity' | 'primaryCountryCode' | 'primaryDistrict' | 'primaryState' | 'roleCategory'
  >,
) => {
  // TODO: Understand how to handle intl cases here
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
    case DTSI_PersonRoleCategory.PRESIDENT:
    case DTSI_PersonRoleCategory.SENATE:
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return compact([
        role.primaryCity,
        role.primaryState && getUSStateNameFromStateCode(role.primaryState),
        role.primaryDistrict,
      ]).join(', ')
  }
  return null
}

export type NormalizedDTSIDistrictId = number | 'at-large'
export const normalizeDTSIDistrictId = (
  role: Pick<DTSI_PersonRole, 'primaryDistrict'>,
): NormalizedDTSIDistrictId => {
  if (!role.primaryDistrict) {
    return gracefullyError({
      msg: `Unexpected primaryDistrict ${role.primaryDistrict}`,
      fallback: 1,
      hint: { extra: { role } },
    })
  }
  if (role.primaryDistrict.toLowerCase() === 'at-large') {
    return 'at-large'
  }
  const asNumber = parseInt(role.primaryDistrict, 10)
  if (isNumber(asNumber)) {
    return asNumber
  }
  return gracefullyError({
    msg: `Unexpected primaryDistrict ${role.primaryDistrict}`,
    fallback: 1,
    hint: { extra: { role } },
  })
}

export const formatDTSIDistrictId = (district: NormalizedDTSIDistrictId) => {
  if (district === 'at-large') {
    return 'At-Large'
  }
  return withOrdinalSuffix(district)
}
