import React from 'react'
import { format, parseISO } from 'date-fns'
import { Quote } from 'lucide-react'

import { RichTextFormatter } from '@/components/app/dtsiRichText/dtsiRichTextFormatter'
import {
  DTSIStanceDetailsQuoteProp,
  DTSIStanceDetailsStanceProp,
  StanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { ExternalLink } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'

type IDTSIStanceDetailsQuoteProps = Omit<StanceDetailsProps, 'stance'> & {
  stance: DTSIStanceDetailsStanceProp<DTSIStanceDetailsQuoteProp>
}

const DTSIStanceDetailsQuoteShared: React.FC<
  IDTSIStanceDetailsQuoteProps & { children: React.ReactNode }
> = ({ children, stance, bodyClassName }) => {
  return (
    <div className={cn('text-gray-800')}>
      {children}
      <hr className="my-4 border" style={{ width: '120px' }} />
      {stance.quote.richTextDescription ? (
        <div className="flex">
          <div className="mr-3 w-7 shrink-0">
            <Quote className="h-6 w-6" />
          </div>
          <RichTextFormatter
            className={bodyClassName}
            richText={stance.quote.richTextDescription}
          />
        </div>
      ) : null}
    </div>
  )
}

export const DTSIStanceDetailsQuote: React.FC<IDTSIStanceDetailsQuoteProps> = props => {
  const { stance } = props
  return (
    <DTSIStanceDetailsQuoteShared {...props}>
      <div>
        Quoted from{' '}
        <ExternalLink
          className="font-bold"
          href={stance.quote.sourceUrl}
          style={{ overflowWrap: 'anywhere' }}
        >
          {new URL(stance.quote.sourceUrl).hostname}
        </ExternalLink>{' '}
        on{' '}
        <span className="font-bold">{format(parseISO(stance.dateStanceMade), 'MMM do, yyyy')}</span>
      </div>
    </DTSIStanceDetailsQuoteShared>
  )
}
