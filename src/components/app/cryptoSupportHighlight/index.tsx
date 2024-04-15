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
  stanceScore: number | null
  text?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full justify-center gap-2 rounded-lg px-8 py-4 text-lg font-bold sm:w-fit',
        convertDTSIStanceScoreToTextColorClass(stanceScore),
        convertDTSIStanceScoreToBgColorClass(stanceScore),
        className,
      )}
    >
      {isNil(stanceScore) || stanceScore === 50 ? null : stanceScore > 50 ? (
        <ThumbsUp />
      ) : (
        <ThumbsDown />
      )}
      <div>{text || convertDTSIStanceScoreToCryptoSupportLanguage(stanceScore)}</div>
    </div>
  )
}
