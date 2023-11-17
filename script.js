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
      img.addEventListener('click', () => displayClubName(img.alt));
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
        const answerDisplay = document.getElementById('answerPopupText');
        answerDisplay.textContent = `Correct! You guessed it in ${numberOfGuesses} guesses.`;
        document.getElementById('answerPopup').style.display = 'block';

        document.getElementById('userGuess').disabled = true;

        setTimeout(() => {
          getRandomPlayer();
          startGame();
        }, 2000);
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

function displayClubName(event, clubName) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = clubName;

  // Position the tooltip next to the clicked logo
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;

  document.body.appendChild(tooltip);

  // Remove the tooltip after a short delay
  setTimeout(() => {
    document.body.removeChild(tooltip);
  }, 2000);
}

const userGuessInput = document.getElementById('userGuess');
userGuessInput.addEventListener('keypress', handleKeyPress);

window.addEventListener('load', () => {
  loadJSONData();
  updateActiveNationalityButton(selectedNationality);
});
