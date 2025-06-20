import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4 animate-in">
      <h1 className="text-headline mb-4">Dashboard</h1>
      <p className="text-subtitle mb-4">Welcome to your Pokemon TCG Dashboard!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/cards" className="bg-card p-6 rounded-lg card-raised interactive">
          <h2 className="text-title mb-2">Browse Cards</h2>
          <p className="text-caption">Explore Pokemon cards</p>
        </Link>
        
        <Link href="/collection" className="bg-card p-6 rounded-lg card-raised interactive">
          <h2 className="text-title mb-2">My Collection</h2>
          <p className="text-caption">Track your Pokemon cards</p>
        </Link>
        
        <Link href="/decks" className="bg-card p-6 rounded-lg card-raised interactive">
          <h2 className="text-title mb-2">Deck Builder</h2>
          <p className="text-caption">Build competitive decks</p>
        </Link>
      </div>
      
      <div className="bg-secondary/50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-muted-foreground">Total Cards</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Collections</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-muted-foreground">Decks</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}