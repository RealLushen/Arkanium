// Game state variables
let playerData = {
    nickname: '',
    materials: {
        gold: 0,
        iron: 0,
        titanium: 0
    },
    weapon: {
        level: 1,
        minDamage: 2,
        maxDamage: 5,
        name: 'Rusty Axe',
        description: 'A weathered axe that has seen better days. Despite its rust, it\'s still sharp enough to cut through flesh.'
    }
};

// Weapon upgrade tiers
const weaponTiers = [
    // Tier 1 (Levels 1-5)
    {
        name: 'Rusty Axe',
        description: 'A weathered axe that has seen better days. Despite its rust, it\'s still sharp enough to cut through flesh.',
        minLevel: 1,
        maxLevel: 5,
        baseMinDamage: 2,
        baseMaxDamage: 5,
        damagePerLevel: 1,
        goldCostBase: 5,
        goldCostMultiplier: 1.2,
        ironCostBase: 0,
        ironCostMultiplier: 0,
        titaniumCostBase: 0,
        titaniumCostMultiplier: 0
    },
    // Tier 2 (Levels 6-10)
    {
        name: 'Iron Axe',
        description: 'A solid iron axe with a comfortable grip. The edge is sharp and reliable for combat.',
        minLevel: 6,
        maxLevel: 10,
        baseMinDamage: 7,
        baseMaxDamage: 12,
        damagePerLevel: 2,
        goldCostBase: 15,
        goldCostMultiplier: 1.3,
        ironCostBase: 2,
        ironCostMultiplier: 1.2,
        titaniumCostBase: 0,
        titaniumCostMultiplier: 0
    },
    // Tier 3 (Levels 11-15)
    {
        name: 'Steel Battleaxe',
        description: 'A finely crafted battleaxe with a steel head. Its weight gives each swing significant momentum.',
        minLevel: 11,
        maxLevel: 15,
        baseMinDamage: 17,
        baseMaxDamage: 22,
        damagePerLevel: 3,
        goldCostBase: 30,
        goldCostMultiplier: 1.4,
        ironCostBase: 8,
        ironCostMultiplier: 1.3,
        titaniumCostBase: 0,
        titaniumCostMultiplier: 0
    },
    // Tier 4 (Levels 16-20)
    {
        name: 'Reinforced Battleaxe',
        description: 'A battleaxe with reinforced steel edges. The head has been balanced for optimal swinging speed.',
        minLevel: 16,
        maxLevel: 20,
        baseMinDamage: 32,
        baseMaxDamage: 40,
        damagePerLevel: 4,
        goldCostBase: 50,
        goldCostMultiplier: 1.5,
        ironCostBase: 15,
        ironCostMultiplier: 1.4,
        titaniumCostBase: 2,
        titaniumCostMultiplier: 1.2
    },
    // Tier 5 (Levels 21-25)
    {
        name: 'Titanium Reaver',
        description: 'A deadly axe with a titanium-edged head. It slices through armor with ease.',
        minLevel: 21,
        maxLevel: 25,
        baseMinDamage: 52,
        baseMaxDamage: 65,
        damagePerLevel: 5,
        goldCostBase: 80,
        goldCostMultiplier: 1.6,
        ironCostBase: 25,
        ironCostMultiplier: 1.5,
        titaniumCostBase: 6,
        titaniumCostMultiplier: 1.3
    },
    // Tier 6 (Levels 26-30)
    {
        name: 'Enchanted Reaver',
        description: 'A titanium axe imbued with magical energy. The blade occasionally glows with an ethereal light.',
        minLevel: 26,
        maxLevel: 30,
        baseMinDamage: 77,
        baseMaxDamage: 95,
        damagePerLevel: 6,
        goldCostBase: 120,
        goldCostMultiplier: 1.7,
        ironCostBase: 40,
        ironCostMultiplier: 1.6,
        titaniumCostBase: 12,
        titaniumCostMultiplier: 1.4
    },
    // Tier 7 (Levels 31+)
    {
        name: 'Arkanium Destroyer',
        description: 'A legendary axe forged with mysterious Arkanium metal. The blade hums with power and appears to cut the air itself.',
        minLevel: 31,
        maxLevel: 999,
        baseMinDamage: 107,
        baseMaxDamage: 130,
        damagePerLevel: 7,
        goldCostBase: 200,
        goldCostMultiplier: 1.8,
        ironCostBase: 60,
        ironCostMultiplier: 1.7,
        titaniumCostBase: 20,
        titaniumCostMultiplier: 1.5
    }
];

// DOM Elements
const nicknameInput = document.getElementById('nickname-input');
const startGameBtn = document.getElementById('start-game-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const goldCoinsElement = document.getElementById('gold-coins');
const ironBarsElement = document.getElementById('iron-bars');
const titaniumBarsElement = document.getElementById('titanium-bars');
const weaponLevelElement = document.getElementById('weapon-level');
const weaponDamageElement = document.getElementById('weapon-damage');
const weaponNameElement = document.getElementById('weapon-name');
const weaponDescriptionElement = document.getElementById('weapon-description');
const costGoldElement = document.getElementById('cost-gold');
const costIronElement = document.getElementById('cost-iron');
const costIronContainer = document.getElementById('cost-iron-container');
const costTitaniumElement = document.getElementById('cost-titanium');
const costTitaniumContainer = document.getElementById('cost-titanium-container');
const viewAllPatchesBtn = document.getElementById('view-all-patches-btn');

// Patch Notes variables
let showingAllPatches = false;

// Initialize the game
function initGame() {
    // Load player data from localStorage
    loadPlayerData();
    
    // Initialize Firebase
    initializeFirebase();
    
    // Load leaderboard
    loadLeaderboard(updateLeaderboardUI);
    
    // Load patch notes
    displayPatchNotes('patch-notes-container', 3);
    
    // Update UI with player data
    updatePlayerDataUI();
    
    // Add event listeners
    nicknameInput.addEventListener('input', validateNickname);
    startGameBtn.addEventListener('click', startGame);
    upgradeBtn.addEventListener('click', upgradeWeapon);
    
    // Add patch notes event listeners
    if (viewAllPatchesBtn) {
        viewAllPatchesBtn.addEventListener('click', toggleAllPatchNotes);
    }
    
    // Validate nickname (in case it's filled from previous session)
    validateNickname();
}

// Toggle between showing recent and all patch notes
function toggleAllPatchNotes() {
    showingAllPatches = !showingAllPatches;
    
    if (showingAllPatches) {
        displayPatchNotes('patch-notes-container', null);
        viewAllPatchesBtn.textContent = 'Show Recent Patch Notes';
    } else {
        displayPatchNotes('patch-notes-container', 3);
        viewAllPatchesBtn.textContent = 'View All Patch Notes';
    }
}

// Load player data from localStorage
function loadPlayerData() {
    const savedData = localStorage.getItem('arkaniumPlayerData');
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            playerData = { ...playerData, ...parsedData };
        } catch (error) {
            console.error('Error parsing saved player data:', error);
            // Continue with default data
        }
    }
}

// Save player data to localStorage
function savePlayerData() {
    localStorage.setItem('arkaniumPlayerData', JSON.stringify(playerData));
}

// Update UI with player data
function updatePlayerDataUI() {
    // Update materials display
    goldCoinsElement.textContent = playerData.materials.gold;
    ironBarsElement.textContent = playerData.materials.iron;
    titaniumBarsElement.textContent = playerData.materials.titanium;
    
    // Update weapon display
    weaponLevelElement.textContent = playerData.weapon.level;
    weaponDamageElement.textContent = `${playerData.weapon.minDamage}-${playerData.weapon.maxDamage}`;
    weaponNameElement.textContent = playerData.weapon.name;
    weaponDescriptionElement.textContent = playerData.weapon.description;
    
    // Update upgrade cost
    updateUpgradeCost();
}

// Get current weapon tier based on level
function getCurrentWeaponTier() {
    return weaponTiers.find(tier => 
        playerData.weapon.level >= tier.minLevel && 
        playerData.weapon.level <= tier.maxLevel
    ) || weaponTiers[weaponTiers.length - 1]; // Default to highest tier if none match
}

// Calculate upgrade cost
function calculateUpgradeCost() {
    const currentTier = getCurrentWeaponTier();
    const level = playerData.weapon.level;
    
    const goldCost = Math.floor(currentTier.goldCostBase * Math.pow(currentTier.goldCostMultiplier, level - currentTier.minLevel));
    const ironCost = Math.floor(currentTier.ironCostBase * Math.pow(currentTier.ironCostMultiplier, level - currentTier.minLevel));
    const titaniumCost = Math.floor(currentTier.titaniumCostBase * Math.pow(currentTier.titaniumCostMultiplier, level - currentTier.minLevel));
    
    return { gold: goldCost, iron: ironCost, titanium: titaniumCost };
}

// Update upgrade cost display
function updateUpgradeCost() {
    const cost = calculateUpgradeCost();
    
    costGoldElement.textContent = cost.gold;
    costIronElement.textContent = cost.iron;
    costTitaniumElement.textContent = cost.titanium;
    
    // Show/hide iron and titanium costs
    if (cost.iron > 0) {
        costIronContainer.classList.remove('hidden');
    } else {
        costIronContainer.classList.add('hidden');
    }
    
    if (cost.titanium > 0) {
        costTitaniumContainer.classList.remove('hidden');
    } else {
        costTitaniumContainer.classList.add('hidden');
    }
    
    // Check if player can afford upgrade
    const canAfford = 
        playerData.materials.gold >= cost.gold && 
        playerData.materials.iron >= cost.iron && 
        playerData.materials.titanium >= cost.titanium;
    
    upgradeBtn.disabled = !canAfford;
}

// Upgrade weapon
function upgradeWeapon() {
    const cost = calculateUpgradeCost();
    
    // Check if player can afford upgrade
    if (
        playerData.materials.gold >= cost.gold && 
        playerData.materials.iron >= cost.iron && 
        playerData.materials.titanium >= cost.titanium
    ) {
        // Deduct materials
        playerData.materials.gold -= cost.gold;
        playerData.materials.iron -= cost.iron;
        playerData.materials.titanium -= cost.titanium;
        
        // Increase weapon level
        playerData.weapon.level++;
        
        // Check if weapon should change tier
        const newTier = getCurrentWeaponTier();
        if (playerData.weapon.level === newTier.minLevel) {
            // Weapon tier change
            playerData.weapon.name = newTier.name;
            playerData.weapon.description = newTier.description;
            
            // Base damage changes with tier
            playerData.weapon.minDamage = newTier.baseMinDamage;
            playerData.weapon.maxDamage = newTier.baseMaxDamage;
            
            // Add upgrade animation
            weaponNameElement.classList.add('pulse-animation');
            setTimeout(() => {
                weaponNameElement.classList.remove('pulse-animation');
            }, 500);
        } else {
            // Just increase damage within the same tier
            playerData.weapon.minDamage += newTier.damagePerLevel;
            playerData.weapon.maxDamage += newTier.damagePerLevel;
        }
        
        // Add upgrade animation
        upgradeBtn.classList.add('pulse-animation');
        setTimeout(() => {
            upgradeBtn.classList.remove('pulse-animation');
        }, 500);
        
        // Save data
        savePlayerData();
        
        // Update UI
        updatePlayerDataUI();
    }
}

// Validate nickname
function validateNickname() {
    const nickname = nicknameInput.value.trim();
    const isValid = nickname.length >= 2 && nickname.length <= 10;
    
    playerData.nickname = nickname;
    startGameBtn.disabled = !isValid;
    
    // Add visual feedback for validation
    if (nickname.length > 0) {
        if (nickname.length < 2) {
            nicknameInput.classList.add('invalid');
            nicknameInput.title = "Nickname must be at least 2 characters";
        } else if (nickname.length > 10) {
            nicknameInput.classList.add('invalid');
            nicknameInput.title = "Nickname must be maximum 10 characters";
        } else {
            nicknameInput.classList.remove('invalid');
            nicknameInput.title = "";
        }
    } else {
        nicknameInput.classList.remove('invalid');
        nicknameInput.title = "";
    }
}

// Start the game
function startGame() {
    const nickname = nicknameInput.value.trim();
    
    if (nickname !== '') {
        playerData.nickname = nickname;
        savePlayerData();
        window.location.href = 'game.html';
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);