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
              { children: 'User Action Deeplinks', href: '/internal/user-action-deeplinks' },
              {
                children: 'v2 Sample Architecture Patterns',
                href: '/internal/sample-architecture-patterns',
              },
            ],
          },
          {
            sectionTitle: 'Sentry Debugging',
            subSectionTitle: 'Note: only available in testing/local environments',
            links: [
              { children: 'Page - Client Component Error', href: '/internal/debug-sentry-client' },
              {
                children: 'Page - Server Component Dynamic Error',
                href: '/internal/debug-sentry-dynamic-server',
              },
              {
                children: 'Page - Server Component ISR Error',
                href: '/internal/debug-sentry-static-server',
              },
              {
                children: 'API - Dynamic Error',
                href: '/api/internal/debug-sentry-dynamic-server',
              },
              { children: 'API - ISR Error', href: '/api/internal/debug-sentry-static-server' },
            ],
          },
        ].map(({ sectionTitle, subSectionTitle, links }) => (
          <div className="space-y-4" key={sectionTitle}>
            <PageTitle size="sm">{sectionTitle}</PageTitle>
            {subSectionTitle && <PageSubTitle>{subSectionTitle}</PageSubTitle>}
            {links.map(props => (
              <a className="block text-lg underline" key={props.href} {...props} target="_blank" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
