"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POKEMON_TYPES, CARD_RARITIES, SORT_OPTIONS } from "@/lib/constants"

export function CardsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const selectedTypes = searchParams.get('types')?.split(',').filter(Boolean) || []
  const selectedRarities = searchParams.get('rarities')?.split(',').filter(Boolean) || []
  const sortBy = searchParams.get('sortBy') || 'name'

  const updateFilters = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams)
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(','))
    } else if (typeof value === 'string' && value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to page 1 on filter change
    router.push(`/cards?${params.toString()}`)
  }

  const toggleFilter = (type: 'types' | 'rarities', value: string) => {
    const current = type === 'types' ? selectedTypes : selectedRarities
    const updated = current.includes(value) 
      ? current.filter(v => v !== value)
      : [...current, value]
    updateFilters(type, updated)
  }

  const clearFilters = () => {
    router.push('/cards')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Sort By</Label>
          <Select value={sortBy} onValueChange={(value) => updateFilters('sortBy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Types</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {POKEMON_TYPES.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleFilter('types', type)}
                />
                <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Rarity</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {CARD_RARITIES.map(rarity => (
              <div key={rarity} className="flex items-center space-x-2">
                <Checkbox
                  id={`rarity-${rarity}`}
                  checked={selectedRarities.includes(rarity)}
                  onCheckedChange={() => toggleFilter('rarities', rarity)}
                />
                <Label htmlFor={`rarity-${rarity}`} className="text-sm cursor-pointer">
                  {rarity}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}