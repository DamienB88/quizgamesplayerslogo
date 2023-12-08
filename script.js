let playersData = {};
let clubsData = {};
let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;
let gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
let correctGuesses = parseInt(localStorage.getItem('correctGuesses')) || 0;
let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
let maxStreak = parseInt(localStorage.getItem('maxStreak')) || 0;
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

  // Display stats modal after a delay
  setTimeout(() => {
    displayStatsModal();
  }, 2); // Adjust the delay as needed
}

function displayStatsModal() {
  // Update and display the stats in the modal
  const gamesPlayedSpan = document.getElementById('games-played');
  gamesPlayedSpan.textContent = gamesPlayed;

  const winPercentageSpan = document.getElementById('win-percentage');
  const winPercentage = gamesPlayed === 0 ? 0 : ((correctGuesses / gamesPlayed) * 100).toFixed(2);
  winPercentageSpan.textContent = `${winPercentage}%`;

  const averageGuessesSpan = document.getElementById('average-guesses');
  const averageGuesses = gamesPlayed === 0 ? 0 : (numberOfGuesses / gamesPlayed).toFixed(2);
  averageGuessesSpan.textContent = averageGuesses;

  const maxStreakSpan = document.getElementById('max-streak');
  maxStreakSpan.textContent = maxStreak;

  const currentStreakSpan = document.getElementById('current-streak');
  currentStreakSpan.textContent = currentStreak;

  // Show the stats modal
  const statsModal = document.getElementById('stats-modal');
  statsModal.style.display = 'block';
}

function closeAnswerPopup() {
  document.getElementById('answerPopup').style.display = 'none';
}

function closeStatsModal() {
  document.getElementById('stats-modal').style.display = 'none';
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

  const dateOfBirthDisplay = document.createElement('div');
  dateOfBirthDisplay.textContent = `Date of Birth: ${selectedPlayer.dateOfBirth}`;
  dateOfBirthAndClubAndPositionContainer.appendChild(dateOfBirthDisplay);

  selectedPlayer.clubs.forEach((club) => {
    const clubLogoUrl = clubsData[club].replace('{playerName}', selectedPlayer.encodedName);
    if (clubLogoUrl) {
      const img = document.createElement('img');
      img.src = clubLogoUrl;
      img.alt = club;
      dateOfBirthAndClubAndPositionContainer.appendChild(img);
    }
  });

  if (selectedPlayer.position) {
    const positionImg = document.createElement('img');
    positionImg.src = `data/${selectedPlayer.position.toLowerCase()}.svg`;
    positionImg.alt = selectedPlayer.position;
    dateOfBirthAndClubAndPositionContainer.appendChild(positionImg);
  }

  numberOfGuesses = 0;
  updateLiveGuessCount(maxGuesses);

  const guessResult = document.getElementById('guessResult');
  guessResult.textContent = '';

  const userGuessInput = document.getElementById('userGuess');
  userGuessInput.disabled = false;
  userGuessInput.value = '';
  const answerDisplay = document.getElementById('answerPopup');
  answerDisplay.style.display = 'none';

  const giveUpButton = document.getElementById('giveUpButton');
  giveUpButton.disabled = false;

  giveUpButton.removeEventListener('click', handleGiveUp);
  giveUpButton.addEventListener('click', handleGiveUp);

  updateActiveNationalityButton(selectedNationality);
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
        // Update stats for correct guess
        gamesPlayed++;
        correctGuesses++;
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }

        const answerDisplay = document.getElementById('answerPopupText');
        answerDisplay.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
        document.getElementById('answerPopup').style.display = 'block';

        document.getElementById('userGuess').disabled = true;

        // Update local storage for stats
        updateLocalStorage();

        setTimeout(() => {
          getRandomPlayer();
          startGame();
        }, 2);
      } else {
        // Update stats for wrong guess
        currentStreak = 0;
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

  // Update stats for giving up
  gamesPlayed++;
  currentStreak = 0;

  displayAnswer();

  // Update local storage for stats
  updateLocalStorage();

  // Display stats modal after a delay
  setTimeout(() => {
    displayStatsModal();
  }, 4); // Adjust the delay as needed
}

function updateLocalStorage() {
  localStorage.setItem('gamesPlayed', gamesPlayed.toString());
  localStorage.setItem('correctGuesses', correctGuesses.toString());
  localStorage.setItem('currentStreak', currentStreak.toString());
  localStorage.setItem('maxStreak', maxStreak.toString());
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

document.getElementById('show-stats-modal').addEventListener('click', () => {
  displayStatsModal();
});

window.addEventListener('load', () => {
  loadJSONData();
  updateActiveNationalityButton(selectedNationality);
});
