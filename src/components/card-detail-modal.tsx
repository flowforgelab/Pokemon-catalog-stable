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
                {card.evolvesFrom && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Evolves from:</dt>
                    <dd>{card.evolvesFrom}</dd>
                  </div>
                )}
                {card.regulationMark && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Regulation:</dt>
                    <dd>
                      <Badge variant="outline">{card.regulationMark}</Badge>
                    </dd>
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
                <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">HP</span>
                    <span className="text-2xl font-bold">{card.hp}</span>
                  </div>
                  {card.retreatCost !== null && card.retreatCost !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Retreat Cost</span>
                      <span className="font-semibold">{card.retreatCost} ⚪</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {card.attacks && card.attacks.length > 0 && (
              <div>
                <h3 className="text-subtitle mb-2">Attacks</h3>
                <div className="space-y-2">
                  {card.attacks.map((attack) => (
                    <div key={attack.id} className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-semibold">{attack.name}</h4>
                          <div className="flex gap-1 mt-1">
                            {attack.cost.map((energy, i) => (
                              <span key={i} className="text-xs">
                                {energy === 'Colorless' ? '⚪' : energy[0]}
                              </span>
                            ))}
                          </div>
                        </div>
                        {attack.damage && (
                          <span className="text-2xl font-bold">{attack.damage}</span>
                        )}
                      </div>
                      {attack.text && (
                        <p className="text-sm text-muted-foreground mt-2">{attack.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {card.abilities && card.abilities.length > 0 && (
              <div>
                <h3 className="text-subtitle mb-2">Abilities</h3>
                <div className="space-y-2">
                  {card.abilities.map((ability) => (
                    <div key={ability.id} className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {ability.type}
                        </Badge>
                        <h4 className="font-semibold">{ability.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{ability.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(card.weaknesses && card.weaknesses.length > 0) || 
             (card.resistances && card.resistances.length > 0) ? (
              <div>
                <h3 className="text-subtitle mb-2">Weaknesses & Resistances</h3>
                <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
                  {card.weaknesses && card.weaknesses.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Weakness:</span>
                      <div className="flex gap-2 mt-1">
                        {card.weaknesses.map((weakness) => (
                          <Badge key={weakness.id} variant="destructive">
                            {weakness.type} {weakness.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {card.resistances && card.resistances.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Resistance:</span>
                      <div className="flex gap-2 mt-1">
                        {card.resistances.map((resistance) => (
                          <Badge key={resistance.id} variant="secondary">
                            {resistance.type} {resistance.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            
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
            
            {card.rules && card.rules.length > 0 && (
              <div>
                <h3 className="text-subtitle mb-2">Rules</h3>
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  {card.rules.map((rule, i) => (
                    <p key={i} className="text-sm text-destructive-foreground">
                      {rule}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {card.flavorText && (
              <div className="italic text-sm text-muted-foreground border-l-4 border-muted pl-4">
                "{card.flavorText}"
              </div>
            )}
            
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-center gap-2 text-sm">
                {card.standardLegal && (
                  <Badge variant="outline" className="text-green-600">
                    Standard Legal
                  </Badge>
                )}
                {card.expandedLegal && (
                  <Badge variant="outline" className="text-blue-600">
                    Expanded Legal
                  </Badge>
                )}
              </div>
              
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