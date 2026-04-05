import type { VariantProps } from 'class-variance-authority'
import type { ElementType } from 'react'

import { cva } from 'class-variance-authority'

import { cn } from '@/utils'

const typographyVariants = cva(
  'font-sans text-foreground',
  {
    variants: {
      variant: {
        heading: `
          text-2xl font-semibold
          lg:text-3xl
        `,
        subheading: `
          text-xl font-medium
          lg:text-2xl/10
        `,
        body: 'text-base/6 font-normal',
        caption: `
          text-xs/tight text-muted-foreground
          lg:text-sm
        `,
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
