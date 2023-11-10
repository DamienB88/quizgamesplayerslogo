let playersData = {};
let clubsData = {};

let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;
let maxGuesses = 6; // Set the maximum number of guesses

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
        clubs: playersData[randomPlayerName].clubs,
        position: playersData[randomPlayerName].position,
        dateOfBirth: playersData[randomPlayerName].dateOfBirth,
    };

    numberOfGuesses = 0; // Reset the number of guesses for a new player
}

function updateLiveGuessCount(count) {
    const liveGuessCount = document.getElementById('liveGuessCount');
    liveGuessCount.textContent = count;

    // Check if the maximum number of guesses is reached
    if (count >= maxGuesses) {
        handleGameOver();
    }
}

function displayAnswer() {
    const answerDisplay = document.getElementById('answer');
    answerDisplay.textContent = `The correct answer is: ${selectedPlayer.name}`;
    answerDisplay.style.display = 'block';
}

function handleGameOver() {
    const userGuessInput = document.getElementById('userGuess');
    const giveUpButton = document.getElementById('giveUpButton');
    
    userGuessInput.disabled = true;
    giveUpButton.disabled = true;

    // Display the correct answer
    displayAnswer();
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
    const dateOfBirthAndClubAndPositionContainer = document.getElementById('dateOfBirthAndClubAndPosition');
    dateOfBirthAndClubAndPositionContainer.innerHTML = '';

    // Display date of birth
    const dateOfBirthDisplay = document.createElement('div');
    dateOfBirthDisplay.textContent = `Date of Birth: ${selectedPlayer.dateOfBirth}`;
    dateOfBirthAndClubAndPositionContainer.appendChild(dateOfBirthDisplay);

    // Display club logos
    selectedPlayer.clubs.forEach((club) => {
        const clubLogoUrl = clubsData[club];
        if (clubLogoUrl) {
            const img = document.createElement('img');
            img.src = clubLogoUrl;
            img.alt = club;
            dateOfBirthAndClubAndPositionContainer.appendChild(img);
        }
    });

    // Display position image
    if (selectedPlayer.position) {
        const positionImg = document.createElement('img');
        if (selectedPlayer.position === 'Forward') {
            positionImg.src = 'data/forward.svg';
        } else if (selectedPlayer.position === 'Goalkeeper') {
            positionImg.src = 'data/goalkeeper.svg';
        } else if (selectedPlayer.position === 'Midfielder') {
            positionImg.src = 'data/midfielder.svg';
        } else if (selectedPlayer.position === 'Defender') {
            positionImg.src = 'data/defender.svg';
        }
        positionImg.alt = selectedPlayer.position;
        dateOfBirthAndClubAndPositionContainer.appendChild(positionImg);
    }

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

                // Change "Give up" button text to "New Game"
                const giveUpButton = document.getElementById('giveUpButton');
                giveUpButton.textContent = 'New Game';

                // Remove the click event listener for "Give up" button
                giveUpButton.removeEventListener('click', handleGiveUp);

                // Add a new click event listener to "New Game" button
                giveUpButton.addEventListener('click', startGame);
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

    // Remove the click event listener for "Give up" button
    giveUpButton.removeEventListener('click', handleGiveUp);

    // Add a new click event listener to "New Game" button
    giveUpButton.addEventListener('click', startGame);
}

// In the startGame function, update the button text to "New Game"
function startGame() {
    // ... (your existing code)

    // Re-enable the "Give up" button
    const giveUpButton = document.getElementById('giveUpButton');
    giveUpButton.disabled = false;

    // Update the button text to "New Game"
    giveUpButton.textContent = 'New Game';

    // Remove the previous "Give up" button click event listener
    giveUpButton.removeEventListener('click', handleGiveUp);

    // Add a new click event listener to the "New Game" button
    giveUpButton.addEventListener('click', startGame);
}


const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', loadJSONData);
