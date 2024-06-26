import { ADVOCATES_ACTIONS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { useIsMobile } from '@/hooks/useIsMobile'

export function AdvocateHeatmapActionList({ isEmbedded }: { isEmbedded?: boolean }) {
  const isMobile = useIsMobile()

  return (
    <div className="flex w-full flex-row justify-around gap-3 md:w-auto md:flex-col md:justify-between">
      {Object.entries(ADVOCATES_ACTIONS).map(([key, action]) => {
        const ActionIcon = action.icon

        return (
          <div
            className={`flex flex-col items-center gap-3 font-sans text-base md:flex-row ${isEmbedded ? 'text-white' : 'text-black'}`}
            key={key}
          >
            <ActionIcon className="w-8 md:w-10" />
            <span className="text-nowrap text-xs">
              {isMobile ? action.labelMobile : action.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
