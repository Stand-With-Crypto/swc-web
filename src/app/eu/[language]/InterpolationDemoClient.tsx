'use client'

import { useState } from 'react'

import { createPluralContext } from '@/utils/i18n/interpolation'
import type { I18nMessages } from '@/utils/i18n/types'
import { useTranslation } from '@/utils/i18n/useTranslation'

interface InterpolationDemoClientProps {
  i18nMessages: I18nMessages
}

export function InterpolationDemoClient({ i18nMessages }: InterpolationDemoClientProps) {
  const { t, language } = useTranslation(i18nMessages, 'InterpolationDemoClient')

  // Interactive state for demos
  const [userName, setUserName] = useState('Mary Jane')
  const [itemCount, setItemCount] = useState(2)
  const [userStatus, setUserStatus] = useState<'online' | 'offline' | 'away'>('online')
  const [subscriptionType, setSubscriptionType] = useState<'free' | 'premium' | 'enterprise'>(
    'premium',
  )

  // Sample data for demonstrations
  const sampleData = {
    username: 'mary.jane',
    age: 32,
    userCount: 2847,
    revenue: 89750.25,
    growthRate: 0.18,
    lastLogin: new Date('2024-01-16T09:15:00'),
    meetingTime: new Date('2024-01-22T16:30:00'),
    postDate: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    companyName: 'crypto solutions ltd.',
    description: 'crypto advocacy',
    code: 'TS-2024-ABC',
    notificationCount: 12,
  }

  return (
    <div className="border-t pt-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Interpolation Demo - Client Side ({language.toUpperCase()})
      </h1>

      <div className="space-y-8">
        {/* Interactive Controls */}
        <section className="rounded-lg bg-blue-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Interactive Controls</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">User Name:</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setUserName(e.target.value)}
                type="text"
                value={userName}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Item Count:</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                max="100"
                min="0"
                onChange={e => setItemCount(parseInt(e.target.value) || 0)}
                type="number"
                value={itemCount}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">User Status:</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setUserStatus(e.target.value as 'online' | 'offline' | 'away')}
                value={userStatus}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="away">Away</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subscription:</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e =>
                  setSubscriptionType(e.target.value as 'free' | 'premium' | 'enterprise')
                }
                value={subscriptionType}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </section>

        {/* Basic Interpolations */}
        <section className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Basic Interpolations (Client)
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Welcome:</strong> {t('welcome', { name: userName })}
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
        <section className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Number Formatting (Client)</h2>
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
        <section className="rounded-lg border-l-4 border-purple-500 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Date & Time Formatting (Client)
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Last Login:</strong>{' '}
              {t('last.login', { date: sampleData.lastLogin.toISOString() })}
            </p>
            <p className="text-gray-700">
              <strong>Meeting:</strong>{' '}
              {t('meeting.time', { time: sampleData.meetingTime.toISOString() })}
            </p>
            <p className="text-gray-700">
              <strong>Relative:</strong>{' '}
              {t('relative.time', { date: sampleData.postDate.toISOString() })}
            </p>
          </div>
        </section>

        {/* Text Transformations */}
        <section className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Text Transformations (Client)
          </h2>
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

        {/* Interactive Pluralization */}
        <section className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Interactive Pluralization (Client)
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Cart Items:</strong> {t('items.count', createPluralContext(itemCount))}
            </p>
            <p className="text-gray-700">
              <strong>Notifications:</strong>{' '}
              {t('notifications', createPluralContext(sampleData.notificationCount))}
            </p>
            <div className="mt-4 rounded bg-gray-50 p-3">
              <p className="mb-2 text-sm text-gray-600">Try different values:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>0:</strong> {t('items.count', createPluralContext(0))}
                </p>
                <p>
                  <strong>1:</strong> {t('items.count', createPluralContext(1))}
                </p>
                <p>
                  <strong>5:</strong> {t('items.count', createPluralContext(5))}
                </p>
                <p>
                  <strong>21:</strong> {t('items.count', createPluralContext(21))}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Conditional Translations */}
        <section className="rounded-lg border-l-4 border-indigo-500 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Interactive Conditional Translations (Client)
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>User Status:</strong> {t('user.status', { condition: userStatus })}
            </p>
            <p className="text-gray-700">
              <strong>Subscription:</strong>{' '}
              {t('subscription.type', { condition: subscriptionType })}
            </p>
            <div className="mt-4 rounded bg-gray-50 p-3">
              <p className="mb-2 text-sm text-gray-600">All status options:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Online:</strong> {t('user.status', { condition: 'online' })}
                </p>
                <p>
                  <strong>Offline:</strong> {t('user.status', { condition: 'offline' })}
                </p>
                <p>
                  <strong>Away:</strong> {t('user.status', { condition: 'away' })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Language Info */}
        <section className="rounded-lg bg-gray-100 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Translation System Info</h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <strong>Current Language:</strong>
              <p className="text-gray-600">{language}</p>
            </div>
            <div>
              <strong>Available Keys:</strong>
              <p className="text-gray-600">
                {Object.keys(i18nMessages[language] || {}).length} keys
              </p>
            </div>
            <div>
              <strong>Component:</strong>
              <p className="text-gray-600">InterpolationDemoClient</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
