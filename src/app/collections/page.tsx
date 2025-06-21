"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Lock, Globe, Trash2, Edit } from "lucide-react"
import { Collection } from "@/lib/types"
import Link from "next/link"

export default function CollectionsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    isPublic: false
  })

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchCollections()
    }
  }, [isLoaded, isSignedIn])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCollection = async () => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection)
      })
      
      if (response.ok) {
        const created = await response.json()
        setCollections([created, ...collections])
        setShowCreateDialog(false)
        setNewCollection({ name: "", description: "", isPublic: false })
      }
    } catch (error) {
      console.error('Error creating collection:', error)
    }
  }

  const deleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return
    
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCollections(collections.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
    }
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to manage your collections</h2>
          <p className="text-muted-foreground">Create and organize your Pokemon card collections</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Collections</h1>
          <p className="text-muted-foreground mt-2">Organize your Pokemon cards</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  placeholder="My Charizard Collection"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="All my Charizard cards from different sets..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={newCollection.isPublic}
                  onChange={(e) => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="public" className="flex items-center cursor-pointer">
                  <Globe className="w-4 h-4 mr-2" />
                  Make this collection public
                </Label>
              </div>
              <Button 
                onClick={createCollection} 
                className="w-full"
                disabled={!newCollection.name}
              >
                Create Collection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">Create your first collection to start organizing your cards</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Card key={collection.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{collection.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {collection._count?.cards || 0} cards
                    </Badge>
                    {collection.isPublic ? (
                      <Badge variant="outline" className="gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/collections/${collection.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteCollection(collection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {collection.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {collection.description}
                </p>
              )}
              
              <Link href={`/collections/${collection.id}`}>
                <Button className="w-full" variant="outline">
                  View Collection
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}