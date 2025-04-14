import { ActionListItem } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionList'
import {
  EmailIcon,
  FollowOnXIcon,
  JoinIcon,
  PrepareToVoteIcon,
} from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapIcons'
import { AU_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/auStateUtils'

export const AU_STATE_COORDS: Record<
  keyof typeof AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  [number, number]
> = {
  NSW: [151.2153, -33.8688],
  VIC: [144.9631, -37.8136],
  QLD: [153.0211, -27.4701],
  WA: [115.8605, -31.9505],
  SA: [138.6007, -34.9285],
  TAS: [147.3272, -42.8821],
  ACT: [149.1286, -35.2834],
  NT: [130.8456, -12.4634],
}

export const AU_ADVOCATES_HEATMAP_GEO_URL =
  'https://raw.githubusercontent.com/cartdeco/Australia-json-data/refs/heads/master/aus25fgd_r.topojson'

export const AU_ADVOCATES_ACTIONS: ActionListItem = {
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
