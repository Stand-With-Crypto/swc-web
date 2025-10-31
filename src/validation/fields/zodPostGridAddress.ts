import type PostGrid from 'postgrid-node'
import { z } from 'zod'

interface PostGridAdvocateContact
  extends PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName {
  metadata: {
    userId: string
  }
}

interface PostGridDTSIPersonContact
  extends PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName {
  metadata: {
    dtsiSlug: string
  }
}

export const zodPostGridRecipientAddress = z.custom<PostGridDTSIPersonContact>()
export const zodPostGridSenderAddress = z.custom<PostGridAdvocateContact>()

export type PostGridSenderContact = z.infer<typeof zodPostGridSenderAddress>
export type PostGridRecipientContact = z.infer<typeof zodPostGridRecipientAddress>
