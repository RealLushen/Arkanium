// Enemy traits
const ENEMY_TRAITS = {
    POISONOUS: {
        name: "Poisonous",
        description: "Applies poison to the player on hit, dealing 2 damage per turn for 3 turns",
        effect: (player, enemy) => {
            addStatusEffect(player, {
                name: "Poison",
                description: "Taking 2 damage per turn",
                duration: 3,
                icon: "☠️",
                onTurnStart: (target) => {
                    applyDamage(target, 2);
                    addBattleLog(`${target.name} takes 2 poison damage!`, "system-message");
                }
            });
        }
    },
    ARMORED: {
        name: "Armored",
        description: "Takes 25% less damage from attacks",
        effect: (enemy) => {
            enemy.damageReduction = 0.25;
        }
    },
    BERSERKER: {
        name: "Berserker",
        description: "Increases damage by 15% each time it takes damage",
        effect: (enemy) => {
            enemy.onDamaged = (damage) => {
                const damageMultiplier = 0.15;
                const minDamageIncrease = Math.max(1, Math.floor(enemy.minDamage * damageMultiplier));
                const maxDamageIncrease = Math.max(1, Math.floor(enemy.maxDamage * damageMultiplier));
                
                enemy.minDamage += minDamageIncrease;
                enemy.maxDamage += maxDamageIncrease;
                
                addBattleLog(`${enemy.name} enters a rage! Damage increased to ${enemy.minDamage}-${enemy.maxDamage}`, "enemy-action");
            };
        }
    },
    HEALER: {
        name: "Healer",
        description: "Heals itself for 5 HP every 2 turns",
        effect: (enemy) => {
            enemy.turnCount = 0;
            enemy.onTurnStart = () => {
                enemy.turnCount++;
                if (enemy.turnCount % 2 === 0) {
                    const healAmount = 5;
                    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + healAmount);
                    updateEnemyStats();
                    addBattleLog(`${enemy.name} heals itself for ${healAmount} HP!`, "enemy-action");
                }
            };
        }
    },
    VAMPIRIC: {
        name: "Vampiric",
        description: "Heals for 25% of damage dealt",
        effect: (enemy) => {
            enemy.onDamageDealt = (damage) => {
                const healAmount = Math.floor(damage * 0.25);
                enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + healAmount);
                updateEnemyStats();
                addBattleLog(`${enemy.name} drains life and heals for ${healAmount} HP!`, "enemy-action");
            };
        }
    },
    REFLECTIVE: {
        name: "Reflective",
        description: "Reflects 20% of damage taken back to the attacker",
        effect: (enemy, player) => {
            enemy.onDamaged = (damage) => {
                const reflectAmount = Math.floor(damage * 0.2);
                if (reflectAmount > 0) {
                    applyDamage(player, reflectAmount);
                    addBattleLog(`${enemy.name} reflects ${reflectAmount} damage back to you!`, "enemy-action");
                }
            };
        }
    },
    ENRAGED: {
        name: "Enraged",
        description: "Deals double damage when below 30% health",
        effect: (enemy) => {
            enemy.originalMinDamage = enemy.minDamage;
            enemy.originalMaxDamage = enemy.maxDamage;
            
            enemy.onHealthChanged = () => {
                const healthPercentage = (enemy.currentHp / enemy.maxHp) * 100;
                
                if (healthPercentage <= 30) {
                    if (enemy.minDamage === enemy.originalMinDamage) {
                        enemy.minDamage = enemy.originalMinDamage * 2;
                        enemy.maxDamage = enemy.originalMaxDamage * 2;
                        addBattleLog(`${enemy.name} becomes enraged! Damage doubled to ${enemy.minDamage}-${enemy.maxDamage}!`, "enemy-action");
                    }
                } else {
                    if (enemy.minDamage !== enemy.originalMinDamage) {
                        enemy.minDamage = enemy.originalMinDamage;
                        enemy.maxDamage = enemy.originalMaxDamage;
                    }
                }
            };
        }
    },
    SWIFT: {
        name: "Swift",
        description: "Has a 25% chance to attack twice",
        effect: (enemy) => {
            enemy.onAttack = (target, damage) => {
                if (Math.random() < 0.25) {
                    setTimeout(() => {
                        const secondDamage = getRandomInt(enemy.minDamage, enemy.maxDamage);
                        applyDamage(target, secondDamage);
                        addBattleLog(`${enemy.name} attacks again for ${secondDamage} damage!`, "enemy-action");
                    }, 500);
                }
            };
        }
    }
};

// Enemy pool by difficulty tiers
const ENEMY_POOLS = {
    // Tier 1 (Rounds 1-5)
    1: [
        {
            name: "Goblin Scout",
            emoji: "👺",
            minHp: 15,
            maxHp: 25,
            minDamage: 2,
            maxDamage: 4,
            goldDropChance: 0.7,
            goldDropAmount: {min: 1, max: 3},
            ironDropChance: 0.1,
            ironDropAmount: {min: 0, max: 1},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: []
        },
        {
            name: "Forest Wolf",
            emoji: "🐺",
            minHp: 18,
            maxHp: 28,
            minDamage: 3,
            maxDamage: 6,
            goldDropChance: 0.6,
            goldDropAmount: {min: 1, max: 2},
            ironDropChance: 0.05,
            ironDropAmount: {min: 0, max: 1},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: []
        },
        {
            name: "Giant Rat",
            emoji: "🐀",
            minHp: 12,
            maxHp: 20,
            minDamage: 1,
            maxDamage: 3,
            goldDropChance: 0.8,
            goldDropAmount: {min: 1, max: 4},
            ironDropChance: 0,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["POISONOUS"]
        }
    ],
    
    // Tier 2 (Rounds 6-10)
    2: [
        {
            name: "Goblin Warrior",
            emoji: "👺",
            minHp: 30,
            maxHp: 40,
            minDamage: 4,
            maxDamage: 8,
            goldDropChance: 0.8,
            goldDropAmount: {min: 3, max: 6},
            ironDropChance: 0.3,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["SWIFT"]
        },
        {
            name: "Forest Bear",
            emoji: "🐻",
            minHp: 40,
            maxHp: 50,
            minDamage: 5,
            maxDamage: 10,
            goldDropChance: 0.7,
            goldDropAmount: {min: 2, max: 5},
            ironDropChance: 0.4,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["BERSERKER"]
        },
        {
            name: "Venomous Spider",
            emoji: "🕷️",
            minHp: 25,
            maxHp: 35,
            minDamage: 3,
            maxDamage: 6,
            goldDropChance: 0.6,
            goldDropAmount: {min: 2, max: 4},
            ironDropChance: 0.2,
            ironDropAmount: {min: 0, max: 1},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["POISONOUS", "SWIFT"]
        }
    ],
    
    // Tier 3 (Rounds 11-15)
    3: [
        {
            name: "Orc Fighter",
            emoji: "👹",
            minHp: 50,
            maxHp: 65,
            minDamage: 6,
            maxDamage: 12,
            goldDropChance: 0.9,
            goldDropAmount: {min: 5, max: 10},
            ironDropChance: 0.6,
            ironDropAmount: {min: 2, max: 4},
            titaniumDropChance: 0.1,
            titaniumDropAmount: {min: 0, max: 1},
            possibleTraits: ["ARMORED", "BERSERKER"]
        },
        {
            name: "Cave Troll",
            emoji: "👾",
            minHp: 70,
            maxHp: 90,
            minDamage: 8,
            maxDamage: 14,
            goldDropChance: 0.8,
            goldDropAmount: {min: 4, max: 8},
            ironDropChance: 0.7,
            ironDropAmount: {min: 3, max: 5},
            titaniumDropChance: 0.15,
            titaniumDropAmount: {min: 0, max: 1},
            possibleTraits: ["ARMORED", "HEALER"]
        },
        {
            name: "Dark Elf Scout",
            emoji: "🧝",
            minHp: 45,
            maxHp: 60,
            minDamage: 7,
            maxDamage: 11,
            goldDropChance: 0.85,
            goldDropAmount: {min: 6, max: 12},
            ironDropChance: 0.5,
            ironDropAmount: {min: 2, max: 3},
            titaniumDropChance: 0.05,
            titaniumDropAmount: {min: 0, max: 1},
            possibleTraits: ["SWIFT", "POISONOUS"]
        }
    ],
    
    // Tier 4 (Rounds 16-20)
    4: [
        {
            name: "Orc Warlord",
            emoji: "👹",
            minHp: 90,
            maxHp: 110,
            minDamage: 10,
            maxDamage: 18,
            goldDropChance: 1.0,
            goldDropAmount: {min: 10, max: 15},
            ironDropChance: 0.8,
            ironDropAmount: {min: 4, max: 7},
            titaniumDropChance: 0.3,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["ARMORED", "BERSERKER", "SWIFT"]
        },
        {
            name: "Cave Dragon",
            emoji: "🐉",
            minHp: 120,
            maxHp: 150,
            minDamage: 12,
            maxDamage: 20,
            goldDropChance: 1.0,
            goldDropAmount: {min: 15, max: 25},
            ironDropChance: 0.9,
            ironDropAmount: {min: 5, max: 8},
            titaniumDropChance: 0.4,
            titaniumDropAmount: {min: 1, max: 3},
            possibleTraits: ["REFLECTIVE", "ENRAGED"]
        },
        {
            name: "Dark Elf Assassin",
            emoji: "🧝",
            minHp: 80,
            maxHp: 100,
            minDamage: 15,
            maxDamage: 25,
            goldDropChance: 0.95,
            goldDropAmount: {min: 12, max: 20},
            ironDropChance: 0.7,
            ironDropAmount: {min: 3, max: 6},
            titaniumDropChance: 0.25,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["SWIFT", "POISONOUS", "VAMPIRIC"]
        }
    ],
    
    // Tier 5 (Rounds 21-25)
    5: [
        {
            name: "Demon Knight",
            emoji: "👿",
            minHp: 140,
            maxHp: 180,
            minDamage: 18,
            maxDamage: 28,
            goldDropChance: 1.0,
            goldDropAmount: {min: 20, max: 30},
            ironDropChance: 1.0,
            ironDropAmount: {min: 8, max: 12},
            titaniumDropChance: 0.6,
            titaniumDropAmount: {min: 2, max: 4},
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC"]
        },
        {
            name: "Mountain Giant",
            emoji: "🗿",
            minHp: 200,
            maxHp: 250,
            minDamage: 20,
            maxDamage: 30,
            goldDropChance: 1.0,
            goldDropAmount: {min: 25, max: 40},
            ironDropChance: 1.0,
            ironDropAmount: {min: 10, max: 15},
            titaniumDropChance: 0.7,
            titaniumDropAmount: {min: 3, max: 5},
            possibleTraits: ["ARMORED", "BERSERKER", "ENRAGED"]
        },
        {
            name: "Shadow Assassin",
            emoji: "👤",
            minHp: 120,
            maxHp: 150,
            minDamage: 25,
            maxDamage: 35,
            goldDropChance: 1.0,
            goldDropAmount: {min: 20, max: 35},
            ironDropChance: 0.9,
            ironDropAmount: {min: 7, max: 10},
            titaniumDropChance: 0.5,
            titaniumDropAmount: {min: 2, max: 3},
            possibleTraits: ["SWIFT", "POISONOUS", "VAMPIRIC"]
        }
    ],
    
    // Tier 6 (Rounds 26+)
    6: [
        {
            name: "Demon Lord",
            emoji: "😈",
            minHp: 250,
            maxHp: 300,
            minDamage: 30,
            maxDamage: 45,
            goldDropChance: 1.0,
            goldDropAmount: {min: 40, max: 60},
            ironDropChance: 1.0,
            ironDropAmount: {min: 15, max: 25},
            titaniumDropChance: 0.9,
            titaniumDropAmount: {min: 5, max: 8},
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC", "ENRAGED"]
        },
        {
            name: "Ancient Dragon",
            emoji: "🐲",
            minHp: 350,
            maxHp: 450,
            minDamage: 35,
            maxDamage: 50,
            goldDropChance: 1.0,
            goldDropAmount: {min: 50, max: 80},
            ironDropChance: 1.0,
            ironDropAmount: {min: 20, max: 30},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 8, max: 12},
            possibleTraits: ["REFLECTIVE", "ENRAGED", "HEALER", "ARMORED"]
        },
        {
            name: "Elder Vampire",
            emoji: "🧛",
            minHp: 200,
            maxHp: 250,
            minDamage: 40,
            maxDamage: 60,
            goldDropChance: 1.0,
            goldDropAmount: {min: 45, max: 70},
            ironDropChance: 1.0,
            ironDropAmount: {min: 18, max: 25},
            titaniumDropChance: 0.8,
            titaniumDropAmount: {min: 6, max: 10},
            possibleTraits: ["SWIFT", "VAMPIRIC", "HEALER"]
        },
        {
            name: "Dark Overlord",
            emoji: "🎩",
            minHp: 300,
            maxHp: 400,
            minDamage: 45,
            maxDamage: 65,
            goldDropChance: 1.0,
            goldDropAmount: {min: 60, max: 100},
            ironDropChance: 1.0,
            ironDropAmount: {min: 25, max: 40},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 10, max: 15},
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC", "ENRAGED", "SWIFT"]
        },
        {
            name: "Ryouhou",
            emoji: "👑",
            minHp: 300,
            maxHp: 600,
            minDamage: 35,
            maxDamage: 70,
            goldDropChance: 1.0,
            goldDropAmount: {min: 60, max: 150},
            ironDropChance: 1.0,
            ironDropAmount: {min: 25, max: 45},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 10, max: 20},
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC", "ENRAGED", "SWIFT"]
        }
    ]
};