import { PageTitle } from '@/components/ui/pageTitleText'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

import { FAQ_DATA } from './faqData'

export function FAQ() {
  return (
    <section className="space-y-7">
      <PageTitle size="sm" as="h2">
        Frequently asked questions
      </PageTitle>
      <Accordion type="single" collapsible>
        {FAQ_DATA.map(({ title, content: Content }) => (
          <AccordionItem key={title} value={title}>
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm max-w-none px-4 pb-6 text-muted-foreground">
                <Content />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
