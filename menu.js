// Main Menu JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const nicknameInput = document.getElementById('nickname');
    const passiveAbilitiesContainer = document.getElementById('passive-abilities');
    const startGameButton = document.getElementById('start-game');
    const leaderboardContainer = document.getElementById('leaderboard');
    
    // Game State
    let selectedPassiveId = null;
    let randomPassives = [];
    
    // Initialize the game
    function initializeGame() {
        loadLeaderboard();
        generatePassiveOptions();
        setupEventListeners();
    }
    
    // Load leaderboard from Firebase
    function loadLeaderboard() {
        getLeaderboardScores()
            .then(scores => {
                if (scores.length === 0) {
                    leaderboardContainer.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
                } else {
                    leaderboardContainer.innerHTML = '';
                    scores.forEach((score, index) => {
                        const entry = document.createElement('div');
                        entry.className = 'leaderboard-entry';
                        entry.innerHTML = `
                            <span class="rank">#${index + 1}</span>
                            <span class="player-name">${score.nickname}</span>
                            <span class="score">Round ${score.round}</span>
                        `;
                        leaderboardContainer.appendChild(entry);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading leaderboard:', error);
                leaderboardContainer.innerHTML = '<div class="leaderboard-error">Error loading leaderboard. Please try again.</div>';
            });
    }
    
    // Generate random passive ability options
    function generatePassiveOptions() {
        // First, we need to import data.js to get access to the STARTING_PASSIVES array
        // Since we don't have direct access to it here, we'll define a temporary version
        // In a real implementation, this would use the imported data from data.js
        const script = document.createElement('script');
        script.src = 'data.js';
        script.onload = function() {
            // Once data.js is loaded, we can get random passives
            randomPassives = getRandomStartingPassives(5);
            displayPassiveOptions();
        };
        document.head.appendChild(script);
    }
    
    // Display passive ability options
    function displayPassiveOptions() {
        passiveAbilitiesContainer.innerHTML = '';
        
        randomPassives.forEach(passive => {
            const passiveCard = document.createElement('div');
            passiveCard.className = 'ability-card';
            passiveCard.dataset.id = passive.id;
            
            if (selectedPassiveId === passive.id) {
                passiveCard.classList.add('selected');
            }
            
            passiveCard.innerHTML = `
                <h3>${passive.name}</h3>
                <p>${passive.description}</p>
            `;
            
            passiveCard.addEventListener('click', () => {
                // Remove selected class from all cards
                document.querySelectorAll('.ability-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Add selected class to clicked card
                passiveCard.classList.add('selected');
                selectedPassiveId = passive.id;
                
                // Check if we can enable the start button
                checkStartGameButton();
            });
            
            passiveAbilitiesContainer.appendChild(passiveCard);
        });
    }
    
    // Check if start game button should be enabled
    function checkStartGameButton() {
        const nickname = nicknameInput.value.trim();
        if (nickname && selectedPassiveId) {
            startGameButton.disabled = false;
        } else {
            startGameButton.disabled = true;
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        nicknameInput.addEventListener('input', checkStartGameButton);
        
        startGameButton.addEventListener('click', startGame);
    }
    
    // Start the game
    function startGame() {
        const nickname = nicknameInput.value.trim();
        
        if (!nickname || !selectedPassiveId) {
            return;
        }
        
        // Find the selected passive
        const selectedPassive = randomPassives.find(p => p.id === selectedPassiveId);
        console.log("Selected passive:", selectedPassive);
        
        if (!selectedPassive) {
            console.error("Selected passive not found!");
            return;
        }
        
        // Store game data in sessionStorage to pass to game.html
        const gameData = {
            nickname: nickname,
            selectedPassive: {
                id: selectedPassive.id,
                name: selectedPassive.name,
                description: selectedPassive.description,
                effect: selectedPassive.effect.toString(), // Convert function to string
                type: selectedPassive.type
            },
            gameStarted: true
        };
        
        sessionStorage.setItem('arkaniumGameData', JSON.stringify(gameData));
        
        // Redirect to game.html
        window.location.href = 'game.html';
    }
    
    // Initialize the game when DOM is loaded
    initializeGame();
});