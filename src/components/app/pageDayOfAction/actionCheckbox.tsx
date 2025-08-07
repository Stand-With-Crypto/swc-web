import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { cn } from '@/utils/web/cn'

interface ActionCheckboxProps {
  title: string
  description: string
  completed: boolean
}

export function ActionCheckbox({ title, description, completed }: ActionCheckboxProps) {
  return (
    <button
      className={cn(
        'h-full w-full cursor-pointer rounded-3xl border border-muted shadow-md transition-shadow hover:shadow-lg',
      )}
    >
      <div className="flex h-auto w-full items-center gap-4 p-6">
        <div className="h-8 w-8">
          <CheckIcon
            completed={completed}
            svgClassname="h-8 w-8 border-background box-content bg-muted"
          />
        </div>
        <div className="flex flex-col gap-1">
          <strong className="text-left font-sans text-sm font-bold">{title}</strong>
          <p className="text-left text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  )
}
