let playersData = {};
let clubsData = {};

let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;

function getRandomPlayer() {
    const playerNames = Object.keys(playersData);
    let randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];

    // Ensure the selected player is not the same as the last one
    while (randomPlayerName === lastSelectedPlayer.name) {
        randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];
    }

    lastSelectedPlayer = selectedPlayer;
    selectedPlayer = {
        name: randomPlayerName,
        clubs: playersData[randomPlayerName],
        dateOfBirth: playersData[randomPlayerName].dateOfBirth,
        position: playersData[randomPlayerName].position,
    };
}

function updateLiveGuessCount(count) {
    const liveGuessCount = document.getElementById('liveGuessCount');
    liveGuessCount.textContent = count;
}

function displayAnswer() {
    const answerDisplay = document.getElementById('answer');
    answerDisplay.textContent = `The correct answer is: ${selectedPlayer.name}`;
    answerDisplay.style.display = 'block';
}

function displayPlayerInfo(player) {
    const playerDetails = document.getElementById('playerDetails');
    const playerName = document.getElementById('playerName');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const position = document.getElementById('position');

    playerName.textContent = `Name: ${player.name}`;
    
    // Check if the player has date of birth and position information
    if (player.dateOfBirth) {
        dateOfBirth.textContent = `Date of Birth: ${player.dateOfBirth}`;
    } else {
        dateOfBirth.textContent = ''; // Clear date of birth if not available
    }

    if (player.position) {
        position.textContent = `Position: ${player.position}`;
    } else {
        position.textContent = ''; // Clear position if not available
    }

    playerDetails.style.display = 'block'; // Display player information
}

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
            getRandomPlayer();
            startGame();
        })
        .catch((error) => {
            console.error('Error loading JSON data:', error);
        });
}

function startGame() {
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
    updateLiveGuessCount(numberOfGuesses); // Initialize live guess count

    const guessResult = document.getElementById('guessResult');
    guessResult.textContent = '';

    const userGuessInput = document.getElementById('userGuess');
    userGuessInput.disabled = false;

    // Clear the user's previous guess
    userGuessInput.value = '';
    const answerDisplay = document.getElementById('answer');
    answerDisplay.style.display = 'none'; // Hide the answer display

    // Display player information
    displayPlayerInfo(selectedPlayer);

    // Re-enable the "Give up" button
    const giveUpButton = document.getElementById('giveUpButton');
    giveUpButton.disabled = false;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (!document.getElementById('userGuess').disabled) {
            const userGuess = document.getElementById('userGuess').value;
            numberOfGuesses++;

            if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
                const answerDisplay = document.getElementById('answer');
                answerDisplay.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
                answerDisplay.style.display = 'block';

                // Disable the input field
                document.getElementById('userGuess').disabled = true;

                // Start a new game after a correct guess
                setTimeout(() => {
                    getRandomPlayer();
                    startGame();
                }, 2000); // Delay for 2 seconds before starting a new game
            } else {
                // No guess result text content, but update the live guess count
                updateLiveGuessCount(numberOfGuesses);
            }
        }
    }
}

function handleGiveUp() {
    const userGuessInput = document.getElementById('userGuess');
    userGuessInput.disabled = true;
    const giveUpButton = document.getElementById('giveUpButton');
    giveUpButton.disabled = true;

    // Display the correct answer
    displayAnswer();
}

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

const giveUpButton = document.getElementById('giveUpButton');
giveUpButton.addEventListener('click', handleGiveUp);

window.addEventListener('load', loadJSONData);
