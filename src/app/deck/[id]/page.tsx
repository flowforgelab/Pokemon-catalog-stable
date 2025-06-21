"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Copy, Download, Edit, Share2, Lock } from "lucide-react"
import { DeckImportExport } from "@/components/deck-import-export"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

interface DeckCard {
  cardId: string
  quantity: number
  card: {
    id: string
    name: string
    supertype: string
    subtypes: string[]
    types: string[]
    hp: string | null
    number: string
    setName: string
    setSeries: string
    artist: string | null
    rarity: string | null
    imageSmall: string
    imageLarge: string
    marketPrice: number | null
  }
}

interface DeckData {
  id: string
  userId: string
  name: string
  format: string
  description: string | null
  isPublic: boolean
  cards: DeckCard[]
  createdAt: string
  updatedAt: string
}

export default function PublicDeckPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [deck, setDeck] = useState<DeckData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDeck()
    }
  }, [params.id])

  const fetchDeck = async () => {
    try {
      const response = await fetch(`/api/decks/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/deck-builder')
          return
        }
        throw new Error('Failed to fetch deck')
      }
      
      const data = await response.json()
      setDeck(data)
    } catch (error) {
      toast({
        title: "Error loading deck",
        description: "Could not load this deck",
        variant: "destructive"
      })
      router.push('/deck-builder')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard"
    })
  }

  const cloneDeck = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to clone this deck",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${deck?.name} (Copy)`,
          format: deck?.format || 'standard',
          description: deck?.description,
          isPublic: false,
          cards: deck?.cards.map(c => ({
            cardId: c.cardId,
            quantity: c.quantity
          })) || []
        })
      })

      if (!response.ok) throw new Error('Failed to clone deck')

      const newDeck = await response.json()
      toast({
        title: "Deck cloned",
        description: "Deck copied to your collection"
      })
      router.push(`/deck-builder?id=${newDeck.id}`)
    } catch (error) {
      toast({
        title: "Clone failed",
        description: "Could not clone this deck",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!deck) return null

  const totalCards = deck.cards.reduce((sum, c) => sum + c.quantity, 0)
  const totalValue = deck.cards.reduce((sum, c) => 
    sum + (c.card.marketPrice || 0) * c.quantity, 0
  )

  const isOwner = user?.id === deck.userId

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/deck-builder">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deck Builder
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{deck.name}</h1>
              {!deck.isPublic && <Lock className="w-5 h-5 text-muted-foreground" />}
            </div>
            {deck.description && (
              <p className="text-muted-foreground mb-4">{deck.description}</p>
            )}
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{totalCards} cards</Badge>
              <Badge variant="outline">{deck.format}</Badge>
              <Badge variant="outline">${totalValue.toFixed(2)}</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner ? (
              <Button asChild>
                <Link href={`/deck-builder?id=${deck.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Deck
                </Link>
              </Button>
            ) : (
              <Button onClick={cloneDeck}>
                <Copy className="w-4 h-4 mr-2" />
                Clone Deck
              </Button>
            )}
            <Button variant="outline" onClick={copyShareLink}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={() => setShowExport(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="visual">Visual View</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {/* Pokemon */}
                  {deck.cards.filter(c => c.card.supertype === "Pokémon").length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Pokémon ({deck.cards.filter(c => c.card.supertype === "Pokémon").reduce((sum, c) => sum + c.quantity, 0)})
                      </h3>
                      <div className="space-y-2">
                        {deck.cards.filter(c => c.card.supertype === "Pokémon").map(item => (
                          <div key={item.cardId} className="flex items-center justify-between">
                            <span className="text-sm">
                              {item.quantity}x {item.card.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.card.setName} {item.card.number}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trainers */}
                  {deck.cards.filter(c => c.card.supertype === "Trainer").length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Trainers ({deck.cards.filter(c => c.card.supertype === "Trainer").reduce((sum, c) => sum + c.quantity, 0)})
                      </h3>
                      <div className="space-y-2">
                        {deck.cards.filter(c => c.card.supertype === "Trainer").map(item => (
                          <div key={item.cardId} className="flex items-center justify-between">
                            <span className="text-sm">
                              {item.quantity}x {item.card.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.card.setName} {item.card.number}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Energy */}
                  {deck.cards.filter(c => c.card.supertype === "Energy").length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Energy ({deck.cards.filter(c => c.card.supertype === "Energy").reduce((sum, c) => sum + c.quantity, 0)})
                      </h3>
                      <div className="space-y-2">
                        {deck.cards.filter(c => c.card.supertype === "Energy").map(item => (
                          <div key={item.cardId} className="flex items-center justify-between">
                            <span className="text-sm">
                              {item.quantity}x {item.card.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.card.setName} {item.card.number}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Deck Preview</h3>
              <div className="grid grid-cols-4 gap-2">
                {deck.cards.slice(0, 12).map((item, index) => (
                  <div key={`${item.cardId}-${index}`} className="relative">
                    <Image
                      src={item.card.imageSmall}
                      alt={item.card.name}
                      width={100}
                      height={140}
                      className="rounded"
                    />
                    {item.quantity > 1 && (
                      <Badge className="absolute top-1 right-1 text-xs">
                        x{item.quantity}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {deck.cards.length > 12 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  +{deck.cards.length - 12} more cards
                </p>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visual" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {deck.cards.map((item, index) => (
              <div key={`${item.cardId}-${index}`} className="relative group">
                <Image
                  src={item.card.imageSmall}
                  alt={item.card.name}
                  width={150}
                  height={210}
                  className="rounded shadow-md hover:shadow-lg transition-shadow"
                />
                {item.quantity > 1 && (
                  <Badge className="absolute top-2 right-2">
                    x{item.quantity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Type Distribution</h3>
              <div className="space-y-2">
                {Object.entries(
                  deck.cards.reduce((acc, item) => {
                    item.card.types?.forEach(type => {
                      acc[type] = (acc[type] || 0) + item.quantity
                    })
                    return acc
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span>{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Rarity Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(
                  deck.cards.reduce((acc, item) => {
                    const rarity = item.card.rarity || 'Unknown'
                    acc[rarity] = (acc[rarity] || 0) + item.quantity
                    return acc
                  }, {} as Record<string, number>)
                ).map(([rarity, count]) => (
                  <div key={rarity} className="flex justify-between">
                    <span>{rarity}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Cost Analysis</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Value</span>
                  <span className="font-semibold">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Card Value</span>
                  <span>${(totalValue / totalCards).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Expensive</span>
                  <span>
                    ${Math.max(...deck.cards.map(c => c.card.marketPrice || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <DeckImportExport
        open={showExport}
        onOpenChange={setShowExport}
        cards={deck.cards}
        deckName={deck.name}
        onImport={() => {}} // Read-only for public view
      />
    </div>
  )
}