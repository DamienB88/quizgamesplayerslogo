// Flag Quiz Game with Multiple Modes

// Country data with flag codes
const countries = [
    { name: 'United States', code: 'us', aliases: ['usa', 'america', 'united states of america'] },
    { name: 'United Kingdom', code: 'gb', aliases: ['uk', 'britain', 'great britain', 'england'] },
    { name: 'Canada', code: 'ca', aliases: [] },
    { name: 'France', code: 'fr', aliases: [] },
    { name: 'Germany', code: 'de', aliases: ['deutschland'] },
    { name: 'Italy', code: 'it', aliases: ['italia'] },
    { name: 'Spain', code: 'es', aliases: ['espana', 'españa'] },
    { name: 'Japan', code: 'jp', aliases: ['nippon'] },
    { name: 'China', code: 'cn', aliases: ['prc', 'peoples republic of china'] },
    { name: 'Brazil', code: 'br', aliases: ['brasil'] },
    { name: 'Australia', code: 'au', aliases: [] },
    { name: 'India', code: 'in', aliases: ['bharat'] },
    { name: 'Mexico', code: 'mx', aliases: [] },
    { name: 'Russia', code: 'ru', aliases: ['russian federation'] },
    { name: 'South Korea', code: 'kr', aliases: ['korea', 'republic of korea', 'south corea'] },
    { name: 'Argentina', code: 'ar', aliases: [] },
    { name: 'Netherlands', code: 'nl', aliases: ['holland'] },
    { name: 'Sweden', code: 'se', aliases: [] },
    { name: 'Norway', code: 'no', aliases: [] },
    { name: 'Denmark', code: 'dk', aliases: [] },
    { name: 'Finland', code: 'fi', aliases: [] },
    { name: 'Poland', code: 'pl', aliases: ['polska'] },
    { name: 'Switzerland', code: 'ch', aliases: [] },
    { name: 'Belgium', code: 'be', aliases: [] },
    { name: 'Austria', code: 'at', aliases: [] },
    { name: 'Portugal', code: 'pt', aliases: [] },
    { name: 'Greece', code: 'gr', aliases: ['hellas'] },
    { name: 'Turkey', code: 'tr', aliases: ['turkiye'] },
    { name: 'South Africa', code: 'za', aliases: [] },
    { name: 'Egypt', code: 'eg', aliases: [] },
    { name: 'Nigeria', code: 'ng', aliases: [] },
    { name: 'Kenya', code: 'ke', aliases: [] },
    { name: 'Thailand', code: 'th', aliases: [] },
    { name: 'Vietnam', code: 'vn', aliases: [] },
    { name: 'Indonesia', code: 'id', aliases: [] },
    { name: 'Philippines', code: 'ph', aliases: [] },
    { name: 'Malaysia', code: 'my', aliases: [] },
    { name: 'Singapore', code: 'sg', aliases: [] },
    { name: 'New Zealand', code: 'nz', aliases: [] },
    { name: 'Ireland', code: 'ie', aliases: ['eire'] },
    { name: 'Iceland', code: 'is', aliases: ['island'] },
    { name: 'Chile', code: 'cl', aliases: [] },
    { name: 'Peru', code: 'pe', aliases: [] },
    { name: 'Colombia', code: 'co', aliases: [] },
    { name: 'Venezuela', code: 've', aliases: [] },
    { name: 'Ukraine', code: 'ua', aliases: [] },
    { name: 'Czech Republic', code: 'cz', aliases: ['czechia'] },
    { name: 'Hungary', code: 'hu', aliases: [] },
    { name: 'Romania', code: 'ro', aliases: [] },
    { name: 'Bulgaria', code: 'bg', aliases: [] },
    { name: 'Croatia', code: 'hr', aliases: ['hrvatska'] },
    { name: 'Serbia', code: 'rs', aliases: [] },
    { name: 'Slovakia', code: 'sk', aliases: [] },
    { name: 'Slovenia', code: 'si', aliases: [] },
    { name: 'Lithuania', code: 'lt', aliases: [] },
    { name: 'Latvia', code: 'lv', aliases: [] },
    { name: 'Estonia', code: 'ee', aliases: [] },
    { name: 'Morocco', code: 'ma', aliases: [] },
    { name: 'Algeria', code: 'dz', aliases: [] },
    { name: 'Tunisia', code: 'tn', aliases: [] },
    { name: 'Israel', code: 'il', aliases: [] },
    { name: 'Saudi Arabia', code: 'sa', aliases: [] },
    { name: 'United Arab Emirates', code: 'ae', aliases: ['uae', 'emirates'] },
    { name: 'Qatar', code: 'qa', aliases: [] },
    { name: 'Kuwait', code: 'kw', aliases: [] },
    { name: 'Iraq', code: 'iq', aliases: [] },
    { name: 'Iran', code: 'ir', aliases: [] },
    { name: 'Pakistan', code: 'pk', aliases: [] },
    { name: 'Bangladesh', code: 'bd', aliases: [] },
    { name: 'Afghanistan', code: 'af', aliases: [] },
    { name: 'Nepal', code: 'np', aliases: [] },
    { name: 'Sri Lanka', code: 'lk', aliases: [] }
];

// Game state
let currentMode = 'normal';
let currentQuestion = 0;
let score = 0;
let streak = 0;
let maxStreak = 0;
let totalQuestions = 10;
let usedCountries = [];
let currentCountry = null;
let gameActive = false;

// DOM elements
const modeSelection = document.getElementById('mode-selection');
const gameArea = document.getElementById('game-area');
const resultsModal = document.getElementById('results-modal');
const flagImage = document.getElementById('flag-image');
const flagDisplay = document.getElementById('flag-display');
const flashOverlay = document.getElementById('flash-overlay');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const skipBtn = document.getElementById('skip-btn');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const questionNumber = document.getElementById('question-number');
const progressFill = document.getElementById('progress-fill');
const currentModeText = document.getElementById('current-mode-text');
const changeModeBtn = document.getElementById('change-mode-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const changeModeResultsBtn = document.getElementById('change-mode-results-btn');

// Mode selection
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        startGame();
    });
});

// Change mode buttons
changeModeBtn.addEventListener('click', () => {
    gameArea.classList.add('hidden');
    modeSelection.classList.remove('hidden');
    resetGame();
});

changeModeResultsBtn.addEventListener('click', () => {
    resultsModal.classList.add('hidden');
    modeSelection.classList.remove('hidden');
    resetGame();
});

// Play again button
playAgainBtn.addEventListener('click', () => {
    resultsModal.classList.add('hidden');
    startGame();
});

// Submit and skip buttons
submitBtn.addEventListener('click', checkAnswer);
skipBtn.addEventListener('click', skipQuestion);

// Enter key to submit
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Start game
function startGame() {
    modeSelection.classList.add('hidden');
    gameArea.classList.remove('hidden');

    currentQuestion = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    usedCountries = [];
    gameActive = true;

    updateModeText();
    updateDisplay();
    loadNextQuestion();
}

// Reset game
function resetGame() {
    currentQuestion = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    usedCountries = [];
    gameActive = false;
}

// Update mode text
function updateModeText() {
    const modeNames = {
        'normal': 'Normal Mode',
        'upside-down': 'Upside Down Mode',
        'half': 'Half Flag Mode',
        'flash': 'Flash Mode',
        'color-swap': 'Color Swap Mode'
    };
    currentModeText.textContent = modeNames[currentMode];
}

// Update display
function updateDisplay() {
    scoreDisplay.textContent = `Score: ${score}/${totalQuestions}`;
    streakDisplay.textContent = `Streak: ${streak}`;
    questionNumber.textContent = `Question ${currentQuestion + 1}/${totalQuestions}`;
    progressFill.style.width = `${(currentQuestion / totalQuestions) * 100}%`;
}

// Get random unused country
function getRandomCountry() {
    const availableCountries = countries.filter(c => !usedCountries.includes(c.code));
    if (availableCountries.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const country = availableCountries[randomIndex];
    usedCountries.push(country.code);
    return country;
}

// Load next question
function loadNextQuestion() {
    if (currentQuestion >= totalQuestions) {
        endGame();
        return;
    }

    currentCountry = getRandomCountry();
    if (!currentCountry) {
        endGame();
        return;
    }

    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';

    displayFlag();
    updateDisplay();
}

// Display flag based on mode
function displayFlag() {
    const flagUrl = `https://flagcdn.com/w640/${currentCountry.code}.png`;
    flagImage.src = flagUrl;

    // Reset all mode styles
    flagImage.style.transform = '';
    flagImage.style.filter = '';
    flagDisplay.style.clipPath = '';
    flashOverlay.classList.add('hidden');

    // Apply mode-specific effects
    switch(currentMode) {
        case 'upside-down':
            applyUpsideDown();
            break;
        case 'half':
            applyHalfFlag();
            break;
        case 'flash':
            applyFlashMode();
            break;
        case 'color-swap':
            applyColorSwap();
            break;
        default:
            // Normal mode - no special effects
            break;
    }
}

// Mode implementations
function applyUpsideDown() {
    flagImage.style.transform = 'rotate(180deg)';
}

function applyHalfFlag() {
    // Show only left half of the flag
    flagDisplay.style.clipPath = 'inset(0 50% 0 0)';
}

function applyFlashMode() {
    // Show flag for 0.2 seconds, then hide it
    flashOverlay.classList.add('hidden');
    flagImage.style.opacity = '1';

    setTimeout(() => {
        flagImage.style.opacity = '0';
        flashOverlay.classList.remove('hidden');
    }, 200);
}

function applyColorSwap() {
    // Invert colors
    flagImage.style.filter = 'invert(1) hue-rotate(180deg)';
}

// Check answer
function checkAnswer() {
    if (!gameActive || !currentCountry) return;

    const userAnswer = answerInput.value.trim().toLowerCase();
    if (!userAnswer) return;

    const correctName = currentCountry.name.toLowerCase();
    const aliases = currentCountry.aliases.map(a => a.toLowerCase());
    const allValidAnswers = [correctName, ...aliases];

    const isCorrect = allValidAnswers.some(validAnswer => {
        // Allow for minor spelling variations
        return userAnswer === validAnswer ||
               validAnswer.includes(userAnswer) ||
               userAnswer.includes(validAnswer);
    });

    if (isCorrect) {
        score++;
        streak++;
        if (streak > maxStreak) maxStreak = streak;
        showFeedback(true, currentCountry.name);
    } else {
        streak = 0;
        showFeedback(false, currentCountry.name);
    }

    currentQuestion++;

    setTimeout(() => {
        loadNextQuestion();
    }, 1500);
}

// Skip question
function skipQuestion() {
    if (!gameActive || !currentCountry) return;

    streak = 0;
    showFeedback(false, currentCountry.name, true);
    currentQuestion++;

    setTimeout(() => {
        loadNextQuestion();
    }, 1500);
}

// Show feedback
function showFeedback(correct, correctAnswer, skipped = false) {
    feedback.className = 'feedback';

    if (correct) {
        feedback.classList.add('correct');
        feedback.textContent = `Correct! It was ${correctAnswer}`;
    } else {
        feedback.classList.add('incorrect');
        if (skipped) {
            feedback.textContent = `Skipped. It was ${correctAnswer}`;
        } else {
            feedback.textContent = `Incorrect. It was ${correctAnswer}`;
        }
    }

    updateDisplay();
}

// End game
function endGame() {
    gameActive = false;
    gameArea.classList.add('hidden');
    resultsModal.classList.remove('hidden');

    document.getElementById('final-score').textContent = `${score}/${totalQuestions}`;
    document.getElementById('accuracy').textContent = `${Math.round((score / totalQuestions) * 100)}%`;
    document.getElementById('max-streak').textContent = maxStreak;
    document.getElementById('mode-played').textContent = currentModeText.textContent;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show mode selection on load
    modeSelection.classList.remove('hidden');
    gameArea.classList.add('hidden');
    resultsModal.classList.add('hidden');
});
