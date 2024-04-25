export function PACFooter() {
  /* The default footer has a margin separating it from the main content. 
    Rather than having to specify margin on every page, we just want to relatively position this addendum to the footer 
    so it appears away from the main content. Kinda hacky but can always change later on
    */
  return (
    <div className="relative top-20 mx-auto max-w-3xl rounded-3xl border-2 p-4">
      Paid for by Stand with Crypto Alliance, Inc. Political Action Committee. Not authorized by any
      candidate or candidate’s committee. 302-566-8028.
    </div>
  )
}
