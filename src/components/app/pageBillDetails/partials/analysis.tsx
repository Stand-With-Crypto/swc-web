import { FileTextIcon } from 'lucide-react'

import { ExternalLink } from '@/components/ui/link'
import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'

interface AnalysisProps {
  analysis: string
  relatedUrls: {
    url: string
    title: string
  }[]
}

export function Analysis({ analysis, relatedUrls }: AnalysisProps) {
  return (
    <section className="container mb-20 space-y-6 text-center font-sans md:mb-28 lg:space-y-10">
      <p className="text-4xl font-bold">Analysis</p>
      <div className="flex flex-col gap-10 lg:flex-row">
        <StyledHtmlContent
          className="w-full space-y-4 text-start text-lg font-medium [&_*::marker]:text-fontcolor-muted [&_*]:text-fontcolor-muted"
          html={analysis}
        />
        {relatedUrls.length > 0 && (
          <div className="flex h-max w-full flex-col gap-6 rounded-3xl border border-muted p-6 lg:max-w-72">
            <strong className="text-lg">More Resources</strong>
            {relatedUrls.map(relatedUrl => (
              <ExternalLink
                className="flex w-full items-center gap-4 text-start text-primary"
                href={relatedUrl.url}
                key={relatedUrl.url}
              >
                <FileTextIcon />
                <span className="flex-1 font-medium">{relatedUrl.title}</span>
              </ExternalLink>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
