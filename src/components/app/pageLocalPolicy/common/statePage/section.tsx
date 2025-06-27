import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

interface SectionProps extends React.PropsWithChildren {
  container?: boolean
  className?: string
}

interface SectionSubTitleProps extends React.PropsWithChildren {
  className?: string
}

export function Section({ children, container = true, className }: SectionProps) {
  return (
    <section className={cn(container && 'container', 'mt-32 md:mt-36', className)}>
      {children}
    </section>
  )
}

export function SectionTitle({ children }: React.PropsWithChildren) {
  return (
    <PageTitle as="h3" className="mb-6 !text-[32px]">
      {children}
    </PageTitle>
  )
}
Section.Title = SectionTitle

export function SectionSubTitle({ children, className }: SectionSubTitleProps) {
  return (
    <PageSubTitle as="h4" className={cn('mb-10', className)}>
      {children}
    </PageSubTitle>
  )
}
Section.SubTitle = SectionSubTitle
