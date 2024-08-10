import React from 'react'

export function DialogFooterSection({ children }: React.PropsWithChildren) {
  return (
    <div
      className="z-10 mt-auto flex flex-col items-center justify-center border border-t p-6 sm:flex-row md:px-12"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
    >
      {children}
    </div>
  )
}
