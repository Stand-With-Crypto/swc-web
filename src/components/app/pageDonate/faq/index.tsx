import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PageTitle } from '@/components/ui/pageTitleText'

import { FAQ_DATA } from './faqData'

export function FAQ() {
  return (
    <section className="space-y-7">
      <PageTitle as="h2" size="md">
        Frequently asked questions
      </PageTitle>
      <Accordion collapsible type="single">
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
