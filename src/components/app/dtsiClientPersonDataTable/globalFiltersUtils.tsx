'use client'
import { useMemo } from 'react'
import { Column, ColumnFiltersState } from '@tanstack/react-table'

import {
  Person,
  PERSON_TABLE_COLUMNS_IDS,
} from '@/components/app/dtsiClientPersonDataTable/columns'
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
} from '@/data/dtsi/generated'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'

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
function getPartyOptionDisplayName(party: string) {
  switch (party) {
    case PARTY_OPTIONS.REPUBLICAN:
      return 'Republican'
    case PARTY_OPTIONS.DEMOCRAT:
      return 'Democratic'
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
function getRoleOptionDisplayName(role: string) {
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

export const getGlobalFilterDefaults = (): ColumnFiltersState => [
  {
    id: PERSON_TABLE_COLUMNS_IDS.STANCE,
    value: StanceOnCryptoOptions.ALL,
  },
  {
    id: PERSON_TABLE_COLUMNS_IDS.ROLE,
    value: ROLE_OPTIONS.ALL,
  },
  {
    id: PERSON_TABLE_COLUMNS_IDS.PARTY,
    value: PARTY_OPTIONS.ALL,
  },
  {
    id: PERSON_TABLE_COLUMNS_IDS.STATE,
    value: 'All',
  },
]

interface GlobalFilterProps<TData extends Person = Person> {
  columns: Column<TData>[]
}

const stateOptions = ['All', ...Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).sort()]

export function GlobalFilters<TData extends Person = Person>({
  columns,
}: GlobalFilterProps<TData>) {
  const namedColumns = useMemo(() => {
    const ids: Record<string, Column<TData>> = {}
    columns.forEach(col => {
      ids[col?.id] = col
    })
    return ids
  }, [columns])

  // Styles get a little funky here so we can responsively support sideways scroll with the proper padding on mobile
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 pl-1 pr-3 pt-3 md:overflow-x-visible md:pb-0 md:pr-0 md:pt-0">
      <Select
        onValueChange={(stance: StanceOnCryptoOptions) =>
          namedColumns?.[PERSON_TABLE_COLUMNS_IDS.STANCE]?.setFilterValue(stance)
        }
        value={namedColumns?.[PERSON_TABLE_COLUMNS_IDS.STANCE]?.getFilterValue() as string}
      >
        <SelectTrigger className="w-[195px] flex-shrink-0" data-testid="stance-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Stance on crypto</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          // Short term fix to prevent clicking on the politician table row when user selects an option from the select menu.
          // Issue is from radix-ui https://github.com/radix-ui/primitives/issues/1658
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

      <Select
        onValueChange={(stance: StanceOnCryptoOptions) =>
          namedColumns?.[PERSON_TABLE_COLUMNS_IDS.ROLE]?.setFilterValue(stance)
        }
        value={namedColumns?.[PERSON_TABLE_COLUMNS_IDS.ROLE]?.getFilterValue() as string}
      >
        <SelectTrigger className="w-[130px] flex-shrink-0" data-testid="role-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Role</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          // Short term fix to prevent clicking on the politician table row when user selects an option from the select menu.
          // Issue is from radix-ui https://github.com/radix-ui/primitives/issues/1658
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

      <Select
        onValueChange={(stance: StanceOnCryptoOptions) =>
          namedColumns?.[PERSON_TABLE_COLUMNS_IDS.PARTY]?.setFilterValue(stance)
        }
        value={namedColumns?.[PERSON_TABLE_COLUMNS_IDS.PARTY]?.getFilterValue() as string}
      >
        <SelectTrigger className="w-[120px] flex-shrink-0" data-testid="party-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Party</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          // Short term fix to prevent clicking on the politician table row when user selects an option from the select menu.
          // Issue is from radix-ui https://github.com/radix-ui/primitives/issues/1658
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
        onValueChange={(stance: StanceOnCryptoOptions) =>
          namedColumns?.[PERSON_TABLE_COLUMNS_IDS.STATE]?.setFilterValue(stance)
        }
        value={namedColumns?.[PERSON_TABLE_COLUMNS_IDS.STATE]?.getFilterValue() as string}
      >
        <SelectTrigger className="w-[110px] flex-shrink-0" data-testid="state-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">State</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          // Short term fix to prevent clicking on the politician table row when user selects an option from the select menu.
          // Issue is from radix-ui https://github.com/radix-ui/primitives/issues/1658
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
