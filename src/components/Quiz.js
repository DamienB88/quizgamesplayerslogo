// Quiz.js
import React, { useState, useEffect } from 'react';
import clubsData from './data/clubs.json';
import playersData from './data/players.json';

const Quiz = () => {
    const [currentPlayer, setCurrentPlayer] = useState({});
    const [userGuess, setUserGuess] = useState('');
    const [isCorrectGuess, setIsCorrectGuess] = useState(false);

    useEffect(() => {
        // Function to start a new round of the quiz
        startNewRound();
    }, []);

    const startNewRound = () => {
        // Randomly select a player from playersData
        const playerNames = Object.keys(playersData);
        const randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];

        // Set the current player and reset user guess and correctness status
        setCurrentPlayer({
            name: randomPlayerName,
            clubs: playersData[randomPlayerName]
        });
        setUserGuess('');
        setIsCorrectGuess(false);
    };

    const handleGuessSubmit = () => {
        // Check if the user's guess is correct
        if (userGuess.toLowerCase() === currentPlayer.name.toLowerCase()) {
            setIsCorrectGuess(true);
        } else {
            setIsCorrectGuess(false);
        }
    };

    return (
        <div>
            <h1>Guess the Football Player</h1>
            <div>
                <p>Guess the player associated with these clubs:</p>
                {currentPlayer.clubs.map((clubName) => (
                    <img
                        key={clubName}
                        src={clubsData[clubName]}
                        alt={clubName}
                        width="100"
                        height="100"
                    />
                ))}
            </div>
            <input
                type="text"
                placeholder="Your guess"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
            />
            <button onClick={handleGuessSubmit}>Submit Guess</button>
            {isCorrectGuess && <p>Correct! You guessed the player.</p>}
            {!isCorrectGuess && isCorrectGuess !== null && (
                <p>Incorrect. Try again.</p>
            )}
            <button onClick={startNewRound}>Next Round</button>
        </div>
    );
};

export default Quiz;
