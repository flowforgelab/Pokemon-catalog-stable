import { PokemonCard, DeckCard } from '@/lib/types';

interface BudgetAlternative {
  original: PokemonCard;
  alternatives: Array<{
    card: PokemonCard;
    similarity: number;
    priceDiff: number;
    recommendation: string;
  }>;
}

interface BudgetOptimizationResult {
  currentTotal: number;
  targetTotal: number;
  savings: number;
  alternatives: BudgetAlternative[];
  upgradePath: Array<{
    card: PokemonCard;
    priority: number;
    impact: string;
  }>;
  budgetScore: number;
}

export class BudgetOptimizer {
  private cards: (DeckCard & { card: PokemonCard })[];

  constructor(deckCards: (DeckCard & { card: PokemonCard })[]) {
    this.cards = deckCards;
  }

  async optimize(targetBudget: number, allCards: PokemonCard[]): Promise<BudgetOptimizationResult> {
    const currentTotal = this.calculateDeckValue();
    const budgetScore = Math.min(100, Math.round((targetBudget / currentTotal) * 100));

    // Find expensive cards that can be replaced
    const expensiveCards = this.cards
      .filter(dc => dc.card.marketPrice && dc.card.marketPrice > 5)
      .sort((a, b) => (b.card.marketPrice || 0) - (a.card.marketPrice || 0));

    const alternatives = await this.findAlternatives(expensiveCards, allCards);
    const upgradePath = this.generateUpgradePath();

    const potentialSavings = alternatives.reduce((sum, alt) => {
      if (alt.alternatives.length > 0) {
        return sum + alt.alternatives[0].priceDiff;
      }
      return sum;
    }, 0);

    return {
      currentTotal,
      targetTotal: targetBudget,
      savings: Math.max(0, currentTotal - targetBudget),
      alternatives,
      upgradePath,
      budgetScore
    };
  }

  private calculateDeckValue(): number {
    return this.cards.reduce((sum, dc) => {
      const cardValue = (dc.card.marketPrice || 0) * dc.quantity;
      return sum + cardValue;
    }, 0);
  }

  private async findAlternatives(
    expensiveCards: (DeckCard & { card: PokemonCard })[],
    allCards: PokemonCard[]
  ): Promise<BudgetAlternative[]> {
    const alternatives: BudgetAlternative[] = [];

    for (const deckCard of expensiveCards.slice(0, 5)) { // Limit to top 5 expensive cards
      const cardAlternatives = this.findSimilarCards(deckCard.card, allCards)
        .filter(alt => (alt.marketPrice || 0) < (deckCard.card.marketPrice || 0))
        .map(alt => ({
          card: alt,
          similarity: this.calculateSimilarity(deckCard.card, alt),
          priceDiff: (deckCard.card.marketPrice || 0) - (alt.marketPrice || 0),
          recommendation: this.generateRecommendation(deckCard.card, alt)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      if (cardAlternatives.length > 0) {
        alternatives.push({
          original: deckCard.card,
          alternatives: cardAlternatives
        });
      }
    }

    return alternatives;
  }

  private findSimilarCards(original: PokemonCard, allCards: PokemonCard[]): PokemonCard[] {
    return allCards.filter(card => {
      // Don't suggest the same card
      if (card.id === original.id) return false;

      // For Pokemon, match type and similar HP
      if (original.supertype === 'Pokémon' && card.supertype === 'Pokémon') {
        const typeMatch = original.types.some(t => card.types.includes(t));
        const hpSimilar = card.hp && original.hp && 
          Math.abs(parseInt(card.hp) - parseInt(original.hp)) <= 20;
        
        return typeMatch && hpSimilar;
      }

      // For trainers, match subtype
      if (original.supertype === 'Trainer' && card.supertype === 'Trainer') {
        return original.subtypes.some(st => card.subtypes.includes(st));
      }

      // For energy, match type
      if (original.supertype === 'Energy' && card.supertype === 'Energy') {
        return original.name.includes('Basic') === card.name.includes('Basic');
      }

      return false;
    });
  }

  private calculateSimilarity(original: PokemonCard, alternative: PokemonCard): number {
    let score = 50; // Base similarity

    if (original.supertype === 'Pokémon' && alternative.supertype === 'Pokémon') {
      // HP similarity
      if (original.hp && alternative.hp) {
        const hpDiff = Math.abs(parseInt(original.hp) - parseInt(alternative.hp));
        score += Math.max(0, 20 - hpDiff);
      }

      // Attack similarity
      if (original.attacks && alternative.attacks) {
        const avgOriginalCost = this.averageAttackCost(original.attacks);
        const avgAltCost = this.averageAttackCost(alternative.attacks);
        const costDiff = Math.abs(avgOriginalCost - avgAltCost);
        score += Math.max(0, 15 - costDiff * 5);
      }

      // Type match bonus
      const typeMatch = original.types.every(t => alternative.types.includes(t));
      if (typeMatch) score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private averageAttackCost(attacks: any[]): number {
    if (!attacks || attacks.length === 0) return 0;
    const total = attacks.reduce((sum, atk) => sum + (atk.convertedEnergyCost || 0), 0);
    return total / attacks.length;
  }

  private generateRecommendation(original: PokemonCard, alternative: PokemonCard): string {
    const priceDiff = (original.marketPrice || 0) - (alternative.marketPrice || 0);
    
    if (original.supertype === 'Pokémon') {
      if (original.hp && alternative.hp && parseInt(alternative.hp) >= parseInt(original.hp)) {
        return `Similar stats, saves $${priceDiff.toFixed(2)}`;
      }
      return `Budget option, saves $${priceDiff.toFixed(2)}`;
    }
    
    return `Functional alternative, saves $${priceDiff.toFixed(2)}`;
  }

  private generateUpgradePath(): Array<{ card: PokemonCard; priority: number; impact: string }> {
    const upgrades: Array<{ card: PokemonCard; priority: number; impact: string }> = [];

    // Identify key cards worth upgrading
    const trainerCards = this.cards.filter(dc => dc.card.supertype === 'Trainer');
    const pokemonCards = this.cards.filter(dc => dc.card.supertype === 'Pokémon');

    // Check for staple trainers that could be upgraded
    const drawSupportCount = trainerCards.filter(dc => 
      dc.card.name.toLowerCase().includes('professor') ||
      dc.card.name.toLowerCase().includes('research')
    ).length;

    if (drawSupportCount < 4) {
      upgrades.push({
        card: { name: "Professor's Research", marketPrice: 2 } as PokemonCard,
        priority: 1,
        impact: "Essential draw support for consistency"
      });
    }

    // Check for boss's orders
    const hasBoss = trainerCards.some(dc => dc.card.name.toLowerCase().includes('boss'));
    if (!hasBoss) {
      upgrades.push({
        card: { name: "Boss's Orders", marketPrice: 5 } as PokemonCard,
        priority: 2,
        impact: "Gust effect for taking key knockouts"
      });
    }

    return upgrades.slice(0, 3);
  }
}