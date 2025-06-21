import { Card } from '@/lib/types';

interface DeckSkeleton {
  strategy: string;
  core: Card[];
  support: Card[];
  trainers: string[];
  energy: string[];
}

export class DeckBuilder {
  buildAround(card: Card, allCards: Card[]): DeckSkeleton {
    // Determine strategy based on card type
    const strategy = this.determineStrategy(card);
    
    // Find synergistic Pokemon
    const support = this.findSynergies(card, allCards);
    
    // Get essential trainers
    const trainers = this.getTrainerPackage(strategy);
    
    // Calculate energy needs
    const energy = this.getEnergyPackage(card);
    
    return {
      strategy,
      core: [card],
      support: support.slice(0, 8),
      trainers,
      energy
    };
  }

  private determineStrategy(card: Card): string {
    if (card.hp && parseInt(card.hp) >= 300) return 'TANK';
    if (card.attacks?.some(a => a.damage && parseInt(a.damage) >= 200)) return 'AGGRO';
    if (card.abilities?.length) return 'ENGINE';
    return 'MIDRANGE';
  }

  private findSynergies(card: Card, allCards: Card[]): Card[] {
    return allCards
      .filter(c => {
        // Same type synergy
        if (c.types.some(t => card.types.includes(t))) return true;
        // Evolution line
        if (c.name === card.evolvesFrom || card.evolvesTo?.includes(c.name)) return true;
        // Energy acceleration for type
        if (c.abilities?.some(a => 
          a.text.toLowerCase().includes('energy') && 
          card.types.some(t => a.text.includes(t))
        )) return true;
        return false;
      })
      .sort((a, b) => {
        // Prioritize evolution line
        if (a.name === card.evolvesFrom) return -1;
        if (b.name === card.evolvesFrom) return 1;
        return 0;
      });
  }

  private getTrainerPackage(strategy: string): string[] {
    const base = [
      "4 Professor's Research",
      "4 Quick Ball", 
      "3 Ultra Ball",
      "2 Boss's Orders",
      "2 Switch"
    ];

    switch (strategy) {
      case 'AGGRO':
        return [...base, "4 Twin Energy", "2 Choice Belt"];
      case 'TANK':
        return [...base, "4 Hyper Potion", "2 Cape of Toughness"];
      case 'ENGINE':
        return [...base, "3 Rare Candy", "2 Pal Pad"];
      default:
        return base;
    }
  }

  private getEnergyPackage(card: Card): string[] {
    const primaryType = card.types[0] || 'Colorless';
    const totalEnergy = 12;
    
    if (card.attacks?.length) {
      const hasColorless = card.attacks.some(a => 
        a.cost.includes('Colorless')
      );
      
      if (hasColorless) {
        return [
          `8 Basic ${primaryType} Energy`,
          "4 Twin Energy"
        ];
      }
    }
    
    return [`${totalEnergy} Basic ${primaryType} Energy`];
  }
}