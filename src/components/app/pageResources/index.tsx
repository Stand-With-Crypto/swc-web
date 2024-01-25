import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageResources() {
  return (
    <div className="container">
      <section className="mb-16 space-y-7 text-center">
        <PageTitle>Your voice will shape the future of crypto in America</PageTitle>
        <PageSubTitle className="gap-10">
          Every day lawmakers are discussing policies and regulations that impact your ability to
          use crypto. They care what you think, but you have to make sure that you are connecting
          with your lawmakers.
          <br /> <br />
          The US sat idly by with semiconductor manufacturing, and now 92% of advanced production is
          located in Taiwan and South Korea. We can’t let history repeat itself, and must ensure the
          US isn’t sidelined from the future financial system.
        </PageSubTitle>
      </section>
    </div>
  )
}
