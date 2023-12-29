import { RichTextFormatter } from '@/components/app/dtsiRichText/dtsiRichTextFormatter'
import {
  DTSIStanceDetailsQuoteProp,
  DTSIStanceDetailsStanceProp,
} from '@/components/app/dtsiStanceDetails/types'
import { ExternalLink } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'
import { format, parseISO } from 'date-fns'
import { Quote } from 'lucide-react'
import React from 'react'

export interface IDTSIStanceDetailsQuoteProps {
  stance: DTSIStanceDetailsStanceProp<DTSIStanceDetailsQuoteProp>
  className?: string
}

export const DTSIStanceDetailsQuoteShared: React.FC<
  IDTSIStanceDetailsQuoteProps & { children: React.ReactNode }
> = ({ children, stance, className }) => {
  return (
    <div className={cn('rounded-lg bg-white p-4 text-gray-800 lg:text-xl', className)}>
      {children}
      <hr className="my-4 border" style={{ width: '120px' }} />
      {stance.quote.richTextDescription ? (
        <div className="flex">
          <div className="mr-3 w-7 shrink-0">
            <Quote className="h-7 w-7" />
          </div>
          <RichTextFormatter richText={stance.quote.richTextDescription} />
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
          className="font-bold text-blue-500"
          style={{ overflowWrap: 'anywhere' }}
          href={stance.quote.sourceUrl}
        >
          {new URL(stance.quote.sourceUrl).hostname}
        </ExternalLink>{' '}
        on{' '}
        <span className="font-bold">{format(parseISO(stance.dateStanceMade), 'MMM do, yyyy')}</span>
      </div>
    </DTSIStanceDetailsQuoteShared>
  )
}
