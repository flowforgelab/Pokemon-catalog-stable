import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, Layers, Trophy, Settings, User } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/");
  }

  // Fetch user stats
  const [collections, decks] = await Promise.all([
    prisma.collection.findMany({
      where: { userId },
      include: { _count: { select: { cards: true } } }
    }),
    prisma.deck.findMany({
      where: { userId },
      include: { _count: { select: { cards: true } } }
    })
  ]);

  const totalCards = collections.reduce((sum, col) => sum + col._count.cards, 0);
  const username = user?.username || user?.firstName || "User";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.imageUrl} alt={username} />
              <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {username}!</h1>
              <p className="text-muted-foreground">Manage your Pokemon TCG collection</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/profile/${username}`}>
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{collections.length}</p>
              <p className="text-muted-foreground">Collections</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{decks.length}</p>
              <p className="text-muted-foreground">Decks Built</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalCards}</p>
              <p className="text-muted-foreground">Total Cards</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/cards">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold mb-2">Browse Cards</h3>
            <p className="text-sm text-muted-foreground">Explore the complete card database</p>
          </Card>
        </Link>
        
        <Link href="/collections">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold mb-2">My Collections</h3>
            <p className="text-sm text-muted-foreground">Manage your card collections</p>
          </Card>
        </Link>
        
        <Link href="/deck-builder">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold mb-2">Deck Builder</h3>
            <p className="text-sm text-muted-foreground">Create competitive decks</p>
          </Card>
        </Link>
        
        <Link href="/deck-analyzer">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold mb-2">AI Analyzer</h3>
            <p className="text-sm text-muted-foreground">Get AI deck insights</p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {collections.length === 0 && decks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No activity yet. Start by creating a collection!</p>
            <Link href="/collections">
              <Button>
                <Package className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.slice(0, 3).map((collection) => (
              <div key={collection.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{collection.name}</p>
                    <p className="text-sm text-muted-foreground">{collection._count.cards} cards</p>
                  </div>
                </div>
                <Link href={`/collections/${collection.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            ))}
            {decks.slice(0, 3).map((deck) => (
              <div key={deck.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{deck.name}</p>
                    <p className="text-sm text-muted-foreground">{deck.format} • {deck._count.cards} cards</p>
                  </div>
                </div>
                <Link href={`/deck-builder?id=${deck.id}`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}