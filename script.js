let playersData = {};
let clubsData = {};

let selectedPlayer = {};
let numberOfGuesses = 0;

function loadJSONData() {
    fetch('data/players.json')
        .then((response) => response.json())
        .then((data) => {
            playersData = data;
            return fetch('data/clubs.json');
        })
        .then((response) => response.json())
        .then((data) => {
            clubsData = data;
            startGame();
        })
        .catch((error) => {
            console.error('Error loading JSON data:', error);
        });
}

function startGame() {
    const playerNames = Object.keys(playersData);
    const randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];
    selectedPlayer = {
        name: randomPlayerName,
        clubs: playersData[randomPlayerName]
    };

    const clubLogosContainer = document.getElementById('clubLogos');
    clubLogosContainer.innerHTML = '';

    selectedPlayer.clubs.forEach((club) => {
        const clubLogoUrl = clubsData[club];
        if (clubLogoUrl) {
            const img = document.createElement('img');
            img.src = clubLogoUrl;
            img.alt = club;
            clubLogosContainer.appendChild(img);
        }
    });

    numberOfGuesses = 0;

    const guessResult = document.getElementById('guessResult');
    guessResult.textContent = '';

    const userGuessInput = document.getElementById('userGuess');
    const guessButton = document.getElementById('guessButton');
    userGuessInput.disabled = false;
    guessButton.disabled = false;

    // Clear the user's previous guess
    userGuessInput.value = '';
}

function handleGuess() {
    const userGuessInput = document.getElementById('userGuess');
    const guessButton = document.getElementById('guessButton');
    const guessResult = document.getElementById('guessResult');

    const userGuess = userGuessInput.value;
    numberOfGuesses++;

    if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
        guessResult.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
        userGuessInput.disabled = true;
        guessButton.disabled = true;

        // Start a new game after a correct guess
        setTimeout(startGame, 2000); // Delay for 2 seconds before starting a new game
    } else {
        guessResult.textContent = 'Try again.';
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (!userGuessInput.disabled) {
            handleGuess();
        }
    }
}

document.getElementById('guessButton').addEventListener('click', handleGuess);

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', loadJSONData);
