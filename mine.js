// The Mine - Passive resource generation system
const MINE_LEVELS = [
    {
        level: 1,
        description: "Basic Mine",
        goldPerCycle: 5,
        ironPerCycle: 0,
        titaniumPerCycle: 0,
        upgradeCost: {
            gold: 100,
            iron: 0,
            titanium: 0
        }
    },
    {
        level: 2,
        description: "Improved Mine",
        goldPerCycle: 5,
        ironPerCycle: 1,
        titaniumPerCycle: 0,
        upgradeCost: {
            gold: 350,
            iron: 0,
            titanium: 0
        }
    },
    {
        level: 3,
        description: "Advanced Mine",
        goldPerCycle: 10,
        ironPerCycle: 2,
        titaniumPerCycle: 0,
        upgradeCost: {
            gold: 500,
            iron: 0,
            titanium: 0
        }
    },
    {
        level: 4,
        description: "Superior Mine",
        goldPerCycle: 15,
        ironPerCycle: 5,
        titaniumPerCycle: 0,
        upgradeCost: {
            gold: 1000,
            iron: 0,
            titanium: 0
        }
    },
    {
        level: 5,
        description: "Master Mine",
        goldPerCycle: 20,
        ironPerCycle: 10,
        titaniumPerCycle: 1,
        upgradeCost: null // No more upgrades
    }
];

// Mine state
let mineState = {
    unlocked: false,
    level: 1,
    mining: false,
    miningStartTime: null,
    miningEndTime: null,
    lastCollected: null
};

// Constants
const MINING_CYCLE_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds
const UNLOCK_REQUIREMENT = 20; // Rounds needed to unlock the mine

// DOM Elements
let startMineBtn;
let upgradeMineBtn;
let mineTimerElement;
let mineOutputElement;
let mineDescriptionElement;
let mineLevelElement;
let mineIndicatorElement;
let mineLockedOverlay;
let mineContainer;

// Initialize the mine
function initMine() {
    // Load mine state from localStorage
    loadMineState();
    
    // Get DOM elements
    startMineBtn = document.getElementById('start-mine-btn');
    upgradeMineBtn = document.getElementById('upgrade-mine-btn');
    mineTimerElement = document.getElementById('mine-timer');
    mineOutputElement = document.getElementById('mine-output');
    mineDescriptionElement = document.getElementById('mine-description');
    mineLevelElement = document.getElementById('mine-level');
    mineIndicatorElement = document.getElementById('mine-indicator');
    mineLockedOverlay = document.getElementById('mine-locked-overlay');
    mineContainer = document.getElementById('mine-container');
    
    // Check if mine is unlocked
    checkMineUnlocked();
    
    // Add event listeners
    if (startMineBtn) {
        startMineBtn.addEventListener('click', startMining);
    }
    
    if (upgradeMineBtn) {
        upgradeMineBtn.addEventListener('click', upgradeMine);
    }
    
    // Update UI
    updateMineUI();
    
    // Check if mining is in progress
    checkMiningStatus();
    
    // Start timer update interval
    setInterval(updateMiningTimer, 1000);
}

// Load mine state from localStorage
function loadMineState() {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Check if mine data exists
            if (playerData.mine) {
                mineState = { ...mineState, ...playerData.mine };
                
                // Convert timestamps back to Date objects if they exist
                if (mineState.miningStartTime) {
                    mineState.miningStartTime = new Date(mineState.miningStartTime);
                }
                if (mineState.miningEndTime) {
                    mineState.miningEndTime = new Date(mineState.miningEndTime);
                }
                if (mineState.lastCollected) {
                    mineState.lastCollected = new Date(mineState.lastCollected);
                }
            }
            
            // Check if mine should be unlocked based on highest round
            if (playerData.highestRound && playerData.highestRound >= UNLOCK_REQUIREMENT) {
                mineState.unlocked = true;
            }
        } catch (error) {
            console.error('Error loading mine state:', error);
        }
    }
}

// Save mine state to localStorage
function saveMineState() {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Update mine data
            playerData.mine = { ...mineState };
            
            // Save updated data
            localStorage.setItem('arkaniumPlayerData', JSON.stringify(playerData));
        } catch (error) {
            console.error('Error saving mine state:', error);
        }
    }
}

// Check if mine is unlocked
function checkMineUnlocked() {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Check if player has reached the required round
            if (playerData.highestRound && playerData.highestRound >= UNLOCK_REQUIREMENT) {
                mineState.unlocked = true;
                saveMineState();
            }
        } catch (error) {
            console.error('Error checking mine unlock status:', error);
        }
    }
    
    // Update UI based on unlock status
    if (mineLockedOverlay) {
        if (mineState.unlocked) {
            mineLockedOverlay.classList.add('hidden');
        } else {
            mineLockedOverlay.classList.remove('hidden');
        }
    }
}

// Start mining
function startMining() {
    if (!mineState.unlocked) return;
    
    // Set mining status
    mineState.mining = true;
    mineState.miningStartTime = new Date();
    mineState.miningEndTime = new Date(mineState.miningStartTime.getTime() + MINING_CYCLE_TIME);
    
    // Save state
    saveMineState();
    
    // Update UI
    updateMineUI();
    
    // Disable start button
    if (startMineBtn) {
        startMineBtn.disabled = true;
    }
}

// Check mining status
function checkMiningStatus() {
    if (!mineState.mining) return;
    
    const now = new Date();
    
    // If mining has finished
    if (mineState.miningEndTime && now >= mineState.miningEndTime) {
        completeMining();
    }
}

// Complete mining cycle
function completeMining() {
    if (!mineState.mining) return;
    
    // Get resources for current level
    const currentLevel = MINE_LEVELS[mineState.level - 1];
    
    // Add resources to player
    addResources(
        currentLevel.goldPerCycle,
        currentLevel.ironPerCycle,
        currentLevel.titaniumPerCycle
    );
    
    // Reset mining status
    mineState.mining = false;
    mineState.lastCollected = new Date();
    mineState.miningStartTime = null;
    mineState.miningEndTime = null;
    
    // Save state
    saveMineState();
    
    // Update UI
    updateMineUI();
    
    // Enable start button
    if (startMineBtn) {
        startMineBtn.disabled = false;
    }
}

// Add resources to player
function addResources(gold, iron, titanium) {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Ensure materials object exists
            if (!playerData.materials) {
                playerData.materials = { gold: 0, iron: 0, titanium: 0 };
            }
            
            // Add resources
            playerData.materials.gold = (playerData.materials.gold || 0) + gold;
            playerData.materials.iron = (playerData.materials.iron || 0) + iron;
            playerData.materials.titanium = (playerData.materials.titanium || 0) + titanium;
            
            // Save updated data
            localStorage.setItem('arkaniumPlayerData', JSON.stringify(playerData));
            
            // Update UI if main.js has updated the materials display
            if (typeof updatePlayerDataUI === 'function') {
                updatePlayerDataUI();
            }
        } catch (error) {
            console.error('Error adding resources:', error);
        }
    }
}

// Upgrade mine
function upgradeMine() {
    if (!mineState.unlocked) return;
    
    // Check if already at max level
    if (mineState.level >= MINE_LEVELS.length) {
        return;
    }
    
    // Get current level data
    const currentLevel = MINE_LEVELS[mineState.level - 1];
    
    // Check if player has enough resources
    if (!hasEnoughResources(
        currentLevel.upgradeCost.gold,
        currentLevel.upgradeCost.iron,
        currentLevel.upgradeCost.titanium
    )) {
        return;
    }
    
    // Deduct resources
    deductResources(
        currentLevel.upgradeCost.gold,
        currentLevel.upgradeCost.iron,
        currentLevel.upgradeCost.titanium
    );
    
    // Increase mine level
    mineState.level++;
    
    // Save state
    saveMineState();
    
    // Update UI
    updateMineUI();
    
    // Add upgrade animation
    if (upgradeMineBtn) {
        upgradeMineBtn.classList.add('pulse-animation');
        setTimeout(() => {
            upgradeMineBtn.classList.remove('pulse-animation');
        }, 500);
    }
}

// Check if player has enough resources
function hasEnoughResources(gold, iron, titanium) {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Ensure materials object exists
            if (!playerData.materials) {
                return false;
            }
            
            // Check resources
            return (
                (playerData.materials.gold || 0) >= gold &&
                (playerData.materials.iron || 0) >= iron &&
                (playerData.materials.titanium || 0) >= titanium
            );
        } catch (error) {
            console.error('Error checking resources:', error);
            return false;
        }
    }
    
    return false;
}

// Deduct resources from player
function deductResources(gold, iron, titanium) {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Ensure materials object exists
            if (!playerData.materials) {
                playerData.materials = { gold: 0, iron: 0, titanium: 0 };
            }
            
            // Deduct resources
            playerData.materials.gold = (playerData.materials.gold || 0) - gold;
            playerData.materials.iron = (playerData.materials.iron || 0) - iron;
            playerData.materials.titanium = (playerData.materials.titanium || 0) - titanium;
            
            // Save updated data
            localStorage.setItem('arkaniumPlayerData', JSON.stringify(playerData));
            
            // Update UI if main.js has updated the materials display
            if (typeof updatePlayerDataUI === 'function') {
                updatePlayerDataUI();
            }
        } catch (error) {
            console.error('Error deducting resources:', error);
        }
    }
}

// Update mining timer
function updateMiningTimer() {
    if (!mineState.mining || !mineState.miningEndTime) return;
    
    const now = new Date();
    const timeRemaining = Math.max(0, mineState.miningEndTime - now);
    
    if (timeRemaining <= 0) {
        completeMining();
        return;
    }
    
    // Format time remaining
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer display
    if (mineTimerElement) {
        mineTimerElement.textContent = timeString;
    }
    
    // Update mining indicator animation
    if (mineIndicatorElement) {
        mineIndicatorElement.classList.toggle('active');
    }
}

// Update mine UI
function updateMineUI() {
    // Update level display
    if (mineLevelElement) {
        mineLevelElement.textContent = mineState.level;
    }
    
    // Get current level data
    const currentLevel = MINE_LEVELS[mineState.level - 1];
    
    // Update description
    if (mineDescriptionElement) {
        mineDescriptionElement.textContent = currentLevel.description;
    }
    
    // Update output display
    if (mineOutputElement) {
        let outputText = `Output: ${currentLevel.goldPerCycle} Gold`;
        
        if (currentLevel.ironPerCycle > 0) {
            outputText += `, ${currentLevel.ironPerCycle} Iron`;
        }
        
        if (currentLevel.titaniumPerCycle > 0) {
            outputText += `, ${currentLevel.titaniumPerCycle} Titanium`;
        }
        
        mineOutputElement.textContent = outputText;
    }
    
    // Update mining status
    if (mineState.mining) {
        if (mineContainer) {
            mineContainer.classList.add('mining-active');
        }
        
        if (startMineBtn) {
            startMineBtn.disabled = true;
        }
    } else {
        if (mineContainer) {
            mineContainer.classList.remove('mining-active');
        }
        
        if (startMineBtn) {
            startMineBtn.disabled = false;
        }
        
        if (mineTimerElement) {
            mineTimerElement.textContent = "20:00";
        }
    }
    
    // Update upgrade button
    if (upgradeMineBtn) {
        // Check if max level
        if (mineState.level >= MINE_LEVELS.length) {
            upgradeMineBtn.disabled = true;
            upgradeMineBtn.textContent = "Max Level";
        } else {
            // Get upgrade cost
            const upgradeCost = currentLevel.upgradeCost;
            
            // Update button text
            upgradeMineBtn.textContent = `Upgrade (${upgradeCost.gold} Gold)`;
            
            // Check if player can afford upgrade
            upgradeMineBtn.disabled = !hasEnoughResources(
                upgradeCost.gold,
                upgradeCost.iron,
                upgradeCost.titanium
            );
        }
    }
}

// Update highest round record after game over
function updateHighestRound(rounds) {
    const savedPlayerData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedPlayerData) {
        try {
            const playerData = JSON.parse(savedPlayerData);
            
            // Update highest round if current round is higher
            if (!playerData.highestRound || rounds > playerData.highestRound) {
                playerData.highestRound = rounds;
                
                // Save updated data
                localStorage.setItem('arkaniumPlayerData', JSON.stringify(playerData));
                
                // Check if mine should be unlocked
                if (rounds >= UNLOCK_REQUIREMENT && !mineState.unlocked) {
                    mineState.unlocked = true;
                    saveMineState();
                }
            }
        } catch (error) {
            console.error('Error updating highest round:', error);
        }
    }
}

// Initialize the mine when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the main menu page
    if (document.querySelector('.main-menu')) {
        initMine();
    }
});