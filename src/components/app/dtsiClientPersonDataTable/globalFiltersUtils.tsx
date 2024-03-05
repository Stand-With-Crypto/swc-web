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
export interface GlobalFilters {
  role: (typeof ROLE_OPTIONS)[keyof typeof ROLE_OPTIONS]
  party: (typeof PARTY_OPTIONS)[keyof typeof PARTY_OPTIONS]
  stance: StanceOnCryptoOptions
  state: 'All' | keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
}

export const getGlobalFilterDefaults = (): GlobalFilters => ({
  role: ROLE_OPTIONS.ALL,
  party: PARTY_OPTIONS.ALL,
  stance: StanceOnCryptoOptions.ALL,
  state: 'All',
})

export function GlobalFilters({
  globalFilter,
  setGlobalFilter,
}: {
  globalFilter: GlobalFilters
  setGlobalFilter: React.Dispatch<React.SetStateAction<GlobalFilters>>
}) {
  const stateOptions = useMemo(() => {
    return ['All', ...Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).sort()]
  }, [])

  const onChangeGlobalFilter = (patch: Partial<GlobalFilters>) => {
    setGlobalFilter({
      ...getGlobalFilterDefaults(),
      ...patch,
    })
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
        <SelectContent>
          {Object.values(StanceOnCryptoOptions).map(stance => (
            <SelectItem key={stance} value={stance}>
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
        <SelectContent>
          {Object.values(ROLE_OPTIONS).map(role => (
            <SelectItem key={role} value={role}>
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
        <SelectContent>
          {Object.values(PARTY_OPTIONS).map(party => (
            <SelectItem key={party} value={party}>
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
        <SelectContent>
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
  globalFilter: GlobalFilters,
) {
  return passedData.filter(x => {
    if (globalFilter.stance !== StanceOnCryptoOptions.ALL) {
      const scoreToUse = x.manuallyOverriddenStanceScore ?? x.computedStanceScore
      if (globalFilter.stance === StanceOnCryptoOptions.PENDING) {
        return isNil(scoreToUse)
      }
      if (globalFilter.stance === StanceOnCryptoOptions.NEUTRAL) {
        return scoreToUse === 50
      }
      const stance =
        !scoreToUse || scoreToUse === 50
          ? null
          : scoreToUse > 50
            ? StanceOnCryptoOptions.PRO_CRYPTO
            : StanceOnCryptoOptions.ANTI_CRYPTO
      if (stance !== globalFilter.stance) {
        return false
      }
    }
    if (globalFilter.role !== ROLE_OPTIONS.ALL) {
      if ([ROLE_OPTIONS.SENATE, ROLE_OPTIONS.CONGRESS].includes(globalFilter.role)) {
        return (
          globalFilter.role === x.primaryRole?.roleCategory &&
          x.primaryRole?.status === DTSI_PersonRoleStatus.HELD
        )
      }
      return (
        !x.primaryRole?.roleCategory ||
        ![DTSI_PersonRoleCategory.SENATE, DTSI_PersonRoleCategory.CONGRESS].includes(
          x.primaryRole?.roleCategory,
        ) ||
        x.primaryRole?.status !== DTSI_PersonRoleStatus.HELD
      )
    }
    if (
      globalFilter.party !== PARTY_OPTIONS.ALL &&
      globalFilter.party !== x.politicalAffiliationCategory
    ) {
      return false
    }
    if (globalFilter.state !== 'All' && globalFilter.state !== x.primaryRole?.primaryState) {
      return false
    }
    return true
  })
}
