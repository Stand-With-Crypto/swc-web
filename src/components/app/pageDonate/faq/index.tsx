import { PageTitle } from '@/components/ui/pageTitleText'
import { Card } from '@/components/ui/card'

import { FAQEntry, FAQ_DATA } from './faqData'
import { FAQItemCollapsible } from './faqItemCollapsible'

export function FAQ() {
  return (
    <section className="space-y-7">
      <PageTitle size="sm" as="h2">
        Frequently asked questions
      </PageTitle>

      <div className="flex flex-col gap-4">
        {FAQ_DATA.map(entry => (
          <FAQListItem key={entry.title} entry={entry} />
        ))}
      </div>
    </section>
  )
}

function FAQListItem({ entry: { title, content: Content } }: { entry: FAQEntry }) {
  return (
    <Card className="p-0">
      <FAQItemCollapsible title={title}>
        <div className="prose px-4 pb-6 text-muted-foreground">
          <Content />
        </div>
      </FAQItemCollapsible>
    </Card>
  )
}
