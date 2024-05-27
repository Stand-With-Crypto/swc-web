import * as PortalPrimitive from '@radix-ui/react-portal'

export function Portal({ children, ...props }: React.ComponentProps<typeof PortalPrimitive.Root>) {
  return <PortalPrimitive.Root {...props}>{children}</PortalPrimitive.Root>
}
