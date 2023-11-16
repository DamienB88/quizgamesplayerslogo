// Import the Vue library
import Vue from 'vue';

// Import the EndgameModal component
import EndgameModal from './EndgameModal.vue';

let playersData = {};
let clubsData = {};
let selectedPlayer = {};
let lastSelectedPlayer = {};
let numberOfGuesses = 0;
const maxGuesses = 6;
let selectedNationality = "all";

// Function to update the active nationality selection
function updateActiveNationalityButton(selectedNationality) {
  document.querySelectorAll('.nationalityButton').forEach(button => {
    if (button.getAttribute('data-nationality') === selectedNationality) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Update the active dropdown option
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
  // Create a new Vue instance for the EndgameModal component
  const endgameModalInstance = new Vue({
    render: (h) => h(EndgameModal, {
      props: {
        statsOpened: true,
        finished: false,
        answerCorrect: true, // Modify this based on the actual answer correctness
        selectedPlayer,
      },
      on: {
        'close-modal': () => {
          endgameModalInstance.$destroy(); // Destroy the Vue instance to clean up
        },
      },
    }),
  }).$mount();

  // Append the modal to the body
  document.body.appendChild(endgameModalInstance.$el);
}

function openEndgameModal(answerCorrect) {
  // Create a new Vue instance for the EndgameModal component
  const endgameModalInstance = new Vue({
    render: (h) => h(EndgameModal, {
      props: {
        statsOpened: true,
        finished: false,
        answerCorrect,
        selectedPlayer,
      },
      on: {
        'close-modal': () => {
          endgameModalInstance.$destroy(); // Destroy the Vue instance to clean up
        },
      },
    }),
  }).$mount();

  // Append the modal to the body
  document.body.appendChild(endgameModalInstance.$el);
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

  // Update active nationality button
  updateActiveNationalityButton(selectedNationality);
}

function handleWrongGuess() {
  const userGuessInput = document.getElementById('userGuess');

  // Add the wrong-guess class to the input field
  userGuessInput.classList.add('wrong-guess');

  // Remove the class after a short delay (1 second)
  setTimeout(function () {
    userGuessInput.classList.remove('wrong-guess');
  }, 1000); // Adjust the delay as needed
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    if (!document.getElementById('userGuess').disabled) {
      const userGuess = document.getElementById('userGuess').value;
      numberOfGuesses++;

      if (userGuess.toLowerCase() === selectedPlayer.name.toLowerCase()) {
        // Display the correct answer in the modal
        openEndgameModal(true);
      } else {
        // Wrong guess logic
        handleWrongGuess();

        // No guess result text content, but update the live guess count
        updateLiveGuessCount(maxGuesses - numberOfGuesses); // Update live guess count with remaining guesses

        // Check if the maximum number of guesses is reached
        if (numberOfGuesses >= maxGuesses) {
          // Display the correct answer in the modal
          openEndgameModal(false);
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

  // Display the correct answer in the modal
  openEndgameModal(false);

  // Start a new game after giving up
  setTimeout(() => {
    getRandomPlayer();
    startGame();
  }, 2000); // Delay for 2 seconds before starting a new game
}

// Event listeners for nationality buttons
document.querySelectorAll('.nationalityButton').forEach(button => {
  button.addEventListener('click', () => {
    selectedNationality = button.getAttribute('data-nationality');
    getRandomPlayer();
    startGame();
  });
});

// Event listener for the "More" dropdown
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
