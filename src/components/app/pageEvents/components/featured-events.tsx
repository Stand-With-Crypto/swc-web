import { Button } from '@/components/ui/button'

const mockedTopPageEvent = {
  name: 'Featured event title',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad ',
  learnMoreLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  eventImageUrl: '',
}

export function FeaturedEvents() {
  return (
    <section className="flex max-w-[53.5rem] items-center">
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
        <div className="h-[233px] w-full bg-blue-600 lg:max-w-[417px]" />
        {/* <NextImage
        alt={mockedTopPageEvent.name}
        height={233}
        sizes="300px"
        src={mockedTopPageEvent.eventImageUrl}
        width={345}
      /> */}
        {/* Uncomment this Image block */}
        <div className="grid gap-2 lg:gap-4">
          <h4 className="text-bold font-sans text-xl text-foreground lg:text-[2rem]">
            {mockedTopPageEvent.name}
          </h4>
          <p className="font-mono text-base text-muted-foreground lg:text-xl">
            {mockedTopPageEvent.description}
          </p>
          <Button className="mt-2 w-full lg:mt-4 lg:w-fit" variant="secondary">
            Watch recap
          </Button>
        </div>
      </div>
    </section>
  )
}
