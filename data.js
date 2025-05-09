// Game Data - Contains all the static data for the game
// This file can be edited to add/modify enemies, mutations, abilities, etc.

// Starting Passives Pool
const STARTING_PASSIVES = [
    {
        id: "berserker",
        name: "Berserker",
        description: "Increases attack by 30% but decreases defense by 15%.",
        effect: (player) => {
            player.baseStats.atk *= 1.3;
            player.baseStats.def *= 0.85;
            return "Berserker: +30% ATK, -15% DEF";
        },
        type: "mixed"
    },
    {
        id: "tank",
        name: "Tank",
        description: "Increases max HP by 25% and defense by 20% but decreases speed by 10%.",
        effect: (player) => {
            player.baseStats.maxHp *= 1.25;
            player.baseStats.hp *= 1.25;
            player.baseStats.def *= 1.2;
            player.baseStats.spd *= 0.9;
            return "Tank: +25% HP, +20% DEF, -10% SPD";
        },
        type: "mixed"
    },
    {
        id: "scout",
        name: "Scout",
        description: "Increases speed by 40% but decreases max HP by 10%.",
        effect: (player) => {
            player.baseStats.spd *= 1.4;
            player.baseStats.maxHp *= 0.9;
            player.baseStats.hp *= 0.9;
            return "Scout: +40% SPD, -10% HP";
        },
        type: "mixed"
    },
    {
        id: "vampiric",
        name: "Vampiric",
        description: "Heal for 10% of damage dealt, but start with 20% less max HP.",
        effect: (player) => {
            player.baseStats.maxHp *= 0.8;
            player.baseStats.hp *= 0.8;
            player.lifesteal = 0.1;
            return "Vampiric: 10% Lifesteal, -20% HP";
        },
        type: "mixed"
    },
    {
        id: "guardian",
        name: "Guardian",
        description: "Start with +30% defense and reflect 15% of damage back to attackers.",
        effect: (player) => {
            player.baseStats.def *= 1.3;
            player.damageReflect = 0.15;
            return "Guardian: +30% DEF, 15% Damage Reflection";
        },
        type: "positive"
    },
    {
        id: "glass_cannon",
        name: "Glass Cannon",
        description: "Increase attack by 50% but decrease defense by 30%.",
        effect: (player) => {
            player.baseStats.atk *= 1.5;
            player.baseStats.def *= 0.7;
            return "Glass Cannon: +50% ATK, -30% DEF";
        },
        type: "mixed"
    },
    {
        id: "tactician",
        name: "Tactician",
        description: "Special skills cooldown reduced by 1 turn.",
        effect: (player) => {
            player.specialCooldownReduction = 1;
            return "Tactician: Special cooldown -1";
        },
        type: "positive"
    },
    {
        id: "survivor",
        name: "Survivor",
        description: "Heal 5% of max HP at the end of each turn.",
        effect: (player) => {
            player.regenPercent = 0.05;
            return "Survivor: Regen 5% HP/turn";
        },
        type: "positive"
    }
];

// Enemy Pool
// Enemies are grouped by level ranges
const ENEMIES = {
    // Level 1-3 Enemies
    beginner: [
        {
            id: "slime",
            name: "Slime",
            portrait: "🟢",
            baseStats: {
                hp: 50,
                maxHp: 50,
                atk: 6,
                def: 3,
                spd: 5
            },
            special: {
                name: "Bounce",
                description: "Bounces on the enemy, dealing damage based on its defense.",
                effect: (self, target) => {
                    const damage = Math.max(5, Math.floor(self.currentStats.def * 1.5));
                    return {
                        damage: damage,
                        message: `${self.name} bounces on ${target.name} for ${damage} damage!`
                    };
                }
            }
        },
        {
            id: "rat",
            name: "Giant Rat",
            portrait: "🐀",
            baseStats: {
                hp: 40,
                maxHp: 40,
                atk: 8,
                def: 2,
                spd: 9
            },
            special: {
                name: "Bite",
                description: "Bites the enemy, with a chance to cause bleeding.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 1.2);
                    const bleedChance = Math.random() < 0.3;
                    let message = `${self.name} bites ${target.name} for ${damage} damage!`;
                    
                    if (bleedChance) {
                        target.effects.push({
                            name: "Bleeding",
                            duration: 2,
                            effect: (t) => {
                                const bleedDamage = Math.floor(t.currentStats.maxHp * 0.05);
                                t.currentStats.hp -= bleedDamage;
                                return `${t.name} bleeds for ${bleedDamage} damage!`;
                            }
                        });
                        message += " The bite causes bleeding!";
                    }
                    
                    return {
                        damage: damage,
                        message: message
                    };
                }
            }
        },
        {
            id: "goblin",
            name: "Goblin",
            portrait: "👺",
            baseStats: {
                hp: 45,
                maxHp: 45,
                atk: 7,
                def: 4,
                spd: 8
            },
            special: {
                name: "Sneak Attack",
                description: "Attacks from the shadows for increased damage.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 1.5);
                    return {
                        damage: damage,
                        message: `${self.name} performs a sneaky attack on ${target.name} for ${damage} damage!`
                    };
                }
            }
        }
    ],
    
    // Level 4-7 Enemies
    intermediate: [
        {
            id: "orc",
            name: "Orc Warrior",
            portrait: "🪓",
            baseStats: {
                hp: 80,
                maxHp: 80,
                atk: 12,
                def: 7,
                spd: 6
            },
            special: {
                name: "Battle Cry",
                description: "Increases attack by 20% for 2 turns.",
                effect: (self, target) => {
                    self.effects.push({
                        name: "Battle Cry",
                        duration: 2,
                        effect: (s) => {
                            s.currentStats.atk = Math.floor(s.currentStats.atk * 1.2);
                            return `${s.name}'s attack is increased!`;
                        }
                    });
                    
                    return {
                        damage: 0,
                        message: `${self.name} lets out a battle cry, increasing its attack!`
                    };
                }
            }
        },
        {
            id: "skeleton",
            name: "Skeleton Archer",
            portrait: "💀",
            baseStats: {
                hp: 65,
                maxHp: 65,
                atk: 14,
                def: 4,
                spd: 10
            },
            special: {
                name: "Barrage",
                description: "Fires multiple arrows, hitting the enemy 2-3 times.",
                effect: (self, target) => {
                    const hits = Math.floor(Math.random() * 2) + 2;
                    const damage = Math.floor(self.currentStats.atk * 0.6) * hits;
                    
                    return {
                        damage: damage,
                        message: `${self.name} fires a barrage of ${hits} arrows at ${target.name} for ${damage} total damage!`
                    };
                }
            }
        },
        {
            id: "wolf",
            name: "Dire Wolf",
            portrait: "🐺",
            baseStats: {
                hp: 70,
                maxHp: 70,
                atk: 13,
                def: 5,
                spd: 12
            },
            special: {
                name: "Howl",
                description: "Increases speed and attack for 2 turns.",
                effect: (self, target) => {
                    self.effects.push({
                        name: "Howl",
                        duration: 2,
                        effect: (s) => {
                            s.currentStats.atk = Math.floor(s.currentStats.atk * 1.15);
                            s.currentStats.spd = Math.floor(s.currentStats.spd * 1.2);
                            return `${s.name} is empowered by the howl!`;
                        }
                    });
                    
                    return {
                        damage: 0,
                        message: `${self.name} lets out a chilling howl!`
                    };
                }
            }
        }
    ],
    
    // Level 8-12 Enemies
    advanced: [
        {
            id: "troll",
            name: "Cave Troll",
            portrait: "🧌",
            baseStats: {
                hp: 120,
                maxHp: 120,
                atk: 16,
                def: 10,
                spd: 5
            },
            special: {
                name: "Smash",
                description: "Smashes the ground, dealing damage and stunning the enemy.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 1.4);
                    
                    target.effects.push({
                        name: "Stunned",
                        duration: 1,
                        effect: (t) => {
                            t.stunned = true;
                            return `${t.name} is stunned and cannot act!`;
                        },
                        onRemove: (t) => {
                            t.stunned = false;
                            return `${t.name} recovers from the stun.`;
                        }
                    });
                    
                    return {
                        damage: damage,
                        message: `${self.name} smashes the ground, dealing ${damage} damage and stunning ${target.name}!`
                    };
                }
            }
        },
        {
            id: "wraith",
            name: "Wraith",
            portrait: "👻",
            baseStats: {
                hp: 90,
                maxHp: 90,
                atk: 18,
                def: 8,
                spd: 15
            },
            special: {
                name: "Soul Drain",
                description: "Drains the enemy's life force, healing the wraith.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 1.2);
                    const healing = Math.floor(damage * 0.5);
                    
                    self.currentStats.hp = Math.min(self.currentStats.maxHp, self.currentStats.hp + healing);
                    
                    return {
                        damage: damage,
                        message: `${self.name} drains ${target.name}'s life force for ${damage} damage and heals for ${healing} HP!`
                    };
                }
            }
        },
        {
            id: "golem",
            name: "Stone Golem",
            portrait: "🗿",
            baseStats: {
                hp: 150,
                maxHp: 150,
                atk: 14,
                def: 15,
                spd: 4
            },
            special: {
                name: "Earth Shield",
                description: "Creates a shield that absorbs damage for 2 turns.",
                effect: (self, target) => {
                    self.effects.push({
                        name: "Earth Shield",
                        duration: 2,
                        effect: (s) => {
                            s.currentStats.def = Math.floor(s.currentStats.def * 1.5);
                            return `${s.name}'s defense is greatly increased!`;
                        },
                        onRemove: (s) => {
                            s.currentStats.def = Math.floor(s.currentStats.def / 1.5);
                            return `${s.name}'s earth shield crumbles.`;
                        }
                    });
                    
                    return {
                        damage: 0,
                        message: `${self.name} surrounds itself with an earth shield!`
                    };
                }
            }
        }
    ],
    
    // Level 13+ Enemies
    elite: [
        {
            id: "dragon",
            name: "Young Dragon",
            portrait: "🐉",
            baseStats: {
                hp: 200,
                maxHp: 200,
                atk: 22,
                def: 18,
                spd: 12
            },
            special: {
                name: "Dragon Breath",
                description: "Breathes fire, dealing heavy damage and burning the enemy.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 1.8);
                    
                    target.effects.push({
                        name: "Burning",
                        duration: 3,
                        effect: (t) => {
                            const burnDamage = Math.floor(t.currentStats.maxHp * 0.08);
                            t.currentStats.hp -= burnDamage;
                            return `${t.name} takes ${burnDamage} burning damage!`;
                        }
                    });
                    
                    return {
                        damage: damage,
                        message: `${self.name} breathes fire at ${target.name} for ${damage} damage, causing burning!`
                    };
                }
            }
        },
        {
            id: "lich",
            name: "Lich",
            portrait: "⚰️",
            baseStats: {
                hp: 180,
                maxHp: 180,
                atk: 24,
                def: 12,
                spd: 14
            },
            special: {
                name: "Death Curse",
                description: "Places a curse that drains health each turn and weakens defense.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 0.8);
                    
                    target.effects.push({
                        name: "Death Curse",
                        duration: 3,
                        effect: (t) => {
                            const curseDamage = Math.floor(t.currentStats.maxHp * 0.07);
                            t.currentStats.hp -= curseDamage;
                            t.currentStats.def = Math.floor(t.currentStats.def * 0.9);
                            return `${t.name} suffers ${curseDamage} damage from the curse and defense is weakened!`;
                        },
                        onRemove: (t) => {
                            return `The death curse on ${t.name} fades away.`;
                        }
                    });
                    
                    return {
                        damage: damage,
                        message: `${self.name} places a death curse on ${target.name}, dealing ${damage} damage!`
                    };
                }
            }
        },
        {
            id: "demon",
            name: "Demon Lord",
            portrait: "😈",
            baseStats: {
                hp: 250,
                maxHp: 250,
                atk: 26,
                def: 16,
                spd: 16
            },
            special: {
                name: "Hellfire",
                description: "Summons hellfire that deals massive damage to the enemy.",
                effect: (self, target) => {
                    const damage = Math.floor(self.currentStats.atk * 2.2);
                    
                    return {
                        damage: damage,
                        message: `${self.name} summons hellfire, engulfing ${target.name} for ${damage} devastating damage!`
                    };
                }
            }
        }
    ]
};

// Mutation Pool - Applied after winning a battle
const MUTATIONS = [
    // Positive Mutations
    {
        id: "strength_blessing",
        name: "Strength Blessing",
        description: "Increases your attack power by 15%.",
        effect: (player) => {
            player.baseStats.atk *= 1.15;
            return "Your muscles surge with newfound power!";
        },
        type: "positive"
    },
    {
        id: "iron_skin",
        name: "Iron Skin",
        description: "Increases your defense by 20%.",
        effect: (player) => {
            player.baseStats.def *= 1.2;
            return "Your skin hardens like iron!";
        },
        type: "positive"
    },
    {
        id: "vitality_surge",
        name: "Vitality Surge",
        description: "Increases your maximum HP by 20%.",
        effect: (player) => {
            const hpIncrease = Math.floor(player.baseStats.maxHp * 0.2);
            player.baseStats.maxHp += hpIncrease;
            player.baseStats.hp += hpIncrease;
            return `Your life force strengthens, gaining ${hpIncrease} max HP!`;
        },
        type: "positive"
    },
    {
        id: "swift_feet",
        name: "Swift Feet",
        description: "Increases your speed by 25%.",
        effect: (player) => {
            player.baseStats.spd *= 1.25;
            return "Your movements become lightning fast!";
        },
        type: "positive"
    },
    {
        id: "vampiric_aura",
        name: "Vampiric Aura",
        description: "Gain lifesteal equal to 10% of damage dealt.",
        effect: (player) => {
            player.lifesteal = (player.lifesteal || 0) + 0.1;
            return "A dark aura surrounds you, allowing you to drain life from enemies!";
        },
        type: "positive"
    },
    {
        id: "critical_master",
        name: "Critical Master",
        description: "Increases critical hit chance by 15% and critical damage by 30%.",
        effect: (player) => {
            player.critChance = (player.critChance || 0.05) + 0.15;
            player.critDamage = (player.critDamage || 1.5) + 0.3;
            return "Your strikes become more precise, finding vital spots!";
        },
        type: "positive"
    },
    {
        id: "quick_recovery",
        name: "Quick Recovery",
        description: "Reduces special skill cooldown by 1 turn.",
        effect: (player) => {
            player.specialCooldownReduction = (player.specialCooldownReduction || 0) + 1;
            return "Your mind becomes sharper, allowing faster ability usage!";
        },
        type: "positive"
    },
    {
        id: "reflective_barrier",
        name: "Reflective Barrier",
        description: "Reflects 20% of damage taken back to the attacker.",
        effect: (player) => {
            player.damageReflect = (player.damageReflect || 0) + 0.2;
            return "A shimmering barrier forms around you, reflecting damage!";
        },
        type: "positive"
    },
    
    // Negative Mutations
    {
        id: "weakened_muscles",
        name: "Weakened Muscles",
        description: "Decreases your attack power by 10%.",
        effect: (player) => {
            player.baseStats.atk *= 0.9;
            return "Your muscles feel weaker!";
        },
        type: "negative"
    },
    {
        id: "brittle_bones",
        name: "Brittle Bones",
        description: "Decreases your defense by 15%.",
        effect: (player) => {
            player.baseStats.def *= 0.85;
            return "Your bones become fragile!";
        },
        type: "negative"
    },
    {
        id: "frailty",
        name: "Frailty",
        description: "Decreases your maximum HP by 15%.",
        effect: (player) => {
            const hpDecrease = Math.floor(player.baseStats.maxHp * 0.15);
            player.baseStats.maxHp -= hpDecrease;
            player.baseStats.hp = Math.min(player.baseStats.hp, player.baseStats.maxHp);
            return `Your life force weakens, losing ${hpDecrease} max HP!`;
        },
        type: "negative"
    },
    {
        id: "sluggishness",
        name: "Sluggishness",
        description: "Decreases your speed by 15%.",
        effect: (player) => {
            player.baseStats.spd *= 0.85;
            return "Your movements become sluggish!";
        },
        type: "negative"
    },
    {
        id: "glass_heart",
        name: "Glass Heart",
        description: "Take 15% more damage from all sources.",
        effect: (player) => {
            player.damageVulnerability = (player.damageVulnerability || 0) + 0.15;
            return "Your heart feels fragile, making you more vulnerable to damage!";
        },
        type: "negative"
    },
    
    // Neutral/Mixed Mutations
    {
        id: "berserker_rage",
        name: "Berserker Rage",
        description: "Increases attack by 30% but decreases defense by 20%.",
        effect: (player) => {
            player.baseStats.atk *= 1.3;
            player.baseStats.def *= 0.8;
            return "Rage fills your veins, making you stronger but less careful!";
        },
        type: "neutral"
    },
    {
        id: "calculated_strikes",
        name: "Calculated Strikes",
        description: "Increases critical hit chance by 25% but decreases attack speed by 10%.",
        effect: (player) => {
            player.critChance = (player.critChance || 0.05) + 0.25;
            player.baseStats.spd *= 0.9;
            return "You become more calculating, striking less often but with greater precision!";
        },
        type: "neutral"
    },
    {
        id: "life_conversion",
        name: "Life Conversion",
        description: "Decreases max HP by 20% but increases attack by 25%.",
        effect: (player) => {
            const hpDecrease = Math.floor(player.baseStats.maxHp * 0.2);
            player.baseStats.maxHp -= hpDecrease;
            player.baseStats.hp = Math.min(player.baseStats.hp, player.baseStats.maxHp);
            player.baseStats.atk *= 1.25;
            return "You convert your life force into offensive power!";
        },
        type: "neutral"
    },
    {
        id: "thorns",
        name: "Thorns",
        description: "Reflect 40% of damage taken, but reduce your defense by 25%.",
        effect: (player) => {
            player.damageReflect = (player.damageReflect || 0) + 0.4;
            player.baseStats.def *= 0.75;
            return "Sharp thorns cover your body, hurting those who attack you but leaving you vulnerable!";
        },
        type: "neutral"
    },
    {
        id: "blood_magic",
        name: "Blood Magic",
        description: "Special abilities deal 50% more damage but cost 10% of your current HP.",
        effect: (player) => {
            player.specialDamageBonus = (player.specialDamageBonus || 0) + 0.5;
            player.specialHealthCost = 0.1;
            return "Dark magic flows through your veins, empowering your abilities at the cost of your life!";
        },
        type: "neutral"
    },
    {
        id: "glass_cannon",
        name: "Glass Cannon",
        description: "Increases attack by 40% but decreases max HP by 30%.",
        effect: (player) => {
            player.baseStats.atk *= 1.4;
            const hpDecrease = Math.floor(player.baseStats.maxHp * 0.3);
            player.baseStats.maxHp -= hpDecrease;
            player.baseStats.hp = Math.min(player.baseStats.hp, player.baseStats.maxHp);
            return "Your body becomes frail but your strikes become devastating!";
        },
        type: "neutral"
    }
];

// Player's special abilities
const PLAYER_SPECIALS = {
    warrior: {
        name: "Mighty Swing",
        description: "A powerful attack that deals 180% of your attack as damage.",
        effect: (self, target) => {
            const baseDamage = Math.floor(self.currentStats.atk * 1.8);
            let damage = baseDamage;
            
            // Apply special damage bonus if present
            if (self.specialDamageBonus) {
                damage = Math.floor(damage * (1 + self.specialDamageBonus));
            }
            
            // Apply health cost if present
            if (self.specialHealthCost) {
                const healthCost = Math.floor(self.currentStats.hp * self.specialHealthCost);
                self.currentStats.hp -= healthCost;
                return {
                    damage: damage,
                    message: `${self.name} performs a Mighty Swing, sacrificing ${healthCost} HP to deal ${damage} damage!`
                };
            }
            
            return {
                damage: damage,
                message: `${self.name} performs a Mighty Swing for ${damage} damage!`
            };
        }
    },
    
    // Add more player specials here as you expand the game
};

// Helper function to get random elements from array
function getRandomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Helper function to get enemy by level
function getEnemyByLevel(level) {
    let pool;
    
    if (level < 4) {
        pool = ENEMIES.beginner;
    } else if (level < 8) {
        pool = ENEMIES.intermediate;
    } else if (level < 13) {
        pool = ENEMIES.advanced;
    } else {
        pool = ENEMIES.elite;
    }
    
    // Randomly select an enemy from the appropriate pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    const enemy = JSON.parse(JSON.stringify(pool[randomIndex])); // Deep clone
    
    // Scale enemy based on player level
    const scaleFactor = 1 + (level - 1) * 0.1;
    enemy.baseStats.maxHp = Math.floor(enemy.baseStats.maxHp * scaleFactor);
    enemy.baseStats.hp = enemy.baseStats.maxHp;
    enemy.baseStats.atk = Math.floor(enemy.baseStats.atk * scaleFactor);
    enemy.baseStats.def = Math.floor(enemy.baseStats.def * scaleFactor);
    
    // Add random mutation for higher levels (chance increases with level)
    if (level > 5 && Math.random() < (level * 0.05)) {
        const randomMutation = MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)];
        enemy.mutations = [randomMutation.name];
        randomMutation.effect(enemy);
    }
    
    return enemy;
}

// Helper function to get random mutations
function getRandomMutations(count) {
    return getRandomElements(MUTATIONS, count);
}

// Helper function to get random starting passives
function getRandomStartingPassives(count) {
    return getRandomElements(STARTING_PASSIVES, count);
}