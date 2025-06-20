import * as React from 'react'
import { PokemonCard } from './pokemon-card'
import { cn } from '@/lib/utils'

interface PokemonGridProps {
  cards: Array<{
    id: string
    name: string
    image?: string
    types?: string[]
    hp?: number
    rarity?: string
    price?: number
    tcgplayerUrl?: string
  }>
  loading?: boolean
  onCardClick?: (cardId: string) => void
  className?: string
}

const PokemonGrid = React.memo(function PokemonGrid({ 
  cards, 
  loading, 
  onCardClick,
  className 
}: PokemonGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4",
      className
    )}>
      {loading
        ? Array.from({ length: 12 }).map((_, i) => (
            <PokemonCard
              key={i}
              id=""
              name=""
              loading
            />
          ))
        : cards.map((card) => (
            <PokemonCard
              key={card.id}
              {...card}
              onClick={() => onCardClick?.(card.id)}
            />
          ))
      }
    </div>
  )
})

export { PokemonGrid }