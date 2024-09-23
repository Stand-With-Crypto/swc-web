import React from 'react'

import { RichTextFormatter } from '@/components/app/dtsiRichText/dtsiRichTextFormatter'
import { DTSIUserAvatar } from '@/components/app/dtsiUserAvatar'
import { ExternalLink } from '@/components/ui/link'
import { DTSI_PersonStanceDetailsFragment } from '@/data/dtsi/generated'
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn } from '@/utils/web/cn'

export type AnalysisDetailsProps = {
  analysis: DTSI_PersonStanceDetailsFragment['analysis'][0]
  analysisType: 'bill' | 'stance'
}

export const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ analysis, analysisType }) => {
  const { publicUser } = analysis
  const descriptor = analysisType
  const commentary = analysis.richTextCommentary as any[] | null
  const hasCommentary = Boolean(commentary?.length)
  return (
    <div className={cn(hasCommentary && 'border border-gray-700', 'rounded-lg p-2')}>
      <div className="flex items-center">
        <div className="mr-2 flex-shrink-0">
          <DTSIUserAvatar size={32} user={publicUser} />
        </div>
        <div>
          <div className="text-xs sm:text-sm">
            {publicUser.twitterUsername ? (
              <ExternalLink
                className="font-bold"
                href={`https://twitter.com/${publicUser.twitterUsername}`}
              >
                {publicUser.displayName}
              </ExternalLink>
            ) : (
              <span className="font-bold">{publicUser.displayName}</span>
            )}
            <br className="md:hidden" />
            <span>
              {' '}
              marked
              {` this ${descriptor} `}
              as{' '}
              <span className="font-bold">
                {convertDTSIStanceScoreToCryptoSupportLanguage(analysis.stanceScore).toLowerCase()}
              </span>
            </span>
          </div>
        </div>
      </div>
      {hasCommentary && (
        <>
          <hr className="my-2 border-gray-700" style={{ width: '100px', borderWidth: '.5px' }} />
          <div className="text-sm">
            {analysis.richTextCommentary ? (
              <RichTextFormatter richText={analysis.richTextCommentary} />
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
