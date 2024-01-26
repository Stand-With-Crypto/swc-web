import { UserInformationVisibility } from '@prisma/client'
import { nativeEnum, object } from 'zod'

export const zodUpdateUserInformationVisibility = object({
  informationVisibility: nativeEnum(UserInformationVisibility),
})
