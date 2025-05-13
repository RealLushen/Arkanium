// Mutation categories
const MUTATION_CATEGORIES = {
    POSITIVE: "positive",
    NEGATIVE: "negative",
    NEUTRAL: "neutral"
};

// List of all possible mutations
const MUTATIONS = [
    // POSITIVE MUTATIONS
    {
        id: "damage_boost",
        name: "Sharpened Edge",
        description: "Increases your weapon damage by 15%",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            const damageMultiplier = 1.15;
            gameState.player.weaponDamageModifier = (gameState.player.weaponDamageModifier || 1) * damageMultiplier;
            updatePlayerDamage();
        }
    },
    {
        id: "max_hp_boost",
        name: "Iron Constitution",
        description: "Increases your maximum HP by 20",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            const hpBoost = 20;
            gameState.player.maxHp += hpBoost;
            gameState.player.currentHp += hpBoost;
            updatePlayerStats();
        }
    },
    {
        id: "max_mana_boost",
        name: "Arcane Focus",
        description: "Increases your maximum Mana by 15",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            const manaBoost = 15;
            gameState.player.maxMana += manaBoost;
            gameState.player.currentMana += manaBoost;
            updatePlayerStats();
        }
    },
    {
        id: "vampiric_strikes",
        name: "Vampiric Strikes",
        description: "Your attacks heal you for 15% of the damage dealt",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            gameState.player.vampiricPercentage = (gameState.player.vampiricPercentage || 0) + 0.15;
        }
    },
    {
        id: "reduced_mana_cost",
        name: "Efficient Casting",
        description: "Reduces the Mana cost of all abilities by 20%",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            const reductionMultiplier = 0.8;
            gameState.abilities.attack.manaCost = Math.floor(gameState.abilities.attack.manaCost * reductionMultiplier);
            gameState.abilities.defend.manaCost = Math.floor(gameState.abilities.defend.manaCost * reductionMultiplier);
            gameState.abilities.heal.manaCost = Math.floor(gameState.abilities.heal.manaCost * reductionMultiplier);
            updateAbilityButtons();
        }
    },
    {
        id: "double_attack_chance",
        name: "Swift Strikes",
        description: "You have a 20% chance to attack twice",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            gameState.player.doubleAttackChance = (gameState.player.doubleAttackChance || 0) + 0.2;
        }
    },
    {
        id: "improved_healing",
        name: "Healing Mastery",
        description: "Your healing ability restores 50% more HP",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            gameState.abilities.heal.healAmount = Math.floor(gameState.abilities.heal.healAmount * 1.5);
        }
    },
    {
        id: "improved_defense",
        name: "Enhanced Shield",
        description: "Your shield now blocks 75 damage instead of 50",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            gameState.abilities.defend.shieldValue = 75;
        }
    },
    {
        id: "material_fortune",
        name: "Material Fortune",
        description: "Increases the chance of material drops by 25%",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            gameState.materialDropChanceModifier = (gameState.materialDropChanceModifier || 1) * 1.25;
        }
    },
    {
        id: "thorns",
        name: "Thorns Aura",
        description: "Reflect 15% of damage taken back to the attacker",
        category: MUTATION_CATEGORIES.POSITIVE,
        effect: (gameState) => {
            gameState.player.thornsPercentage = (gameState.player.thornsPercentage || 0) + 0.15;
        }
    },

    // NEGATIVE MUTATIONS
    {
        id: "damage_reduction",
        name: "Dulled Blade",
        description: "Decreases your weapon damage by 10%",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            const damageMultiplier = 0.9;
            gameState.player.weaponDamageModifier = (gameState.player.weaponDamageModifier || 1) * damageMultiplier;
            updatePlayerDamage();
        }
    },
    {
        id: "max_hp_reduction",
        name: "Frailty",
        description: "Decreases your maximum HP by 15",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            const hpReduction = 15;
            gameState.player.maxHp = Math.max(10, gameState.player.maxHp - hpReduction);
            gameState.player.currentHp = Math.min(gameState.player.currentHp, gameState.player.maxHp);
            updatePlayerStats();
        }
    },
    {
        id: "max_mana_reduction",
        name: "Mana Disruption",
        description: "Decreases your maximum Mana by 10",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            const manaReduction = 10;
            gameState.player.maxMana = Math.max(10, gameState.player.maxMana - manaReduction);
            gameState.player.currentMana = Math.min(gameState.player.currentMana, gameState.player.maxMana);
            updatePlayerStats();
        }
    },
    {
        id: "increased_mana_cost",
        name: "Mana Drain",
        description: "Increases the Mana cost of all abilities by 20%",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            const increaseMultiplier = 1.2;
            gameState.abilities.attack.manaCost = Math.floor(gameState.abilities.attack.manaCost * increaseMultiplier);
            gameState.abilities.defend.manaCost = Math.floor(gameState.abilities.defend.manaCost * increaseMultiplier);
            gameState.abilities.heal.manaCost = Math.floor(gameState.abilities.heal.manaCost * increaseMultiplier);
            updateAbilityButtons();
        }
    },
    {
        id: "reduced_healing",
        name: "Healing Impediment",
        description: "Your healing ability restores 30% less HP",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            gameState.abilities.heal.healAmount = Math.floor(gameState.abilities.heal.healAmount * 0.7);
        }
    },
    {
        id: "reduced_defense",
        name: "Weakened Shield",
        description: "Your shield blocks only 30 damage instead of 50",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            gameState.abilities.defend.shieldValue = 30;
        }
    },
    {
        id: "material_scarcity",
        name: "Material Scarcity",
        description: "Decreases the chance of material drops by 15%",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            gameState.materialDropChanceModifier = (gameState.materialDropChanceModifier || 1) * 0.85;
        }
    },
    {
        id: "enemies_strengthened",
        name: "Strengthened Foes",
        description: "All enemies deal 15% more damage",
        category: MUTATION_CATEGORIES.NEGATIVE,
        effect: (gameState) => {
            gameState.enemyDamageModifier = (gameState.enemyDamageModifier || 1) * 1.15;
        }
    },

    // NEUTRAL MUTATIONS
    {
        id: "glass_cannon",
        name: "Glass Cannon",
        description: "Increases your damage by 30% but decreases your max HP by 20",
        category: MUTATION_CATEGORIES.NEUTRAL,
        effect: (gameState) => {
            // Increase damage
            gameState.player.weaponDamageModifier = (gameState.player.weaponDamageModifier || 1) * 1.3;
            updatePlayerDamage();
            
            // Decrease HP
            const hpReduction = 20;
            gameState.player.maxHp = Math.max(10, gameState.player.maxHp - hpReduction);
            gameState.player.currentHp = Math.min(gameState.player.currentHp, gameState.player.maxHp);
            updatePlayerStats();
        }
    },
    {
        id: "mana_shift",
        name: "Mana Shift",
        description: "Increases max Mana by 20 but decreases max HP by 15",
        category: MUTATION_CATEGORIES.NEUTRAL,
        effect: (gameState) => {
            // Increase Mana
            const manaBoost = 20;
            gameState.player.maxMana += manaBoost;
            gameState.player.currentMana += manaBoost;
            
            // Decrease HP
            const hpReduction = 15;
            gameState.player.maxHp = Math.max(10, gameState.player.maxHp - hpReduction);
            gameState.player.currentHp = Math.min(gameState.player.currentHp, gameState.player.maxHp);
            
            updatePlayerStats();
        }
    },
    {
        id: "berserker",
        name: "Berserker",
        description: "Your damage increases by 5% for every 10% of missing HP",
        category: MUTATION_CATEGORIES.NEUTRAL,
        effect: (gameState) => {
            gameState.player.berserkerActive = true;
        }
    },
    {
        id: "random_start",
        name: "Chaotic Energy",
        description: "Start each battle with random HP and Mana between 50-150% of your max",
        category: MUTATION_CATEGORIES.NEUTRAL,
        effect: (gameState) => {
            gameState.player.randomStartStats = true;
        }
    },
    {
        id: "trade_defense",
        name: "Offensive Stance",
        description: "Your shield blocks 20 less damage but also deals damage equal to 50% of your weapon",
        category: MUTATION_CATEGORIES.NEUTRAL,
        effect: (gameState) => {
            gameState.abilities.defend.shieldValue = Math.max(10, gameState.abilities.defend.shieldValue - 20);
            gameState.abilities.defend.offensiveDefense = true;
        }
    },
    {
        id: "high_risk",
        name: "High Risk, High Reward",
        description: "Enemies deal 20% more damage, but drop 30% more materials",
        category: MUTATION_CATEGORIES.NEUTRAL,
        effect: (gameState) => {
            gameState.enemyDamageModifier = (gameState.enemyDamageModifier || 1) * 1.2;
            gameState.materialDropAmountModifier = (gameState.materialDropAmountModifier || 1) * 1.3;
        }
    }
];

// Function to get N random unique mutations
function getRandomMutations(count = 3, alreadyActiveMutationIds = []) {
    // Filter out mutations that are already active
    const availableMutations = MUTATIONS.filter(mutation => !alreadyActiveMutationIds.includes(mutation.id));
    
    // Simple random selection without category consideration
    const shuffledMutations = [...availableMutations].sort(() => Math.random() - 0.5);
    
    // Return the requested number of mutations (or all available if less than requested)
    return shuffledMutations.slice(0, count);
}