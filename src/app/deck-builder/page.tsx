"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Plus, 
  Minus, 
  Save, 
  Copy, 
  Download, 
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    imageSmall: string
    marketPrice: number | null
    regulationMark: string | null
    standardLegal: boolean
    expandedLegal: boolean
  }
}

interface SearchResult {
  id: string
  name: string
  supertype: string
  subtypes: string[]
  types: string[]
  hp: string | null
  number: string
  setName: string
  imageSmall: string
  marketPrice: number | null
  regulationMark: string | null
  standardLegal: boolean
  expandedLegal: boolean
}

export default function DeckBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Deck state
  const [deckId, setDeckId] = useState<string | null>(null)
  const [deckName, setDeckName] = useState("New Deck")
  const [format, setFormat] = useState("standard")
  const [description, setDescription] = useState("")
  const [cards, setCards] = useState<DeckCard[]>([])
  const [saving, setSaving] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("pokemon")
  
  // Import/Export dialog
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [importText, setImportText] = useState("")

  // Calculate deck statistics
  const deckStats = useMemo(() => {
    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0)
    const pokemonCount = cards.filter(c => c.card.supertype === "Pokémon").reduce((sum, c) => sum + c.quantity, 0)
    const trainerCount = cards.filter(c => c.card.supertype === "Trainer").reduce((sum, c) => sum + c.quantity, 0)
    const energyCount = cards.filter(c => c.card.supertype === "Energy").reduce((sum, c) => sum + c.quantity, 0)
    const totalValue = cards.reduce((sum, c) => sum + (c.card.marketPrice || 0) * c.quantity, 0)
    
    const isValid = totalCards === 60
    const isLegal = format === "unlimited" || cards.every(c => {
      if (format === "standard") return c.card.standardLegal
      if (format === "expanded") return c.card.expandedLegal
      return true
    })
    
    return {
      totalCards,
      pokemonCount,
      trainerCount,
      energyCount,
      totalValue,
      isValid,
      isLegal
    }
  }, [cards, format])

  // Search for cards
  const searchCards = async (query: string, type?: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    
    setSearching(true)
    try {
      const params = new URLSearchParams({ 
        q: query,
        limit: "20"
      })
      
      if (type && type !== "all") {
        params.append("supertype", type)
      }
      
      const response = await fetch(`/api/cards?${params}`)
      const data = await response.json()
      setSearchResults(data.cards || [])
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not search for cards",
        variant: "destructive"
      })
    } finally {
      setSearching(false)
    }
  }

  // Add card to deck
  const addCard = (card: SearchResult) => {
    const existingIndex = cards.findIndex(c => c.cardId === card.id)
    
    if (existingIndex >= 0) {
      // Increase quantity (max 4 for non-basic energy)
      const existing = cards[existingIndex]
      const isBasicEnergy = card.supertype === "Energy" && card.subtypes.includes("Basic")
      const maxQuantity = isBasicEnergy ? 60 : 4
      
      if (existing.quantity < maxQuantity) {
        const newCards = [...cards]
        newCards[existingIndex] = { ...existing, quantity: existing.quantity + 1 }
        setCards(newCards)
      }
    } else {
      // Add new card
      setCards([...cards, {
        cardId: card.id,
        quantity: 1,
        card
      }])
    }
  }

  // Remove card from deck
  const removeCard = (cardId: string) => {
    setCards(cards.filter(c => c.cardId !== cardId))
  }

  // Update card quantity
  const updateQuantity = (cardId: string, quantity: number) => {
    if (quantity <= 0) {
      removeCard(cardId)
    } else {
      setCards(cards.map(c => 
        c.cardId === cardId ? { ...c, quantity } : c
      ))
    }
  }

  // Save deck
  const saveDeck = async () => {
    setSaving(true)
    try {
      const deckData = {
        name: deckName,
        format: format.toUpperCase(),
        description,
        cards: cards.map(c => ({
          cardId: c.cardId,
          quantity: c.quantity
        }))
      }

      if (deckId) {
        // Update existing deck
        const response = await fetch(`/api/decks/${deckId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        })
        
        if (!response.ok) throw new Error('Failed to update deck')
        
        toast({
          title: "Deck saved",
          description: "Your changes have been saved"
        })
      } else {
        // Create new deck
        const response = await fetch('/api/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deckData)
        })
        
        if (!response.ok) throw new Error('Failed to create deck')
        
        const deck = await response.json()
        setDeckId(deck.id)
        
        toast({
          title: "Deck created",
          description: "Your deck has been saved"
        })
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save your deck",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Export deck as text
  const exportDeck = () => {
    const text = cards.map(c => 
      `${c.quantity} ${c.card.name} ${c.card.setName} ${c.card.number}`
    ).join('\n')
    
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Deck list copied in PTCGO format"
    })
  }

  // Import deck from text
  const importDeck = () => {
    // Simple parser - would be more robust in production
    const lines = importText.trim().split('\n')
    const imported: DeckCard[] = []
    
    // This is a simplified import - in production would match against actual cards
    lines.forEach(line => {
      const match = line.match(/^(\d+)\s+(.+)/)
      if (match) {
        const quantity = parseInt(match[1])
        const cardName = match[2]
        // Would need to look up card by name here
        toast({
          title: "Import partially implemented",
          description: "Full import requires card name matching",
          variant: "destructive"
        })
      }
    })
    
    setImportExportOpen(false)
  }

  // Analyze deck
  const analyzeDeck = async () => {
    if (!deckId) {
      await saveDeck()
    }
    
    if (deckId) {
      router.push(`/deck-analyzer?id=${deckId}`)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <Input
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="text-2xl font-bold mb-2"
            placeholder="Deck Name"
          />
          <div className="flex gap-4 items-center">
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deck description (optional)"
              className="max-w-sm"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setImportExportOpen(true)} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button onClick={exportDeck} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button onClick={analyzeDeck} variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-1" />
            Analyze
          </Button>
          <Button onClick={saveDeck} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Deck Stats Bar */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${deckStats.totalCards === 60 ? 'text-green-600' : 'text-red-600'}`}>
                {deckStats.totalCards}/60
              </div>
              <div className="text-xs text-muted-foreground">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-blue-600">{deckStats.pokemonCount}</div>
              <div className="text-xs text-muted-foreground">Pokémon</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-orange-600">{deckStats.trainerCount}</div>
              <div className="text-xs text-muted-foreground">Trainers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-600">{deckStats.energyCount}</div>
              <div className="text-xs text-muted-foreground">Energy</div>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <div className="text-lg font-semibold">${deckStats.totalValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
            
            <div className="flex gap-2">
              {deckStats.isValid ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Invalid
                </Badge>
              )}
              
              {deckStats.isLegal ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Legal
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Illegal
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Card Search */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Card Search</h3>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchCards(e.target.value, activeTab)
                }}
                placeholder="Search for cards..."
                className="pl-9"
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pokemon">Pokémon</TabsTrigger>
                <TabsTrigger value="trainer">Trainer</TabsTrigger>
                <TabsTrigger value="energy">Energy</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {searching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => addCard(card)}
                    >
                      <img 
                        src={card.imageSmall} 
                        alt={card.name}
                        className="w-16 h-22 object-contain rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{card.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {card.setName} • {card.number}
                        </div>
                        {card.marketPrice && (
                          <div className="text-sm font-medium">
                            ${card.marketPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No cards found
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Search for cards to add to your deck
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Deck List */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Deck List</h3>
          
          <ScrollArea className="h-[680px]">
            <div className="space-y-4">
              {/* Pokémon */}
              {cards.filter(c => c.card.supertype === "Pokémon").length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Pokémon ({cards.filter(c => c.card.supertype === "Pokémon").reduce((sum, c) => sum + c.quantity, 0)})
                  </h4>
                  <div className="space-y-1">
                    {cards.filter(c => c.card.supertype === "Pokémon").map(item => (
                      <DeckListItem 
                        key={item.cardId} 
                        item={item}
                        onQuantityChange={(q) => updateQuantity(item.cardId, q)}
                        onRemove={() => removeCard(item.cardId)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Trainers */}
              {cards.filter(c => c.card.supertype === "Trainer").length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Trainers ({cards.filter(c => c.card.supertype === "Trainer").reduce((sum, c) => sum + c.quantity, 0)})
                  </h4>
                  <div className="space-y-1">
                    {cards.filter(c => c.card.supertype === "Trainer").map(item => (
                      <DeckListItem 
                        key={item.cardId} 
                        item={item}
                        onQuantityChange={(q) => updateQuantity(item.cardId, q)}
                        onRemove={() => removeCard(item.cardId)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Energy */}
              {cards.filter(c => c.card.supertype === "Energy").length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Energy ({cards.filter(c => c.card.supertype === "Energy").reduce((sum, c) => sum + c.quantity, 0)})
                  </h4>
                  <div className="space-y-1">
                    {cards.filter(c => c.card.supertype === "Energy").map(item => (
                      <DeckListItem 
                        key={item.cardId} 
                        item={item}
                        onQuantityChange={(q) => updateQuantity(item.cardId, q)}
                        onRemove={() => removeCard(item.cardId)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {cards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Add cards from the search panel to build your deck
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Import/Export Dialog */}
      <Dialog open={importExportOpen} onOpenChange={setImportExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your deck list here..."
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportExportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={importDeck}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DeckListItem({ 
  item, 
  onQuantityChange, 
  onRemove 
}: { 
  item: DeckCard
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded hover:bg-accent/50">
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => onQuantityChange(item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => onQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex-1">
        <span className="font-medium">{item.card.name}</span>
        <span className="text-sm text-muted-foreground ml-2">
          {item.card.setName} {item.card.number}
        </span>
      </div>
      
      {item.card.marketPrice && (
        <span className="text-sm font-medium">
          ${(item.card.marketPrice * item.quantity).toFixed(2)}
        </span>
      )}
      
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-destructive"
        onClick={onRemove}
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  )
}