// Firebase configuration
// Note: In a real app, you should use environment variables to store your Firebase config
const firebaseConfig = {
    // Replace with your Firebase config
  apiKey: "AIzaSyDznH50XJv4M0gL4AdzkwpDQlgV_77R8U4",
  authDomain: "arkanium-bc48a.firebaseapp.com",
  databaseURL: "https://arkanium-bc48a-default-rtdb.firebaseio.com",
  projectId: "arkanium-bc48a",
  storageBucket: "arkanium-bc48a.firebasestorage.app",
  messagingSenderId: "556861674998",
  appId: "1:556861674998:web:d0dbf0571511e824c363d7",
  measurementId: "G-6B9S6RT0Y3"
};

// Initialize Firebase
let firebaseInitialized = false;
let database;

function initializeFirebase() {
    if (firebaseInitialized) return;
    
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        firebaseInitialized = true;
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

// Load leaderboard data from Firebase
function loadLeaderboard(callback) {
    initializeFirebase();
    
    if (!firebaseInitialized) {
        console.error("Firebase not initialized. Cannot load leaderboard.");
        return;
    }
    
    const leaderboardRef = database.ref('leaderboard');
    
    leaderboardRef.orderByChild('rounds')
        .limitToLast(10)
        .once('value')
        .then((snapshot) => {
            const leaderboardData = [];
            snapshot.forEach((childSnapshot) => {
                leaderboardData.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Sort by rounds (highest first)
            leaderboardData.sort((a, b) => b.rounds - a.rounds);
            
            if (callback && typeof callback === 'function') {
                callback(leaderboardData);
            }
        })
        .catch((error) => {
            console.error("Error loading leaderboard:", error);
            if (callback && typeof callback === 'function') {
                callback([]);
            }
        });
}

// Submit new score to leaderboard
function submitScore(nickname, rounds, weaponLevel) {
    initializeFirebase();
    
    if (!firebaseInitialized) {
        console.error("Firebase not initialized. Cannot submit score.");
        return Promise.reject("Firebase not initialized");
    }
    
    if (!nickname || nickname.trim() === '') {
        return Promise.reject("Nickname is required");
    }
    
    const leaderboardRef = database.ref('leaderboard');
    const newScoreRef = leaderboardRef.push();
    
    return newScoreRef.set({
        nickname: nickname.trim(),
        rounds: rounds,
        weaponLevel: weaponLevel,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log("Score submitted successfully");
        return "Score submitted successfully";
    })
    .catch((error) => {
        console.error("Error submitting score:", error);
        return Promise.reject("Error submitting score: " + error.message);
    });
}

// Update leaderboard UI
function updateLeaderboardUI(leaderboardData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    if (!leaderboardBody) return;
    
    // Clear existing rows
    leaderboardBody.innerHTML = '';
    
    if (leaderboardData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'No scores yet';
        row.appendChild(cell);
        leaderboardBody.appendChild(row);
        return;
    }
    
    // Add rows for each leaderboard entry
    leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Rank
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        row.appendChild(rankCell);
        
        // Player
        const playerCell = document.createElement('td');
        playerCell.textContent = entry.nickname;
        row.appendChild(playerCell);
        
        // Rounds
        const roundsCell = document.createElement('td');
        roundsCell.textContent = entry.rounds;
        row.appendChild(roundsCell);
        
        // Weapon Level
        const weaponLevelCell = document.createElement('td');
        weaponLevelCell.textContent = entry.weaponLevel;
        row.appendChild(weaponLevelCell);
        
        leaderboardBody.appendChild(row);
    });
}