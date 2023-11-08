let playersData = {};
let clubsData = {};

let selectedPlayer = {};
let numberOfGuesses = 0;

function getRandomPlayer() {
    const playerNames = Object.keys(playersData);
    const randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];
    selectedPlayer = {
        name: randomPlayerName,
        clubs: playersData[randomPlayerName]
    };
}

function updateLiveGuessCount(count) {
    const liveGuessCount = document.getElementById('liveGuessCount');
    liveGuessCount.textContent = count;
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
            startGame(); // Start the game after loading data
        })
        .catch((error) => {
            console.error('Error loading JSON data:', error);
        });
}

function displayClubLogos() {
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
}

function startGame() {
    getRandomPlayer();
    displayClubLogos();

    numberOfGuesses = 0;
    updateLiveGuessCount(numberOfGuesses);

    const guessResult = document.getElementById('guessResult');
    guessResult.textContent = '';

    const userGuessInput = document.getElementById('userGuess');
    userGuessInput.disabled = false;

    userGuessInput.value = '';
    const answerDisplay = document.getElementById('answer');
    answerDisplay.style.display = 'none';

    const giveUpButton = document.getElementById('giveUpButton');
    giveUpButton.disabled = false;

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

                document.getElementById('userGuess').disabled = true;

                setTimeout(() => {
                    getRandomPlayer();
                    displayClubLogos(); // Display logos for the new player
                    startGame();
                }, 2000);
            } else {
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

    const answerDisplay = document.getElementById('answer');
    answerDisplay.textContent = `Correct answer: ${selectedPlayer.name}`;
    answerDisplay.style.display = 'block';

    setTimeout(() => {
        getRandomPlayer();
        displayClubLogos(); // Display logos for the new player
        startGame();
    }, 2000);
}

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', loadJSONData);
