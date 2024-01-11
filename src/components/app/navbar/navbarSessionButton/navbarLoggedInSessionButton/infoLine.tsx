import { NextImage } from '@/components/ui/image'
import { Label } from '@/components/ui/label'

interface InfoLineProps {
  label: string
  value?: React.ReactNode
  image?: {
    src: string
    alt: string
  }
}

export function InfoLine({ label, image, value }: InfoLineProps) {
  return (
    <div className="space-y-2 text-start">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {image && (
          <div className="rounded-full bg-secondary p-2">
            <NextImage src={image.src} alt={image.alt} width={12} height={12} />
          </div>
        )}

        <span className="font-semibold">{value}</span>
      </div>
    </div>
  )
}
