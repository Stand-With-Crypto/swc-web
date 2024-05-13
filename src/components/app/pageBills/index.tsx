import { BillCard } from '@/components/app/billCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface PageBillsProps {
  title: string
  description: string
}

export function PageBills(props: PageBillsProps) {
  const { title, description } = props

  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="space-y-7 text-center">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </section>

      <section>
        <div className="flex flex-col gap-4">
          <BillCard
            bill={{
              name: 'Bill 1',
              description: 'This is a description of bill 1',
            }}
          />
          <BillCard
            bill={{
              name: 'Bill 1',
              description: 'This is a description of bill 1',
            }}
          />
        </div>
      </section>
    </div>
  )
}
