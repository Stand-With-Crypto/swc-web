'use server'

import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { OLD_NEWS_DATE_OVERRIDES } from '@/utils/server/builder/models/data/news/constants'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface InternalNews {
  id: string
  type: 'internal'
  pressPage: {
    id: string
    model: BuilderPageModelIdentifiers
    // When the page gets deleted the value is undefined
    value?: {
      createdDate: number
      name: string
      data: {
        source: string
        title: string
        url: string
      }
    }
  }
}

interface ExternalNews {
  id: string
  type: 'external'
  title: string
  url: string
  source: string
}

type News = InternalNews | ExternalNews

interface NewsData {
  data: News
  createdDate: number
  id: string
}

export interface NormalizedNews {
  id: string
  type: 'internal' | 'external'
  dateHeading: Date
  title: string
  source: string
  url: string
}

async function getAllNewsWithOffset(
  offset: number,
  limit: number,
  countryCode: SupportedCountryCodes,
) {
  return await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.NEWS, {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          data: {
            countryCode: countryCode.toUpperCase(),
          },
        },
        options: {
          includeRefs: true,
        },
        sort: {
          createdDate: -1,
        },
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        cacheSeconds: 60,
        fields: 'data,createdDate,id',
        limit,
        offset,
      }) as Promise<Array<NewsData>>,
    {
      retries: 3,
      minTimeout: 10000,
    },
  ).catch(error => {
    Sentry.captureException(error, {
      tags: { domain: 'builder.io', model: 'getAllNewsWithOffset' },
    })
    throw error
  })
}

interface GetNewsListOptions {
  page?: number
  limit?: number
  countryCode: SupportedCountryCodes
}

export async function getNewsList({
  page = 0,
  limit = 10,
  countryCode,
}: GetNewsListOptions): Promise<NormalizedNews[]> {
  try {
    const offset = page * limit

    const news = await getAllNewsWithOffset(offset, limit, countryCode)

    return news.map(normalizeNewsListItem).filter(Boolean)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { domain: 'builder.io', model: 'getNewsList' },
    })
    throw error
  }
}

function isInternalNews(news: News) {
  return news.type === 'internal'
}

function isExternalNews(news: News) {
  return news.type === 'external'
}

function normalizeNewsListItem(newsData: NewsData): NormalizedNews | undefined {
  const { createdDate, data: news, id } = newsData

  const dataHeading = OLD_NEWS_DATE_OVERRIDES[id] ?? new Date(createdDate)

  if (isInternalNews(news)) {
    if (!news.pressPage?.value) {
      return
    }

    const { source, title, url } = news.pressPage?.value?.data ?? {}

    return {
      id,
      type: 'internal',
      dateHeading: dataHeading,
      source: source,
      title: title,
      url: url,
    }
  } else if (isExternalNews(news)) {
    return {
      id,
      type: 'external',
      dateHeading: dataHeading,
      source: news.source,
      title: news.title,
      url: news.url,
    }
  }

  Sentry.captureMessage('Unknown news type', {
    extra: { news },
    tags: {
      domain: 'builder.io',
      model: 'normalizeNewsListItem',
    },
  })
}
