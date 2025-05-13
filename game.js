// Game state
let gameState = {
    player: {
        name: "Player",
        maxHp: 100,
        currentHp: 100,
        maxMana: 50,
        currentMana: 50,
        weapon: {
            level: 1,
            minDamage: 2,
            maxDamage: 5
        },
        weaponDamageModifier: 1,
        doubleAttackChance: 0,
        doubleDamageChance: 0,
        vampiricPercentage: 0,
        thornsPercentage: 0,
        berserkerActive: false,
        randomStartStats: false,
        damageReduction: 0,
        survivalChance: 0,
        startRoundShield: 0,
        statusEffects: [],
        shieldActive: false,
        shieldValue: 0
    },
    enemy: {
        name: "Monster",
        emoji: "👹",
        maxHp: 20,
        currentHp: 20,
        minDamage: 1,
        maxDamage: 3,
        traits: [],
        statusEffects: []
    },
    abilities: {
        attack: {
            name: "Attack",
            manaCost: 15
        },
        defend: {
            name: "Defend",
            manaCost: 45,
            shieldValue: 50,
            offensiveDefense: false
        },
        heal: {
            name: "Heal",
            manaCost: 15,
            healAmount: 10
        },
        replenishMana: {
            name: "Replenish Mana",
            manaCost: 0
        }
    },
    rounds: 0,
    activeMutations: [],
    materialDropChanceModifier: 1,
    materialDropAmountModifier: 1,
    enemyDamageModifier: 1
};

// DOM Elements
const playerNameElement = document.getElementById('player-name');
const playerHpBarElement = document.getElementById('player-hp-bar');
const playerHpTextElement = document.getElementById('player-hp-text');
const playerManaBarElement = document.getElementById('player-mana-bar');
const playerManaTextElement = document.getElementById('player-mana-text');
const playerDamageElement = document.getElementById('player-damage');
const playerStatusEffectsElement = document.getElementById('player-status-effects');

const enemyNameElement = document.getElementById('enemy-name');
const enemyEmojiElement = document.getElementById('enemy-emoji');
const enemyHpBarElement = document.getElementById('enemy-hp-bar');
const enemyHpTextElement = document.getElementById('enemy-hp-text');
const enemyDamageElement = document.getElementById('enemy-damage');
const enemyStatusEffectsElement = document.getElementById('enemy-status-effects');

const roundsElement = document.getElementById('rounds-survived');
const activeMutationsElement = document.getElementById('active-mutations');
const battleLogElement = document.getElementById('battle-log');

const attackBtn = document.getElementById('attack-btn');
const defendBtn = document.getElementById('defend-btn');
const healBtn = document.getElementById('heal-btn');
const replenishBtn = document.getElementById('replenish-btn');
const endTurnBtn = document.getElementById('end-turn-btn');
const shopBtn = document.getElementById('shop-btn');

const homeBtn = document.getElementById('home-btn');
const materialsGainedElement = document.getElementById('materials-gained');
const materialsListElement = document.querySelector('.materials-list');
const continueBtn = document.getElementById('continue-btn');

const mutationOverlay = document.getElementById('mutation-overlay');
const mutationOptionsElement = document.getElementById('mutation-options');
const shopOverlay = document.getElementById('shop-overlay');
const closeShopBtn = document.getElementById('close-shop-btn');

const gameOverOverlay = document.getElementById('game-over-overlay');
const gameOverStatsElement = document.getElementById('game-over-stats');
const returnBtn = document.getElementById('return-btn');

// Initialize the game
function initGame() {
    // Load player data from localStorage
    loadPlayerData();
    
    // Reset shop state for new run
    resetShopState();
    
    // Setup event listeners
    attackBtn.addEventListener('click', playerAttack);
    defendBtn.addEventListener('click', playerDefend);
    healBtn.addEventListener('click', playerHeal);
    replenishBtn.addEventListener('click', playerReplenishMana);
    endTurnBtn.addEventListener('click', endPlayerTurn);
    homeBtn.addEventListener('click', returnToMainMenu);
    continueBtn.addEventListener('click', continueAfterVictory);
    returnBtn.addEventListener('click', returnToMainMenu);
    shopBtn.addEventListener('click', openShop);
    closeShopBtn.addEventListener('click', closeShop);
    
    // Start the first round
    startNewRound();
    
    // Update UI
    updateUI();
    updateCrystalDisplay();
}

// Load player data from localStorage
function loadPlayerData() {
    const savedData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedData) {
        try {
            const playerData = JSON.parse(savedData);
            
            // Set player name
            gameState.player.name = playerData.nickname || "Player";
            
            // Set player weapon
            if (playerData.weapon) {
                gameState.player.weapon = { ...playerData.weapon };
            }
            
            // Update player name in UI
            if (playerNameElement) {
                playerNameElement.textContent = gameState.player.name;
            }
        } catch (error) {
            console.error('Error parsing saved player data:', error);
        }
    }
}

// Start a new round with a new enemy
function startNewRound() {
    // Increment rounds counter
    gameState.rounds++;
    
    // Reset player's shield status
    gameState.player.shieldActive = false;
    gameState.player.shieldValue = 0;
    
    // Clear status effects
    gameState.player.statusEffects = [];
    gameState.enemy.statusEffects = [];
    
    // Generate a new enemy based on current round
    generateEnemy();
    
    // Check if player should get a mutation (every 3 rounds)
    if (gameState.rounds > 1 && gameState.rounds % 3 === 1) {
        showMutationOptions();
    }
    
    // Check if shop should open (every 5 rounds)
    if (gameState.rounds % 5 === 0) {
        // Show shop button
        shopBtn.classList.remove('hidden');
        addBattleLog("The shop is available! Click the Shop button to purchase items.", "system-message");
    } else {
        // Hide shop button
        shopBtn.classList.add('hidden');
    }
    
    // Apply random start stats effect if active
    if (gameState.player.randomStartStats) {
        applyRandomStartStats();
    }
    
    // Apply start-of-round shield if player has the Imperial Shield
    applyStartRoundShield();
    
    // Update UI
    updateRoundsDisplay();
    updatePlayerStats();
    updateEnemyStats();
    updateStatusEffects();
    updateActiveMutations();
    updatePlayerInventory();
    
    // Add round start message to battle log
    addBattleLog(`Round ${gameState.rounds} begins! A ${gameState.enemy.name} appears!`, "system-message");
}

// Apply random start stats if the mutation is active
function applyRandomStartStats() {
    const minPercent = 0.5;
    const maxPercent = 1.5;
    
    const hpPercent = minPercent + Math.random() * (maxPercent - minPercent);
    const manaPercent = minPercent + Math.random() * (maxPercent - minPercent);
    
    gameState.player.currentHp = Math.floor(gameState.player.maxHp * hpPercent);
    gameState.player.currentHp = Math.min(gameState.player.currentHp, gameState.player.maxHp);
    
    gameState.player.currentMana = Math.floor(gameState.player.maxMana * manaPercent);
    gameState.player.currentMana = Math.min(gameState.player.currentMana, gameState.player.maxMana);
    
    addBattleLog(`Chaotic energy fluctuates! Starting HP: ${gameState.player.currentHp}, Mana: ${gameState.player.currentMana}`, "system-message");
}

// Generate an enemy based on the current round
function generateEnemy() {
    // Determine difficulty tier based on rounds survived
    let tier;
    if (gameState.rounds <= 5) {
        tier = 1;
    } else if (gameState.rounds <= 10) {
        tier = 2;
    } else if (gameState.rounds <= 15) {
        tier = 3;
    } else if (gameState.rounds <= 20) {
        tier = 4;
    } else if (gameState.rounds <= 25) {
        tier = 5;
    } else {
        tier = 6;
    }
    
    // Store the tier in the enemy object for crystal rewards
    gameState.currentEnemyTier = tier;
    
    // Get enemies from the current tier
    const enemiesPool = ENEMY_POOLS[tier];
    
    // Select a random enemy from the pool
    const enemyTemplate = enemiesPool[Math.floor(Math.random() * enemiesPool.length)];
    
    // Calculate enemy stats (with scaling based on round number)
    const roundScaling = 1 + (gameState.rounds - 1) * 0.05; // 5% increase per round
    const hpScaling = Math.max(1, (gameState.rounds - 1) * 0.1); // HP increases more significantly
    
    const minHp = Math.floor(enemyTemplate.minHp * (1 + hpScaling));
    const maxHp = Math.floor(enemyTemplate.maxHp * (1 + hpScaling));
    const hp = getRandomInt(minHp, maxHp);
    
    const minDamage = Math.floor(enemyTemplate.minDamage * roundScaling);
    const maxDamage = Math.floor(enemyTemplate.maxDamage * roundScaling);
    
    // Create the enemy object
    gameState.enemy = {
        name: enemyTemplate.name,
        emoji: enemyTemplate.emoji,
        maxHp: hp,
        currentHp: hp,
        minDamage: minDamage,
        maxDamage: maxDamage,
        goldDropChance: enemyTemplate.goldDropChance,
        goldDropAmount: enemyTemplate.goldDropAmount,
        ironDropChance: enemyTemplate.ironDropChance,
        ironDropAmount: enemyTemplate.ironDropAmount,
        titaniumDropChance: enemyTemplate.titaniumDropChance,
        titaniumDropAmount: enemyTemplate.titaniumDropAmount,
        traits: [],
        statusEffects: []
    };
    
    // Apply enemy damage modifier from mutations
    gameState.enemy.minDamage = Math.floor(gameState.enemy.minDamage * gameState.enemyDamageModifier);
    gameState.enemy.maxDamage = Math.floor(gameState.enemy.maxDamage * gameState.enemyDamageModifier);
    
    // Add traits if the enemy has possible traits
    if (enemyTemplate.possibleTraits && enemyTemplate.possibleTraits.length > 0) {
        // Higher chance for traits in higher rounds
        const traitChance = 0.3 + (tier - 1) * 0.1; // 30% at tier 1, +10% per tier
        
        if (Math.random() < traitChance) {
            // Select a random trait
            const traitName = enemyTemplate.possibleTraits[Math.floor(Math.random() * enemyTemplate.possibleTraits.length)];
            const trait = ENEMY_TRAITS[traitName];
            
            if (trait) {
                gameState.enemy.traits.push(trait);
                
                // Apply trait effect
                if (typeof trait.effect === 'function') {
                    trait.effect(gameState.enemy, gameState.player);
                }
            }
        }
    }
}

// Show mutation options for player to choose
function showMutationOptions() {
    // Get active mutation IDs
    const activeMutationIds = gameState.activeMutations.map(m => m.id);
    
    // Get random mutations
    const mutations = getRandomMutations(3, activeMutationIds);
    
    // Create mutation options
    mutationOptionsElement.innerHTML = '';
    
    mutations.forEach(mutation => {
        const optionElement = document.createElement('div');
        optionElement.className = 'mutation-option';
        optionElement.dataset.mutationId = mutation.id;
        
        // Add category-based styling
        if (mutation.category === MUTATION_CATEGORIES.POSITIVE) {
            optionElement.style.borderColor = '#4caf50';
        } else if (mutation.category === MUTATION_CATEGORIES.NEGATIVE) {
            optionElement.style.borderColor = '#f44336';
        } else {
            optionElement.style.borderColor = '#ff9800';
        }
        
        const nameElement = document.createElement('h3');
        nameElement.textContent = mutation.name;
        
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = mutation.description;
        
        optionElement.appendChild(nameElement);
        optionElement.appendChild(descriptionElement);
        
        // Add click event
        optionElement.addEventListener('click', () => {
            selectMutation(mutation);
        });
        
        mutationOptionsElement.appendChild(optionElement);
    });
    
    // Show the overlay
    mutationOverlay.classList.remove('hidden');
    
    // Disable action buttons while overlay is visible
    toggleActionButtons(false);
}

// Select a mutation
function selectMutation(mutation) {
    // Add mutation to active mutations
    gameState.activeMutations.push(mutation);
    
    // Apply mutation effect
    if (typeof mutation.effect === 'function') {
        mutation.effect(gameState);
    }
    
    // Add to battle log
    addBattleLog(`Mutation acquired: ${mutation.name} - ${mutation.description}`, "system-message");
    
    // Hide the overlay
    mutationOverlay.classList.add('hidden');
    
    // Update UI
    updateActiveMutations();
    updatePlayerStats();
    updatePlayerDamage();
    updateAbilityButtons();
    
    // Re-enable action buttons
    toggleActionButtons(true);
}

// Player actions
function playerAttack() {
    // Check if player has enough mana
    if (gameState.player.currentMana < gameState.abilities.attack.manaCost) {
        addBattleLog("Not enough mana to attack!", "system-message");
        return;
    }
    
    // Calculate base damage
    let minDamage = gameState.player.weapon.minDamage;
    let maxDamage = gameState.player.weapon.maxDamage;
    
    // Apply weapon damage modifier
    minDamage = Math.floor(minDamage * gameState.player.weaponDamageModifier);
    maxDamage = Math.floor(maxDamage * gameState.player.weaponDamageModifier);
    
    // Apply berserker effect if active
    if (gameState.player.berserkerActive) {
        const missingHpPercent = 1 - (gameState.player.currentHp / gameState.player.maxHp);
        const berserkerBonus = 1 + (missingHpPercent * 0.5); // 5% per 10% missing HP
        
        minDamage = Math.floor(minDamage * berserkerBonus);
        maxDamage = Math.floor(maxDamage * berserkerBonus);
    }
    
    // Calculate final damage
    let damage = getRandomInt(minDamage, maxDamage);
    
    // Check for double damage chance (Hellhound Claw item)
    if (gameState.player.doubleDamageChance > 0 && Math.random() < gameState.player.doubleDamageChance) {
        damage *= 2;
        addBattleLog("Hellhound Claw glows! Double damage!", "player-action");
    }
    
    // Apply damage to enemy
    let damageDealt = applyDamage(gameState.enemy, damage);
    
    // Use mana
    gameState.player.currentMana -= gameState.abilities.attack.manaCost;
    
    // Add to battle log
    addBattleLog(`${gameState.player.name} attacks ${gameState.enemy.name} for ${damageDealt} damage!`, "player-action");
    
    // Apply vampiric effect if active
    if (gameState.player.vampiricPercentage > 0) {
        const healAmount = Math.floor(damageDealt * gameState.player.vampiricPercentage);
        if (healAmount > 0) {
            gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + healAmount);
            addBattleLog(`${gameState.player.name} drains ${healAmount} HP from the enemy!`, "player-action");
            updatePlayerStats();
        }
    }
    
    // Check for double attack
    if (gameState.player.doubleAttackChance > 0 && Math.random() < gameState.player.doubleAttackChance) {
        setTimeout(() => {
            // Calculate second attack damage
            const secondDamage = getRandomInt(minDamage, maxDamage);
            let secondDamageDealt = applyDamage(gameState.enemy, secondDamage);
            
            // Add to battle log
            addBattleLog(`${gameState.player.name} strikes again for ${secondDamageDealt} damage!`, "player-action");
            
            // Apply vampiric effect for second attack
            if (gameState.player.vampiricPercentage > 0) {
                const healAmount = Math.floor(secondDamageDealt * gameState.player.vampiricPercentage);
                if (healAmount > 0) {
                    gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + healAmount);
                    addBattleLog(`${gameState.player.name} drains ${healAmount} HP from the enemy!`, "player-action");
                    updatePlayerStats();
                }
            }
            
            // Check if enemy is defeated
            checkEnemyDefeated();
        }, 500);
    }
    
    // Update UI
    updatePlayerStats();
    updateEnemyStats();
    
    // Check if enemy is defeated
    checkEnemyDefeated();
}

function playerDefend() {
    // Check if player has enough mana
    if (gameState.player.currentMana < gameState.abilities.defend.manaCost) {
        addBattleLog("Not enough mana to defend!", "system-message");
        return;
    }
    
    // Set shield status
    gameState.player.shieldActive = true;
    gameState.player.shieldValue = gameState.abilities.defend.shieldValue;
    
    // Use mana
    gameState.player.currentMana -= gameState.abilities.defend.manaCost;
    
    // Add to battle log
    addBattleLog(`${gameState.player.name} activates a shield that blocks ${gameState.player.shieldValue} damage!`, "player-action");
    
    // Check if offensive defense is active
    if (gameState.abilities.defend.offensiveDefense) {
        // Calculate damage (50% of weapon damage)
        let minDamage = Math.floor(gameState.player.weapon.minDamage * 0.5);
        let maxDamage = Math.floor(gameState.player.weapon.maxDamage * 0.5);
        
        // Apply weapon damage modifier
        minDamage = Math.floor(minDamage * gameState.player.weaponDamageModifier);
        maxDamage = Math.floor(maxDamage * gameState.player.weaponDamageModifier);
        
        const damage = getRandomInt(minDamage, maxDamage);
        
        // Apply damage to enemy
        const damageDealt = applyDamage(gameState.enemy, damage);
        
        // Add to battle log
        addBattleLog(`${gameState.player.name}'s defensive stance strikes ${gameState.enemy.name} for ${damageDealt} damage!`, "player-action");
        
        // Check if enemy is defeated
        checkEnemyDefeated();
    }
    
    // Update UI
    updatePlayerStats();
    updateStatusEffects();
}

function playerHeal() {
    // Check if player has enough mana
    if (gameState.player.currentMana < gameState.abilities.heal.manaCost) {
        addBattleLog("Not enough mana to heal!", "system-message");
        return;
    }
    
    // Check if player is at full health
    if (gameState.player.currentHp >= gameState.player.maxHp) {
        addBattleLog("You are already at full health!", "system-message");
        return;
    }
    
    // Calculate heal amount
    const healAmount = gameState.abilities.heal.healAmount;
    
    // Apply healing
    gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + healAmount);
    
    // Use mana
    gameState.player.currentMana -= gameState.abilities.heal.manaCost;
    
    // Add to battle log
    addBattleLog(`${gameState.player.name} heals for ${healAmount} HP!`, "player-action");
    
    // Update UI
    updatePlayerStats();
}

function playerReplenishMana() {
    // Check if player is at full mana
    if (gameState.player.currentMana >= gameState.player.maxMana) {
        addBattleLog("You already have full mana!", "system-message");
        return;
    }
    
    // Replenish mana to full
    gameState.player.currentMana = gameState.player.maxMana;
    
    // Add to battle log
    addBattleLog(`${gameState.player.name} replenishes mana to full!`, "player-action");
    
    // Update UI
    updatePlayerStats();
    
    // End player turn automatically when using this ability
    endPlayerTurn();
}

function endPlayerTurn() {
    // Process status effects that activate at end of turn
    processStatusEffects(gameState.player, 'onTurnEnd');
    
    // Process enemy turn
    enemyTurn();
}

// Enemy turn
function enemyTurn() {
    // Process status effects that activate at start of enemy turn
    processStatusEffects(gameState.enemy, 'onTurnStart');
    
    // Check if enemy has a custom turn start function from a trait
    if (typeof gameState.enemy.onTurnStart === 'function') {
        gameState.enemy.onTurnStart();
    }
    
    // Check if enemy is defeated (might have happened due to status effects)
    if (gameState.enemy.currentHp <= 0) {
        checkEnemyDefeated();
        return;
    }
    
    // Enemy performs an attack
    setTimeout(() => {
        enemyAttack();
    }, 500);
}

function enemyAttack() {
    // Calculate damage
    const damage = getRandomInt(gameState.enemy.minDamage, gameState.enemy.maxDamage);
    
    // Check if player has shield active
    let finalDamage = damage;
    let shieldBlockedAmount = 0;
    
    if (gameState.player.shieldActive) {
        shieldBlockedAmount = Math.min(damage, gameState.player.shieldValue);
        finalDamage = Math.max(0, damage - shieldBlockedAmount);
        
        addBattleLog(`${gameState.player.name}'s shield blocks ${shieldBlockedAmount} damage!`, "player-action");
        gameState.player.shieldActive = false;
        gameState.player.shieldValue = 0;
    }
    
    // Apply damage reduction from items (Orcish Shoulders)
    if (gameState.player.damageReduction > 0) {
        const reducedAmount = Math.floor(finalDamage * gameState.player.damageReduction);
        finalDamage = Math.max(0, finalDamage - reducedAmount);
        
        if (reducedAmount > 0) {
            addBattleLog(`Orcish Shoulders absorb ${reducedAmount} damage!`, "player-action");
        }
    }
    
    // Check for survival chance (Rogue's Cloak)
    const wouldDie = gameState.player.currentHp <= finalDamage;
    const survived = wouldDie && checkSurvivalChance(finalDamage);
    
    if (!survived) {
        // Apply damage to player
        applyDamage(gameState.player, finalDamage);
        
        // Add to battle log
        addBattleLog(`${gameState.enemy.name} attacks ${gameState.player.name} for ${finalDamage} damage!`, "enemy-action");
    }
    
    // Check if enemy has a custom onAttack function from a trait
    if (typeof gameState.enemy.onAttack === 'function') {
        gameState.enemy.onAttack(gameState.player, finalDamage);
    }
    
    // Check if enemy has a custom onDamageDealt function from a trait
    if (typeof gameState.enemy.onDamageDealt === 'function') {
        gameState.enemy.onDamageDealt(finalDamage);
    }
    
    // Apply thorns damage if active
    if (gameState.player.thornsPercentage > 0) {
        const thornsDamage = Math.floor(finalDamage * gameState.player.thornsPercentage);
        if (thornsDamage > 0) {
            applyDamage(gameState.enemy, thornsDamage);
            addBattleLog(`${gameState.enemy.name} takes ${thornsDamage} thorns damage!`, "player-action");
            
            // Check if enemy is defeated by thorns
            if (gameState.enemy.currentHp <= 0) {
                checkEnemyDefeated();
                return;
            }
        }
    }
    
    // Update UI
    updatePlayerStats();
    updateEnemyStats();
    updateStatusEffects();
    
    // Check if player is defeated
    if (gameState.player.currentHp <= 0) {
        playerDefeated();
    } else {
        // Process status effects that activate at end of enemy turn
        processStatusEffects(gameState.enemy, 'onTurnEnd');
        
        // Process status effects that activate at start of player turn
        setTimeout(() => {
            processStatusEffects(gameState.player, 'onTurnStart');
            updatePlayerStats();
            updateEnemyStats();
            updateStatusEffects();
            
            // Check if player is defeated by status effects
            if (gameState.player.currentHp <= 0) {
                playerDefeated();
            }
        }, 500);
    }
}

// Process status effects
function processStatusEffects(target, trigger) {
    if (!target.statusEffects) return;
    
    const expiredEffects = [];
    
    target.statusEffects.forEach((effect, index) => {
        // If the effect has the specified trigger, execute it
        if (effect[trigger] && typeof effect[trigger] === 'function') {
            effect[trigger](target);
        }
        
        // Decrease duration if it has one
        if (effect.duration !== undefined) {
            effect.duration--;
            
            // If duration is expired, add to expired effects
            if (effect.duration <= 0) {
                expiredEffects.push(index);
            }
        }
    });
    
    // Remove expired effects (in reverse order to avoid index issues)
    for (let i = expiredEffects.length - 1; i >= 0; i--) {
        const index = expiredEffects[i];
        const effect = target.statusEffects[index];
        
        // Call onExpire if it exists
        if (effect.onExpire && typeof effect.onExpire === 'function') {
            effect.onExpire(target);
        }
        
        // Remove the effect
        target.statusEffects.splice(index, 1);
        
        // Add to battle log
        addBattleLog(`${effect.name} effect on ${target.name} has expired!`, "system-message");
    }
    
    // Update status effects display
    updateStatusEffects();
}

// Add a status effect
function addStatusEffect(target, effect) {
    // Check if the target already has this effect
    const existingEffect = target.statusEffects.find(e => e.name === effect.name);
    
    if (existingEffect) {
        // If the effect already exists, reset its duration
        existingEffect.duration = effect.duration;
        addBattleLog(`${effect.name} effect on ${target.name} has been refreshed!`, "system-message");
    } else {
        // Add the new effect
        target.statusEffects.push({ ...effect });
        addBattleLog(`${target.name} is affected by ${effect.name}!`, "system-message");
    }
    
    // Update status effects display
    updateStatusEffects();
}

// Check if enemy is defeated
function checkEnemyDefeated() {
    if (gameState.enemy.currentHp <= 0) {
        // Enemy is defeated
        addBattleLog(`${gameState.enemy.name} has been defeated!`, "system-message");
        
        // Award crystals based on enemy tier
        if (gameState.currentEnemyTier) {
            const crystals = awardCrystals(gameState.currentEnemyTier);
            addBattleLog(`You gained ${crystals} crystals!`, "system-message");
        }
        
        // Calculate material drops
        const materialDrops = calculateMaterialDrops();
        
        // Show materials gained overlay
        showMaterialsGained(materialDrops);
        
        // Disable action buttons
        toggleActionButtons(false);
    }
}

// Calculate material drops from defeated enemy
function calculateMaterialDrops() {
    const materialDrops = {
        gold: 0,
        iron: 0,
        titanium: 0
    };
    
    // Gold drop
    if (Math.random() < gameState.enemy.goldDropChance * gameState.materialDropChanceModifier) {
        const min = gameState.enemy.goldDropAmount.min;
        const max = gameState.enemy.goldDropAmount.max;
        materialDrops.gold = Math.floor(getRandomInt(min, max) * gameState.materialDropAmountModifier);
    }
    
    // Iron drop
    if (Math.random() < gameState.enemy.ironDropChance * gameState.materialDropChanceModifier) {
        const min = gameState.enemy.ironDropAmount.min;
        const max = gameState.enemy.ironDropAmount.max;
        materialDrops.iron = Math.floor(getRandomInt(min, max) * gameState.materialDropAmountModifier);
    }
    
    // Titanium drop
    if (Math.random() < gameState.enemy.titaniumDropChance * gameState.materialDropChanceModifier) {
        const min = gameState.enemy.titaniumDropAmount.min;
        const max = gameState.enemy.titaniumDropAmount.max;
        materialDrops.titanium = Math.floor(getRandomInt(min, max) * gameState.materialDropAmountModifier);
    }
    
    return materialDrops;
}

// Show materials gained overlay
function showMaterialsGained(materialDrops) {
    // Clear previous materials
    materialsListElement.innerHTML = '';
    
    // Add material elements
    let materialsGained = false;
    
    if (materialDrops.gold > 0) {
        addMaterialElement('🪙', 'Gold Coins', materialDrops.gold);
        materialsGained = true;
    }
    
    if (materialDrops.iron > 0) {
        addMaterialElement('🧱', 'Iron Bars', materialDrops.iron);
        materialsGained = true;
    }
    
    if (materialDrops.titanium > 0) {
        addMaterialElement('⬜', 'Titanium Bars', materialDrops.titanium);
        materialsGained = true;
    }
    
    // If no materials gained, add a message
    if (!materialsGained) {
        const noMaterialsElement = document.createElement('div');
        noMaterialsElement.className = 'material-gained-item';
        noMaterialsElement.textContent = 'No materials dropped';
        materialsListElement.appendChild(noMaterialsElement);
    }
    
    // Update player data with new materials
    updatePlayerMaterials(materialDrops);
    
    // Show the overlay
    materialsGainedElement.classList.remove('hidden');
}

// Add material element to materials gained overlay
function addMaterialElement(emoji, name, amount) {
    const materialElement = document.createElement('div');
    materialElement.className = 'material-gained-item';
    
    const emojiElement = document.createElement('span');
    emojiElement.className = 'material-emoji';
    emojiElement.textContent = emoji;
    
    const nameElement = document.createElement('span');
    nameElement.className = 'material-name';
    nameElement.textContent = name;
    
    const amountElement = document.createElement('span');
    amountElement.className = 'material-amount';
    amountElement.textContent = '+' + amount;
    
    materialElement.appendChild(emojiElement);
    materialElement.appendChild(nameElement);
    materialElement.appendChild(amountElement);
    
    materialsListElement.appendChild(materialElement);
}

// Update player materials in localStorage
function updatePlayerMaterials(materialDrops) {
    // Load current player data
    const savedData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedData) {
        try {
            const playerData = JSON.parse(savedData);
            
            // Update materials
            if (!playerData.materials) {
                playerData.materials = { gold: 0, iron: 0, titanium: 0 };
            }
            
            playerData.materials.gold = (playerData.materials.gold || 0) + materialDrops.gold;
            playerData.materials.iron = (playerData.materials.iron || 0) + materialDrops.iron;
            playerData.materials.titanium = (playerData.materials.titanium || 0) + materialDrops.titanium;
            
            // Save updated data
            localStorage.setItem('arkaniumPlayerData', JSON.stringify(playerData));
        } catch (error) {
            console.error('Error updating player materials:', error);
        }
    }
}

// Continue after victory (button click)
function continueAfterVictory() {
    // Hide materials gained overlay
    materialsGainedElement.classList.add('hidden');
    
    // Start new round
    startNewRound();
    
    // Re-enable action buttons
    toggleActionButtons(true);
}

// Player defeated
function playerDefeated() {
    addBattleLog(`${gameState.player.name} has been defeated!`, "system-message");
    
    // Disable action buttons
    toggleActionButtons(false);
    
    // Show game over overlay
    showGameOver();
    
    // Submit score to leaderboard
    submitToLeaderboard();
}

// Show game over overlay
function showGameOver() {
    // Populate game over stats
    gameOverStatsElement.innerHTML = '';
    
    // Add stats elements
    addStatElement('Rounds Survived', gameState.rounds);
    addStatElement('Weapon Level', gameState.player.weapon.level);
    addStatElement('Crystals Earned', shopState.crystals);
    
    // Add purchased items
    if (shopState.purchasedItems.length > 0) {
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'items-container';
        
        const itemsTitle = document.createElement('h3');
        itemsTitle.textContent = 'Purchased Items';
        itemsContainer.appendChild(itemsTitle);
        
        const itemsList = document.createElement('ul');
        shopState.purchasedItems.forEach(itemId => {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (item) {
                const itemElement = document.createElement('li');
                itemElement.textContent = `${item.name}: ${item.description}`;
                itemsList.appendChild(itemElement);
            }
        });
        
        itemsContainer.appendChild(itemsList);
        gameOverStatsElement.appendChild(itemsContainer);
    }
    
    // Add active mutations
    if (gameState.activeMutations.length > 0) {
        const mutationsContainer = document.createElement('div');
        mutationsContainer.className = 'mutations-container';
        
        const mutationsTitle = document.createElement('h3');
        mutationsTitle.textContent = 'Active Mutations';
        mutationsContainer.appendChild(mutationsTitle);
        
        const mutationsList = document.createElement('ul');
        gameState.activeMutations.forEach(mutation => {
            const mutationItem = document.createElement('li');
            mutationItem.textContent = `${mutation.name}: ${mutation.description}`;
            mutationsList.appendChild(mutationItem);
        });
        
        mutationsContainer.appendChild(mutationsList);
        gameOverStatsElement.appendChild(mutationsContainer);
    }
    
    // Show the overlay
    gameOverOverlay.classList.remove('hidden');
}

// Add stat element to game over stats
function addStatElement(label, value) {
    const statElement = document.createElement('div');
    statElement.className = 'stats-item';
    
    const labelElement = document.createElement('span');
    labelElement.className = 'stats-item-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('span');
    valueElement.className = 'stats-item-value';
    valueElement.textContent = value;
    
    statElement.appendChild(labelElement);
    statElement.appendChild(valueElement);
    
    gameOverStatsElement.appendChild(statElement);
}

// Submit score to leaderboard
function submitToLeaderboard() {
    const playerName = gameState.player.name;
    const rounds = gameState.rounds;
    const weaponLevel = gameState.player.weapon.level;
    
    submitScore(playerName, rounds, weaponLevel)
        .then(message => {
            console.log(message);
        })
        .catch(error => {
            console.error('Error submitting score:', error);
        });
}

// Return to main menu
function returnToMainMenu() {
    window.location.href = 'index.html';
}

// Utility functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function applyDamage(target, damage) {
    // Check for damage reduction
    if (target.damageReduction && target.damageReduction > 0) {
        damage = Math.floor(damage * (1 - target.damageReduction));
    }
    
    // Ensure minimum damage of 1
    damage = Math.max(1, damage);
    
    // Apply damage
    target.currentHp -= damage;
    
    // Ensure HP doesn't go below 0
    target.currentHp = Math.max(0, target.currentHp);
    
    // If target has an onDamaged function, call it
    if (typeof target.onDamaged === 'function') {
        target.onDamaged(damage);
    }
    
    // If target has an onHealthChanged function, call it
    if (typeof target.onHealthChanged === 'function') {
        target.onHealthChanged();
    }
    
    return damage;
}

function addBattleLog(message, className = '') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${className}`;
    logEntry.textContent = message;
    
    battleLogElement.appendChild(logEntry);
    
    // Scroll to bottom
    battleLogElement.scrollTop = battleLogElement.scrollHeight;
}

// UI update functions
function updateUI() {
    updatePlayerStats();
    updateEnemyStats();
    updateRoundsDisplay();
    updateStatusEffects();
    updateActiveMutations();
    updatePlayerDamage();
    updateAbilityButtons();
}

function updatePlayerStats() {
    // Update health bar and text
    const hpPercentage = (gameState.player.currentHp / gameState.player.maxHp) * 100;
    playerHpBarElement.style.width = `${hpPercentage}%`;
    playerHpTextElement.textContent = `${gameState.player.currentHp}/${gameState.player.maxHp}`;
    
    // Update mana bar and text
    const manaPercentage = (gameState.player.currentMana / gameState.player.maxMana) * 100;
    playerManaBarElement.style.width = `${manaPercentage}%`;
    playerManaTextElement.textContent = `${gameState.player.currentMana}/${gameState.player.maxMana}`;
    
    // Update ability buttons based on available mana
    updateAbilityButtons();
}

function updateEnemyStats() {
    // Update enemy name, emoji
    enemyNameElement.textContent = gameState.enemy.name;
    enemyEmojiElement.textContent = gameState.enemy.emoji;
    
    // Update health bar and text
    const hpPercentage = (gameState.enemy.currentHp / gameState.enemy.maxHp) * 100;
    enemyHpBarElement.style.width = `${hpPercentage}%`;
    enemyHpTextElement.textContent = `${gameState.enemy.currentHp}/${gameState.enemy.maxHp}`;
    
    // Update damage range
    enemyDamageElement.textContent = `${gameState.enemy.minDamage}-${gameState.enemy.maxDamage}`;
}

function updatePlayerDamage() {
    // Calculate displayed damage range with modifiers
    let minDamage = gameState.player.weapon.minDamage;
    let maxDamage = gameState.player.weapon.maxDamage;
    
    // Apply weapon damage modifier
    minDamage = Math.floor(minDamage * gameState.player.weaponDamageModifier);
    maxDamage = Math.floor(maxDamage * gameState.player.weaponDamageModifier);
    
    // Update damage range display
    playerDamageElement.textContent = `${minDamage}-${maxDamage}`;
}

function updateAbilityButtons() {
    // Enable/disable ability buttons based on available mana
    attackBtn.disabled = gameState.player.currentMana < gameState.abilities.attack.manaCost;
    defendBtn.disabled = gameState.player.currentMana < gameState.abilities.defend.manaCost;
    healBtn.disabled = gameState.player.currentMana < gameState.abilities.heal.manaCost;
    replenishBtn.disabled = gameState.player.currentMana >= gameState.player.maxMana;
    
    // Update button text with current mana costs
    attackBtn.textContent = `⚔️ Attack (${gameState.abilities.attack.manaCost}💧)`;
    defendBtn.textContent = `🛡️ Defend (${gameState.abilities.defend.manaCost}💧)`;
    healBtn.textContent = `❤️ Heal (${gameState.abilities.heal.manaCost}💧)`;
}

function updateRoundsDisplay() {
    roundsElement.textContent = gameState.rounds;
}

function updateStatusEffects() {
    // Update player status effects
    playerStatusEffectsElement.innerHTML = '';
    
    // Add shield indicator if active
    if (gameState.player.shieldActive && gameState.player.shieldValue > 0) {
        const shieldElement = document.createElement('div');
        shieldElement.className = 'status-effect shield-effect';
        shieldElement.dataset.description = `Shield active: Blocks ${gameState.player.shieldValue} damage from next attack`;
        
        const iconElement = document.createElement('span');
        iconElement.className = 'effect-icon';
        iconElement.textContent = '🛡️';
        
        const nameElement = document.createElement('span');
        nameElement.className = 'effect-name';
        nameElement.textContent = `Shield (${gameState.player.shieldValue})`;
        
        shieldElement.appendChild(iconElement);
        shieldElement.appendChild(nameElement);
        
        playerStatusEffectsElement.appendChild(shieldElement);
    }
    
    // Add regular status effects
    if (gameState.player.statusEffects && gameState.player.statusEffects.length > 0) {
        gameState.player.statusEffects.forEach(effect => {
            const effectElement = document.createElement('div');
            effectElement.className = 'status-effect';
            effectElement.dataset.description = `${effect.description} (${effect.duration} turns remaining)`;
            
            const iconElement = document.createElement('span');
            iconElement.className = 'effect-icon';
            iconElement.textContent = effect.icon || '❓';
            
            const nameElement = document.createElement('span');
            nameElement.className = 'effect-name';
            nameElement.textContent = effect.name;
            
            effectElement.appendChild(iconElement);
            effectElement.appendChild(nameElement);
            
            playerStatusEffectsElement.appendChild(effectElement);
        });
    }
    
    // Update enemy status effects
    enemyStatusEffectsElement.innerHTML = '';
    
    if (gameState.enemy.statusEffects && gameState.enemy.statusEffects.length > 0) {
        gameState.enemy.statusEffects.forEach(effect => {
            const effectElement = document.createElement('div');
            effectElement.className = 'status-effect';
            effectElement.dataset.description = `${effect.description} (${effect.duration} turns remaining)`;
            
            const iconElement = document.createElement('span');
            iconElement.className = 'effect-icon';
            iconElement.textContent = effect.icon || '❓';
            
            const nameElement = document.createElement('span');
            nameElement.className = 'effect-name';
            nameElement.textContent = effect.name;
            
            effectElement.appendChild(iconElement);
            effectElement.appendChild(nameElement);
            
            enemyStatusEffectsElement.appendChild(effectElement);
        });
    }
    
    // Display enemy traits
    if (gameState.enemy.traits && gameState.enemy.traits.length > 0) {
        gameState.enemy.traits.forEach(trait => {
            const traitElement = document.createElement('div');
            traitElement.className = 'status-effect';
            traitElement.dataset.description = trait.description;
            
            const nameElement = document.createElement('span');
            nameElement.className = 'effect-name';
            nameElement.textContent = trait.name;
            
            traitElement.appendChild(nameElement);
            
            enemyStatusEffectsElement.appendChild(traitElement);
        });
    }
}

function updateActiveMutations() {
    activeMutationsElement.innerHTML = '';
    
    if (gameState.activeMutations.length === 0) {
        const noMutationsElement = document.createElement('p');
        noMutationsElement.className = 'no-mutations';
        noMutationsElement.textContent = 'No active mutations yet';
        activeMutationsElement.appendChild(noMutationsElement);
        return;
    }
    
    gameState.activeMutations.forEach(mutation => {
        const mutationElement = document.createElement('div');
        mutationElement.className = 'mutation-item';
        mutationElement.dataset.description = mutation.description;
        
        // Add category-based styling
        if (mutation.category === MUTATION_CATEGORIES.POSITIVE) {
            mutationElement.style.backgroundColor = '#e8f5e9';
            mutationElement.style.borderLeft = '3px solid #4caf50';
        } else if (mutation.category === MUTATION_CATEGORIES.NEGATIVE) {
            mutationElement.style.backgroundColor = '#ffebee';
            mutationElement.style.borderLeft = '3px solid #f44336';
        } else {
            mutationElement.style.backgroundColor = '#fff3e0';
            mutationElement.style.borderLeft = '3px solid #ff9800';
        }
        
        mutationElement.textContent = mutation.name;
        
        activeMutationsElement.appendChild(mutationElement);
    });
}

function toggleActionButtons(enabled) {
    attackBtn.disabled = !enabled || gameState.player.currentMana < gameState.abilities.attack.manaCost;
    defendBtn.disabled = !enabled || gameState.player.currentMana < gameState.abilities.defend.manaCost;
    healBtn.disabled = !enabled || gameState.player.currentMana < gameState.abilities.heal.manaCost;
    replenishBtn.disabled = !enabled || gameState.player.currentMana >= gameState.player.maxMana;
    endTurnBtn.disabled = !enabled;
    
    // Don't disable shop button if it's already visible
    if (enabled && !shopBtn.classList.contains('hidden')) {
        shopBtn.disabled = false;
    } else {
        shopBtn.disabled = !enabled;
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);