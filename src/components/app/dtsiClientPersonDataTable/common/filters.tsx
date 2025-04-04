'use client'

import { Column } from '@tanstack/react-table'

import {
  Person,
  PERSON_TABLE_COLUMNS_IDS,
} from '@/components/app/dtsiClientPersonDataTable/common/columns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/web/cn'

export enum StanceOnCryptoOptions {
  ALL = 'All',
  PRO_CRYPTO = 'Pro-crypto',
  ANTI_CRYPTO = 'Anti-crypto',
  NEUTRAL = 'Neutral',
  PENDING = 'Pending',
}

export function GlobalFilters({ children }: { children: React.ReactNode }) {
  // Styles get a little funky here so we can responsively support sideways scroll with the proper padding on mobile
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 pl-1 pr-3 pt-3 md:overflow-x-visible md:pb-0 md:pr-0 md:pt-0">
      {children}
    </div>
  )
}

function GlobalFiltersStanceOnCryptoSelect({
  namedColumns,
}: {
  namedColumns: Record<string, Column<Person>>
}) {
  return (
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
  )
}

GlobalFilters.StanceOnCryptoSelect = GlobalFiltersStanceOnCryptoSelect

function GlobalFiltersRoleSelect({
  namedColumns,
  roleOptions,
  getRoleOptionDisplayName,
}: {
  namedColumns: Record<string, Column<Person>>
  roleOptions: Record<string, string>
  getRoleOptionDisplayName: (role: string) => string
}) {
  return (
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
        {Object.values(roleOptions).map(role => (
          <SelectItem key={role} onClick={event => event.stopPropagation()} value={role}>
            {getRoleOptionDisplayName(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

GlobalFilters.RoleSelect = GlobalFiltersRoleSelect

function GlobalFiltersPartySelect({
  namedColumns,
  partyOptions,
  getPartyOptionDisplayName,
}: {
  namedColumns: Record<string, Column<Person>>
  partyOptions: Record<string, string>
  getPartyOptionDisplayName: (party: string) => string
}) {
  return (
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
        {Object.values(partyOptions).map(party => (
          <SelectItem key={party} onClick={event => event.stopPropagation()} value={party}>
            {getPartyOptionDisplayName(party)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

GlobalFilters.PartySelect = GlobalFiltersPartySelect

function GlobalFiltersStateSelect({
  namedColumns,
  stateOptions,
  locationLabel,
  getStateOptionDisplayName,
  triggerClassName,
}: {
  namedColumns: Record<string, Column<Person>>
  stateOptions: string[]
  locationLabel: string
  getStateOptionDisplayName: (state: string) => string
  triggerClassName?: string
}) {
  return (
    <Select
      onValueChange={(stance: StanceOnCryptoOptions) =>
        namedColumns?.[PERSON_TABLE_COLUMNS_IDS.STATE]?.setFilterValue(stance)
      }
      value={namedColumns?.[PERSON_TABLE_COLUMNS_IDS.STATE]?.getFilterValue() as string}
    >
      <SelectTrigger
        className={cn('w-[110px] flex-shrink-0', triggerClassName)}
        data-testid="state-filter-trigger"
      >
        <span className="mr-2 inline-block flex-shrink-0 font-bold">{locationLabel}</span>
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
            {getStateOptionDisplayName(state)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

GlobalFilters.StateSelect = GlobalFiltersStateSelect
