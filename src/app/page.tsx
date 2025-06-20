import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-2 text-center">Pokemon TCG Catalog</h1>
        <p className="text-center text-gray-600 mb-8">Track and manage your Pokemon card collection</p>
        
        <SignedOut>
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle>Welcome, Trainer!</CardTitle>
              <CardDescription>Sign in to start building your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Create an account to track your cards, build decks, and discover new additions for your collection.
              </p>
              <div className="flex gap-4">
                <Link href="/cards" className="flex-1">
                  <Button variant="outline" className="w-full">Browse Cards</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </SignedOut>
        
        <SignedIn>
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
              <CardDescription>Continue managing your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
                <Link href="/cards" className="flex-1">
                  <Button variant="outline" className="w-full">Browse Cards</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </SignedIn>
        
        <div className="grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 gap-4 mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">9,000+ Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Browse through thousands of Pokemon cards from various sets and expansions.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Track Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Keep track of which cards you own and which ones you're looking for.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Build Decks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create and manage competitive decks with our deck building tools.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}