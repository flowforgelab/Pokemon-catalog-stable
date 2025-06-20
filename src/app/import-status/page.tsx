"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

interface ImportStats {
  totalCards: number
  cardsWithAttacks: number
  cardsWithAbilities: number
  cardsWithWeaknesses: number
  cardsWithEvolution: number
  progressPercentage: number
}

export default function ImportStatusPage() {
  const [stats, setStats] = useState<ImportStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/import/status')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch import status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading && !stats) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Game Data Import Status</h1>
      
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Overall Progress</h2>
              <span className="text-2xl font-bold">{stats?.progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={stats?.progressPercentage || 0} className="h-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                  <p className="text-2xl font-bold">{stats?.totalCards.toLocaleString()}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cards with Attacks</p>
                  <p className="text-2xl font-bold">{stats?.cardsWithAttacks.toLocaleString()}</p>
                </div>
                {stats && stats.cardsWithAttacks > 0 ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cards with Abilities</p>
                  <p className="text-2xl font-bold">{stats?.cardsWithAbilities.toLocaleString()}</p>
                </div>
                {stats && stats.cardsWithAbilities > 0 ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cards with Weaknesses</p>
                  <p className="text-2xl font-bold">{stats?.cardsWithWeaknesses.toLocaleString()}</p>
                </div>
                {stats && stats.cardsWithWeaknesses > 0 ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Evolution Chains</p>
                  <p className="text-2xl font-bold">{stats?.cardsWithEvolution.toLocaleString()}</p>
                </div>
                {stats && stats.cardsWithEvolution > 0 ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                )}
              </div>
            </Card>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={fetchStats} disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          {stats && stats.progressPercentage < 100 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> To complete the game data import, run the following command in your terminal:
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                node scripts/import-game-data.js
              </code>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}