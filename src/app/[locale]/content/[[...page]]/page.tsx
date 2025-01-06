import { RenderBuilderContent } from '@/components/app/builder'
import { serverCMS } from '@/utils/server/builder/serverCMS'

interface PageProps {
  params: {
    page: string[]
  }
}

const PAGE_PREFIX = '/content/'

export default async function Page(props: PageProps) {
  const model = 'content'
  const params = await props.params

  const content = await serverCMS
    // Get the page content from Builder with the specified options
    .get('content', {
      userAttributes: {
        // Use the page path specified in the URL to fetch the content
        urlPath: PAGE_PREFIX + (params?.page?.join('/') || ''),
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
    })
    // Convert the result to a promise
    .toPromise()

  return (
    <>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} model={model} />
    </>
  )
}

export async function generateStaticParams() {
  const paths = await serverCMS
    .getAll('content', { options: { noTargeting: true } })
    .then(res => res.map(({ data }) => data?.url))

  return paths.map((path: string) => {
    return {
      params: {
        page: path.replace(PAGE_PREFIX, '').split('/'),
      },
    }
  })
}
