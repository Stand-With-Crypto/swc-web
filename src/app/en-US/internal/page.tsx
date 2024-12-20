import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export const dynamic = 'error'

// consolidated links for all internal pages
export default async function InternalHomepage() {
  return (
    <div className="container mx-auto mt-10 max-w-lg">
      <div className="space-y-10">
        {[
          {
            sectionTitle: 'General',
            links: [
              { children: 'User Settings', href: '/internal/user-settings' },
              { children: 'User Experiments', href: '/internal/user-experiments' },
              { children: 'User Action Deeplinks', href: '/internal/user-action-deeplinks' },
            ],
          },
          {
            sectionTitle: 'Sentry Debugging',
            subSectionTitle: 'Note: only available in testing/local environments',
            links: [
              {
                children: 'Page - Client Component Error',
                href: '/internal/debug-sentry-client',
                target: '_blank',
              },
              {
                children: 'Page - Client Component Server Action Error',
                href: '/internal/debug-sentry-client-server-action',
                target: '_blank',
              },
              {
                children: 'Page - Server Component Dynamic Error',
                href: '/internal/debug-sentry-dynamic-server',
                target: '_blank',
              },
              {
                children: 'Page - Server Component ISR Error',
                href: '/internal/debug-sentry-static-server',
                target: '_blank',
              },
              {
                children: 'API - Dynamic Error',
                href: '/api/internal/debug-sentry-dynamic-server',
                target: '_blank',
              },
              {
                children: 'API - ISR Error',
                href: '/api/internal/debug-sentry-static-server',
                target: '_blank',
              },
            ],
          },
        ].map(({ sectionTitle, subSectionTitle, links }) => (
          <div className="space-y-4" key={sectionTitle}>
            <PageTitle size="sm">{sectionTitle}</PageTitle>
            {subSectionTitle && <PageSubTitle>{subSectionTitle}</PageSubTitle>}
            {links.map(props => (
              <InternalLink
                className="block text-lg underline"
                key={props.href}
                prefetch={false}
                {...props}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
