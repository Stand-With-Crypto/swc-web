import { format as dateFormat, isBefore, parseISO } from 'date-fns'
import { compact, isNumber } from 'lodash-es'

import {
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { auGetIsRoleInFuture } from '@/utils/dtsi/au/auGetIsRoleInFuture'
import { caGetIsRoleInFuture } from '@/utils/dtsi/ca/caGetIsRoleInFuture'
import { gbGetIsRoleInFuture } from '@/utils/dtsi/gb/gbGetIsRoleInFuture'
import { usGetIsRoleInFuture } from '@/utils/dtsi/us/usGetIsRoleInFuture'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { withOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'

export const getHasDTSIPersonRoleEnded = ({ dateEnd }: { dateEnd: string | null | undefined }) => {
  if (!dateEnd) {
    return false
  }
  return isBefore(parseISO(dateEnd), new Date())
}

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

const COMMON_ROLE_DISPLAY_NAME_MAP = {
  [DTSI_PersonRoleCategory.PRESIDENT]: 'President',
  [DTSI_PersonRoleCategory.SENATE]: 'Senator',
  [DTSI_PersonRoleCategory.VICE_PRESIDENT]: 'Vice President',
  [DTSI_PersonRoleCategory.ATTORNEY_GENERAL]: 'Attorney General',
  [DTSI_PersonRoleCategory.GOVERNOR]: 'Governor',
  [DTSI_PersonRoleCategory.MAYOR]: 'Mayor',
}

export const getRoleNameResolver = (countryCode: SupportedCountryCodes) => {
  const GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP = {
    [SupportedCountryCodes.US]: (role: DTSIPersonRoleCategoryDisplayNameProps) => {
      if (role.status !== DTSI_PersonRoleStatus.HELD || usGetIsRoleInFuture(role)) {
        return 'Political Figure'
      }
      const roleDisplayNames = {
        [DTSI_PersonRoleCategory.CONGRESS]: 'Congressperson',
        [DTSI_PersonRoleCategory.STATE_CONGRESS]: 'State Congressperson',
        [DTSI_PersonRoleCategory.STATE_SENATE]: 'State Senator',
        [DTSI_PersonRoleCategory.COMMITTEE_CHAIR]: 'Committee Chair',
        [DTSI_PersonRoleCategory.COMMITTEE_MEMBER]: 'Committee Member',
        ...COMMON_ROLE_DISPLAY_NAME_MAP,
      }

      return (
        roleDisplayNames[role.roleCategory as keyof typeof roleDisplayNames] || 'Political Figure'
      )
    },
    [SupportedCountryCodes.AU]: (role: DTSIPersonRoleCategoryDisplayNameProps) => {
      if (role.status !== DTSI_PersonRoleStatus.HELD || auGetIsRoleInFuture(role)) {
        return 'Candidate'
      }
      const roleDisplayNames = {
        [DTSI_PersonRoleCategory.CONGRESS]: 'Member of Parliament',
        [DTSI_PersonRoleCategory.HOUSE_OF_COMMONS]: 'House of Representatives Member',
        ...COMMON_ROLE_DISPLAY_NAME_MAP,
      }
      return roleDisplayNames[role.roleCategory as keyof typeof roleDisplayNames] || 'Candidate'
    },
    [SupportedCountryCodes.CA]: (role: DTSIPersonRoleCategoryDisplayNameProps) => {
      if (role.status !== DTSI_PersonRoleStatus.HELD || caGetIsRoleInFuture(role)) {
        return 'Candidate'
      }
      const roleDisplayNames = {
        [DTSI_PersonRoleCategory.CONGRESS]: 'Congressperson',
        [DTSI_PersonRoleCategory.HOUSE_OF_COMMONS]: 'House of Commons Member',
        ...COMMON_ROLE_DISPLAY_NAME_MAP,
      }
      return roleDisplayNames[role.roleCategory as keyof typeof roleDisplayNames] || 'Candidate'
    },
    [SupportedCountryCodes.GB]: (role: DTSIPersonRoleCategoryDisplayNameProps) => {
      if (role.status !== DTSI_PersonRoleStatus.HELD || gbGetIsRoleInFuture(role)) {
        return 'Candidate'
      }
      const roleDisplayNames = {
        [DTSI_PersonRoleCategory.HOUSE_OF_LORDS]: 'House of Lords Member',
        [DTSI_PersonRoleCategory.HOUSE_OF_COMMONS]: 'House of Commons Member',
        ...COMMON_ROLE_DISPLAY_NAME_MAP,
      }
      return roleDisplayNames[role.roleCategory as keyof typeof roleDisplayNames] || 'Candidate'
    },
  }

  return (
    GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP[
      countryCode as keyof typeof GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP
    ] || GET_ROLE_DISPLAY_NAME_BY_COUNTRY_CODE_MAP[DEFAULT_SUPPORTED_COUNTRY_CODE]
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
  countryCode: SupportedCountryCodes,
) => {
  let stateStr = <></>

  const stateNameResolver = getStateNameResolver(countryCode)

  if (role.primaryState) {
    stateStr = (
      <>
        , <span className="max-sm:hidden">{role.primaryState}</span>
        <span className="sm:hidden">{stateNameResolver(role.primaryState)}</span>{' '}
        {role.primaryDistrict && countryCode === SupportedCountryCodes.US
          ? `${role.primaryDistrict} `
          : ''}
      </>
    )
  }
  if (role.status !== DTSI_PersonRoleStatus.HELD) {
    return <>Political Figure{stateStr}</>
  }
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
      if (countryCode === SupportedCountryCodes.AU) {
        return <>MP{stateStr}</>
      }
      return <>Rep{stateStr}</>
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'President'
    case DTSI_PersonRoleCategory.GOVERNOR:
      return <>Governor{stateStr}</>
    case DTSI_PersonRoleCategory.ATTORNEY_GENERAL:
      return <>Attorney General{stateStr}</>
    case DTSI_PersonRoleCategory.SENATE:
      return <>Senator{stateStr}</>
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'Vice President'
    case DTSI_PersonRoleCategory.HOUSE_OF_COMMONS:
      return <>MP{stateStr}</>
    case DTSI_PersonRoleCategory.HOUSE_OF_LORDS:
      return <>MP{stateStr}</>
  }
  return 'Political Figure'
}

export const getDTSIPersonRoleLocation = (
  role: Pick<
    DTSI_PersonRole,
    'primaryCity' | 'primaryCountryCode' | 'primaryDistrict' | 'primaryState' | 'roleCategory'
  >,
) => {
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
    case DTSI_PersonRoleCategory.ATTORNEY_GENERAL:
    case DTSI_PersonRoleCategory.GOVERNOR:
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
