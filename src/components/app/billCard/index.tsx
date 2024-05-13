import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/web/cn'

interface BillCardProps {
  bill: Bill
  className?: string
}

export function BillCard(props: BillCardProps) {
  const { bill, className } = props

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-3xl bg-secondary  p-6  md:flex-row',
        className,
      )}
      data-test-id="policy-card"
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-semibold">{bill.name}</span>
          <div className="flex flex-wrap gap-2 uppercase">
            <Badge variant="gray">Sponsored</Badge>

            <Badge variant="green">Pro-Crypto</Badge>
            <Badge variant="gray">Voted Against</Badge>
            <Badge variant="red">Anti-Crypto</Badge>
          </div>
        </div>

        <span>{bill.description}</span>
      </div>

      <Button className="max-md:w-full">Learn More</Button>
    </div>
  )
}
