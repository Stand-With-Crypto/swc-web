import { cn } from '@/utils/web/cn'

export function CheckIcon({
  completed,
  svgClassname,
}: {
  completed?: boolean
  svgClassname?: string
}) {
  return (
    <svg
      className={cn('rounded-full', svgClassname)}
      fill="none"
      height="32"
      viewBox="0 0 32 32"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="16"
        cy="16"
        fill={completed ? '#6100FF' : '#BFC4CF'}
        r="16"
        stroke="var(--muted-foreground)"
        strokeWidth="2"
      />
      <path
        d="M21.7869 12.5436L13.787 21.1768L9.61328 16.6726L10.7869 15.5851L13.787 18.8228L20.6133 11.4561L21.7869 12.5436Z"
        fill="white"
      />
    </svg>
  )
}
