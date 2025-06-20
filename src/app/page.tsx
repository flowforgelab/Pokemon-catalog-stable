import { HeroSection } from '@/components/hero-section'
import { QuickSearch } from '@/components/quick-search'
import { StatsCards } from '@/components/stats-cards'

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stats`, {
      cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return { totalCards: 18405, totalSets: 168, totalUsers: 1250 }
  }
}

export default async function Home() {
  const stats = await getStats()
  
  return (
    <div className="flex flex-col gap-8">
      <HeroSection />
      <div className="container space-y-8">
        <QuickSearch />
        <StatsCards {...stats} />
      </div>
    </div>
  )
}