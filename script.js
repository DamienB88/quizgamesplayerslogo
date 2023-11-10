let playersData = {};
let clubsData = {};

let selectedPlayer = {};
let numberOfGuesses = 0;

function getRandomPlayer() {
    const playerNames = Object.keys(playersData);
    let randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];
    selectedPlayer = {
        name: randomPlayerName,
        clubs: playersData[randomPlayerName].clubs,
        position: playersData[randomPlayerName].position,
        dateOfBirth: playersData[randomPlayerName].dateOfBirth,
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
    giveUpButton.textContent = 'Give Up';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (!document.getElementById('userGuess').disabled) {
            const userGuess = document.getElementById('userGuess').value;
            numberOfGuesses++;

            if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
                // Correct guess
                const answerDisplay = document.getElementById('answer');
                answerDisplay.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
                answerDisplay.style.display = 'block';

                // Disable the input field
                document.getElementById('userGuess').disabled = true;

                // Change "Give Up" button to "New Game"
                const giveUpButton = document.getElementById('giveUpButton');
                giveUpButton.textContent = 'New Game';
            } else if (numberOfGuesses >= 6) {
                // Reached the limit of 6 guesses
                // Display the correct answer
                displayAnswer();

                // Change "Give Up" button to "New Game"
                const giveUpButton = document.getElementById('giveUpButton');
                giveUpButton.textContent = 'New Game';
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

    // Change "Give Up" button to "New Game"
    giveUpButton.textContent = 'New Game';
}

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

// Ensure the game starts when the page loads
window.addEventListener('load', loadJSONData);

// Add click event listener to "Give Up" button
document.getElementById('giveUpButton').addEventListener('click', handleGiveUp);
