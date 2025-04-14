import { ActionListItem } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionList'
import {
  EmailIcon,
  FollowOnXIcon,
  JoinIcon,
  PrepareToVoteIcon,
} from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapIcons'
import { GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/gbCountryUtils'

export const GB_STATE_COORDS: Record<
  keyof typeof GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  [number, number]
> = {
  ENG: [-1.1743, 52.3555],
  NIR: [-6.4923, 54.7877],
  SCT: [-4.2026, 56.4907],
  WLS: [-3.7837, 52.1307],
}

export const GB_ADVOCATES_HEATMAP_GEO_URL =
  'https://raw.githubusercontent.com/ONSvisual/topojson_boundaries/refs/heads/master/geogUKregion.json'

export const GB_ADVOCATES_ACTIONS: ActionListItem = {
  OPT_IN: {
    icon: JoinIcon,
    label: 'New member joined',
    labelMobile: 'joined',
    labelActionTooltip: () => 'joined SWC',
  },
  EMAIL: {
    icon: EmailIcon,
    label: 'Email sent to their MP',
    labelMobile: 'emailed',
    labelActionTooltip: () => 'emailed their MP',
  },
  VIEW_KEY_PAGE: {
    icon: PrepareToVoteIcon,
    label: 'Viewed key page',
    labelMobile: 'viewed',
    labelActionTooltip: () => 'viewed key page',
  },
  TWEET: {
    icon: FollowOnXIcon,
    label: 'Followed SWC on X',
    labelMobile: 'Followed SWC on X',
    labelActionTooltip: () => 'followed SWC on X',
  },
}
