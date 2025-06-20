import * as React from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { TypeBadge } from './type-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface PokemonCardProps {
  id: string
  name: string
  image?: string
  types?: string[]
  hp?: number
  rarity?: string
  price?: number
  tcgplayerUrl?: string
  className?: string
  onClick?: () => void
  loading?: boolean
}

const PokemonCard = React.memo(function PokemonCard({
  id,
  name,
  image,
  types = [],
  hp,
  rarity,
  price,
  tcgplayerUrl,
  className,
  onClick,
  loading
}: PokemonCardProps) {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <Skeleton className="aspect-[3/4] w-full" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg cursor-pointer",
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <p className="text-sm text-muted-foreground">{id}</p>
        </div>
        
        {types.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <TypeBadge 
                key={type} 
                type={type.toLowerCase() as any} 
                size="sm"
              />
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm">
          {hp && (
            <div className="font-medium">
              HP <span className="text-lg">{hp}</span>
            </div>
          )}
          {rarity && (
            <div className="text-muted-foreground">
              {rarity}
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            {price !== undefined && price !== null ? (
              <span className="text-2xl font-bold text-green-600">
                ${price.toFixed(2)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No Price Available
              </span>
            )}
            {tcgplayerUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(tcgplayerUrl, '_blank')
                }}
                className="text-muted-foreground hover:text-primary p-1 rounded"
                title="Buy on TCGPlayer"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export { PokemonCard }