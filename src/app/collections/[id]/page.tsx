"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Search, Trash2, Edit2, Save, X } from "lucide-react"
import { Collection, CollectionCard, PokemonCard } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [cards, setCards] = useState<CollectionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [cardSearch, setCardSearch] = useState("")
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([])
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [condition, setCondition] = useState("Near Mint")
  const [editingCard, setEditingCard] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && isSignedIn && params.id) {
      fetchCollection()
      fetchCollectionCards()
    }
  }, [isLoaded, isSignedIn, params.id])

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCollection(data)
      } else if (response.status === 404) {
        router.push('/collections')
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
    }
  }

  const fetchCollectionCards = async () => {
    try {
      const response = await fetch(`/api/collections/${params.id}/cards`)
      if (response.ok) {
        const data = await response.json()
        setCards(data)
      }
    } catch (error) {
      console.error('Error fetching collection cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchCards = async () => {
    if (!cardSearch) return
    
    try {
      const response = await fetch(`/api/cards?search=${encodeURIComponent(cardSearch)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.cards)
      }
    } catch (error) {
      console.error('Error searching cards:', error)
    }
  }

  const addCardToCollection = async () => {
    if (!selectedCard) return
    
    try {
      const response = await fetch(`/api/collections/${params.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard.id,
          quantity,
          condition,
          language: "English",
          notes: ""
        })
      })
      
      if (response.ok) {
        const newCard = await response.json()
        setCards([...cards, { ...newCard, card: selectedCard }])
        setShowAddDialog(false)
        setSelectedCard(null)
        setQuantity(1)
        setCardSearch("")
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error adding card:', error)
    }
  }

  const updateCardQuantity = async (cardId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    try {
      const response = await fetch(`/api/collections/${params.id}/cards`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          quantity: newQuantity
        })
      })
      
      if (response.ok) {
        setCards(cards.map(c => 
          c.cardId === cardId ? { ...c, quantity: newQuantity } : c
        ))
        setEditingCard(null)
      }
    } catch (error) {
      console.error('Error updating card:', error)
    }
  }

  const removeCard = async (cardId: string) => {
    if (!confirm('Remove this card from the collection?')) return
    
    try {
      const response = await fetch(`/api/collections/${params.id}/cards`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      })
      
      if (response.ok) {
        setCards(cards.filter(c => c.cardId !== cardId))
      }
    } catch (error) {
      console.error('Error removing card:', error)
    }
  }

  const filteredCards = cards.filter(item =>
    item.card?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.card?.setName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalValue = cards.reduce((sum, item) => 
    sum + (item.card?.marketPrice || 0) * item.quantity, 0
  )

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to view this collection</h2>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="h-48 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!collection) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/collections">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground mt-2">{collection.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary">{cards.length} cards</Badge>
              <Badge variant="outline">Value: ${totalValue.toFixed(2)}</Badge>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cards
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Cards to Collection</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for cards..."
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchCards()}
                  />
                  <Button onClick={searchCards}>Search</Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {searchResults.map((card) => (
                      <Card
                        key={card.id}
                        className={`p-2 cursor-pointer transition-all ${
                          selectedCard?.id === card.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedCard(card)}
                      >
                        <Image
                          src={card.imageSmall}
                          alt={card.name}
                          width={100}
                          height={140}
                          className="w-full h-auto rounded"
                        />
                        <p className="text-xs mt-1 truncate">{card.name}</p>
                      </Card>
                    ))}
                  </div>
                )}
                
                {selectedCard && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={selectedCard.imageSmall}
                        alt={selectedCard.name}
                        width={80}
                        height={112}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedCard.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCard.setName} • {selectedCard.number}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Condition</label>
                        <Select value={condition} onValueChange={setCondition}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mint">Mint</SelectItem>
                            <SelectItem value="Near Mint">Near Mint</SelectItem>
                            <SelectItem value="Lightly Played">Lightly Played</SelectItem>
                            <SelectItem value="Moderately Played">Moderately Played</SelectItem>
                            <SelectItem value="Heavily Played">Heavily Played</SelectItem>
                            <SelectItem value="Damaged">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button onClick={addCardToCollection} className="w-full">
                      Add to Collection
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search in collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No cards in this collection yet</h3>
          <p className="text-muted-foreground mb-4">Start adding cards to build your collection</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Cards
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
              {item.card && (
                <>
                  <div className="relative mb-2">
                    <Image
                      src={item.card.imageSmall}
                      alt={item.card.name}
                      width={200}
                      height={280}
                      className="w-full h-auto rounded"
                    />
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      x{item.quantity}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-sm">{item.card.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {item.card.setName} • {item.card.number}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.condition}
                    </Badge>
                    {item.card.marketPrice && (
                      <span className="text-sm font-medium">
                        ${(item.card.marketPrice * item.quantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1 mt-2">
                    {editingCard === item.cardId ? (
                      <>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1
                            setCards(cards.map(c => 
                              c.cardId === item.cardId ? { ...c, quantity: newQty } : c
                            ))
                          }}
                          className="h-8"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => updateCardQuantity(item.cardId, item.quantity)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingCard(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingCard(item.cardId)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => removeCard(item.cardId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}