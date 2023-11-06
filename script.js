// Define variables to store player and club data
let playersData = [];
let clubsData = [];
let selectedPlayer = {};

// Define a variable to track the number of guesses
let numberOfGuesses = 0;

// Function to load JSON data
function loadJSONData() {
    fetch('data/players.json')
        .then((response) => response.json())
        .then((data) => {
            playersData = data;
            fetch('data/clubs.json')
                .then((response) => response.json())
                .then((data) => {
                    clubsData = data;
                    startGame();
                });
        });
}

// Function to start the game
function startGame() {
    // Select a random player
    selectedPlayer = playersData[Math.floor(Math.random() * playersData.length)];

    // Display the club logos associated with the player's career
    const clubLogosContainer = document.getElementById('clubLogos');
    clubLogosContainer.innerHTML = '';

    selectedPlayer.clubs.forEach((club) => {
        const clubLogo = clubsData.find((item) => item.clubName === club);
        if (clubLogo) {
            const img = document.createElement('img');
            img.src = clubLogo.logoUrl;
            img.alt = clubLogo.clubName;
            clubLogosContainer.appendChild(img);
        }
    });

    // Reset the number of guesses
    numberOfGuesses = 0;

    // Clear the guess result message
    const guessResult = document.getElementById('guessResult');
    guessResult.textContent = '';

    // Enable the input field and guess button
    const userGuessInput = document.getElementById('userGuess');
    const guessButton = document.getElementById('guessButton');
    userGuessInput.disabled = false;
    guessButton.disabled = false;
}

// Function to handle user guesses
function handleGuess() {
    const userGuessInput = document.getElementById('userGuess');
    const guessButton = document.getElementById('guessButton');
    const guessResult = document.getElementById('guessResult');

    const userGuess = userGuessInput.value;
    numberOfGuesses++;

    if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
        guessResult.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
        // Disable the input field and guess button after a correct guess
        userGuessInput.disabled = true;
        guessButton.disabled = true;
    } else {
        guessResult.textContent = 'Try again.';
    }
}

// Event listener for the guess button
document.getElementById('guessButton').addEventListener('click', handleGuess);

// Load JSON data and start the game when the page loads
window.addEventListener('load', loadJSONData);

