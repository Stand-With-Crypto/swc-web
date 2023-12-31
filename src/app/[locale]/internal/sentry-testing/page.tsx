export const dynamic = 'error'

// consolidated links for all our sentry error endpoints
export default async function SentryTesting() {
  return (
    <div className="container mx-auto mt-10 max-w-lg">
      <div className="space-y-7">
        <p className="italic">Note: only available in testing/local environments</p>
        {[
          { children: 'Page - Client Component Error', href: '/internal/debug-sentry-client' },
          {
            children: 'Page - Server Component Dynamic Error',
            href: '/internal/debug-sentry-dynamic-server',
          },
          {
            children: 'Page - Server Component ISR Error',
            href: '/internal/debug-sentry-static-server',
          },
          { children: 'API - Dynamic Error', href: '/api/internal/debug-sentry-dynamic-server' },
          { children: 'API - ISR Error', href: '/api/internal/debug-sentry-static-server' },
        ].map(props => (
          <a className="block text-lg underline" key={props.href} {...props} target="_blank" />
        ))}
      </div>
    </div>
  )
}
