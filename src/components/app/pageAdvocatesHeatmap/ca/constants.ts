import { ActionListItem } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionList'
import {
  EmailIcon,
  FollowOnXIcon,
  JoinIcon,
} from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapIcons'
import { CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/caProvinceUtils'

export const CA_STATE_COORDS: Record<
  keyof typeof CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  [number, number]
> = {
  AB: [-114.0719, 53.9333],
  BC: [-122.3331, 49.2827],
  MB: [-97.1387, 49.8172],
  NB: [-65.6188, 45.9189],
  NL: [-56.1304, 47.5122],
  NS: [-63.5724, 44.6812],
  ON: [-79.8726, 44.2614],
  PE: [-63.5444, 46.5107],
  QC: [-73.5491, 45.5017],
  SK: [-106.6761, 52.1166],
  NT: [-114.0719, 53.9333],
  NU: [-114.0719, 53.9333],
  YT: [-135.0107, 62.4593],
}

export const CA_ADVOCATES_HEATMAP_GEO_URL =
  'https://gist.githubusercontent.com/Saw-mon-and-Natalie/a11f058fc0dcce9343b02498a46b3d44/raw/e8afc74f791169a64d6e8df033d7e88ff85ba673/canada.json'

export const CA_ADVOCATES_ACTIONS: ActionListItem = {
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
    icon: EmailIcon,
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
