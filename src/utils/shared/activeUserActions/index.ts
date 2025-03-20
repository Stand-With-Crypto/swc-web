import { AUActiveClientUserActionType } from './au/auActiveUserAction'
import { CAActiveClientUserActionType } from './ca/caActiveUserAction'
import { UKActiveClientUserActionType } from './uk/ukActiveUserAction'
import { USActiveClientUserActionType } from './us/usActiveUserAction'

export type ActiveClientUserActionType =
  | USActiveClientUserActionType
  | UKActiveClientUserActionType
  | CAActiveClientUserActionType
  | AUActiveClientUserActionType
