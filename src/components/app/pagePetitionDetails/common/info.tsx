import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'

interface PetitionDetailsInfoProps {
  content: string
}

export function PetitionDetailsInfo({ content }: PetitionDetailsInfoProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Info</h2>
      <StyledHtmlContent className="[&_*]:text-fontcolor-muted" html={content} />
    </section>
  )
}
