import { Dot } from 'lucide-react'

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div className="border-fontcolor-primary h-16 w-16 animate-spin rounded-full border-4">
        <Dot className="relative top-[40px] h-[30px] w-[30px] text-blue-500" />
      </div>
    </div>
  )
}
