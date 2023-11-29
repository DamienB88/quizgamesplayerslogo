let playersData = {};
let clubsData = {};
let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;
const maxGuesses = 6;
let selectedNationality = "all";

function updateActiveNationalityButton(selectedNationality) {
  document.querySelectorAll('.nationalityButton').forEach(button => {
    if (button.getAttribute('data-nationality') === selectedNationality) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  const moreNationalitiesDropdown = document.getElementById('moreNationalities');
  const dropdownOptions = moreNationalitiesDropdown.options;
  for (let i = 0; i < dropdownOptions.length; i++) {
    const option = dropdownOptions[i];
    if (option.value === selectedNationality) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  }
}

function getRandomPlayer() {
  const playerNames = Object.keys(playersData).filter(
    playerName => selectedNationality === "all" || playersData[playerName].nationality === selectedNationality
  );

  let randomPlayerName = playerNames[Math.floor(Math.random() * playerNames.length)];

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

  selectedPlayer.encodedName = encodeURIComponent(selectedPlayer.name);
}

function updateLiveGuessCount(count) {
  const liveGuessCount = document.getElementById('liveGuessCount');
  liveGuessCount.textContent = count;
}

function displayAnswer() {
  const answerDisplay = document.getElementById('answerPopupText');
  answerDisplay.textContent = `The correct answer is: ${selectedPlayer.name}`;
  document.getElementById('answerPopup').style.display = 'block';
}

function closeAnswerPopup() {
  document.getElementById('answerPopup').style.display = 'none';
}

function showStatsModal() {
  // Update stats from local storage
  const stats = JSON.parse(localStorage.getItem('stats'));
  if (stats) {
    document.getElementById('games-played').textContent = stats.gamesPlayed;
    document.getElementById('win-percentage').textContent = stats.winPercentage;
    document.getElementById('average-guesses').textContent = stats.averageGuesses;
    document.getElementById('max-streak').textContent = stats.maxStreak;
    document.getElementById('current-streak').textContent = stats.currentStreak;
  }

  statsModal.style.display = 'block';
}

function handleGameOver(correctGuess) {
  const userGuessInput = document.getElementById('userGuess');
  userGuessInput.disabled = true;
  const giveUpButton = document.getElementById('giveUpButton');
  giveUpButton.disabled = true;

  if (correctGuess) {
    // Player guessed correctly
    showStatsModal();
  } else {
    // Player gave up
    displayAnswer();

    setTimeout(() => {
      getRandomPlayer();
      startGame();
    }, 4000);
  }
}

function handleCorrectGuess() {
  const answerDisplay = document.getElementById('answerPopupText');
  answerDisplay.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
  showStatsModal();

  document.getElementById('userGuess').disabled = true;

  setTimeout(() => {
    getRandomPlayer();
    startGame();
  }, 2000);
}

function handleWrongGuess() {
  const userGuessInput = document.getElementById('userGuess');
  userGuessInput.classList.add('wrong-guess');

  setTimeout(function () {
    userGuessInput.classList.remove('wrong-guess');
  }, 1000);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    if (!document.getElementById('userGuess').disabled) {
      const userGuess = document.getElementById('userGuess').value;
      numberOfGuesses++;

      if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
        handleCorrectGuess();
      } else {
        handleWrongGuess();
        updateLiveGuessCount(maxGuesses - numberOfGuesses);

        if (numberOfGuesses >= maxGuesses) {
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

  displayAnswer();

  setTimeout(() => {
    getRandomPlayer();
    startGame();
  }, 4000);
}

document.querySelectorAll('.nationalityButton').forEach(button => {
  button.addEventListener('click', () => {
    selectedNationality = button.getAttribute('data-nationality');
    getRandomPlayer();
    startGame();
  });
});

document.getElementById('moreNationalities').addEventListener('change', function () {
  if (this.value !== "More") {
    selectedNationality = this.value;
    getRandomPlayer();
    startGame();
  }
});

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', () => {
  loadJSONData();
  updateActiveNationalityButton(selectedNationality);
});
