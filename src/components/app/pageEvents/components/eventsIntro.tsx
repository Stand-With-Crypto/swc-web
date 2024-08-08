import { Button } from '@/components/ui/button'

export function EventsIntro() {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="flex flex-col gap-4 lg:gap-6">
        <h3 className="text-bold text-center font-sans text-xl text-foreground lg:text-[2rem]">
          Events
        </h3>
        <p className="text-center font-mono text-base text-muted-foreground lg:text-xl">
          Stand With Crypto is dedicated to engaging and empowering the crypto community both online
          and at real-world events. Crypto is a major force in our economy, our politics, and our
          culture – but we need to keep up the momentum. See below for a list of events happening
          nationwide, as well as information about how you can host your own SWC meet-up.
        </p>
      </div>
      <Button className="w-full font-bold lg:w-auto">Host an event</Button>
    </section>
  )
}
