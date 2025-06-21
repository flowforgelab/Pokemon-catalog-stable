import { Card, DeckCard } from '@/lib/types';

interface DeckAnalysisResult {
  consistencyScore: number;
  speedScore: number;
  resilienceScore: number;
  synergyScore: number;
  metaScore: number;
  overallScore: number;
  strategy: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  energyCurve: Record<number, number>;
  typeDistribution: Record<string, number>;
  trainerRatios: {
    draw: number;
    search: number;
    disruption: number;
    stadium: number;
    tool: number;
  };
  attackCosts: Record<number, number>;
}

export class DeckAnalyzer {
  private cards: (DeckCard & { card: Card })[];
  private pokemonCards: Card[];
  private trainerCards: Card[];
  private energyCards: Card[];

  constructor(deckCards: (DeckCard & { card: Card })[]) {
    this.cards = deckCards;
    
    // Categorize cards
    this.pokemonCards = [];
    this.trainerCards = [];
    this.energyCards = [];
    
    deckCards.forEach(dc => {
      const count = dc.quantity;
      for (let i = 0; i < count; i++) {
        switch (dc.card.supertype) {
          case 'Pokémon':
            this.pokemonCards.push(dc.card);
            break;
          case 'Trainer':
            this.trainerCards.push(dc.card);
            break;
          case 'Energy':
            this.energyCards.push(dc.card);
            break;
        }
      }
    });
  }

  analyze(): DeckAnalysisResult {
    const consistencyScore = this.analyzeConsistency();
    const speedScore = this.analyzeSpeed();
    const resilienceScore = this.analyzeResilience();
    const synergyScore = this.analyzeSynergy();
    const metaScore = this.analyzeMeta();
    
    const overallScore = Math.round(
      consistencyScore * 0.3 +
      speedScore * 0.2 +
      resilienceScore * 0.2 +
      synergyScore * 0.2 +
      metaScore * 0.1
    );

    const strategy = this.determineStrategy();
    const strengths = this.identifyStrengths();
    const weaknesses = this.identifyWeaknesses();
    const recommendations = this.generateRecommendations();

    return {
      consistencyScore,
      speedScore,
      resilienceScore,
      synergyScore,
      metaScore,
      overallScore,
      strategy,
      strengths,
      weaknesses,
      recommendations,
      energyCurve: this.calculateEnergyCurve(),
      typeDistribution: this.calculateTypeDistribution(),
      trainerRatios: this.calculateTrainerRatios(),
      attackCosts: this.calculateAttackCosts()
    };
  }

  private analyzeConsistency(): number {
    let score = 50; // Base score
    
    // Check Pokemon line consistency
    const basicCount = this.pokemonCards.filter(p => !p.evolvesFrom).length;
    const pokemonRatio = this.pokemonCards.length / 60;
    
    if (pokemonRatio >= 0.15 && pokemonRatio <= 0.25) score += 10;
    if (basicCount >= 8) score += 10;
    
    // Check draw support
    const drawCards = this.trainerCards.filter(t => 
      t.name.toLowerCase().includes('professor') ||
      t.name.toLowerCase().includes('research') ||
      t.name.toLowerCase().includes('cynthia')
    ).length;
    
    if (drawCards >= 8) score += 15;
    else if (drawCards >= 6) score += 10;
    else if (drawCards >= 4) score += 5;
    
    // Check search cards
    const searchCards = this.trainerCards.filter(t =>
      t.name.toLowerCase().includes('ball') ||
      t.name.toLowerCase().includes('communication') ||
      t.name.toLowerCase().includes('radar')
    ).length;
    
    if (searchCards >= 8) score += 15;
    else if (searchCards >= 6) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private analyzeSpeed(): number {
    let score = 50;
    
    // Check energy count
    const energyRatio = this.energyCards.length / 60;
    if (energyRatio >= 0.15 && energyRatio <= 0.25) score += 15;
    
    // Check for energy acceleration
    const energyAccel = this.cards.some(dc => 
      dc.card.name.toLowerCase().includes('patch') ||
      dc.card.name.toLowerCase().includes('welder') ||
      dc.card.abilities?.some(a => a.text.toLowerCase().includes('energy'))
    );
    
    if (energyAccel) score += 20;
    
    // Check average attack cost
    const avgCost = this.calculateAverageAttackCost();
    if (avgCost <= 2) score += 15;
    else if (avgCost <= 3) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private analyzeResilience(): number {
    let score = 50;
    
    // Check for recovery options
    const recoveryCards = this.trainerCards.filter(t =>
      t.name.toLowerCase().includes('rescue') ||
      t.name.toLowerCase().includes('rod') ||
      t.name.toLowerCase().includes('recycler')
    ).length;
    
    if (recoveryCards >= 2) score += 15;
    
    // Check for switching options
    const switchCards = this.trainerCards.filter(t =>
      t.name.toLowerCase().includes('switch') ||
      t.name.toLowerCase().includes('rope') ||
      t.name.toLowerCase().includes('cart')
    ).length;
    
    if (switchCards >= 3) score += 15;
    
    // Check bench size potential
    const benchSitters = this.pokemonCards.filter(p => p.hp && parseInt(p.hp) >= 200).length;
    if (benchSitters >= 2) score += 10;
    
    // Check for healing
    const healingCards = this.cards.some(dc =>
      dc.card.name.toLowerCase().includes('potion') ||
      dc.card.abilities?.some(a => a.text.toLowerCase().includes('heal'))
    );
    
    if (healingCards) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private analyzeSynergy(): number {
    let score = 60; // Higher base for synergy
    
    // Check type consistency
    const types = new Set(this.pokemonCards.flatMap(p => p.types));
    if (types.size <= 2) score += 20;
    else if (types.size <= 3) score += 10;
    
    // Check for ability synergies
    const abilities = this.pokemonCards.filter(p => p.abilities && p.abilities.length > 0);
    if (abilities.length >= 3) score += 10;
    
    // Check evolution lines
    const evolutionPairs = this.checkEvolutionLines();
    if (evolutionPairs >= 2) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private analyzeMeta(): number {
    // Simplified meta score - would need tournament data for real analysis
    let score = 70;
    
    // Check for meta-relevant cards (simplified)
    const hasVSTAR = this.pokemonCards.some(p => p.name.includes('VSTAR'));
    const hasVMAX = this.pokemonCards.some(p => p.name.includes('VMAX'));
    const hasEx = this.pokemonCards.some(p => p.name.includes('ex'));
    
    if (hasVSTAR || hasVMAX || hasEx) score += 15;
    
    // Check for counter cards
    const hasCounter = this.trainerCards.some(t =>
      t.name.toLowerCase().includes('boss') ||
      t.name.toLowerCase().includes('marnie') ||
      t.name.toLowerCase().includes('judge')
    );
    
    if (hasCounter) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  private determineStrategy(): string {
    const avgCost = this.calculateAverageAttackCost();
    const pokemonCount = this.pokemonCards.length;
    const hasControl = this.trainerCards.some(t => 
      t.name.toLowerCase().includes('marnie') ||
      t.name.toLowerCase().includes('judge') ||
      t.name.toLowerCase().includes('reset')
    );
    
    if (avgCost <= 2 && pokemonCount <= 15) return 'AGGRO';
    if (hasControl && this.trainerCards.length >= 35) return 'CONTROL';
    if (pokemonCount >= 20) return 'MIDRANGE';
    
    return 'COMBO';
  }

  private identifyStrengths(): string[] {
    const strengths = [];
    
    if (this.analyzeConsistency() >= 80) strengths.push('Highly consistent draw engine');
    if (this.analyzeSpeed() >= 80) strengths.push('Fast setup and energy acceleration');
    if (this.pokemonCards.filter(p => p.hp && parseInt(p.hp) >= 300).length > 0) {
      strengths.push('High HP attackers');
    }
    
    const types = new Set(this.pokemonCards.flatMap(p => p.types));
    if (types.size === 1) strengths.push('Focused type strategy');
    
    return strengths.slice(0, 3);
  }

  private identifyWeaknesses(): string[] {
    const weaknesses = [];
    
    if (this.energyCards.length < 8) weaknesses.push('Low energy count may cause drought');
    if (this.energyCards.length > 15) weaknesses.push('High energy count reduces consistency');
    
    const switchCards = this.trainerCards.filter(t =>
      t.name.toLowerCase().includes('switch') ||
      t.name.toLowerCase().includes('rope')
    ).length;
    
    if (switchCards < 2) weaknesses.push('Limited switching options');
    
    const basicCount = this.pokemonCards.filter(p => !p.evolvesFrom).length;
    if (basicCount < 6) weaknesses.push('Low basic Pokemon count risks mulligans');
    
    return weaknesses.slice(0, 3);
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const consistencyScore = this.analyzeConsistency();
    const speedScore = this.analyzeSpeed();
    
    if (consistencyScore < 70) {
      recommendations.push('Add more draw supporters (Professor\'s Research, Bibarel line)');
    }
    
    if (speedScore < 70) {
      recommendations.push('Consider energy acceleration options (Twin Energy, Baxcalibur)');
    }
    
    const searchCards = this.trainerCards.filter(t =>
      t.name.toLowerCase().includes('ball')
    ).length;
    
    if (searchCards < 6) {
      recommendations.push('Add more Pokemon search cards (Quick Ball, Ultra Ball)');
    }
    
    return recommendations.slice(0, 3);
  }

  private calculateEnergyCurve(): Record<number, number> {
    const curve: Record<number, number> = {};
    
    this.pokemonCards.forEach(pokemon => {
      if (pokemon.attacks) {
        pokemon.attacks.forEach(attack => {
          const cost = attack.convertedEnergyCost || 0;
          curve[cost] = (curve[cost] || 0) + 1;
        });
      }
    });
    
    return curve;
  }

  private calculateTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.pokemonCards.forEach(pokemon => {
      pokemon.types.forEach(type => {
        distribution[type] = (distribution[type] || 0) + 1;
      });
    });
    
    return distribution;
  }

  private calculateTrainerRatios() {
    const ratios = {
      draw: 0,
      search: 0,
      disruption: 0,
      stadium: 0,
      tool: 0
    };
    
    this.trainerCards.forEach(trainer => {
      const name = trainer.name.toLowerCase();
      
      if (name.includes('professor') || name.includes('research')) ratios.draw++;
      if (name.includes('ball') || name.includes('radar')) ratios.search++;
      if (name.includes('boss') || name.includes('marnie')) ratios.disruption++;
      if (trainer.subtypes.includes('Stadium')) ratios.stadium++;
      if (trainer.subtypes.includes('Tool')) ratios.tool++;
    });
    
    return ratios;
  }

  private calculateAttackCosts(): Record<number, number> {
    const costs: Record<number, number> = {};
    
    this.pokemonCards.forEach(pokemon => {
      if (pokemon.attacks) {
        pokemon.attacks.forEach(attack => {
          const cost = attack.convertedEnergyCost || 0;
          costs[cost] = (costs[cost] || 0) + 1;
        });
      }
    });
    
    return costs;
  }

  private calculateAverageAttackCost(): number {
    let total = 0;
    let count = 0;
    
    this.pokemonCards.forEach(pokemon => {
      if (pokemon.attacks) {
        pokemon.attacks.forEach(attack => {
          total += attack.convertedEnergyCost || 0;
          count++;
        });
      }
    });
    
    return count > 0 ? total / count : 3;
  }

  private checkEvolutionLines(): number {
    let pairs = 0;
    
    this.pokemonCards.forEach(pokemon => {
      if (pokemon.evolvesFrom) {
        const hasBasic = this.pokemonCards.some(p => p.name === pokemon.evolvesFrom);
        if (hasBasic) pairs++;
      }
    });
    
    return pairs;
  }
}