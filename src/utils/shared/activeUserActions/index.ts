import { AUActiveClientUserActionType } from './au/auActiveUserAction'
import { CAActiveClientUserActionType } from './ca/caActiveUserAction'
import { GBActiveClientUserActionType } from './gb/gbActiveUserAction'
import { USActiveClientUserActionType } from './us/usActiveUserAction'

export type ActiveClientUserActionType =
  | USActiveClientUserActionType
  | GBActiveClientUserActionType
  | CAActiveClientUserActionType
  | AUActiveClientUserActionType
