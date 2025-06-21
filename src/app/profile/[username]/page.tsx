"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Package, Layers, Trophy, TrendingUp } from "lucide-react"
import { Collection, Deck } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

interface UserProfile {
  id: string
  username: string
  imageUrl: string
  joinedDate: string
  stats: {
    totalCollections: number
    totalDecks: number
    totalCards: number
    totalValue: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [decks, setDecks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.username) {
      fetchUserProfile()
    }
  }, [params.username])

  const fetchUserProfile = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data
      setProfile({
        id: "user_123",
        username: params.username as string,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${params.username}`,
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          totalCollections: 5,
          totalDecks: 12,
          totalCards: 347,
          totalValue: 1234.56
        }
      })

      // Fetch public collections
      const collectionsRes = await fetch('/api/collections/public?limit=6')
      if (collectionsRes.ok) {
        const data = await collectionsRes.json()
        setCollections(data.collections.slice(0, 3)) // Mock filtering by user
      }

      // Mock deck data
      setDecks([
        { id: '1', name: 'Charizard ex Control', format: 'standard', cards: 60, value: 234.50 },
        { id: '2', name: 'Lost Box Toolbox', format: 'standard', cards: 60, value: 189.99 },
        { id: '3', name: 'Gardevoir ex', format: 'standard', cards: 60, value: 156.75 }
      ])
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 bg-muted rounded-full"></div>
            <div>
              <div className="h-8 bg-muted rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const memberDays = Math.floor((Date.now() - new Date(profile.joinedDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.imageUrl} alt={profile.username} />
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member for {memberDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{profile.stats.totalCollections}</p>
              <p className="text-sm text-muted-foreground">Collections</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{profile.stats.totalDecks}</p>
              <p className="text-sm text-muted-foreground">Decks</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{profile.stats.totalCards}</p>
              <p className="text-sm text-muted-foreground">Cards</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">${profile.stats.totalValue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="collections" className="w-full">
        <TabsList>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="decks">Decks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="mt-6">
          {collections.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No public collections yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">{collection.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {collection._count?.cards || 0} cards
                      </Badge>
                    </div>
                  </div>
                  
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-4 gap-1 mb-4">
                    {collection.cards?.slice(0, 4).map((item, i) => (
                      <div key={i} className="aspect-[3/4] relative">
                        {item.card && (
                          <Image
                            src={item.card.imageSmall}
                            alt={item.card.name}
                            fill
                            className="object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Link href={`/collections/${collection.id}`}>
                    <Button variant="outline" className="w-full">
                      View Collection
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="decks" className="mt-6">
          {decks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No public decks yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <Card key={deck.id} className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{deck.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{deck.format}</Badge>
                    <Badge variant="outline">{deck.cards} cards</Badge>
                    <Badge variant="outline">${deck.value}</Badge>
                  </div>
                  <Link href={`/deck/${deck.id}`}>
                    <Button variant="outline" className="w-full">
                      View Deck
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">
                  Created collection <span className="font-semibold">Vintage Charizards</span>
                </p>
                <span className="text-xs text-muted-foreground ml-auto">2 days ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">
                  Shared deck <span className="font-semibold">Lost Box Toolbox</span>
                </p>
                <span className="text-xs text-muted-foreground ml-auto">5 days ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">
                  Added 15 cards to <span className="font-semibold">Base Set Collection</span>
                </p>
                <span className="text-xs text-muted-foreground ml-auto">1 week ago</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}