// Shop system for Arkanium
const SHOP_ITEMS = [
    {
        id: "orcish_shoulders",
        name: "Orcish Shoulders",
        description: "Gives 10% damage reduction to the player",
        cost: 2000,
        image: "🛡️", // Placeholder, will be replaced with actual image path
        effect: (gameState) => {
            // Damage reduction effect
            gameState.player.damageReduction = (gameState.player.damageReduction || 0) + 0.1;
        }
    },
    {
        id: "demon_helmet",
        name: "Demon Helmet",
        description: "Gives a 5% damage boost",
        cost: 1000,
        image: "👹", // Placeholder
        effect: (gameState) => {
            // Damage boost effect
            gameState.player.weaponDamageModifier = (gameState.player.weaponDamageModifier || 1) * 1.05;
            updatePlayerDamage();
        }
    },
    {
        id: "hellhound_claw",
        name: "Hellhound Claw",
        description: "Gives a 10% chance to make double damage",
        cost: 3500,
        image: "🔥", // Placeholder
        effect: (gameState) => {
            // Double damage chance
            gameState.player.doubleDamageChance = (gameState.player.doubleDamageChance || 0) + 0.1;
        }
    },
    {
        id: "elemental_extractor",
        name: "Elemental Extractor",
        description: "Makes 5% more materials drop if materials are dropping this round",
        cost: 1500,
        image: "💎", // Placeholder
        effect: (gameState) => {
            // Material drop rate increase
            gameState.materialDropAmountModifier = (gameState.materialDropAmountModifier || 1) * 1.05;
        }
    },
    {
        id: "imperial_shield",
        name: "Imperial Shield",
        description: "Gives 10 shield (block) at the start of each round",
        cost: 500,
        image: "🛡️", // Placeholder
        effect: (gameState) => {
            // Add start-of-round shield property
            gameState.player.startRoundShield = (gameState.player.startRoundShield || 0) + 10;
        }
    },
    {
        id: "rogues_cloak",
        name: "Rogue's Cloak",
        description: "1% chance to survive a hit which would have killed you, setting your HP to 20",
        cost: 10000,
        image: "🧥", // Placeholder
        effect: (gameState) => {
            // Survival chance
            gameState.player.survivalChance = (gameState.player.survivalChance || 0) + 0.01;
        }
    }
];

// Game state extension for the shop
let shopState = {
    crystals: 10, // Starting crystals
    purchasedItems: [], // Track purchased items
    shopOpen: false
};

// Function to open the shop
function openShop() {
    shopState.shopOpen = true;
    
    // Create shop content
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    
    SHOP_ITEMS.forEach(item => {
        // Check if item has been purchased
        const isPurchased = shopState.purchasedItems.includes(item.id);
        
        const itemElement = document.createElement('div');
        itemElement.className = `shop-item ${isPurchased ? 'purchased' : ''}`;
        itemElement.dataset.id = item.id;
        
        const imageElement = document.createElement('div');
        imageElement.className = 'item-image';
        imageElement.textContent = item.image; // Will be replaced with image tag
        
        const infoElement = document.createElement('div');
        infoElement.className = 'item-info';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'item-name';
        nameElement.textContent = item.name;
        
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'item-description';
        descriptionElement.textContent = item.description;
        
        const costElement = document.createElement('div');
        costElement.className = 'item-cost';
        costElement.innerHTML = `<span class="crystal-icon">💎</span> ${item.cost}`;
        
        infoElement.appendChild(nameElement);
        infoElement.appendChild(descriptionElement);
        
        const buyButtonElement = document.createElement('button');
        
        if (isPurchased) {
            buyButtonElement.className = 'buy-button purchased';
            buyButtonElement.textContent = 'Purchased';
            buyButtonElement.disabled = true;
        } else {
            buyButtonElement.className = 'buy-button';
            buyButtonElement.textContent = 'Buy';
            buyButtonElement.disabled = shopState.crystals < item.cost;
            
            buyButtonElement.addEventListener('click', () => {
                purchaseItem(item);
            });
        }
        
        // Build the item element
        itemElement.appendChild(imageElement);
        itemElement.appendChild(infoElement);
        itemElement.appendChild(costElement);
        itemElement.appendChild(buyButtonElement);
        
        // Add tooltip
        itemElement.title = `${item.name}: ${item.description}`;
        
        shopItems.appendChild(itemElement);
    });
    
    // Set crystals display
    document.getElementById('crystal-count').textContent = shopState.crystals;
    
    // Show the overlay
    document.getElementById('shop-overlay').classList.remove('hidden');
    
    // Disable action buttons while shop is open
    toggleActionButtons(false);
}

// Function to close the shop
function closeShop() {
    shopState.shopOpen = false;
    
    // Hide the overlay
    document.getElementById('shop-overlay').classList.add('hidden');
    
    // Re-enable action buttons
    toggleActionButtons(true);
}

// Function to purchase an item
function purchaseItem(item) {
    // Check if player has enough crystals
    if (shopState.crystals < item.cost) {
        addBattleLog(`Not enough crystals to purchase ${item.name}!`, "system-message");
        return;
    }
    
    // Check if item is already purchased
    if (shopState.purchasedItems.includes(item.id)) {
        addBattleLog(`You already own ${item.name}!`, "system-message");
        return;
    }
    
    // Deduct crystals
    shopState.crystals -= item.cost;
    
    // Add item to purchased items
    shopState.purchasedItems.push(item.id);
    
    // Apply item effect
    if (typeof item.effect === 'function') {
        item.effect(gameState);
    }
    
    // Update player inventory display
    updatePlayerInventory();
    
    // Update shop display
    openShop(); // Refresh shop
    
    // Add to battle log
    addBattleLog(`Purchased ${item.name} for ${item.cost} crystals!`, "system-message");
}

// Function to update player inventory display
function updatePlayerInventory() {
    const inventoryElement = document.getElementById('player-inventory');
    if (!inventoryElement) return;
    
    inventoryElement.innerHTML = '';
    
    if (shopState.purchasedItems.length === 0) {
        inventoryElement.innerHTML = '<div class="no-items">No items yet</div>';
        return;
    }
    
    shopState.purchasedItems.forEach(itemId => {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.title = `${item.name}: ${item.description}`;
        itemElement.textContent = item.image; // Will be replaced with image tag
        
        inventoryElement.appendChild(itemElement);
    });
}

// Function to award crystals when defeating an enemy
function awardCrystals(enemyTier) {
    // Base crystals by tier
    const baseCrystals = {
        1: 50,   // Tier 1 (Rounds 1-5)
        2: 100,  // Tier 2 (Rounds 6-10)
        3: 150,  // Tier 3 (Rounds 11-15)
        4: 200,  // Tier 4 (Rounds 16-20)
        5: 250,  // Tier 5 (Rounds 21-25)
        6: 300  // Tier 6 (Rounds 26+)
    };
    
    const crystalsAwarded = baseCrystals[enemyTier] || 50;
    shopState.crystals += crystalsAwarded;
    
    // Update crystal display
    updateCrystalDisplay();
    
    // Add to battle log
    addBattleLog(`You gained ${crystalsAwarded} crystals!`, "system-message");
    
    return crystalsAwarded;
}

// Function to update crystal display
function updateCrystalDisplay() {
    const crystalDisplayElement = document.getElementById('crystal-display');
    if (crystalDisplayElement) {
        crystalDisplayElement.textContent = shopState.crystals;
    }
}

// Function to reset shop state for a new run
function resetShopState() {
    shopState = {
        crystals: 10, // Starting crystals
        purchasedItems: [], // Track purchased items
        shopOpen: false
    };
    
    // Update displays
    updateCrystalDisplay();
    updatePlayerInventory();
}

// Check if player survives fatal hit
function checkSurvivalChance(damage) {
    // If player has survival chance and would die from this hit
    if (gameState.player.survivalChance > 0 && 
        gameState.player.currentHp > 0 && 
        gameState.player.currentHp <= damage) {
        
        // Roll for survival
        if (Math.random() < gameState.player.survivalChance) {
            // Survived!
            addBattleLog(`The Rogue's Cloak shimmers! You narrowly escape death!`, "system-message");
            gameState.player.currentHp = 20; // Set HP to 20
            return true; // Survived
        }
    }
    
    return false; // Didn't survive
}

// Apply start-of-round shield
function applyStartRoundShield() {
    if (gameState.player.startRoundShield > 0) {
        gameState.player.shieldActive = true;
        gameState.player.shieldValue = gameState.player.startRoundShield;
        
        addBattleLog(`Imperial Shield activates, providing ${gameState.player.startRoundShield} shield!`, "system-message");
        updateStatusEffects();
    }
}