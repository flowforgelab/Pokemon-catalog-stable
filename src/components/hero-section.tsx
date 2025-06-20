import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export function HeroSection() {
  return (
    <section className="text-center space-y-6 py-12 md:py-24">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Your Ultimate <span className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pokemon TCG</span> Companion
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Track collections, build decks, and discover the value of your cards with real-time pricing.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Button size="lg" asChild>
          <Link href="/cards">Browse Cards</Link>
        </Button>
        <SignedOut>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">My Collection</Link>
          </Button>
        </SignedIn>
      </div>
    </section>
  )
}