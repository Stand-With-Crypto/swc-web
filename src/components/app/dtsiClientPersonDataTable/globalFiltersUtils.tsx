'use client'
import { useMemo } from 'react'
import { isNil } from 'lodash-es'

import { Person } from '@/components/app/dtsiClientPersonDataTable/columns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export enum StanceOnCryptoOptions {
  ALL = 'All',
  PRO_CRYPTO = 'Pro-crypto',
  ANTI_CRYPTO = 'Anti-crypto',
  NEUTRAL = 'Neutral',
  PENDING = 'Pending',
}
export const PARTY_OPTIONS = {
  ALL: 'All',
  REPUBLICAN: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  DEMOCRAT: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
}
export function getPartyOptionDisplayName(party: string) {
  switch (party) {
    case PARTY_OPTIONS.REPUBLICAN:
      return 'Republican'
    case PARTY_OPTIONS.DEMOCRAT:
      return 'Democrat'
    default:
      return 'All'
  }
}
export const ROLE_OPTIONS = {
  ALL: 'All',
  SENATE: DTSI_PersonRoleCategory.SENATE,
  CONGRESS: DTSI_PersonRoleCategory.CONGRESS,
  ALL_OTHER: 'ALL_OTHER',
}
export function getRoleOptionDisplayName(role: string) {
  switch (role) {
    case ROLE_OPTIONS.ALL_OTHER:
      return 'Other Political Figure'
    case ROLE_OPTIONS.SENATE:
      return 'Senator'
    case ROLE_OPTIONS.CONGRESS:
      return 'Representative'
    default:
      return 'All'
  }
}

enum GlobalFilterKeys {
  Role = 'role',
  Party = 'party',
  Stance = 'stance',
  State = 'state',
}

export interface IGlobalFilters {
  [GlobalFilterKeys.Role]: (typeof ROLE_OPTIONS)[keyof typeof ROLE_OPTIONS]
  [GlobalFilterKeys.Party]: (typeof PARTY_OPTIONS)[keyof typeof PARTY_OPTIONS]
  [GlobalFilterKeys.Stance]: StanceOnCryptoOptions
  [GlobalFilterKeys.State]: 'All' | keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
}

export const getGlobalFilterDefaults = (): IGlobalFilters => ({
  role: ROLE_OPTIONS.ALL,
  party: PARTY_OPTIONS.ALL,
  stance: StanceOnCryptoOptions.ALL,
  state: 'All',
})

export function GlobalFilters({
  globalFilter,
  setGlobalFilter,
}: {
  globalFilter: IGlobalFilters
  setGlobalFilter: React.Dispatch<React.SetStateAction<IGlobalFilters>>
}) {
  const stateOptions = useMemo(() => {
    return ['All', ...Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).sort()]
  }, [])

  const onChangeGlobalFilter = (patch: Partial<IGlobalFilters>) => {
    setGlobalFilter(prev => ({
      ...prev,
      ...patch,
    }))
  }

  // Styles get a little funky here so we can responsively support sideways scroll with the proper padding on mobile
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 pl-1 pr-3 pt-3 md:overflow-x-visible md:pb-0 md:pr-0 md:pt-0">
      <Select
        onValueChange={(stance: StanceOnCryptoOptions) => onChangeGlobalFilter({ stance })}
        value={globalFilter.stance}
      >
        <SelectTrigger className="w-[195px] flex-shrink-0" data-testid="stance-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Stance on crypto</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          ref={ref => {
            if (!ref) return
            ref.ontouchend = e => {
              e.preventDefault()
            }
          }}
        >
          {Object.values(StanceOnCryptoOptions).map(stance => (
            <SelectItem key={stance} onClick={event => event.stopPropagation()} value={stance}>
              {stance}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={role => onChangeGlobalFilter({ role })} value={globalFilter.role}>
        <SelectTrigger className="w-[130px] flex-shrink-0" data-testid="role-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Role</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          ref={ref => {
            if (!ref) return
            ref.ontouchend = e => {
              e.preventDefault()
            }
          }}
        >
          {Object.values(ROLE_OPTIONS).map(role => (
            <SelectItem key={role} onClick={event => event.stopPropagation()} value={role}>
              {getRoleOptionDisplayName(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={party => onChangeGlobalFilter({ party })} value={globalFilter.party}>
        <SelectTrigger className="w-[120px] flex-shrink-0" data-testid="party-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Party</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          ref={ref => {
            if (!ref) return
            ref.ontouchend = e => {
              e.preventDefault()
            }
          }}
        >
          {Object.values(PARTY_OPTIONS).map(party => (
            <SelectItem key={party} onClick={event => event.stopPropagation()} value={party}>
              {getPartyOptionDisplayName(party)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(state: typeof globalFilter.state) => onChangeGlobalFilter({ state })}
        value={globalFilter.state}
      >
        <SelectTrigger className="w-[110px] flex-shrink-0" data-testid="state-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">State</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          ref={ref => {
            if (!ref) return
            ref.ontouchend = e => {
              e.preventDefault()
            }
          }}
        >
          {stateOptions.map(state => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function filterDataViaGlobalFilters<TData extends Person>(
  passedData: TData[],
  globalFilter: IGlobalFilters,
) {
  const FILTER_FN_BY_FIELD = {
    [GlobalFilterKeys.Stance]: (
      record: TData,
      filterValue: IGlobalFilters[GlobalFilterKeys.Stance],
    ) => {
      if (filterValue === StanceOnCryptoOptions.ALL) {
        return true
      }
      const scoreToUse = record.manuallyOverriddenStanceScore ?? record.computedStanceScore
      if (filterValue === StanceOnCryptoOptions.PENDING) {
        return isNil(scoreToUse)
      }
      if (filterValue === StanceOnCryptoOptions.NEUTRAL) {
        return scoreToUse === 50
      }
      const stance =
        !scoreToUse || scoreToUse === 50
          ? null
          : scoreToUse > 50
            ? StanceOnCryptoOptions.PRO_CRYPTO
            : StanceOnCryptoOptions.ANTI_CRYPTO
      return stance === filterValue
    },
    [GlobalFilterKeys.Role]: (
      record: TData,
      filterValue: IGlobalFilters[GlobalFilterKeys.Role],
    ) => {
      if (filterValue === ROLE_OPTIONS.ALL) {
        return true
      }
      if ([ROLE_OPTIONS.SENATE, ROLE_OPTIONS.CONGRESS].includes(filterValue)) {
        return (
          filterValue === record.primaryRole?.roleCategory &&
          record.primaryRole?.status === DTSI_PersonRoleStatus.HELD
        )
      }
      return (
        !record.primaryRole?.roleCategory ||
        ![DTSI_PersonRoleCategory.SENATE, DTSI_PersonRoleCategory.CONGRESS].includes(
          record.primaryRole?.roleCategory,
        ) ||
        record.primaryRole?.status !== DTSI_PersonRoleStatus.HELD
      )
    },
    [GlobalFilterKeys.Party]: (
      record: TData,
      filterValue: IGlobalFilters[GlobalFilterKeys.Party],
    ) => {
      return (
        filterValue === PARTY_OPTIONS.ALL || filterValue === record.politicalAffiliationCategory
      )
    },
    [GlobalFilterKeys.State]: (
      record: TData,
      filterValue: IGlobalFilters[GlobalFilterKeys.State],
    ) => {
      return filterValue === 'All' || record.primaryRole?.primaryState === filterValue
    },
  }

  return passedData.filter(record => {
    if (
      !FILTER_FN_BY_FIELD[GlobalFilterKeys.Stance](record, globalFilter[GlobalFilterKeys.Stance])
    ) {
      return false
    }
    if (!FILTER_FN_BY_FIELD[GlobalFilterKeys.Role](record, globalFilter[GlobalFilterKeys.Role])) {
      return false
    }
    if (!FILTER_FN_BY_FIELD[GlobalFilterKeys.Party](record, globalFilter[GlobalFilterKeys.Party])) {
      return false
    }
    if (!FILTER_FN_BY_FIELD[GlobalFilterKeys.State](record, globalFilter[GlobalFilterKeys.State])) {
      return false
    }
    return true
  })
}
