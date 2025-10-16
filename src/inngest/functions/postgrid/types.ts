export const PROCESS_POSTGRID_WEBHOOK_EVENTS_EVENT_NAME = 'postgrid/process-webhook-events'
export const PROCESS_POSTGRID_WEBHOOK_EVENTS_FUNCTION_ID = 'postgrid.process-webhook-events'

export interface ProcessPostgridWebhookEventsSchema {
  name: typeof PROCESS_POSTGRID_WEBHOOK_EVENTS_EVENT_NAME
  data?: Record<string, never>
}

