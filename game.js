// Game JavaScript - Core Game Logic
document.addEventListener('DOMContentLoaded', function() {
    // Check if game data exists in sessionStorage
    const gameDataString = sessionStorage.getItem('arkaniumGameData');
    if (!gameDataString) {
        // Redirect back to index.html if no game data
        window.location.href = 'index.html';
        return;
    }
    
    // Parse game data
    const gameData = JSON.parse(gameDataString);
    console.log("Game data loaded:", gameData); // Debug
    
    // DOM Elements
    const playerNicknameElement = document.getElementById('player-nickname');
    const playerNameElement = document.getElementById('player-name');
    const playerLevelElement = document.getElementById('player-level');
    const roundCounterElement = document.getElementById('round-counter');
    const playerHealthBar = document.getElementById('player-health-bar');
    const playerHealthText = document.getElementById('player-health-text');
    const playerHpElement = document.getElementById('player-hp');
    const playerAtkElement = document.getElementById('player-atk');
    const playerDefElement = document.getElementById('player-def');
    const playerSpdElement = document.getElementById('player-spd');
    const enemyNameElement = document.getElementById('enemy-name');
    const enemyHealthBar = document.getElementById('enemy-health-bar');
    const enemyHealthText = document.getElementById('enemy-health-text');
    const enemyHpElement = document.getElementById('enemy-hp');
    const enemyAtkElement = document.getElementById('enemy-atk');
    const enemyDefElement = document.getElementById('enemy-def');
    const enemySpdElement = document.getElementById('enemy-spd');
    const battleStatusElement = document.getElementById('battle-status');
    const statusMessageElement = document.getElementById('status-message');
    const attackButton = document.getElementById('attack-btn');
    const defendButton = document.getElementById('defend-btn');
    const specialButton = document.getElementById('special-btn');
    const specialCooldownElement = document.getElementById('special-cooldown');
    const mutationsLogElement = document.getElementById('mutations-log');
    const mutationSelectionElement = document.getElementById('mutation-selection');
    const mutationsOptionsElement = document.getElementById('mutations-options');
    const gameOverElement = document.getElementById('game-over');
    const finalStatsElement = document.getElementById('final-stats');
    const returnToMenuButton = document.getElementById('return-to-menu');
    
    // Game State
    const gameState = {
        player: {
            nickname: gameData.nickname,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            baseStats: {
                hp: 100,
                maxHp: 100,
                atk: 10,
                def: 5,
                spd: 10
            },
            currentStats: {
                hp: 100,
                maxHp: 100,
                atk: 10,
                def: 5,
                spd: 10
            },
            specialCooldown: 0,
            specialCooldownMax: 3,
            specialCooldownReduction: 0,
            special: PLAYER_SPECIALS.warrior,
            effects: [],
            mutations: [],
            isDefending: false,
            lifesteal: 0,
            damageReflect: 0,
            critChance: 0.05,
            critDamage: 1.5,
            regenPercent: 0,
            damageVulnerability: 0,
            specialDamageBonus: 0,
            specialHealthCost: 0
        },
        enemy: null,
        round: 1,
        battleLog: [],
        playerTurn: true,
        battleOver: false,
        gameOver: false
    };
    
    // Apply starting passive
    if (gameData.selectedPassive) {
        console.log("Applying starting passive:", gameData.selectedPassive.name);
        try {
            // We need to get the actual passive ability from STARTING_PASSIVES
            const passiveId = gameData.selectedPassive.id;
            const actualPassive = STARTING_PASSIVES.find(p => p.id === passiveId);
            
            if (actualPassive) {
                const passiveEffect = actualPassive.effect(gameState.player);
                gameState.player.mutations.push({
                    name: actualPassive.name,
                    description: actualPassive.description,
                    effect: passiveEffect,
                    type: actualPassive.type
                });
            } else {
                console.error("Could not find passive with id:", passiveId);
            }
        } catch (error) {
            console.error("Error applying passive:", error);
        }
    }
    
    // Initialize the game
    function initializeGame() {
        console.log("Initializing game...");
        // Set the player's nickname
        gameState.player.nickname = gameData.nickname;
        
        // Update UI elements
        updatePlayerUI();
        updateMutationsLog();
        
        // Spawn the first enemy
        spawnEnemy();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log("Game initialized!");
    }
    
    // Spawn a new enemy based on player level
    function spawnEnemy() {
        gameState.enemy = getEnemyByLevel(gameState.player.level);
        gameState.enemy.currentStats = { ...gameState.enemy.baseStats };
        gameState.enemy.effects = [];
        gameState.enemy.isDefending = false;
        
        // Update UI with enemy info
        updateEnemyUI();
        
        // Reset battle state
        gameState.battleOver = false;
        gameState.playerTurn = gameState.player.currentStats.spd >= gameState.enemy.currentStats.spd;
        
        if (gameState.playerTurn) {
            setStatusMessage("Your turn!");
            enablePlayerActions();
        } else {
            setStatusMessage(`${gameState.enemy.name}'s turn!`);
            disablePlayerActions();
            setTimeout(enemyTurn, 1000);
        }
    }
    
    // Update player UI elements
    function updatePlayerUI() {
        const player = gameState.player;
        
        playerNicknameElement.textContent = player.nickname;
        playerNameElement.textContent = `Player: ${player.nickname}`;
        playerLevelElement.textContent = `Level: ${player.level}`;
        roundCounterElement.textContent = `Round: ${gameState.round}`;
        
        // Health
        const healthPercent = (player.currentStats.hp / player.currentStats.maxHp) * 100;
        playerHealthBar.style.width = `${healthPercent}%`;
        playerHealthText.textContent = `${player.currentStats.hp}/${player.currentStats.maxHp}`;
        
        // Stats
        playerHpElement.textContent = player.currentStats.hp;
        playerAtkElement.textContent = player.currentStats.atk;
        playerDefElement.textContent = player.currentStats.def;
        playerSpdElement.textContent = player.currentStats.spd;
        
        // Special cooldown
        if (player.specialCooldown > 0) {
            specialCooldownElement.textContent = `(${player.specialCooldown})`;
            specialButton.disabled = true;
        } else {
            specialCooldownElement.textContent = `(Ready)`;
            specialButton.disabled = false;
        }
    }
    
    // Update enemy UI elements
    function updateEnemyUI() {
        const enemy = gameState.enemy;
        
        enemyNameElement.textContent = enemy.name;
        
        // Health
        const healthPercent = (enemy.currentStats.hp / enemy.currentStats.maxHp) * 100;
        enemyHealthBar.style.width = `${healthPercent}%`;
        enemyHealthText.textContent = `${enemy.currentStats.hp}/${enemy.currentStats.maxHp}`;
        
        // Stats
        enemyHpElement.textContent = enemy.currentStats.hp;
        enemyAtkElement.textContent = enemy.currentStats.atk;
        enemyDefElement.textContent = enemy.currentStats.def;
        enemySpdElement.textContent = enemy.currentStats.spd;
        
        // Update enemy portrait based on enemy id if available
        const enemyPortrait = document.querySelector('.enemy-portrait');
        if (enemy.portrait) {
            enemyPortrait.innerHTML = `<span class="enemy-emoji">${enemy.portrait}</span>`;
        } else {
            enemyPortrait.innerHTML = '';
        }
    }
    
    // Update the mutations log
    function updateMutationsLog() {
        mutationsLogElement.innerHTML = '';
        
        if (gameState.player.mutations.length === 0) {
            mutationsLogElement.innerHTML = '<div class="no-mutations">No mutations yet.</div>';
            return;
        }
        
        gameState.player.mutations.forEach(mutation => {
            const mutationTag = document.createElement('div');
            mutationTag.className = `mutation-tag ${mutation.type || 'neutral'}`;
            
            mutationTag.innerHTML = `
                ${mutation.name}
                <div class="mutation-tooltip">
                    <strong>${mutation.name}</strong>
                    <p>${mutation.description}</p>
                </div>
            `;
            
            mutationsLogElement.appendChild(mutationTag);
        });
    }
    
    // Set the status message
    function setStatusMessage(message) {
        statusMessageElement.textContent = message;
        
        // Create a temporary battle log entry
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.className = 'battle-log-entry';
        
        // Optional: Add animation/highlight to status message
        statusMessageElement.classList.add('highlight');
        setTimeout(() => {
            statusMessageElement.classList.remove('highlight');
        }, 500);
    }
    
    // Enable player action buttons
    function enablePlayerActions() {
        attackButton.disabled = false;
        defendButton.disabled = false;
        specialButton.disabled = gameState.player.specialCooldown > 0;
    }
    
    // Disable player action buttons
    function disablePlayerActions() {
        attackButton.disabled = true;
        defendButton.disabled = true;
        specialButton.disabled = true;
    }
    
    // Player attacks enemy
    function playerAttack() {
        const player = gameState.player;
        const enemy = gameState.enemy;
        
        // Calculate damage
        let damage = Math.max(1, player.currentStats.atk - Math.floor(enemy.currentStats.def * 0.5));
        let criticalHit = false;
        
        // Check for critical hit
        if (Math.random() < player.critChance) {
            damage = Math.floor(damage * player.critDamage);
            criticalHit = true;
        }
        
        // Apply damage to enemy
        enemy.currentStats.hp -= damage;
        
        // Apply lifesteal if player has it
        if (player.lifesteal > 0) {
            const healing = Math.floor(damage * player.lifesteal);
            player.currentStats.hp = Math.min(player.currentStats.maxHp, player.currentStats.hp + healing);
            setStatusMessage(`You attack for ${damage} damage${criticalHit ? ' (Critical Hit!)' : ''}. You heal for ${healing} HP.`);
        } else {
            setStatusMessage(`You attack for ${damage} damage${criticalHit ? ' (Critical Hit!)' : ''}.`);
        }
        
        // Check if enemy is defeated
        if (enemy.currentStats.hp <= 0) {
            enemy.currentStats.hp = 0;
            handleEnemyDefeated();
        } else {
            // End player turn
            finishPlayerTurn();
        }
        
        // Update UI
        updatePlayerUI();
        updateEnemyUI();
    }
    
    // Player defends
    function playerDefend() {
        const player = gameState.player;
        
        player.isDefending = true;
        setStatusMessage("You prepare to defend against the next attack.");
        
        // End player turn
        finishPlayerTurn();
    }
    
    // Player uses special ability
    function playerSpecial() {
        const player = gameState.player;
        const enemy = gameState.enemy;
        
        // Use special ability
        const specialResult = player.special.effect(player, enemy);
        
        // Apply damage to enemy
        enemy.currentStats.hp -= specialResult.damage;
        
        // Set cooldown
        player.specialCooldown = player.specialCooldownMax - (player.specialCooldownReduction || 0);
        
        // Display message
        setStatusMessage(specialResult.message);
        
        // Check if enemy is defeated
        if (enemy.currentStats.hp <= 0) {
            enemy.currentStats.hp = 0;
            handleEnemyDefeated();
        } else {
            // End player turn
            finishPlayerTurn();
        }
        
        // Update UI
        updatePlayerUI();
        updateEnemyUI();
    }
    
    // Finish player turn and start enemy turn
    function finishPlayerTurn() {
        gameState.playerTurn = false;
        disablePlayerActions();
        
        // Apply effects that happen at end of turn
        applyEndOfTurnEffects(gameState.player);
        
        // Start enemy turn after a short delay
        setTimeout(enemyTurn, 1000);
    }
    
    // Enemy takes their turn
    function enemyTurn() {
        if (gameState.battleOver) return;
        
        const player = gameState.player;
        const enemy = gameState.enemy;
        
        // Check if enemy is stunned
        if (enemy.stunned) {
            setStatusMessage(`${enemy.name} is stunned and cannot act!`);
            finishEnemyTurn();
            return;
        }
        
        // Decide on enemy action (simple AI)
        // 70% chance to attack, 20% chance to defend, 10% chance to use special
        const actionRoll = Math.random();
        
        if (actionRoll < 0.1 && enemy.special) {
            // Use special ability
            const specialResult = enemy.special.effect(enemy, player);
            
            // Apply damage to player
            let damage = specialResult.damage;
            
            // Reduce damage if player is defending
            if (player.isDefending) {
                damage = Math.floor(damage * 0.5);
                setStatusMessage(`${specialResult.message} You defend, reducing the damage to ${damage}!`);
            } else {
                setStatusMessage(specialResult.message);
            }
            
            // Apply damage vulnerability if player has it
            if (player.damageVulnerability > 0) {
                damage = Math.floor(damage * (1 + player.damageVulnerability));
            }
            
            player.currentStats.hp -= damage;
            
            // Apply damage reflect if player has it
            if (player.damageReflect > 0 && damage > 0) {
                const reflectDamage = Math.floor(damage * player.damageReflect);
                enemy.currentStats.hp -= reflectDamage;
                setStatusMessage(`${enemy.name} uses ${enemy.special.name} for ${damage} damage. You reflect ${reflectDamage} damage back!`);
                
                // Check if enemy is defeated by reflection
                if (enemy.currentStats.hp <= 0) {
                    enemy.currentStats.hp = 0;
                    handleEnemyDefeated();
                    return;
                }
            }
        } else if (actionRoll < 0.3) {
            // Defend
            enemy.isDefending = true;
            setStatusMessage(`${enemy.name} prepares to defend.`);
        } else {
            // Attack
            let damage = Math.max(1, enemy.currentStats.atk - Math.floor(player.currentStats.def * 0.5));
            
            // Reduce damage if player is defending
            if (player.isDefending) {
                damage = Math.floor(damage * 0.5);
                setStatusMessage(`${enemy.name} attacks for ${damage} damage. You defend, reducing the damage!`);
            } else {
                setStatusMessage(`${enemy.name} attacks for ${damage} damage.`);
            }
            
            // Apply damage vulnerability if player has it
            if (player.damageVulnerability > 0) {
                damage = Math.floor(damage * (1 + player.damageVulnerability));
            }
            
            player.currentStats.hp -= damage;
            
            // Apply damage reflect if player has it
            if (player.damageReflect > 0 && damage > 0) {
                const reflectDamage = Math.floor(damage * player.damageReflect);
                enemy.currentStats.hp -= reflectDamage;
                setStatusMessage(`${enemy.name} attacks for ${damage} damage. You reflect ${reflectDamage} damage back!`);
                
                // Check if enemy is defeated by reflection
                if (enemy.currentStats.hp <= 0) {
                    enemy.currentStats.hp = 0;
                    handleEnemyDefeated();
                    return;
                }
            }
        }
        
        // Check if player is defeated
        if (player.currentStats.hp <= 0) {
            player.currentStats.hp = 0;
            handlePlayerDefeated();
        } else {
            finishEnemyTurn();
        }
        
        // Update UI
        updatePlayerUI();
        updateEnemyUI();
    }
    
    // Finish enemy turn and start player turn
    function finishEnemyTurn() {
        gameState.playerTurn = true;
        
        // Reset defending status
        gameState.player.isDefending = false;
        gameState.enemy.isDefending = false;
        
        // Reduce special cooldown
        if (gameState.player.specialCooldown > 0) {
            gameState.player.specialCooldown--;
        }
        
        // Apply effects that happen at end of turn
        applyEndOfTurnEffects(gameState.enemy);
        
        // Process ongoing effects
        processEffects();
        
        // Start player turn
        setStatusMessage("Your turn!");
        enablePlayerActions();
    }
    
    // Apply end of turn effects (like regeneration)
    function applyEndOfTurnEffects(character) {
        // Apply regeneration if character has it
        if (character.regenPercent && character.regenPercent > 0) {
            const regenAmount = Math.floor(character.currentStats.maxHp * character.regenPercent);
            character.currentStats.hp = Math.min(character.currentStats.maxHp, character.currentStats.hp + regenAmount);
            setStatusMessage(`${character === gameState.player ? 'You regenerate' : character.name + ' regenerates'} ${regenAmount} HP.`);
        }
    }
    
    // Process ongoing effects for both player and enemy
    function processEffects() {
        // Process player effects
        processCharacterEffects(gameState.player);
        
        // Process enemy effects
        processCharacterEffects(gameState.enemy);
        
        // Update UI
        updatePlayerUI();
        updateEnemyUI();
        
        // Check if either character is defeated by effects
        if (gameState.player.currentStats.hp <= 0) {
            gameState.player.currentStats.hp = 0;
            handlePlayerDefeated();
        } else if (gameState.enemy.currentStats.hp <= 0) {
            gameState.enemy.currentStats.hp = 0;
            handleEnemyDefeated();
        }
    }
    
    // Process effects for a specific character
    function processCharacterEffects(character) {
        if (!character.effects || character.effects.length === 0) return;
        
        // Create a new array to hold effects that are still active
        const activeEffects = [];
        
        character.effects.forEach(effect => {
            // Process effect
            if (effect.effect) {
                const effectResult = effect.effect(character);
                if (effectResult) {
                    setStatusMessage(effectResult);
                }
            }
            
            // Reduce duration
            effect.duration--;
            
            // Check if effect is still active
            if (effect.duration > 0) {
                activeEffects.push(effect);
            } else {
                // Apply onRemove effect if it exists
                if (effect.onRemove) {
                    const removeResult = effect.onRemove(character);
                    if (removeResult) {
                        setStatusMessage(removeResult);
                    }
                }
            }
        });
        
        // Update character's effects
        character.effects = activeEffects;
    }
    
    // Handle player defeated
    function handlePlayerDefeated() {
        gameState.battleOver = true;
        gameState.gameOver = true;
        
        setStatusMessage("You have been defeated!");
        disablePlayerActions();
        
        // Show game over screen after a delay
        setTimeout(showGameOverScreen, 1500);
    }
    
    // Handle enemy defeated
    function handleEnemyDefeated() {
        gameState.battleOver = true;
        
        setStatusMessage(`You defeated the ${gameState.enemy.name}!`);
        disablePlayerActions();
        
        // Award XP and handle level up
        const xpGained = calculateXpGained(gameState.enemy);
        gameState.player.xp += xpGained;
        
        // Check for level up
        checkLevelUp();
        
        // Show mutation selection after a delay
        setTimeout(showMutationSelection, 1500);
    }
    
    // Calculate XP gained from defeating an enemy
    function calculateXpGained(enemy) {
        // Base XP based on enemy stats
        const baseXp = enemy.baseStats.maxHp * 0.5 + enemy.baseStats.atk * 2 + enemy.baseStats.def;
        
        // Scale by round
        return Math.floor(baseXp * (1 + (gameState.round - 1) * 0.1));
    }
    
    // Check if player levels up
    function checkLevelUp() {
        while (gameState.player.xp >= gameState.player.xpToNextLevel) {
            // Level up!
            gameState.player.xp -= gameState.player.xpToNextLevel;
            gameState.player.level++;
            
            // Increase stats
            gameState.player.baseStats.maxHp += 10;
            gameState.player.baseStats.hp = gameState.player.baseStats.maxHp;
            gameState.player.baseStats.atk += 2;
            gameState.player.baseStats.def += 1;
            gameState.player.baseStats.spd += 1;
            
            // Update current stats
            gameState.player.currentStats.maxHp = gameState.player.baseStats.maxHp;
            gameState.player.currentStats.hp = gameState.player.baseStats.hp;
            gameState.player.currentStats.atk = gameState.player.baseStats.atk;
            gameState.player.currentStats.def = gameState.player.baseStats.def;
            gameState.player.currentStats.spd = gameState.player.baseStats.spd;
            
            // Calculate new XP requirement (increases each level)
            gameState.player.xpToNextLevel = Math.floor(gameState.player.xpToNextLevel * 1.2);
            
            setStatusMessage(`Level up! You are now level ${gameState.player.level}!`);
        }
        
        // Update UI
        updatePlayerUI();
    }
    
    // Show mutation selection screen
    function showMutationSelection() {
        console.log("Showing mutation selection");
        // Get three random mutations
        const randomMutations = getRandomMutations(3);
        console.log("Random mutations:", randomMutations);
        
        // Clear the mutations options container
        mutationsOptionsElement.innerHTML = '';
        
        // Add each mutation option
        randomMutations.forEach(mutation => {
            const mutationOption = document.createElement('div');
            mutationOption.className = `mutation-option ${mutation.type}`;
            
            mutationOption.innerHTML = `
                <h3>${mutation.name}</h3>
                <p>${mutation.description}</p>
                <div class="mutation-effect">Effect Type: ${mutation.type}</div>
            `;
            
            mutationOption.addEventListener('click', () => {
                console.log(`Selected mutation: ${mutation.name}`);
                // Apply mutation
                const effectResult = mutation.effect(gameState.player);
                
                // Add to mutations list
                gameState.player.mutations.push({
                    name: mutation.name,
                    description: mutation.description,
                    effect: effectResult,
                    type: mutation.type
                });
                
                // Update mutations log
                updateMutationsLog();
                
                // Hide mutation selection
                mutationSelectionElement.classList.add('hidden');
                
                // Prepare for next round
                prepareNextRound();
            });
            
            mutationsOptionsElement.appendChild(mutationOption);
        });
        
        // Show mutation selection screen
        mutationSelectionElement.classList.remove('hidden');
    }
    
    // Prepare for the next round
    function prepareNextRound() {
        // Increment round
        gameState.round++;
        
        // Heal player partially (30% of missing health)
        const missingHealth = gameState.player.currentStats.maxHp - gameState.player.currentStats.hp;
        const healAmount = Math.floor(missingHealth * 0.3);
        gameState.player.currentStats.hp += healAmount;
        
        // Update round counter and player UI
        roundCounterElement.textContent = `Round: ${gameState.round}`;
        updatePlayerUI();
        
        // Spawn new enemy
        spawnEnemy();
    }
    
    // Show game over screen
    function showGameOverScreen() {
        console.log("Showing game over screen");
        // Generate final stats
        finalStatsElement.innerHTML = `
            <h3>Final Stats</h3>
            <div class="final-stat-group">
                <h4>Player</h4>
                <ul class="final-stat-list">
                    <li>Nickname: ${gameState.player.nickname}</li>
                    <li>Level: ${gameState.player.level}</li>
                    <li>Rounds Survived: ${gameState.round}</li>
                </ul>
            </div>
            
            <div class="final-stat-group">
                <h4>Final Stats</h4>
                <ul class="final-stat-list">
                    <li>Max HP: ${gameState.player.baseStats.maxHp}</li>
                    <li>Attack: ${gameState.player.baseStats.atk}</li>
                    <li>Defense: ${gameState.player.baseStats.def}</li>
                    <li>Speed: ${gameState.player.baseStats.spd}</li>
                </ul>
            </div>
            
            <div class="final-stat-group">
                <h4>Mutations</h4>
                <ul class="final-stat-list">
                    ${gameState.player.mutations.map(mutation => 
                        `<li>${mutation.name}: ${mutation.description || ''}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
        
        // Show game over screen
        gameOverElement.classList.remove('hidden');
        
        // Submit score to leaderboard
        try {
            submitScore(gameState.player.nickname, gameState.round)
                .then(() => {
                    console.log('Score submitted successfully!');
                })
                .catch(error => {
                    console.error('Error submitting score:', error);
                });
        } catch (error) {
            console.error('Error during score submission:', error);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        console.log("Setting up event listeners...");
        
        // Player action buttons
        attackButton.addEventListener('click', function() {
            console.log("Attack button clicked");
            playerAttack();
        });
        
        defendButton.addEventListener('click', function() {
            console.log("Defend button clicked");
            playerDefend();
        });
        
        specialButton.addEventListener('click', function() {
            console.log("Special button clicked");
            playerSpecial();
        });
        
        // Return to menu button
        returnToMenuButton.addEventListener('click', () => {
            console.log("Return to menu button clicked");
            window.location.href = 'index.html';
        });
        
        console.log("Event listeners set up!");
    }
    
    // Initialize the game
    initializeGame();
});