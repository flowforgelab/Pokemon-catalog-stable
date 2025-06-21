import { Card, Deck, DeckCard } from '@/lib/types';

interface Recommendation {
  type: 'weakness' | 'consistency' | 'tech' | 'upgrade';
  priority: 'high' | 'medium' | 'low';
  card?: Card;
  suggestion: string;
  reason: string;
}

export class DeckRecommender {
  private deck: (DeckCard & { card: Card })[];

  constructor(deckCards: (DeckCard & { card: Card })[]) {
    this.deck = deckCards;
  }

  generateRecommendations(allCards: Card[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Check weaknesses
    const weaknessRecs = this.checkWeaknesses(allCards);
    recommendations.push(...weaknessRecs);

    // Check consistency
    const consistencyRecs = this.checkConsistency();
    recommendations.push(...consistencyRecs);

    // Check tech cards
    const techRecs = this.checkTechCards();
    recommendations.push(...techRecs);

    return recommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  }

  private checkWeaknesses(allCards: Card[]): Recommendation[] {
    const recs: Recommendation[] = [];
    
    // Find common weaknesses
    const weaknessTypes = new Set<string>();
    this.deck.forEach(dc => {
      if (dc.card.weaknesses) {
        dc.card.weaknesses.forEach(w => weaknessTypes.add(w.type));
      }
    });

    if (weaknessTypes.size > 0 && weaknessTypes.has('Fire')) {
      recs.push({
        type: 'weakness',
        priority: 'high',
        suggestion: 'Add Wash Water Energy',
        reason: 'Reduces Fire weakness by 20 damage for Water Pokemon'
      });
    }

    return recs;
  }

  private checkConsistency(): Recommendation[] {
    const recs: Recommendation[] = [];
    const trainers = this.deck.filter(dc => dc.card.supertype === 'Trainer');
    
    // Check draw support
    const drawCount = trainers.filter(dc => 
      dc.card.name.includes('Research') || 
      dc.card.name.includes('Cynthia')
    ).reduce((sum, dc) => sum + dc.quantity, 0);

    if (drawCount < 6) {
      recs.push({
        type: 'consistency',
        priority: 'high',
        suggestion: "Add more Professor's Research",
        reason: `Only ${drawCount} draw supporters found. Aim for 6-8 for consistency`
      });
    }

    // Check Pokemon search
    const ballCount = trainers.filter(dc => 
      dc.card.name.includes('Ball')
    ).reduce((sum, dc) => sum + dc.quantity, 0);

    if (ballCount < 6) {
      recs.push({
        type: 'consistency',
        priority: 'medium',
        suggestion: 'Add more Quick Ball or Ultra Ball',
        reason: 'Insufficient Pokemon search cards for consistent setup'
      });
    }

    return recs;
  }

  private checkTechCards(): Recommendation[] {
    const recs: Recommendation[] = [];
    const hasStadium = this.deck.some(dc => 
      dc.card.subtypes.includes('Stadium')
    );

    if (!hasStadium) {
      recs.push({
        type: 'tech',
        priority: 'low',
        suggestion: 'Consider adding a Stadium card',
        reason: 'Stadiums provide continuous effects and counter opponent stadiums'
      });
    }

    const hasGust = this.deck.some(dc => 
      dc.card.name.includes("Boss's Orders") || 
      dc.card.name.includes('Cross Switcher')
    );

    if (!hasGust) {
      recs.push({
        type: 'tech',
        priority: 'high',
        suggestion: "Add Boss's Orders",
        reason: 'Gust effects are essential for taking key knockouts'
      });
    }

    return recs;
  }

  generateNaturalLanguageGuide(analysis: any): string[] {
    const guides: string[] = [];

    // Opening strategy
    guides.push(this.getOpeningStrategy(analysis.strategy));

    // Mid-game focus
    guides.push(this.getMidGameStrategy(analysis.strategy));

    // Key combos
    const combos = this.identifyKeyCombos();
    if (combos.length > 0) {
      guides.push(`Key combo: ${combos[0]}`);
    }

    return guides;
  }

  private getOpeningStrategy(strategy: string): string {
    const strategies: Record<string, string> = {
      'AGGRO': 'Focus on getting energy attachments early. Use Quick Ball to find your main attacker and start pressuring immediately.',
      'CONTROL': 'Establish your board control pieces first. Use supporters to disrupt your opponent while setting up.',
      'COMBO': 'Prioritize finding your combo pieces. Use draw supporters aggressively to assemble your engine.',
      'MIDRANGE': 'Build a stable board with multiple attackers. Balance between aggression and setup.'
    };
    return strategies[strategy] || strategies['MIDRANGE'];
  }

  private getMidGameStrategy(strategy: string): string {
    const strategies: Record<string, string> = {
      'AGGRO': "Maintain pressure and take quick prizes. Don't let your opponent stabilize.",
      'CONTROL': 'Lock down their options while building your win condition. Time your attacks carefully.',
      'COMBO': 'Execute your combo repeatedly. Protect your key pieces from disruption.',
      'MIDRANGE': 'Trade efficiently and maintain board presence. Adapt to their strategy.'
    };
    return strategies[strategy] || strategies['MIDRANGE'];
  }

  private identifyKeyCombos(): string[] {
    const combos: string[] = [];
    
    const hasVSTAR = this.deck.some(dc => dc.card.name.includes('VSTAR'));
    const hasChoice = this.deck.some(dc => dc.card.name.includes('Choice Belt'));
    
    if (hasVSTAR && hasChoice) {
      combos.push('VSTAR + Choice Belt for massive damage against V Pokemon');
    }

    return combos;
  }
}