import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCardCount } from "@/lib/type-guards"

interface StatsCardsProps {
  totalCards: number
  totalSets: number
  totalUsers?: number
}

export function StatsCards({ totalCards, totalSets, totalUsers = 0 }: StatsCardsProps) {
  const stats = [
    { title: "Total Cards", value: formatCardCount(totalCards), description: "Available in catalog" },
    { title: "Card Sets", value: totalSets.toString(), description: "Unique collections" },
    { title: "Active Users", value: formatCardCount(totalUsers), description: "Collectors worldwide" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}