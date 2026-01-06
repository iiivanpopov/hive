import type { VariantProps } from 'class-variance-authority'
import type { ElementType } from 'react'

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const typographyVariants = cva(
  'font-outfit text-foreground',
  {
    variants: {
      variant: {
        heading: 'text-2xl lg:text-3xl font-semibold',
        subheading: 'text-xl lg:text-2xl font-medium',
        body: 'text-base font-normal',
        caption: 'text-xs lg:text-sm leading-tight',
      },
    },
    defaultVariants: {
      variant: 'body',
    },
  },
)

function Typography<T extends ElementType = 'div'>({
  children,
  tag,
  className,
  variant = 'body',
  ...props
}: { tag?: T }
  & Omit<React.ComponentPropsWithoutRef<T>, 'tag'>
  & VariantProps<typeof typographyVariants>) {
  const Comp = tag ?? 'div'

  return (
    <Comp
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Typography }
