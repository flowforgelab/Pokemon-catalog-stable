"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, Copy, FileText } from "lucide-react"
import { DeckCard, PokemonCard } from "@/lib/types"
import { formats, ptcgoFormat } from "@/lib/deck-formats"
import { useToast } from "@/hooks/use-toast"

interface DeckImportExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cards: (DeckCard & { card: PokemonCard })[]
  deckName: string
  onImport: (cards: { name: string; quantity: number; set?: string; number?: string }[]) => void
}

export function DeckImportExport({ 
  open, 
  onOpenChange, 
  cards, 
  deckName,
  onImport 
}: DeckImportExportProps) {
  const { toast } = useToast()
  const [importText, setImportText] = useState("")
  const [selectedFormat, setSelectedFormat] = useState(ptcgoFormat.name)
  
  const currentFormat = formats.find(f => f.name === selectedFormat) || ptcgoFormat

  const handleExport = () => {
    const content = currentFormat.export(cards, deckName || "Pokemon Deck")
    
    // Copy to clipboard
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: `Deck exported in ${currentFormat.name} format`
    })
  }

  const handleDownload = () => {
    const content = currentFormat.export(cards, deckName || "Pokemon Deck")
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deckName || 'deck'}.${currentFormat.extension}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded",
      description: `Deck saved as ${a.download}`
    })
  }

  const handleImport = () => {
    try {
      const parsed = currentFormat.parse(importText)
      
      if (parsed.length === 0) {
        toast({
          title: "No cards found",
          description: "Check your deck list format",
          variant: "destructive"
        })
        return
      }
      
      onImport(parsed)
      setImportText("")
      onOpenChange(false)
      
      toast({
        title: "Import started",
        description: `Found ${parsed.length} cards to import`
      })
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid deck list format",
        variant: "destructive"
      })
    }
  }

  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import/Export Deck</DialogTitle>
          <DialogDescription>
            Share your deck or import from popular formats
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format.name} value={format.name}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preview ({totalCards} cards)</Label>
              <Textarea
                value={currentFormat.export(cards, deckName || "Pokemon Deck")}
                readOnly
                className="font-mono text-sm"
                rows={10}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div>
              <Label htmlFor="import-format">Import Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger id="import-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format.name} value={format.name}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="import-text">Paste Deck List</Label>
              <Textarea
                id="import-text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Example:\n4 Pikachu V RCL 43\n2 Raichu V CPA 45\n4 Professor's Research SSH 178`}
                className="font-mono text-sm"
                rows={10}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleImport} 
                className="flex-1"
                disabled={!importText.trim()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Deck
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setImportText("")}
              >
                Clear
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-1">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PTCGO: Official Pokemon TCG Online format</li>
                <li>Limitless: Popular tournament deck format</li>
                <li>CSV: For spreadsheet applications</li>
              </ul>
              <p className="mt-2">Cards will be matched by name. Missing cards will be highlighted.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}