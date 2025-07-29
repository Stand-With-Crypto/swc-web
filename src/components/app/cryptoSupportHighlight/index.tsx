import { isNil } from 'lodash-es'
import { ThumbsDown, ThumbsUp } from 'lucide-react'

import {
  convertDTSIStanceScoreToBgColorClass,
  convertDTSIStanceScoreToCryptoSupportLanguage,
  convertDTSIStanceScoreToTextColorClass,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn } from '@/utils/web/cn'

export function CryptoSupportHighlight({
  stanceScore,
  text,
  className,
}: {
  className?: string
  stanceScore: number | null | undefined
  text?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-lg font-bold text-background sm:w-fit',
        convertDTSIStanceScoreToTextColorClass(stanceScore),
        convertDTSIStanceScoreToBgColorClass(stanceScore),
        className,
      )}
    >
      {isNil(stanceScore) || stanceScore === 50 ? null : stanceScore > 50 ? (
        <ThumbsUp />
      ) : (
        <ThumbsDown className="relative top-[3px]" />
      )}
      <div className="capitalize">
        {text || convertDTSIStanceScoreToCryptoSupportLanguage(stanceScore)}
      </div>
    </div>
  )
}
