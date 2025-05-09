// Firebase Configuration
// Replace with your own Firebase project configuration
const firebaseConfig = {
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
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Firebase helper functions
const leaderboardRef = database.ref('leaderboard');

// Function to get top 10 scores from leaderboard
function getLeaderboardScores() {
    return leaderboardRef.orderByChild('round').limitToLast(10).once('value')
        .then((snapshot) => {
            let scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.push({
                    nickname: childSnapshot.val().nickname,
                    round: childSnapshot.val().round
                });
            });
            // Sort by round in descending order
            return scores.sort((a, b) => b.round - a.round);
        });
}

// Function to submit a new score to the leaderboard
function submitScore(nickname, round) {
    if (!nickname) return Promise.reject("Nickname is required");
    
    return leaderboardRef.push({
        nickname: nickname,
        round: round,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}