import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const typeBadgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-fast hover:scale-105',
  {
    variants: {
      type: {
        normal: 'bg-pokemon-normal text-white',
        fire: 'bg-pokemon-fire text-white',
        water: 'bg-pokemon-water text-white',
        grass: 'bg-pokemon-grass text-white',
        electric: 'bg-pokemon-electric text-black',
        ice: 'bg-pokemon-ice text-black',
        fighting: 'bg-pokemon-fighting text-white',
        poison: 'bg-pokemon-poison text-white',
        ground: 'bg-pokemon-ground text-white',
        flying: 'bg-pokemon-flying text-white',
        psychic: 'bg-pokemon-psychic text-white',
        bug: 'bg-pokemon-bug text-white',
        rock: 'bg-pokemon-rock text-white',
        ghost: 'bg-pokemon-ghost text-white',
        dragon: 'bg-pokemon-dragon text-white',
        dark: 'bg-pokemon-dark text-white',
        steel: 'bg-pokemon-steel text-black',
        fairy: 'bg-pokemon-fairy text-black',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface TypeBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof typeBadgeVariants> {
  type: NonNullable<VariantProps<typeof typeBadgeVariants>['type']>
}

const TypeBadge = React.forwardRef<HTMLSpanElement, TypeBadgeProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(typeBadgeVariants({ type, size, className }))}
        {...props}
      >
        {type}
      </span>
    )
  }
)
TypeBadge.displayName = 'TypeBadge'

export { TypeBadge, typeBadgeVariants }