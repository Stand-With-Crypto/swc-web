import { useFormContext } from 'react-hook-form'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/web/cn'

interface PollItemProps {
  isChecked: boolean
  isDisabled: boolean
  value: string
  displayName: string
  multiple: boolean
}

export function PollItem({ isChecked, isDisabled, value, displayName, multiple }: PollItemProps) {
  const { register } = useFormContext()

  return (
    <Label
      className={cn(
        'flex h-14 cursor-pointer items-center justify-between rounded-2xl bg-gray-100 px-4 py-2 text-base font-medium leading-6 text-muted-foreground hover:bg-gray-200',
        isChecked && 'text-foreground',
        isDisabled && 'hover:none cursor-default',
      )}
      key={value}
    >
      <div className="flex items-center gap-4">
        <Input
          className={multiple ? 'h-5 w-5 cursor-pointer' : 'hidden'}
          {...register('answers')}
          disabled={isDisabled}
          type={multiple ? 'checkbox' : 'radio'}
          value={value}
        />
        <span>{displayName}</span>
      </div>
      {isChecked && (
        <div className="relative h-4 w-4">
          <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
        </div>
      )}
    </Label>
  )
}

interface PollItemOtherProps extends PollItemProps {
  isOtherSelected: boolean
  isOtherFieldDisabled: boolean
}

export function PollItemOther({
  value,
  displayName,
  multiple,
  isOtherSelected,
  isOtherFieldDisabled,
}: PollItemOtherProps) {
  const { register } = useFormContext()

  return (
    <Label
      className={cn(
        'flex h-auto min-h-14 cursor-pointer flex-col justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-base font-medium leading-6 text-muted-foreground hover:bg-gray-200',
        isOtherSelected && 'text-foreground',
        isOtherFieldDisabled && 'hover:none cursor-default',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            type={multiple ? 'checkbox' : 'radio'}
            {...register('answers')}
            className="h-5 w-5 cursor-pointer"
            disabled={isOtherFieldDisabled}
            value={value}
          />
          <span className="py-2">{displayName}</span>
        </div>
        {isOtherSelected && (
          <div className="relative h-4 w-4">
            <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
          </div>
        )}
      </div>
      {isOtherSelected && (
        <Input
          className="w-full rounded-lg border px-4 py-2 focus:border-gray-400 focus:outline-none"
          {...register('otherValue')}
          disabled={isOtherFieldDisabled}
          placeholder="Please specify"
          type="text"
        />
      )}
    </Label>
  )
}
