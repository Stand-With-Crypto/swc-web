import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { cn } from '@/utils/web/cn'

interface ToolkitSectionProps {
  heading: string
  subtext: string
  children?: React.ReactNode
  headingClassName?: string
  sectionClassName?: string
}

export function ToolkitSection({
  heading,
  subtext,
  children,
  headingClassName,
  sectionClassName,
}: ToolkitSectionProps) {
  return (
    <section className={cn('mt-10', sectionClassName)}>
      <div className="container flex flex-col items-center gap-4">
        <PageSubTitle className={cn('font-medium text-foreground', headingClassName)} size="md">
          {heading}
        </PageSubTitle>
        <p className="text-center font-mono text-base text-muted-foreground">{subtext}</p>
      </div>
      {children && <div className="mt-6 flex items-center justify-center">{children}</div>}
    </section>
  )
}
