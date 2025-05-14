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

// Enemy pool by difficulty tiers - BALANCED VERSION
const ENEMY_POOLS = {
    // Tier 1 (Rounds 1-5)
    1: [
        {
            name: "Goblin Scout",
            emoji: "👺",
            minHp: 12,         // Reduced from 15
            maxHp: 20,         // Reduced from 25
            minDamage: 2,
            maxDamage: 4,
            goldDropChance: 0.7,
            goldDropAmount: {min: 1, max: 2},  // Adjusted to give at least 1 gold
            ironDropChance: 0.1,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: []
        },
        {
            name: "Forest Wolf",
            emoji: "🐺",
            minHp: 14,         // Reduced from 18
            maxHp: 22,         // Reduced from 28
            minDamage: 3,
            maxDamage: 5,      // Reduced from 6
            goldDropChance: 0.6,
            goldDropAmount: {min: 1, max: 2},  // Adjusted to give at least 1 gold
            ironDropChance: 0.05,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: []
        },
        {
            name: "Giant Rat",
            emoji: "🐀",
            minHp: 10,         // Reduced from 12
            maxHp: 16,         // Reduced from 20
            minDamage: 1,
            maxDamage: 3,
            goldDropChance: 0.8,
            goldDropAmount: {min: 1, max: 3},  // Adjusted to give at least 1 gold
            ironDropChance: 0,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["POISONOUS"]
        },
        // New enemies for Tier 1
        {
            name: "Wild Boar",
            emoji: "🐗",
            minHp: 16,         // Reduced from 20
            maxHp: 24,         // Reduced from 30
            minDamage: 2,
            maxDamage: 4,      // Reduced from 5
            goldDropChance: 0.65,
            goldDropAmount: {min: 1, max: 2},  // Adjusted to give at least 1 gold
            ironDropChance: 0.08,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["BERSERKER"]
        },
        {
            name: "Skeleton Scout",
            emoji: "💀",
            minHp: 11,         // Reduced from 14
            maxHp: 18,         // Reduced from 22
            minDamage: 2,
            maxDamage: 4,
            goldDropChance: 0.75,
            goldDropAmount: {min: 1, max: 3},  // Slightly increased
            ironDropChance: 0.1,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: []
        },
        {
            name: "Creeper Plant",
            emoji: "🌿",
            minHp: 8,          // Reduced from 10
            maxHp: 13,         // Reduced from 16
            minDamage: 1,
            maxDamage: 3,      // Reduced from 4
            goldDropChance: 0.6,
            goldDropAmount: {min: 1, max: 2},  // Adjusted to give at least 1 gold
            ironDropChance: 0,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["POISONOUS"]
        },
        {
            name: "Small Slime",
            emoji: "🟢",
            minHp: 13,         // Reduced from 16
            maxHp: 19,         // Reduced from 24
            minDamage: 1,
            maxDamage: 3,
            goldDropChance: 0.7,
            goldDropAmount: {min: 1, max: 2},  // Adjusted to give at least 1 gold
            ironDropChance: 0,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["HEALER"]
        },
        {
            name: "Cave Bat",
            emoji: "🦇",
            minHp: 7,          // Reduced from 8
            maxHp: 11,         // Reduced from 14
            minDamage: 2,
            maxDamage: 3,      // Reduced from 4
            goldDropChance: 0.6,
            goldDropAmount: {min: 1, max: 2},  // Adjusted to give at least 1 gold
            ironDropChance: 0,
            ironDropAmount: {min: 0, max: 0},
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["SWIFT"]
        }
    ],
    
    // Tier 2 (Rounds 6-10)
    2: [
        {
            name: "Goblin Warrior",
            emoji: "👺",
            minHp: 24,         // Reduced from 30
            maxHp: 32,         // Reduced from 40
            minDamage: 3,      // Reduced from 4
            maxDamage: 7,      // Reduced from 8
            goldDropChance: 0.8,
            goldDropAmount: {min: 2, max: 4},  // Increased min
            ironDropChance: 0.3,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["SWIFT"]
        },
        {
            name: "Forest Bear",
            emoji: "🐻",
            minHp: 32,         // Reduced from 40
            maxHp: 40,         // Reduced from 50
            minDamage: 4,      // Reduced from 5
            maxDamage: 9,      // Reduced from 10
            goldDropChance: 0.7,
            goldDropAmount: {min: 2, max: 3},  // Increased min
            ironDropChance: 0.4,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["BERSERKER"]
        },
        {
            name: "Venomous Spider",
            emoji: "🕷️",
            minHp: 20,         // Reduced from 25
            maxHp: 28,         // Reduced from 35
            minDamage: 3,
            maxDamage: 5,      // Reduced from 6
            goldDropChance: 0.6,
            goldDropAmount: {min: 2, max: 3},  // Increased min
            ironDropChance: 0.2,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["POISONOUS", "SWIFT"]
        },
        // New enemies for Tier 2
        {
            name: "Hobgoblin",
            emoji: "👹",
            minHp: 28,         // Reduced from 35
            maxHp: 36,         // Reduced from 45
            minDamage: 4,      // Reduced from 5
            maxDamage: 8,      // Reduced from 9
            goldDropChance: 0.75,
            goldDropAmount: {min: 2, max: 4},  // Increased min
            ironDropChance: 0.35,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["ARMORED"]
        },
        {
            name: "Skeleton Archer",
            emoji: "🏹",
            minHp: 22,         // Reduced from 28
            maxHp: 30,         // Reduced from 38
            minDamage: 5,      // Reduced from 6
            maxDamage: 8,      // Reduced from 9
            goldDropChance: 0.8,
            goldDropAmount: {min: 2, max: 4},  // Adjusted
            ironDropChance: 0.3,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["SWIFT"]
        },
        {
            name: "Swamp Lurker",
            emoji: "🦎",
            minHp: 26,         // Reduced from 32
            maxHp: 34,         // Reduced from 42
            minDamage: 4,
            maxDamage: 6,      // Reduced from 7
            goldDropChance: 0.7,
            goldDropAmount: {min: 2, max: 3},  // Increased min
            ironDropChance: 0.25,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["POISONOUS"]
        },
        {
            name: "Medium Slime",
            emoji: "🔵",
            minHp: 30,         // Reduced from 38
            maxHp: 38,         // Reduced from 48
            minDamage: 3,
            maxDamage: 5,      // Reduced from 6
            goldDropChance: 0.85,
            goldDropAmount: {min: 3, max: 5},  // Increased
            ironDropChance: 0.2,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["HEALER", "REFLECTIVE"]
        },
        {
            name: "Feral Werewolf",
            emoji: "🐺",
            minHp: 29,         // Reduced from 36
            maxHp: 37,         // Reduced from 46
            minDamage: 4,      // Reduced from 5
            maxDamage: 9,      // Reduced from 11
            goldDropChance: 0.75,
            goldDropAmount: {min: 2, max: 4},  // Increased min
            ironDropChance: 0.35,
            ironDropAmount: {min: 1, max: 1},  // Guaranteed 1 iron now
            titaniumDropChance: 0,
            titaniumDropAmount: {min: 0, max: 0},
            possibleTraits: ["BERSERKER", "SWIFT"]
        }
    ],
    
    // Tier 3 (Rounds 11-15)
    3: [
        {
            name: "Orc Fighter",
            emoji: "👹",
            minHp: 40,         // Reduced from 50
            maxHp: 52,         // Reduced from 65
            minDamage: 5,      // Reduced from 6
            maxDamage: 10,     // Reduced from 12
            goldDropChance: 0.9,
            goldDropAmount: {min: 3, max: 6},  // Adjusted
            ironDropChance: 0.6,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0.1,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["ARMORED", "BERSERKER"]
        },
        {
            name: "Cave Troll",
            emoji: "👾",
            minHp: 56,         // Reduced from 70
            maxHp: 72,         // Reduced from 90
            minDamage: 7,      // Reduced from 8
            maxDamage: 12,     // Reduced from 14
            goldDropChance: 0.8,
            goldDropAmount: {min: 3, max: 5},  // Increased min
            ironDropChance: 0.7,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0.15,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["ARMORED", "HEALER"]
        },
        {
            name: "Dark Elf Scout",
            emoji: "🧝",
            minHp: 36,         // Reduced from 45
            maxHp: 48,         // Reduced from 60
            minDamage: 6,      // Reduced from 7
            maxDamage: 9,      // Reduced from 11
            goldDropChance: 0.85,
            goldDropAmount: {min: 4, max: 7},  // Increased
            ironDropChance: 0.5,
            ironDropAmount: {min: 1, max: 2},  // Increased max
            titaniumDropChance: 0.05,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["SWIFT", "POISONOUS"]
        },
        // New enemies for Tier 3
        {
            name: "Minotaur Warrior",
            emoji: "🐂",
            minHp: 52,         // Reduced from 65
            maxHp: 68,         // Reduced from 85
            minDamage: 6,      // Reduced from 7
            maxDamage: 11,     // Reduced from 13
            goldDropChance: 0.9,
            goldDropAmount: {min: 4, max: 6},  // Increased
            ironDropChance: 0.65,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0.1,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["BERSERKER", "ENRAGED"]
        },
        {
            name: "Undead Knight",
            emoji: "⚔️",
            minHp: 44,         // Reduced from 55
            maxHp: 56,         // Reduced from 70
            minDamage: 7,      // Reduced from 8
            maxDamage: 10,     // Reduced from 12
            goldDropChance: 0.95,
            goldDropAmount: {min: 4, max: 7},  // Increased
            ironDropChance: 0.7,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0.15,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["ARMORED", "REFLECTIVE"]
        },
        {
            name: "Poison Drake",
            emoji: "🐉",
            minHp: 48,         // Reduced from 60
            maxHp: 60,         // Reduced from 75
            minDamage: 6,      // Reduced from 7
            maxDamage: 11,     // Reduced from 13
            goldDropChance: 0.9,
            goldDropAmount: {min: 4, max: 6},  // Increased
            ironDropChance: 0.6,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0.1,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["POISONOUS", "HEALER"]
        },
        {
            name: "Desert Scorpion",
            emoji: "🦂",
            minHp: 38,         // Reduced from 48
            maxHp: 50,         // Reduced from 62
            minDamage: 7,      // Reduced from 8
            maxDamage: 12,     // Reduced from 14
            goldDropChance: 0.85,
            goldDropAmount: {min: 3, max: 5},  // Increased
            ironDropChance: 0.55,
            ironDropAmount: {min: 1, max: 2},  // Increased max
            titaniumDropChance: 0.08,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["POISONOUS", "SWIFT"]
        },
        {
            name: "Forest Wendigo",
            emoji: "🦌",
            minHp: 46,         // Reduced from 58
            maxHp: 58,         // Reduced from 72
            minDamage: 8,      // Reduced from 9
            maxDamage: 13,     // Reduced from 15
            goldDropChance: 0.8,
            goldDropAmount: {min: 3, max: 6},  // Increased
            ironDropChance: 0.5,
            ironDropAmount: {min: 1, max: 2},
            titaniumDropChance: 0.12,
            titaniumDropAmount: {min: 1, max: 1},  // Guaranteed 1 titanium now with low chance
            possibleTraits: ["BERSERKER", "VAMPIRIC"]
        }
    ],
    
    // Tier 4 (Rounds 16-20)
    4: [
        {
            name: "Orc Warlord",
            emoji: "👹",
            minHp: 72,         // Reduced from 90
            maxHp: 88,         // Reduced from 110
            minDamage: 8,      // Reduced from 10
            maxDamage: 15,     // Reduced from 18
            goldDropChance: 1.0,
            goldDropAmount: {min: 6, max: 9},  // Increased
            ironDropChance: 0.8,
            ironDropAmount: {min: 2, max: 3},
            titaniumDropChance: 0.3,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["ARMORED", "BERSERKER", "SWIFT"]
        },
        {
            name: "Cave Dragon",
            emoji: "🐉",
            minHp: 96,         // Reduced from 120
            maxHp: 120,        // Reduced from 150
            minDamage: 10,     // Reduced from 12
            maxDamage: 17,     // Reduced from 20
            goldDropChance: 1.0,
            goldDropAmount: {min: 8, max: 14}, // Increased
            ironDropChance: 0.9,
            ironDropAmount: {min: 2, max: 4},
            titaniumDropChance: 0.4,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["REFLECTIVE", "ENRAGED"]
        },
        {
            name: "Dark Elf Assassin",
            emoji: "🧝",
            minHp: 64,         // Reduced from 80
            maxHp: 80,         // Reduced from 100
            minDamage: 12,     // Reduced from 15
            maxDamage: 20,     // Reduced from 25
            goldDropChance: 0.95,
            goldDropAmount: {min: 7, max: 12}, // Increased
            ironDropChance: 0.7,
            ironDropAmount: {min: 2, max: 3},  // Increased min
            titaniumDropChance: 0.25,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["SWIFT", "POISONOUS", "VAMPIRIC"]
        },
        // New enemies for Tier 4
        {
            name: "Frost Giant",
            emoji: "❄️",
            minHp: 88,         // Reduced from 110
            maxHp: 108,        // Reduced from 135
            minDamage: 9,      // Reduced from 11
            maxDamage: 16,     // Reduced from 19
            goldDropChance: 1.0,
            goldDropAmount: {min: 7, max: 11}, // Increased
            ironDropChance: 0.85,
            ironDropAmount: {min: 2, max: 3},
            titaniumDropChance: 0.35,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["ARMORED", "REFLECTIVE"]
        },
        {
            name: "Necromancer",
            emoji: "🧙",
            minHp: 68,         // Reduced from 85
            maxHp: 84,         // Reduced from 105
            minDamage: 11,     // Reduced from 14
            maxDamage: 18,     // Reduced from 22
            goldDropChance: 1.0,
            goldDropAmount: {min: 8, max: 13}, // Increased
            ironDropChance: 0.75,
            ironDropAmount: {min: 2, max: 3},
            titaniumDropChance: 0.3,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["HEALER", "VAMPIRIC"]
        },
        {
            name: "Lava Golem",
            emoji: "🔥",
            minHp: 80,         // Reduced from 100
            maxHp: 96,         // Reduced from 120
            minDamage: 10,     // Reduced from 13
            maxDamage: 17,     // Reduced from 21
            goldDropChance: 1.0,
            goldDropAmount: {min: 7, max: 12}, // Increased
            ironDropChance: 0.9,
            ironDropAmount: {min: 2, max: 4},
            titaniumDropChance: 0.4,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["REFLECTIVE", "ARMORED"]
        },
        {
            name: "Large Slime",
            emoji: "🟣",
            minHp: 76,         // Reduced from 95
            maxHp: 92,         // Reduced from 115
            minDamage: 7,      // Reduced from 9
            maxDamage: 13,     // Reduced from 16
            goldDropChance: 1.0,
            goldDropAmount: {min: 8, max: 14}, // Increased
            ironDropChance: 0.8,
            ironDropAmount: {min: 2, max: 3},
            titaniumDropChance: 0.35,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["HEALER", "REFLECTIVE", "ARMORED"]
        },
        {
            name: "Basilisk",
            emoji: "🐍",
            minHp: 70,         // Reduced from 88
            maxHp: 86,         // Reduced from 108
            minDamage: 13,     // Reduced from 16
            maxDamage: 19,     // Reduced from 24
            goldDropChance: 0.95,
            goldDropAmount: {min: 7, max: 12}, // Increased
            ironDropChance: 0.75,
            ironDropAmount: {min: 2, max: 3},
            titaniumDropChance: 0.3,
            titaniumDropAmount: {min: 1, max: 1},
            possibleTraits: ["POISONOUS", "SWIFT", "REFLECTIVE"]
        }
    ],
    
    // Tier 5 (Rounds 21-25)
    5: [
        {
            name: "Demon Knight",
            emoji: "👿",
            minHp: 112,        // Reduced from 140
            maxHp: 144,        // Reduced from 180
            minDamage: 14,     // Reduced from 18
            maxDamage: 22,     // Reduced from 28
            goldDropChance: 1.0,
            goldDropAmount: {min: 12, max: 18}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 4, max: 6},
            titaniumDropChance: 0.6,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC"]
        },
        {
            name: "Mountain Giant",
            emoji: "🗿",
            minHp: 160,        // Reduced from 200
            maxHp: 200,        // Reduced from 250
            minDamage: 16,     // Reduced from 20
            maxDamage: 24,     // Reduced from 30
            goldDropChance: 1.0,
            goldDropAmount: {min: 15, max: 24}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 5, max: 7},
            titaniumDropChance: 0.7,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["ARMORED", "BERSERKER", "ENRAGED"]
        },
        {
            name: "Shadow Assassin",
            emoji: "👤",
            minHp: 96,         // Reduced from 120
            maxHp: 120,        // Reduced from 150
            minDamage: 20,     // Reduced from 25
            maxDamage: 28,     // Reduced from 35
            goldDropChance: 1.0,
            goldDropAmount: {min: 12, max: 20}, // Increased
            ironDropChance: 0.9,
            ironDropAmount: {min: 3, max: 5},
            titaniumDropChance: 0.5,
            titaniumDropAmount: {min: 1, max: 2},  // Increased max
            possibleTraits: ["SWIFT", "POISONOUS", "VAMPIRIC"]
        },
        // New enemies for Tier 5
        {
            name: "Infernal Behemoth",
            emoji: "👹",
            minHp: 144,        // Reduced from 180
            maxHp: 176,        // Reduced from 220
            minDamage: 18,     // Reduced from 22
            maxDamage: 26,     // Reduced from 32
            goldDropChance: 1.0,
            goldDropAmount: {min: 14, max: 22}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 4, max: 7},
            titaniumDropChance: 0.65,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["ARMORED", "BERSERKER", "REFLECTIVE"]
        },
        {
            name: "Storm Elemental",
            emoji: "⚡",
            minHp: 120,        // Reduced from 150
            maxHp: 152,        // Reduced from 190
            minDamage: 19,     // Reduced from 24
            maxDamage: 27,     // Reduced from 34
            goldDropChance: 1.0,
            goldDropAmount: {min: 14, max: 23}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 4, max: 6},
            titaniumDropChance: 0.6,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["SWIFT", "REFLECTIVE", "ENRAGED"]
        },
        {
            name: "Undead Warlord",
            emoji: "☠️",
            minHp: 132,        // Reduced from 165
            maxHp: 164,        // Reduced from 205
            minDamage: 16,     // Reduced from 20
            maxDamage: 24,     // Reduced from 30
            goldDropChance: 1.0,
            goldDropAmount: {min: 15, max: 21}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 4, max: 7},
            titaniumDropChance: 0.7,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["ARMORED", "VAMPIRIC", "HEALER"]
        },
        {
            name: "Warlock",
            emoji: "🧙‍♂️",
            minHp: 104,        // Reduced from 130
            maxHp: 136,        // Reduced from 170
            minDamage: 21,     // Reduced from 26
            maxDamage: 29,     // Reduced from 36
            goldDropChance: 1.0,
            goldDropAmount: {min: 14, max: 20}, // Increased
            ironDropChance: 0.95,
            ironDropAmount: {min: 4, max: 6},
            titaniumDropChance: 0.55,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["VAMPIRIC", "POISONOUS", "HEALER"]
        },
        {
            name: "Black Wyrm",
            emoji: "🐲",
            minHp: 136,        // Reduced from 170
            maxHp: 176,        // Reduced from 220
            minDamage: 18,     // Reduced from 22
            maxDamage: 26,     // Reduced from 32
            goldDropChance: 1.0,
            goldDropAmount: {min: 15, max: 23}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 5, max: 7},
            titaniumDropChance: 0.65,
            titaniumDropAmount: {min: 1, max: 2},
            possibleTraits: ["ARMORED", "SWIFT", "ENRAGED"]
        }
    ],
    
    // Tier 6 (Rounds 26+)
    6: [
        {
            name: "Demon Lord",
            emoji: "😈",
            minHp: 200,        // Reduced from 250
            maxHp: 240,        // Reduced from 300
            minDamage: 24,     // Reduced from 30
            maxDamage: 36,     // Reduced from 45
            goldDropChance: 1.0,
            goldDropAmount: {min: 24, max: 36}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 7, max: 12},
            titaniumDropChance: 0.9,
            titaniumDropAmount: {min: 2, max: 4},
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC", "ENRAGED"]
        },
        {
            name: "Ancient Dragon",
            emoji: "🐲",
            minHp: 280,        // Reduced from 350
            maxHp: 360,        // Reduced from 450
            minDamage: 28,     // Reduced from 35
            maxDamage: 40,     // Reduced from 50
            goldDropChance: 1.0,
            goldDropAmount: {min: 30, max: 48}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 10, max: 15},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 4, max: 6},
            possibleTraits: ["REFLECTIVE", "ENRAGED", "HEALER", "ARMORED"]
        },
        {
            name: "Elder Vampire",
            emoji: "🧛",
            minHp: 160,        // Reduced from 200
            maxHp: 200,        // Reduced from 250
            minDamage: 32,     // Reduced from 40
            maxDamage: 48,     // Reduced from 60
            goldDropChance: 1.0,
            goldDropAmount: {min: 26, max: 42}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 9, max: 12},
            titaniumDropChance: 0.8,
            titaniumDropAmount: {min: 3, max: 5},
            possibleTraits: ["SWIFT", "VAMPIRIC", "HEALER"]
        },
        {
            name: "Dark Overlord",
            emoji: "👑",
            minHp: 240,        // Reduced from 300
            maxHp: 320,        // Reduced from 400
            minDamage: 36,     // Reduced from 45
            maxDamage: 52,     // Reduced from 65
            goldDropChance: 1.0,
            goldDropAmount: {min: 36, max: 60}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 12, max: 20},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 5, max: 8},  // Increased max
            possibleTraits: ["ARMORED", "REFLECTIVE", "VAMPIRIC", "ENRAGED", "SWIFT"]
        },
        // New enemies for Tier 6
        {
            name: "Abyssal Horror",
            emoji: "👁️",
            minHp: 224,        // Reduced from 280
            maxHp: 280,        // Reduced from 350
            minDamage: 30,     // Reduced from 38
            maxDamage: 44,     // Reduced from 55
            goldDropChance: 1.0,
            goldDropAmount: {min: 33, max: 50}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 11, max: 17},
            titaniumDropChance: 0.95,
            titaniumDropAmount: {min: 4, max: 7},  // Increased max
            possibleTraits: ["POISONOUS", "VAMPIRIC", "ENRAGED", "HEALER"]
        },
        {
            name: "Arkanium Golem",
            emoji: "🤖",
            minHp: 320,        // Reduced from 400
            maxHp: 400,        // Reduced from 500
            minDamage: 26,     // Reduced from 32
            maxDamage: 38,     // Reduced from 48
            goldDropChance: 1.0,
            goldDropAmount: {min: 38, max: 56}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 12, max: 20},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 6, max: 10}, // Increased max
            possibleTraits: ["ARMORED", "REFLECTIVE", "BERSERKER", "HEALER"]
        },
        {
            name: "Celestial Seraph",
            emoji: "👼",
            minHp: 208,        // Reduced from 260
            maxHp: 256,        // Reduced from 320
            minDamage: 34,     // Reduced from 42
            maxDamage: 50,     // Reduced from 62
            goldDropChance: 1.0,
            goldDropAmount: {min: 30, max: 48}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 10, max: 15},
            titaniumDropChance: 0.9,
            titaniumDropAmount: {min: 3, max: 6},  // Increased max
            possibleTraits: ["REFLECTIVE", "HEALER", "SWIFT", "ARMORED"]
        },
        {
            name: "Chaos Titan",
            emoji: "💥",
            minHp: 256,        // Reduced from 320
            maxHp: 336,        // Reduced from 420
            minDamage: 38,     // Reduced from 48
            maxDamage: 54,     // Reduced from 68
            goldDropChance: 1.0,
            goldDropAmount: {min: 42, max: 66}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 14, max: 22},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 6, max: 10}, // Increased max
            possibleTraits: ["BERSERKER", "ENRAGED", "SWIFT", "VAMPIRIC"]
        },
        {
            name: "Shadow Emperor",
            emoji: "🌑",
            minHp: 232,        // Reduced from 290
            maxHp: 296,        // Reduced from 370
            minDamage: 40,     // Reduced from 50
            maxDamage: 56,     // Reduced from 70
            goldDropChance: 1.0,
            goldDropAmount: {min: 32, max: 54}, // Increased
            ironDropChance: 1.0,
            ironDropAmount: {min: 12, max: 19},
            titaniumDropChance: 1.0,
            titaniumDropAmount: {min: 5, max: 9},  // Increased max
            possibleTraits: ["SWIFT", "VAMPIRIC", "POISONOUS", "ENRAGED", "REFLECTIVE"]
        }
    ]
};