/**
 * Redis key for storing PostGrid webhook events
 * Events are stored as a list and processed by the processPostgridWebhookEvents function
 */
export const POSTGRID_EVENTS_REDIS_KEY = 'postgrid:webhook:events'

