"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DollarSign, TrendingDown, Package, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BudgetBuilderPage() {
  const [budget, setBudget] = useState([50])
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null)

  const archetypes = [
    {
      id: "lost-box",
      name: "Lost Box",
      strategy: "Toolbox",
      avgPrice: 120,
      description: "Versatile deck using Lost Zone engine",
      keyCards: ["Comfey", "Colress's Experiment", "Mirage Gate"],
      budgetVersion: 45
    },
    {
      id: "charizard-ex",
      name: "Charizard ex",
      strategy: "Aggro",
      avgPrice: 250,
      description: "Powerful fire-type attacker with energy acceleration",
      keyCards: ["Charizard ex", "Rare Candy", "Pidgeot ex"],
      budgetVersion: 80
    },
    {
      id: "gardevoir-ex",
      name: "Gardevoir ex",
      strategy: "Control",
      avgPrice: 180,
      description: "Psychic powerhouse with ability-based energy acceleration",
      keyCards: ["Gardevoir ex", "Kirlia", "Refinement"],
      budgetVersion: 60
    }
  ]

  const budgetRanges = [
    { min: 0, max: 50, label: "Ultra Budget", color: "text-green-600" },
    { min: 50, max: 100, label: "Budget", color: "text-blue-600" },
    { min: 100, max: 200, label: "Competitive", color: "text-purple-600" },
    { min: 200, max: 500, label: "Premium", color: "text-orange-600" }
  ]

  const getCurrentRange = () => {
    return budgetRanges.find(r => budget[0] >= r.min && budget[0] <= r.max) || budgetRanges[0]
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Budget Deck Builder</h1>
        <p className="text-muted-foreground">
          Build competitive decks within your budget using AI-powered recommendations
        </p>
      </div>

      {/* Budget Selector */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Set Your Budget</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-3">
              <Label>Maximum Budget</Label>
              <span className={`text-2xl font-bold ${getCurrentRange().color}`}>
                ${budget[0]}
              </span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={20}
              max={300}
              step={10}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$20</span>
              <span>$300+</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {budgetRanges.map((range) => (
              <Button
                key={range.label}
                variant={getCurrentRange().label === range.label ? "default" : "outline"}
                size="sm"
                onClick={() => setBudget([range.min + (range.max - range.min) / 2])}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">{getCurrentRange().label} Range:</span> Best for{" "}
              {getCurrentRange().label === "Ultra Budget" && "new players and casual play"}
              {getCurrentRange().label === "Budget" && "local tournaments and league play"}
              {getCurrentRange().label === "Competitive" && "regional competitions"}
              {getCurrentRange().label === "Premium" && "championship-level play"}
            </p>
          </div>
        </div>
      </Card>

      {/* Archetype Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose Your Archetype</h2>
        
        <div className="grid gap-4">
          {archetypes.map((archetype) => {
            const canAfford = budget[0] >= archetype.budgetVersion
            
            return (
              <Card
                key={archetype.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedArchetype === archetype.id 
                    ? "ring-2 ring-primary" 
                    : "hover:shadow-md"
                } ${!canAfford ? "opacity-50" : ""}`}
                onClick={() => canAfford && setSelectedArchetype(archetype.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{archetype.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {archetype.strategy}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {archetype.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {archetype.keyCards.map((card) => (
                        <Badge key={card} variant="secondary" className="text-xs">
                          {card}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-sm text-muted-foreground line-through">
                      ${archetype.avgPrice}
                    </div>
                    <div className={`text-xl font-bold ${
                      canAfford ? "text-green-600" : "text-red-600"
                    }`}>
                      ${archetype.budgetVersion}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      budget version
                    </div>
                  </div>
                </div>

                {!canAfford && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-red-600">
                      Requires minimum ${archetype.budgetVersion} budget
                    </p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Budget Tips */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Budget Building Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            Start with trainer staples - they work in multiple decks
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            Look for reprints and promo versions of expensive cards
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            Consider single-prize attackers as alternatives to ex/V cards
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            Build one consistent deck rather than multiple incomplete ones
          </li>
        </ul>
      </Card>

      {/* CTA */}
      {selectedArchetype && (
        <div className="mt-8 text-center">
          <Button size="lg" className="gap-2">
            Generate Budget Deck List
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            AI will create an optimized list within your ${budget[0]} budget
          </p>
        </div>
      )}
    </div>
  )
}