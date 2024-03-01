import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PageContribute() {
  return (
    <div className="container space-y-16 md:space-y-24">
      <section>
        <PageTitle className="mb-4">Contribute to Stand With Crypto</PageTitle>
        <PageSubTitle>
          We’re calling on passionate developers, innovators, and enthusiasts to contribute to our
          open source project aimed at safeguarding and advancing the crypto ecosystem.
        </PageSubTitle>
      </section>
      {[
        {
          imageSrc: '/pagesContent/contribute/promote.svg',
          title: 'Promote Stand With Crypto on your website, app, or dApp',
          subtitle: (
            <>
              To access our brand assets and explore their integration potential, simply open our
              Figma file, where you can download logos, view brand guidelines, and see examples
              tailored to your website or app.
            </>
          ),
          content: (
            <>
              <iframe
                allowFullScreen
                className="aspect-auto min-h-[50vh] w-full border"
                src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F0UVwglzDupzR0hwTnZWGe9%2FOpen-Source-SWC%3Ftype%3Ddesign%26node-id%3D0%253A1%26mode%3Ddesign%26t%3D7XXRxL4bSW1HNARp-1"
              ></iframe>
              <div className="mt-8 flex items-center justify-between gap-3 rounded-xl bg-gray-100 p-6 text-left">
                <p className="font-semibold">Download all logos and assets</p>
                <div>
                  <Button asChild>
                    <a href="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/Stand%20With%20Crypto%20Brand%20Assets-Z17GHwhQoTBCbSQSPjovITDc78V3wr.zip">
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            </>
          ),
        },
        // {
        //   imageSrc: '/pagesContent/contribute/code.svg',
        //   title: 'Contribute to our open source repo',
        //   subtitle: (
        //     <>
        //       We’re calling all software engineers to join us in the fight to keep crypto in
        //       America. Contribute directly to StandWithCrypto.org through our open source GitHub
        //       repo.
        //     </>
        //   ),
        //   content: (
        //     <Button asChild size="lg">
        //       <ExternalLink href={'https://github.com/Stand-With-Crypto/swc-web/'}>
        //         View Github
        //       </ExternalLink>
        //     </Button>
        //   ),
        // },
        {
          imageSrc: '/pagesContent/contribute/stances.svg',
          title: 'Contribute to our politician scoring system',
          subtitle: (
            <>
              Help us build a transparent politician scoring system by submitting public statements
              or tweets that a politician has made about crypto to{' '}
              <ExternalLink href={'https://www.dotheysupportit.com/faq'}>
                DoTheySupportIt.com
              </ExternalLink>
              .
            </>
          ),
          content: (
            <Button asChild size="lg">
              <ExternalLink href={'https://www.dotheysupportit.com/faq'}>
                Add a position
              </ExternalLink>
            </Button>
          ),
        },
      ].map(({ title, subtitle, imageSrc, content }, index) => (
        <section className="text-center" key={index}>
          <div className="mx-auto mb-6 inline-block">
            <NextImage
              alt={`Icon signifying "${title}"`}
              className="h-16 w-16"
              height={128}
              src={imageSrc}
              width={128}
            />
          </div>
          <PageTitle as="h3" className="mb-2" size="sm">
            {title}
          </PageTitle>
          <PageSubTitle as="h4" className="mb-9" size="sm">
            {subtitle}
          </PageSubTitle>
          <div>{content}</div>
        </section>
      ))}
    </div>
  )
}
