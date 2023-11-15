let playersData = {};
let clubsData = {};

let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;
const maxGuesses = 6; // Set the maximum number of guesses

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

    // Encode the player name
    selectedPlayer.encodedName = encodeURIComponent(selectedPlayer.name);
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
        const clubLogoUrl = clubsData[club].replace('{playerName}', selectedPlayer.encodedName);
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
    updateLiveGuessCount(maxGuesses); // Initialize live guess count with max guesses

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

function updateNationality(nationality) {
    selectedNationality = nationality;
    getRandomPlayer();
    startGame();
}

document.querySelectorAll('.nationalityButton').forEach(button => {
    button.addEventListener('click', () => {
        updateNationality(button.getAttribute('data-nationality'));
    });
});

document.getElementById('moreNationalities').addEventListener('change', function () {
    if (this.value !== "More") {
        updateNationality(this.value);
    }
});

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
                updateLiveGuessCount(maxGuesses - numberOfGuesses); // Update live guess count with remaining guesses

                // Check if the maximum number of guesses is reached
                if (numberOfGuesses >= maxGuesses) {
                    // Display the correct answer
                    handleGiveUp();
                }
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
    }, 2000); // Delay for 2 seconds before starting a new game
}

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', loadJSONData);
