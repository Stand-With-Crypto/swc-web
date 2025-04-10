'use client'

import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { FormErrorMessage, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/web/cn'

interface PollItemProps {
  value: string
  displayName: string
  isMultiple: boolean
  isFormDisabled: boolean
  maxNumberOfOptions: number
  shouldShowOtherField?: boolean
}

export function PollItem({
  value,
  displayName,
  isMultiple,
  isFormDisabled,
  maxNumberOfOptions,
  shouldShowOtherField,
}: PollItemProps) {
  const { register, control, setValue, clearErrors } = useFormContext()
  const selectedAnswers = useWatch({ control, name: 'answers' })

  const isItemSelected = selectedAnswers.includes(value)
  const isDisabled = isMultiple
    ? isFormDisabled ||
      (maxNumberOfOptions > 0 && selectedAnswers.length >= maxNumberOfOptions && !isItemSelected)
    : isFormDisabled || isItemSelected

  const isOtherSelected =
    selectedAnswers &&
    (Array.isArray(selectedAnswers)
      ? selectedAnswers.includes('other')
      : selectedAnswers === 'other')

  const isOtherFieldDisabled =
    (maxNumberOfOptions > 0 &&
      selectedAnswers.length >= maxNumberOfOptions &&
      !selectedAnswers.includes('other')) ||
    isFormDisabled

  useEffect(() => {
    if (!isOtherSelected) {
      setValue('otherValue', '')
      clearErrors('otherValue')
    }
  }, [isOtherSelected, setValue, clearErrors])

  return (
    <Label
      className={cn(
        'flex h-auto min-h-14 cursor-pointer flex-col justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-base font-medium leading-6 text-muted-foreground hover:bg-gray-200',
        isItemSelected && 'text-foreground',
        isDisabled && 'cursor-default hover:bg-gray-100',
      )}
      key={value}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMultiple ? (
            <FormField
              control={control}
              name="answers"
              render={({ field }) => (
                <Checkbox
                  checked={field.value?.includes(value)}
                  className="h-5 w-5 cursor-pointer rounded-sm border-2 border-gray-400 bg-secondary data-[state=checked]:border-primary-cta data-[state=checked]:bg-primary-cta data-[state=checked]:text-primary-cta-foreground"
                  disabled={isDisabled}
                  onCheckedChange={checked => {
                    const newValue = checked
                      ? [...(field.value || []), value]
                      : field.value?.filter((v: string) => v !== value)
                    field.onChange(newValue)
                  }}
                />
              )}
            />
          ) : (
            <Input
              className="hidden"
              {...register('answers')}
              disabled={isDisabled}
              type="radio"
              value={value}
            />
          )}
          <span className="py-2">{displayName}</span>
        </div>
        {!isMultiple && isItemSelected && (
          <div className="relative h-4 w-4">
            <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
          </div>
        )}
      </div>

      <Collapsible open={shouldShowOtherField && isOtherSelected}>
        <CollapsibleContent className="AnimateCollapsibleContent">
          <FormField
            control={control}
            name="otherValue"
            render={({ field }) => (
              <FormItem>
                <Input
                  className="w-full rounded-lg border px-4 py-2 focus:border-gray-400 focus:outline-none"
                  disabled={isOtherFieldDisabled}
                  placeholder="Please specify"
                  type="text"
                  {...field}
                />
                <FormErrorMessage />
              </FormItem>
            )}
            rules={{ required: 'Text input required.' }}
          />
        </CollapsibleContent>
      </Collapsible>
    </Label>
  )
}
