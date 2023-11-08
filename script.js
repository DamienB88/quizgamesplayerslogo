let playersData = {};
let clubsData = {};

let clubNames = [];

function loadJSONData() {
    fetch('data/players.json')
        .then((response) => response.json())
        .then((data) => {
            playersData = data;
            clubNames = Object.values(data).flat();
            return fetch('data/clubs.json');
        })
        .then((response) => response.json())
        .then((data) => {
            clubsData = data;
            getRandomPlayer();
            displayClubLogos();
            startGame();
        })
        .catch((error) => {
            console.error('Error loading JSON data:', error);
        });
}

function displayClubLogos() {
    const clubLogosContainer = document.getElementById('clubLogos');
    clubLogosContainer.innerHTML = '';

    clubNames.forEach((clubName) => {
        if (clubsData[clubName]) {
            const img = document.createElement('img');
            img.src = clubsData[clubName];
            img.alt = clubName;
            clubLogosContainer.appendChild(img);
        }
    });
}

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
        clubs: playersData[randomPlayerName]
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

function startGame() {
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

    // Re-enable the "Give up" button
    const giveUpButton = document.getElementById('giveUpButton');
    giveUpButton.disabled = false;

    // Remove the previous "Give up" button click event listener
    giveUpButton.removeEventListener('click', handleGiveUp);

    // Add a new click event listener to the "Give up" button
    giveUpButton.addEventListener('click', handleGiveUp);
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
                    displayClubLogos(); // Update the club logos
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

    // Start a new game after giving up
    setTimeout(() => {
        getRandomPlayer();
        startGame();
        displayClubLogos(); // Update the club logos
    }, 2000); // Delay for 2 seconds before starting a new game
}

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', loadJSONData);
