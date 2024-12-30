import { RenderBuilderContent } from '@/components/app/builder'
import { builderIOClient } from '@/utils/server/builderIO/client'

interface PageProps {
  params: {
    page: string[]
  }
}

export default async function Page(props: PageProps) {
  const model = 'page'
  const content = await builderIOClient
    // Get the page content from Builder with the specified options
    .get('page', {
      userAttributes: {
        // Use the page path specified in the URL to fetch the content
        urlPath: '/' + (props?.params?.page?.join('/') || ''),
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
