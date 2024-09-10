import { EventSchemas, Inngest } from 'inngest'

import { BackfillReactivationEmailInngestSchema } from '@/inngest/functions/backfillReactivation'
import { ClearUpActionsInngestSchema } from '@/inngest/functions/user/clearUpActions'

type Events = ClearUpActionsInngestSchema & BackfillReactivationEmailInngestSchema

export const inngest = new Inngest({
  id: 'swc-web',
  schemas: new EventSchemas().fromRecord<Events>(),
})
