let playersData = {};
let clubsData = {};
let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;
const maxGuesses = 6; // Set the maximum number of guesses
let selectedNationality = "all"; // Default nationality selection

function updateActiveNationalityButton(selectedNationality) {
  document.querySelectorAll('.nationalityButton').forEach(button => {
    button.classList.toggle('active', button.getAttribute('data-nationality') === selectedNationality);
  });

  const moreNationalitiesDropdown = document.getElementById('moreNationalities');
  Array.from(moreNationalitiesDropdown.options).forEach(option => {
    option.classList.toggle('active', option.value === selectedNationality);
  });
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
  document.getElementById('liveGuessCount').textContent = count;
}

function displayAnswer(message) {
  const answerPopup = document.getElementById('answerPopup');
  const answerPopupText = document.getElementById('answerPopupText');
  answerPopupText.textContent = message;
  answerPopup.style.display = 'block';
}

function closeAnswerPopup() {
  document.getElementById('answerPopup').style.display = 'none';
}

function loadJSONData() {
  fetch('data/players.json')
    .then(response => response.json())
    .then(data => {
      playersData = data;
      return fetch('data/clubs.json');
    })
    .then(response => response.json())
    .then(data => {
      clubsData = data;
      getRandomPlayer();
      startGame();
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
    });
}

function startGame() {
  const dateOfBirthAndClubAndPositionContainer = document.getElementById('dateOfBirthAndClubAndPosition');
  dateOfBirthAndClubAndPositionContainer.innerHTML = '';

  const dateOfBirthDisplay = document.createElement('div');
  dateOfBirthDisplay.textContent = `Date of Birth: ${selectedPlayer.dateOfBirth}`;
  dateOfBirthAndClubAndPositionContainer.appendChild(dateOfBirthDisplay);

  selectedPlayer.clubs.forEach(club => {
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

  const answerDisplay = document.getElementById('answer');
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
  setTimeout(() => {
    userGuessInput.classList.remove('wrong-guess');
  }, 1000);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    if (!document.getElementById('userGuess').disabled) {
      const userGuess = document.getElementById('userGuess').value;
      numberOfGuesses++;

      if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
        displayAnswer(`Correct! You guessed it in ${numberOfGuesses} guesses.`);
        document.getElementById('userGuess').disabled = true;
        setTimeout(() => {
          getRandomPlayer();
          startGame();
        }, 2000);
      } else {
        handleWrongGuess();
        updateLiveGuessCount(maxGuesses - numberOfGuesses);

        if (numberOfGuesses >= maxGuesses) {
          displayAnswer(`Sorry, you've run out of guesses. The correct answer is ${selectedPlayer.name}.`);
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
  displayAnswer(`The correct answer is ${selectedPlayer.name}.`);
  setTimeout(() => {
    getRandomPlayer();
    startGame();
  }, 2000);
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
