import { formatDateForLocale, formatTimeForLocale } from '@/utils/i18n/dateFormatting'
import { getServerTranslation } from '@/utils/i18n/getServerTranslation'
import type { SupportedLanguage } from '@/utils/i18n/types'

import { ErrorDemoButton } from './errorDemoButton'
import { InterpolationDemoClient } from './InterpolationDemoClient'
import { i18nMessages } from './messages'

interface PageProps {
  params: {
    language: string
  }
}

// Static pages generation for en, de, fr
export async function generateStaticParams() {
  return [{ language: 'en' }, { language: 'de' }, { language: 'fr' }]
}

export default async function Page({ params }: PageProps) {
  const { language } = await params
  const { t } = await getServerTranslation(i18nMessages, 'EuPage', language as 'en' | 'de' | 'fr')

  // Sample data for demonstrations
  const sampleData = {
    name: 'John Doe',
    username: 'john.doe',
    age: 28,
    userCount: 1542,
    revenue: 125430.5,
    growthRate: 0.23,
    lastLogin: new Date('2024-01-15T10:30:00'),
    meetingTime: new Date('2024-01-20T14:00:00'),
    postDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    companyName: 'StandWithCrypto',
    description: 'advocacy for crypto',
    code: 'SWC-2024-XYZ',
    cartItems: 3,
    notificationCount: 5,
    userStatus: 'online' as const,
    subscriptionType: 'premium' as const,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Interpolation Demo - Server Side ({language.toUpperCase()})
        </h1>

        <div className="space-y-8">
          {/* Basic Interpolations */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Basic Interpolations</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Welcome:</strong> {t('welcome', { name: sampleData.name })}
              </p>
              <p className="text-gray-700">
                <strong>Profile:</strong>{' '}
                {t('user.profile', {
                  username: sampleData.username,
                  age: sampleData.age,
                })}
              </p>
            </div>
          </section>

          {/* Number Formatting */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Number Formatting</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Users:</strong> {t('stats.users', { count: sampleData.userCount })}
              </p>
              <p className="text-gray-700">
                <strong>Revenue:</strong> {t('stats.revenue', { amount: sampleData.revenue })}
              </p>
              <p className="text-gray-700">
                <strong>Growth:</strong> {t('stats.growth', { rate: sampleData.growthRate })}
              </p>
            </div>
          </section>

          {/* Date and Time Formatting */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Date & Time Formatting</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Last Login:</strong>{' '}
                {t('last.login', {
                  date: formatDateForLocale(sampleData.lastLogin, language as SupportedLanguage),
                })}
              </p>
              <p className="text-gray-700">
                <strong>Meeting:</strong>{' '}
                {t('meeting.time', {
                  time: formatTimeForLocale(sampleData.meetingTime, language as SupportedLanguage),
                })}
              </p>
              <p className="text-gray-700">
                <strong>Relative:</strong>{' '}
                {t('relative.time', {
                  date: formatDateForLocale(
                    sampleData.postDate,
                    language as SupportedLanguage,
                    'short',
                  ),
                })}
              </p>
            </div>
          </section>

          {/* Text Transformations */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Text Transformations</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Company:</strong> {t('company.name', { company: sampleData.companyName })}
              </p>
              <p className="text-gray-700">
                <strong>Description:</strong> {t('description', { text: sampleData.description })}
              </p>
              <p className="text-gray-700">
                <strong>Code:</strong> {t('code', { code: sampleData.code })}
              </p>
            </div>
          </section>

          {/* Pluralization */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Pluralization</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Cart (0):</strong> {t('items.count', { count: 0 })}
              </p>
              <p className="text-gray-700">
                <strong>Cart (1):</strong> {t('items.count', { count: 1 })}
              </p>
              <p className="text-gray-700">
                <strong>Cart (3):</strong> {t('items.count', { count: sampleData.cartItems })}
              </p>
              <p className="text-gray-700">
                <strong>Notifications:</strong>{' '}
                {t('notifications', { count: sampleData.notificationCount })}
              </p>
            </div>
          </section>

          {/* Conditional Translations */}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Conditional Translations</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>User Status:</strong> {t('user.status', { status: sampleData.userStatus })}
              </p>
              <p className="text-gray-700">
                <strong>Offline Status:</strong> {t('user.status', { status: 'offline' })}
              </p>
              <p className="text-gray-700">
                <strong>Subscription:</strong>{' '}
                {t('subscription.type', { type: sampleData.subscriptionType })}
              </p>
              <p className="text-gray-700">
                <strong>Free Plan:</strong> {t('subscription.type', { type: 'free' })}
              </p>
            </div>
          </section>
        </div>

        {/* Error Demo */}
        <section className="rounded-lg bg-red-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Error Demo</h2>
          <p className="mb-4 text-gray-700">
            Test the translated error messages from errorUtils.ts:
          </p>
          <ErrorDemoButton />
        </section>

        {/* Client Component Demo */}
        <div className="mt-12">
          <InterpolationDemoClient i18nMessages={i18nMessages} />
        </div>
      </div>
    </div>
  )
}
