import { Bill, BillCard } from '@/components/app/billCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface PageBillsProps {
  title: string
  description: string
  bills: Bill[]
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
        <div className="flex flex-col gap-4 lg:gap-8">
          {props.bills.map(bill => (
            <BillCard bill={bill} key={bill.id} />
          ))}
        </div>
      </section>
    </div>
  )
}
