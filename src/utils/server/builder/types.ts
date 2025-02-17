interface EventValue {
  id: string
  name: string
  modelId: string
  published: string
  meta: {
    hasLinks: boolean
    kind: string
    lastPreviewUrl: string
  }
  query: Array<{
    property: string
    operator: string
    value: string
  }>
  data: {
    themeId: boolean
    title: string
    blocksString: string
  }
  metrics: {
    clicks: number
    impressions: number
  }
  variations: Record<string, unknown>
  lastUpdated: number
  createdDate: number
  testRatio: number
  createdBy: string
}

export interface BuilderEventBody {
  operation: 'publish' | 'archive' | 'delete' | 'unpublish' | 'scheduledStart' | 'scheduledEnd'
  modelName: string
  newValue?: EventValue
  previousValue?: EventValue
}
