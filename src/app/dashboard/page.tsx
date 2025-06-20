import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg mb-4">Welcome to your Pokemon TCG Dashboard!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/cards" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Browse Cards</h2>
          <p className="text-gray-600">Explore Pokemon cards</p>
        </Link>
        
        <Link href="/collection" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">My Collection</h2>
          <p className="text-gray-600">Track your Pokemon cards</p>
        </Link>
        
        <Link href="/decks" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Deck Builder</h2>
          <p className="text-gray-600">Build competitive decks</p>
        </Link>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Total Cards</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-gray-600">Collections</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-gray-600">Decks</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}