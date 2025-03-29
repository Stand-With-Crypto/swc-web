import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { cn } from '@/utils/web/cn'
import { createTweetLink } from '@/utils/web/createTweetLink'
import { createWarpcastLink } from '@/utils/web/createWarpcastLink'

export function PageContribute() {
  return (
    <div className="standard-spacing-from-navbar container space-y-16 md:space-y-28">
      <section>
        <PageTitle className="mb-8">Become a partner</PageTitle>
        <PageSubTitle>
          We're calling on passionate developers, innovators, and enthusiasts to contribute to Stand
          With Crypto. Show people you care about crypto’s fate in America. Become an industry
          partner and get featured on our website.
        </PageSubTitle>
        <div className="mt-16 text-center">
          <Button asChild size="lg">
            <ExternalLink
              href={
                'https://docs.google.com/forms/d/e/1FAIpQLSf4T51k9InqKQKW2911_HVWm11wz_dOcpoDj8QuyF7cxU5MHw/viewform'
              }
            >
              Get in touch
            </ExternalLink>
          </Button>
        </div>
      </section>
      {[
        {
          imageSrc: '/pagesContent/contribute/promote.svg',
          title: 'Promote Stand With Crypto',
          subtitle: <>Use your audience to bring more people to the movement.</>,
          content: (
            <>
              <div className="space-y-14 text-left">
                {[
                  {
                    title: 'Share Stand With Crypto on Social',
                    subtitle: 'We’ve drafted a post for you',
                    cta: (
                      <div className="space-x-3">
                        <Button asChild variant="primary-cta">
                          <ExternalLink
                            href={createTweetLink({
                              message: `I #StandWithCrypto. More than ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} people are already advocating for better crypto policy in America. Join the fight to receive email updates on crypto policy, invites to local events, and more.`,
                              url: 'https://www.standwithcrypto.org/action/sign-up?utm_source=twitter&utm_medium=social&utm_campaign=partner-share',
                            })}
                          >
                            Share on X
                          </ExternalLink>
                        </Button>
                        <Button asChild variant="primary-cta">
                          <ExternalLink
                            href={createWarpcastLink({
                              message: `I #StandWithCrypto. More than ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} people are already advocating for better crypto policy in America. Join the fight to receive email updates on crypto policy, invites to local events, and more.`,
                              url: 'https://www.standwithcrypto.org/action/sign-up?utm_source=warpcast&utm_medium=social&utm_campaign=partner-share',
                            })}
                          >
                            Share on Warpcast
                          </ExternalLink>
                        </Button>
                      </div>
                    ),
                  },
                  {
                    title: 'Send an email to your customers and employees',
                    subtitle: 'We’ve prepared one for you',
                    cta: (
                      <Dialog analytics={'Contribute Email CTA'}>
                        <DialogTrigger asChild>
                          <Button variant="primary-cta">Send email</Button>
                        </DialogTrigger>
                        <DialogContent
                          a11yTitle="Email template"
                          className={cn(dialogContentPaddingStyles, 'max-w-3xl')}
                        >
                          <PageTitle as="h4" size="md">
                            Sample Email Copy
                          </PageTitle>
                          <div className="prose my-8 max-w-full rounded-2xl bg-secondary p-5">
                            <p>All,</p>

                            <p>
                              I’m reaching out to ask for help in securing crypto’s future and
                              America’s leadership in financial innovation.
                            </p>
                            <p>
                              The elections, new Congressional legislation, and court proceedings
                              will determine whether 52M Americans can continue to access crypto and
                              the fate of millions of jobs that hang in the balance. If any, this is
                              the time we need your support to fight for sensible rules for crypto
                              in the US.
                            </p>
                            <p>
                              To do our part, [Company Name] has become an industry partner of Stand
                              With Crypto, an independent grassroots movement that has made
                              tremendous progress in fighting back.
                            </p>
                            <ul>
                              <li>1M+ advocates</li>
                              <li>200k+ contacts with Congress</li>
                              <li>
                                $179M+ donated to organizations defending crypto, including Stand
                                With Crypto
                              </li>
                            </ul>
                            <p>
                              [For employees]
                              <br />
                              But we need to do more and need your help. Here’s what you can do:
                            </p>
                            <ul>
                              <li>
                                <ExternalLink
                                  href={
                                    'https://www.standwithcrypto.org/action/sign-up?utm_source=partner&utm_medium=email&utm_campaign=partner-share'
                                  }
                                >
                                  Join Stand With Crypto
                                </ExternalLink>
                              </li>
                              <li>
                                <ExternalLink
                                  href={
                                    'https://www.standwithcrypto.org/action/email?utm_source=partner&utm_medium=email&utm_campaign=partner-share'
                                  }
                                >
                                  Contact your Congressperson
                                </ExternalLink>
                              </li>
                              <li>
                                <ExternalLink
                                  href={
                                    'https://www.standwithcrypto.org/donate?utm_source=partner&utm_medium=email&utm_campaign=partner-share'
                                  }
                                >
                                  Make a donation
                                </ExternalLink>
                              </li>
                            </ul>
                            <p>
                              [For companies]
                              <br />
                              But we need to do more and need your help. Learn how your company can
                              support our efforts{' '}
                              <ExternalLink href={'https://www.standwithcrypto.org/contribute'}>
                                standwithcrypto.org/contribute
                              </ExternalLink>
                            </p>
                            <p>It's time to make our voices heard. Let’s keep crypto in America.</p>
                            <p>
                              Thank you. <br />
                              [Name]
                            </p>
                          </div>
                          <div className="text-center">
                            <DialogClose asChild>
                              <Button className="w-full max-w-sm" size="lg">
                                Close
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ),
                  },
                  {
                    title: 'Sponsor an event',
                    subtitle: 'Help us host our next pro-crypto rally',
                    cta: (
                      <Button asChild variant="primary-cta">
                        <ExternalLink
                          href={
                            'https://docs.google.com/forms/d/e/1FAIpQLSdVp_dkj3sOIq0mBpFcSp96wsUz8w4aEBvJuLWJcLumrVadcA/viewform'
                          }
                        >
                          Sponsor an event
                        </ExternalLink>
                      </Button>
                    ),
                  },
                  {
                    title: 'Add a link or button to your website',
                    subtitle: 'Take a look at the Figma below for examples',
                    cta: (
                      <Button asChild variant="primary-cta">
                        <a href="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/SWC%20Brand%20Assets%20-%202024-04-25.zip">
                          Download assets
                        </a>
                      </Button>
                    ),
                  },
                ].map((props, index) => (
                  <div
                    className="item-center flex flex-col justify-between gap-4 md:flex-row md:gap-6"
                    key={index}
                  >
                    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-bold sm:h-14 sm:w-14 sm:text-2xl">
                        <div>{index + 1}</div>
                      </div>
                      <div>
                        <h3 className="font-bold sm:text-xl">{props.title}</h3>
                        <h4 className="text-sm text-fontcolor-muted sm:text-base">
                          {props.subtitle}
                        </h4>
                      </div>
                    </div>
                    <div className="text-center">{props.cta}</div>
                  </div>
                ))}
              </div>
              <iframe
                allowFullScreen
                className="aspect-auto mt-20 min-h-[50vh] w-full border"
                src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F0UVwglzDupzR0hwTnZWGe9%2FOpen-Source-SWC%3Ftype%3Ddesign%26node-id%3D0%253A1%26mode%3Ddesign%26t%3D7XXRxL4bSW1HNARp-1"
              />
            </>
          ),
        },
        {
          imageSrc: '/pagesContent/contribute/code.svg',
          title: 'Contribute to our open source repo',
          subtitle: (
            <>
              We’re calling all software engineers to join us in the fight to keep crypto in
              America. Contribute directly to StandWithCrypto.org through our open source GitHub
              repo.
            </>
          ),
          content: (
            <Button asChild size="lg">
              <ExternalLink href={'https://github.com/Stand-With-Crypto/swc-web/'}>
                View Github
              </ExternalLink>
            </Button>
          ),
        },
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
          <PageTitle as="h3" className="mb-2" size="md">
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
