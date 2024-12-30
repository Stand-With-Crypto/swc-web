import { RenderBuilderContent } from '@/components/app/builder'
import { builderIOClient } from '@/utils/server/builderIO/client'

interface PageProps {
  params: {
    page: string[]
  }
}

const PAGE_PREFIX = '/content/'

export default async function Page(props: PageProps) {
  const model = 'page'
  const params = await props.params
  const content = await builderIOClient
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
