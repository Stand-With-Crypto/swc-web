'use server'

import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

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
        description?: string
        url: string
      }
    }
  }
}

interface ExternalNews {
  id: string
  type: 'external'
  title: string
  description?: string
  url: string
  source: string
}

type News = (InternalNews | ExternalNews) & {
  publicationDate: number // timestamp
  previewImage?: string
}

interface NewsData {
  data: News
  createdDate: number
  id: string
}

export interface NormalizedNews {
  id: string
  type: 'internal' | 'external'
  dateHeading: Date
  previewImage?: string
  title: string
  description?: string
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
          'data.publicationDate': -1,
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

    return news.map(newsItem => normalizeNewsListItem(newsItem, countryCode)).filter(Boolean)
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

function normalizeNewsListItem(
  newsData: NewsData,
  countryCode: SupportedCountryCodes,
): NormalizedNews | undefined {
  const { data: news, id } = newsData

  const dateHeading = new Date(news.publicationDate)

  if (isInternalNews(news)) {
    if (!news.pressPage?.value) {
      return
    }

    const { source, title, url, description } = news.pressPage?.value?.data ?? {}

    return {
      id,
      type: 'internal',
      dateHeading,
      previewImage: news.previewImage,
      source,
      title,
      description,
      url: countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE ? `/${countryCode}${url}` : url,
    }
  } else if (isExternalNews(news)) {
    return {
      id,
      type: 'external',
      dateHeading,
      previewImage: news.previewImage,
      source: news.source,
      title: news.title,
      description: news.description,
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
