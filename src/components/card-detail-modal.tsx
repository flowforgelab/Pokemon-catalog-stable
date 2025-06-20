"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { Card } from "@/lib/types/index"

interface CardDetailModalProps {
  card: Card | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardDetailModal({ card, open, onOpenChange }: CardDetailModalProps) {
  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{card.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            <Image
              src={card.imageLarge || card.imageSmall}
              alt={card.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-subtitle mb-2">Card Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Set:</dt>
                  <dd>{card.setName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Number:</dt>
                  <dd>{card.number}/{card.setTotal}</dd>
                </div>
                {card.artist && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Artist:</dt>
                    <dd>{card.artist}</dd>
                  </div>
                )}
                {card.rarity && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rarity:</dt>
                    <dd>{card.rarity}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            {card.types.length > 0 && (
              <div>
                <h3 className="text-subtitle mb-2">Types</h3>
                <div className="flex gap-2 flex-wrap">
                  {card.types.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {card.hp && (
              <div>
                <h3 className="text-subtitle mb-2">Stats</h3>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">HP</span>
                    <span className="text-2xl font-bold">{card.hp}</span>
                  </div>
                </div>
              </div>
            )}
            
            {card.subtypes && card.subtypes.length > 0 && (
              <div>
                <h3 className="text-subtitle mb-2">Subtypes</h3>
                <div className="flex gap-2 flex-wrap">
                  {card.subtypes.map((subtype) => (
                    <Badge key={subtype} variant="outline">
                      {subtype}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t space-y-3">
              {card.marketPrice !== null && card.marketPrice !== undefined && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Market Price</p>
                  <p className="text-3xl font-bold text-green-600">${card.marketPrice.toFixed(2)}</p>
                </div>
              )}
              
              {card.tcgplayerUrl && (
                <Button className="w-full" asChild>
                  <a href={card.tcgplayerUrl} target="_blank" rel="noopener noreferrer">
                    View on TCGPlayer
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}