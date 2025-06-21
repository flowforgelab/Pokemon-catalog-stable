"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Sparkles, TrendingUp, Shield, Zap, Target, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export default function DeckAnalyzerPage() {
  const [deckName, setDeckName] = useState("")
  const [deckList, setDeckList] = useState("")
  const [format, setFormat] = useState("STANDARD")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [deckId, setDeckId] = useState<string | null>(null)
  const [budget, setBudget] = useState<string>("")
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!deckName || !deckList) {
      toast({
        title: "Missing Information",
        description: "Please provide a deck name and card list",
        variant: "destructive"
      })
      return
    }

    setAnalyzing(true)
    try {
      // Parse deck list (simplified - in production would be more robust)
      const cards = parseDeckList(deckList)
      
      // Create deck
      const deckResponse = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckName,
          format,
          description: "AI Analysis Deck",
          cards
        })
      })

      if (!deckResponse.ok) throw new Error('Failed to create deck')
      const deck = await deckResponse.json()

      // Analyze deck
      const analysisResponse = await fetch(`/api/decks/${deck.id}/analyze`, {
        method: 'POST'
      })

      if (!analysisResponse.ok) throw new Error('Failed to analyze deck')
      const analysisData = await analysisResponse.json()
      
      setAnalysis(analysisData)
      setDeckId(deck.id)
      toast({
        title: "Analysis Complete!",
        description: "Your deck has been analyzed successfully"
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please check your deck list format and try again",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Deck Analyzer</h1>
        <p className="text-muted-foreground">
          Get instant AI-powered analysis of your Pokemon TCG deck
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Deck Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="deckName">Deck Name</Label>
                <Input
                  id="deckName"
                  placeholder="My Awesome Deck"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="EXPANDED">Expanded</SelectItem>
                    <SelectItem value="UNLIMITED">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deckList">Deck List (60 cards)</Label>
                <Textarea
                  id="deckList"
                  placeholder="4 Pikachu ex sv1-123&#10;2 Raichu sv2-45&#10;4 Professor's Research..."
                  value={deckList}
                  onChange={(e) => setDeckList(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: [Quantity] [Card Name] [Set-Number]
                </p>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Deck
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Currently analyzing with limited game data ({(231/15602 * 100).toFixed(1)}% complete).</p>
                <p>Analysis accuracy will improve as more cards are imported.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* Overall Score */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Overall Analysis</h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">
                      {analysis.overallScore}
                    </div>
                    <p className="text-muted-foreground">Overall Score</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium">
                      {analysis.strategy} DECK
                    </div>
                  </div>
                </div>
              </Card>

              {/* Score Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                <div className="space-y-3">
                  <ScoreItem
                    icon={<Target className="h-4 w-4" />}
                    label="Consistency"
                    score={analysis.consistencyScore}
                  />
                  <ScoreItem
                    icon={<Zap className="h-4 w-4" />}
                    label="Speed"
                    score={analysis.speedScore}
                  />
                  <ScoreItem
                    icon={<Shield className="h-4 w-4" />}
                    label="Resilience"
                    score={analysis.resilienceScore}
                  />
                  <ScoreItem
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Synergy"
                    score={analysis.synergyScore}
                  />
                  <ScoreItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Meta Relevance"
                    score={analysis.metaScore}
                  />
                </div>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.strengths.map((strength: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-green-600">+</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2 text-red-600">Weaknesses</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.weaknesses.map((weakness: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-red-600">-</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* AI Recommendations */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-medium mb-2">AI Recommendations</h4>
                <ul className="space-y-1 text-sm">
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Strategy Guide */}
              {analysis.strategyGuide && (
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Strategy Guide</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {analysis.strategyGuide.map((guide: string, i: number) => (
                      <p key={i}>{guide}</p>
                    ))}
                  </div>
                </Card>
              )}

              {/* Budget Optimization */}
              {deckId && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget Optimization
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Target budget ($)"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={async () => {
                          if (!budget) return;
                          try {
                            const res = await fetch(`/api/decks/${deckId}/optimize`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ targetBudget: parseFloat(budget) })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setBudgetAnalysis(data);
                            }
                          } catch (error) {
                            toast({
                              title: "Optimization Failed",
                              description: "Could not generate budget alternatives",
                              variant: "destructive"
                            });
                          }
                        }}
                        size="sm"
                      >
                        Optimize
                      </Button>
                    </div>

                    {budgetAnalysis && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Value:</span>
                          <span className="font-medium">${budgetAnalysis.currentTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Potential Savings:</span>
                          <span className="font-medium text-green-600">
                            ${budgetAnalysis.savings.toFixed(2)}
                          </span>
                        </div>
                        {budgetAnalysis.alternatives.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <p className="text-xs text-muted-foreground">Top Alternatives:</p>
                            {budgetAnalysis.alternatives.slice(0, 2).map((alt: any, i: number) => (
                              <div key={i} className="text-xs">
                                <p className="font-medium">{alt.original.name}</p>
                                {alt.alternatives[0] && (
                                  <p className="text-muted-foreground">
                                    → {alt.alternatives[0].card.name} 
                                    <span className="text-green-600 ml-1">
                                      (save ${alt.alternatives[0].priceDiff.toFixed(2)})
                                    </span>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Submit your deck list to see AI analysis</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreItem({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-medium">{score}/100</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  )
}

function parseDeckList(deckList: string): any[] {
  // Simplified parser - in production would handle more formats
  const lines = deckList.trim().split('\n')
  const cards: any[] = []
  
  lines.forEach(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s+(\S+)$/)
    if (match) {
      const [_, quantity, name, setCode] = match
      // In production, would lookup card ID from name/set
      // For now, using a placeholder
      cards.push({
        cardId: 'placeholder-' + name.toLowerCase().replace(/\s+/g, '-'),
        quantity: parseInt(quantity)
      })
    }
  })
  
  return cards
}