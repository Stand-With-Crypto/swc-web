export function FeaturedPastEvents() {
  return (
    <section className="grid w-full gap-4">
      <h4 className="text-bold mb-2 text-center font-sans text-xl text-foreground lg:text-[2rem]">
        Featured past events
      </h4>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="group relative">
          <div className="h-[233px] w-full bg-blue-600 lg:max-w-[345px]" />
          <EventOverlay />
        </div>

        <div className="group relative">
          <div className="h-[233px] w-full bg-red-600 lg:max-w-[345px]" />
          <EventOverlay />
        </div>

        <div className="group relative">
          <div className="h-[233px] w-full bg-green-600 lg:max-w-[345px]" />
          <EventOverlay />
        </div>

        <div className="group relative">
          <div className="h-[233px] w-full bg-purple-600 lg:max-w-[345px]" />
          <EventOverlay />
        </div>

        <div className="group relative">
          <div className="h-[233px] w-full bg-orange-600 lg:max-w-[345px]" />
          <EventOverlay />
        </div>

        <div className="group relative cursor-pointer">
          <div className="h-[233px] w-full bg-amber-600 lg:max-w-[345px]" />
          <EventOverlay />
        </div>
      </div>
    </section>
  )
}

function EventOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-75" />

      <div className="relative z-10 flex h-full w-full cursor-pointer flex-col items-start justify-end p-4 text-left text-white">
        <h2 className="text-xl font-bold">Event</h2>
        <p className="text-lg">June 22, 2024</p>
      </div>
    </div>
  )
}
