import { format as dateFormat, isBefore, parseISO } from 'date-fns'
import { compact, isNumber, sortBy } from 'lodash-es'

import {
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { safeStringify } from '@/utils/web/safeStringify'
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

export const getDTSIPersonRoleCategoryDisplayName = (
  role: Pick<DTSI_PersonRole, 'roleCategory' | 'title' | 'status' | 'primaryState'>,
) => {
  if (role.status !== DTSI_PersonRoleStatus.HELD) {
    if (!role.primaryState) {
      return 'National Political Figure'
    }
    return 'Key Political Figure'
  }
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
      return 'Congressperson'
    case DTSI_PersonRoleCategory.GOVERNOR:
      return 'Governor'
    case DTSI_PersonRoleCategory.MAYOR:
      return 'Mayor'
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'President'
    case DTSI_PersonRoleCategory.SENATE:
      return 'Senator'
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'Vice President'
  }
  return role.title
}

export const getDTSIPersonRoleCategoryWithStateDisplayName = (
  role: Pick<
    DTSI_PersonRole,
    'status' | 'primaryState' | 'primaryCountryCode' | 'title' | 'roleCategory'
  >,
) => {
  if (role.status !== DTSI_PersonRoleStatus.HELD) {
    if (!role.primaryState) {
      return 'National Political Figure'
    }
    return 'Key Political Figure'
  }
  let stateStr = ''
  if (role.primaryState && role.primaryCountryCode === 'US') {
    stateStr = `, ${getUSStateNameFromStateCode(role.primaryState)} `
  }
  switch (role.roleCategory) {
    case DTSI_PersonRoleCategory.CONGRESS:
      return `Congressperson${stateStr}`
    case DTSI_PersonRoleCategory.GOVERNOR:
      return 'Governor'
    case DTSI_PersonRoleCategory.MAYOR:
      return 'Mayor'
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'President'
    case DTSI_PersonRoleCategory.SENATE:
      return `Senator${stateStr}`
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'Vice President'
  }
  return role.title
}

export const getDTSIPersonRoleLocation = (
  role: Pick<
    DTSI_PersonRole,
    'primaryCity' | 'primaryCountryCode' | 'primaryDistrict' | 'primaryState'
  >,
) => {
  return compact([
    role.primaryCity,
    role.primaryState && getUSStateNameFromStateCode(role.primaryState),
    role.primaryDistrict,
  ]).join(', ')
}

const DTSI_PERSON_ROLE_IMPORTANCE = [
  DTSI_PersonRoleCategory.PRESIDENT,
  DTSI_PersonRoleCategory.VICE_PRESIDENT,
  DTSI_PersonRoleCategory.SENATE,
  DTSI_PersonRoleCategory.CONGRESS,
  DTSI_PersonRoleCategory.GOVERNOR,
  DTSI_PersonRoleCategory.MAYOR,
  DTSI_PersonRoleCategory.STATE_SENATE,
  DTSI_PersonRoleCategory.STATE_CONGRESS,
  DTSI_PersonRoleCategory.COMMITTEE_MEMBER,
  DTSI_PersonRoleCategory.COMMITTEE_CHAIR,
]

export const orderDTSIPersonRolesByImportance = <
  T extends {
    roleCategory: DTSI_PersonRoleCategory | null | undefined
    dateStart: string
    dateEnd: string | null | undefined
  },
>(
  roles: Array<T>,
) => {
  const byDateStart = sortBy([...roles], x => -1 * new Date(x.dateStart).getTime())
  const byImportance = [...byDateStart]
  byImportance.sort((role1, role2) => {
    if (role1.roleCategory === role2.roleCategory) {
      return 0
    }
    for (const role of DTSI_PERSON_ROLE_IMPORTANCE) {
      if (role1.roleCategory === role) {
        return -1
      }
      if (role2.roleCategory === role) {
        return 1
      }
    }
    if (!!role2.dateEnd !== !!role1.dateEnd) {
      return role1.dateEnd ? 1 : -1
    }
    return 0
  })
  return { byImportance, byDateStart }
}

export const CURRENT_SESSION_OF_CONGRESS = 118
export const NEXT_SESSION_OF_CONGRESS = 119

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
