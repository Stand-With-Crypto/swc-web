'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'

export interface ComboBoxProps<T>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  inputValue: string
  onChangeInputValue: (val: string) => void
  options: T[]
  value: T | null
  onChange: (val: T | null) => void
  formatPopoverTrigger: (val: T | null) => React.ReactNode
  getOptionLabel: (val: T) => string
  getOptionKey: (val: T) => string
  popoverContentClassName?: string
}

export function Combobox<T>({
  value,
  onChange,
  formatPopoverTrigger,
  options,
  getOptionLabel,
  getOptionKey,
  popoverContentClassName,
  ...inputProps
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile({ defaultState: false })
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{formatPopoverTrigger(value)}</DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <StatusList
              setOpen={setOpen}
              {...{ value, onChange, options, getOptionLabel, getOptionKey, ...inputProps }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{formatPopoverTrigger(value)}</PopoverTrigger>
      <PopoverContent
        avoidCollisions={false}
        className={cn('p-0', popoverContentClassName)}
        align="start"
      >
        <StatusList
          setOpen={setOpen}
          {...{ value, onChange, options, getOptionLabel, getOptionKey, ...inputProps }}
        />
      </PopoverContent>
    </Popover>
  )
}

function StatusList<T>({
  setOpen,
  onChange,
  options,
  getOptionLabel,
  getOptionKey,
  value,
  inputValue,
  onChangeInputValue,
  ...inputProps
}: {
  setOpen: (open: boolean) => void
} & Pick<
  ComboBoxProps<T>,
  | 'inputValue'
  | 'onChangeInputValue'
  | 'options'
  | 'value'
  | 'onChange'
  | 'getOptionLabel'
  | 'getOptionKey'
>) {
  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Filter status..."
        onValueChange={onChangeInputValue}
        value={inputValue}
        {...inputProps}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map(option => {
            const key = getOptionKey(option)
            console.log({
              key,
              value,
              getOptionKey: value && getOptionKey(value),
              foo: value && getOptionKey(value) === key,
            })
            return (
              <CommandItem
                key={key}
                value={key}
                onSelect={() => {
                  onChange(options.find(x => getOptionKey(x) === key) || null)
                  setOpen(false)
                }}
              >
                {getOptionLabel(option)}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
