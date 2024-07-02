import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoLhGd1WV32H3mOP_qBYDVoRn-_7U9iLE",
  authDomain: "scrambleauth.firebaseapp.com",
  databaseURL: "https://scrambleauth-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "scrambleauth",
  storageBucket: "scrambleauth.appspot.com",
  messagingSenderId: "551044592329",
  appId: "1:551044592329:web:04807082fa43578690d318",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

function App() {
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      console.log ("in auth state change"); 
      if (user) {
        setCurrentPlayer(user.uid);
        // Set initial game state if it doesn't exist
        const gameRef = ref(db, 'game');
        console.log ("rameref",gameRef); 
        onValue(gameRef, (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            set(gameRef, {
              players: {
                [user.uid]: {
                  score: 5,
                  turn: false,
                },
              },
              currentPlayer: null,
            });
          }
        });
      } else {
        console.log ("setting current player to null"); 
        setCurrentPlayer(null);
      }
    });
  }, []);

  useEffect(() => {
    // Listen for changes to game state
    const gameRef = ref(db, 'game');
    onValue(gameRef, (snapshot) => {
      setGameState(snapshot.val());
    });
  }, []);

  const handleTurn = () => {
    const gameRef = ref(db, 'game');
    update(gameRef, {
      currentPlayer: currentPlayer,
    });
  };

  const handleScore = () => {
    const gameRef = ref(db, 'game');
    update(gameRef, {
      [`players/${currentPlayer}/score`]: gameState.players[currentPlayer].score + 1,
    });
  };

  if (!gameState || !currentPlayer) {
    return <div>Loading...</div>;
  }

  console.log ("Current player=", currentPlayer)
  console.log ("Game state =", gameState.players)

  return (
    <div>
      <h1>Simple 2-Player Game</h1>
      <h2>Player {currentPlayer === gameState.players ? '1' : '2'}'s Turn</h2>
      <p>Score: {gameState.players[currentPlayer].score}</p>
      hi
      {gameState.currentPlayer === currentPlayer && (
        <button onClick={handleTurn}>Take Turn</button>
      )}
      {gameState.currentPlayer === currentPlayer && (
        <button onClick={handleScore}>Score Point</button>
      )}
    </div>
  );
}

export default App;