// Flag Quiz Game with Multiple Modes

// Complete country data with ALL countries
const countries = [
    // Africa
    { name: 'Algeria', code: 'dz', aliases: [] },
    { name: 'Angola', code: 'ao', aliases: [] },
    { name: 'Benin', code: 'bj', aliases: [] },
    { name: 'Botswana', code: 'bw', aliases: [] },
    { name: 'Burkina Faso', code: 'bf', aliases: [] },
    { name: 'Burundi', code: 'bi', aliases: [] },
    { name: 'Cameroon', code: 'cm', aliases: [] },
    { name: 'Cape Verde', code: 'cv', aliases: [] },
    { name: 'Central African Republic', code: 'cf', aliases: [] },
    { name: 'Chad', code: 'td', aliases: [] },
    { name: 'Comoros', code: 'km', aliases: [] },
    { name: 'Congo', code: 'cg', aliases: ['republic of the congo'] },
    { name: 'Democratic Republic of the Congo', code: 'cd', aliases: ['drc', 'congo-kinshasa'] },
    { name: 'Djibouti', code: 'dj', aliases: [] },
    { name: 'Egypt', code: 'eg', aliases: [] },
    { name: 'Equatorial Guinea', code: 'gq', aliases: [] },
    { name: 'Eritrea', code: 'er', aliases: [] },
    { name: 'Eswatini', code: 'sz', aliases: ['swaziland'] },
    { name: 'Ethiopia', code: 'et', aliases: [] },
    { name: 'Gabon', code: 'ga', aliases: [] },
    { name: 'Gambia', code: 'gm', aliases: ['the gambia'] },
    { name: 'Ghana', code: 'gh', aliases: [] },
    { name: 'Guinea', code: 'gn', aliases: [] },
    { name: 'Guinea-Bissau', code: 'gw', aliases: [] },
    { name: 'Ivory Coast', code: 'ci', aliases: ['cote d\'ivoire'] },
    { name: 'Kenya', code: 'ke', aliases: [] },
    { name: 'Lesotho', code: 'ls', aliases: [] },
    { name: 'Liberia', code: 'lr', aliases: [] },
    { name: 'Libya', code: 'ly', aliases: [] },
    { name: 'Madagascar', code: 'mg', aliases: [] },
    { name: 'Malawi', code: 'mw', aliases: [] },
    { name: 'Mali', code: 'ml', aliases: [] },
    { name: 'Mauritania', code: 'mr', aliases: [] },
    { name: 'Mauritius', code: 'mu', aliases: [] },
    { name: 'Morocco', code: 'ma', aliases: [] },
    { name: 'Mozambique', code: 'mz', aliases: [] },
    { name: 'Namibia', code: 'na', aliases: [] },
    { name: 'Niger', code: 'ne', aliases: [] },
    { name: 'Nigeria', code: 'ng', aliases: [] },
    { name: 'Rwanda', code: 'rw', aliases: [] },
    { name: 'Sao Tome and Principe', code: 'st', aliases: [] },
    { name: 'Senegal', code: 'sn', aliases: [] },
    { name: 'Seychelles', code: 'sc', aliases: [] },
    { name: 'Sierra Leone', code: 'sl', aliases: [] },
    { name: 'Somalia', code: 'so', aliases: [] },
    { name: 'South Africa', code: 'za', aliases: [] },
    { name: 'South Sudan', code: 'ss', aliases: [] },
    { name: 'Sudan', code: 'sd', aliases: [] },
    { name: 'Tanzania', code: 'tz', aliases: [] },
    { name: 'Togo', code: 'tg', aliases: [] },
    { name: 'Tunisia', code: 'tn', aliases: [] },
    { name: 'Uganda', code: 'ug', aliases: [] },
    { name: 'Zambia', code: 'zm', aliases: [] },
    { name: 'Zimbabwe', code: 'zw', aliases: [] },

    // Asia
    { name: 'Afghanistan', code: 'af', aliases: [] },
    { name: 'Armenia', code: 'am', aliases: [] },
    { name: 'Azerbaijan', code: 'az', aliases: [] },
    { name: 'Bahrain', code: 'bh', aliases: [] },
    { name: 'Bangladesh', code: 'bd', aliases: [] },
    { name: 'Bhutan', code: 'bt', aliases: [] },
    { name: 'Brunei', code: 'bn', aliases: [] },
    { name: 'Cambodia', code: 'kh', aliases: [] },
    { name: 'China', code: 'cn', aliases: ['prc', 'peoples republic of china'] },
    { name: 'Cyprus', code: 'cy', aliases: [] },
    { name: 'Georgia', code: 'ge', aliases: [] },
    { name: 'India', code: 'in', aliases: ['bharat'] },
    { name: 'Indonesia', code: 'id', aliases: [] },
    { name: 'Iran', code: 'ir', aliases: [] },
    { name: 'Iraq', code: 'iq', aliases: [] },
    { name: 'Israel', code: 'il', aliases: [] },
    { name: 'Japan', code: 'jp', aliases: ['nippon'] },
    { name: 'Jordan', code: 'jo', aliases: [] },
    { name: 'Kazakhstan', code: 'kz', aliases: [] },
    { name: 'Kuwait', code: 'kw', aliases: [] },
    { name: 'Kyrgyzstan', code: 'kg', aliases: [] },
    { name: 'Laos', code: 'la', aliases: [] },
    { name: 'Lebanon', code: 'lb', aliases: [] },
    { name: 'Malaysia', code: 'my', aliases: [] },
    { name: 'Maldives', code: 'mv', aliases: [] },
    { name: 'Mongolia', code: 'mn', aliases: [] },
    { name: 'Myanmar', code: 'mm', aliases: ['burma'] },
    { name: 'Nepal', code: 'np', aliases: [] },
    { name: 'North Korea', code: 'kp', aliases: ['dprk'] },
    { name: 'Oman', code: 'om', aliases: [] },
    { name: 'Pakistan', code: 'pk', aliases: [] },
    { name: 'Palestine', code: 'ps', aliases: [] },
    { name: 'Philippines', code: 'ph', aliases: [] },
    { name: 'Qatar', code: 'qa', aliases: [] },
    { name: 'Saudi Arabia', code: 'sa', aliases: [] },
    { name: 'Singapore', code: 'sg', aliases: [] },
    { name: 'South Korea', code: 'kr', aliases: ['korea', 'republic of korea'] },
    { name: 'Sri Lanka', code: 'lk', aliases: [] },
    { name: 'Syria', code: 'sy', aliases: [] },
    { name: 'Taiwan', code: 'tw', aliases: [] },
    { name: 'Tajikistan', code: 'tj', aliases: [] },
    { name: 'Thailand', code: 'th', aliases: [] },
    { name: 'Timor-Leste', code: 'tl', aliases: ['east timor'] },
    { name: 'Turkey', code: 'tr', aliases: ['turkiye'] },
    { name: 'Turkmenistan', code: 'tm', aliases: [] },
    { name: 'United Arab Emirates', code: 'ae', aliases: ['uae', 'emirates'] },
    { name: 'Uzbekistan', code: 'uz', aliases: [] },
    { name: 'Vietnam', code: 'vn', aliases: [] },
    { name: 'Yemen', code: 'ye', aliases: [] },

    // Europe
    { name: 'Albania', code: 'al', aliases: [] },
    { name: 'Andorra', code: 'ad', aliases: [] },
    { name: 'Austria', code: 'at', aliases: [] },
    { name: 'Belarus', code: 'by', aliases: [] },
    { name: 'Belgium', code: 'be', aliases: [] },
    { name: 'Bosnia and Herzegovina', code: 'ba', aliases: ['bosnia'] },
    { name: 'Bulgaria', code: 'bg', aliases: [] },
    { name: 'Croatia', code: 'hr', aliases: ['hrvatska'] },
    { name: 'Czech Republic', code: 'cz', aliases: ['czechia'] },
    { name: 'Denmark', code: 'dk', aliases: [] },
    { name: 'Estonia', code: 'ee', aliases: [] },
    { name: 'Finland', code: 'fi', aliases: [] },
    { name: 'France', code: 'fr', aliases: [] },
    { name: 'Germany', code: 'de', aliases: ['deutschland'] },
    { name: 'Greece', code: 'gr', aliases: ['hellas'] },
    { name: 'Hungary', code: 'hu', aliases: [] },
    { name: 'Iceland', code: 'is', aliases: ['island'] },
    { name: 'Ireland', code: 'ie', aliases: ['eire'] },
    { name: 'Italy', code: 'it', aliases: ['italia'] },
    { name: 'Kosovo', code: 'xk', aliases: [] },
    { name: 'Latvia', code: 'lv', aliases: [] },
    { name: 'Liechtenstein', code: 'li', aliases: [] },
    { name: 'Lithuania', code: 'lt', aliases: [] },
    { name: 'Luxembourg', code: 'lu', aliases: [] },
    { name: 'Malta', code: 'mt', aliases: [] },
    { name: 'Moldova', code: 'md', aliases: [] },
    { name: 'Monaco', code: 'mc', aliases: [] },
    { name: 'Montenegro', code: 'me', aliases: [] },
    { name: 'Netherlands', code: 'nl', aliases: ['holland'] },
    { name: 'North Macedonia', code: 'mk', aliases: ['macedonia'] },
    { name: 'Norway', code: 'no', aliases: [] },
    { name: 'Poland', code: 'pl', aliases: ['polska'] },
    { name: 'Portugal', code: 'pt', aliases: [] },
    { name: 'Romania', code: 'ro', aliases: [] },
    { name: 'Russia', code: 'ru', aliases: ['russian federation'] },
    { name: 'San Marino', code: 'sm', aliases: [] },
    { name: 'Serbia', code: 'rs', aliases: [] },
    { name: 'Slovakia', code: 'sk', aliases: [] },
    { name: 'Slovenia', code: 'si', aliases: [] },
    { name: 'Spain', code: 'es', aliases: ['espana', 'españa'] },
    { name: 'Sweden', code: 'se', aliases: [] },
    { name: 'Switzerland', code: 'ch', aliases: [] },
    { name: 'Ukraine', code: 'ua', aliases: [] },
    { name: 'United Kingdom', code: 'gb', aliases: ['uk', 'britain', 'great britain', 'england'] },
    { name: 'Vatican City', code: 'va', aliases: ['holy see'] },

    // North America
    { name: 'Antigua and Barbuda', code: 'ag', aliases: [] },
    { name: 'Bahamas', code: 'bs', aliases: ['the bahamas'] },
    { name: 'Barbados', code: 'bb', aliases: [] },
    { name: 'Belize', code: 'bz', aliases: [] },
    { name: 'Canada', code: 'ca', aliases: [] },
    { name: 'Costa Rica', code: 'cr', aliases: [] },
    { name: 'Cuba', code: 'cu', aliases: [] },
    { name: 'Dominica', code: 'dm', aliases: [] },
    { name: 'Dominican Republic', code: 'do', aliases: [] },
    { name: 'El Salvador', code: 'sv', aliases: [] },
    { name: 'Grenada', code: 'gd', aliases: [] },
    { name: 'Guatemala', code: 'gt', aliases: [] },
    { name: 'Haiti', code: 'ht', aliases: [] },
    { name: 'Honduras', code: 'hn', aliases: [] },
    { name: 'Jamaica', code: 'jm', aliases: [] },
    { name: 'Mexico', code: 'mx', aliases: [] },
    { name: 'Nicaragua', code: 'ni', aliases: [] },
    { name: 'Panama', code: 'pa', aliases: [] },
    { name: 'Saint Kitts and Nevis', code: 'kn', aliases: [] },
    { name: 'Saint Lucia', code: 'lc', aliases: [] },
    { name: 'Saint Vincent and the Grenadines', code: 'vc', aliases: [] },
    { name: 'Trinidad and Tobago', code: 'tt', aliases: [] },
    { name: 'United States', code: 'us', aliases: ['usa', 'america', 'united states of america'] },

    // South America
    { name: 'Argentina', code: 'ar', aliases: [] },
    { name: 'Bolivia', code: 'bo', aliases: [] },
    { name: 'Brazil', code: 'br', aliases: ['brasil'] },
    { name: 'Chile', code: 'cl', aliases: [] },
    { name: 'Colombia', code: 'co', aliases: [] },
    { name: 'Ecuador', code: 'ec', aliases: [] },
    { name: 'Guyana', code: 'gy', aliases: [] },
    { name: 'Paraguay', code: 'py', aliases: [] },
    { name: 'Peru', code: 'pe', aliases: [] },
    { name: 'Suriname', code: 'sr', aliases: [] },
    { name: 'Uruguay', code: 'uy', aliases: [] },
    { name: 'Venezuela', code: 've', aliases: [] },

    // Oceania
    { name: 'Australia', code: 'au', aliases: [] },
    { name: 'Fiji', code: 'fj', aliases: [] },
    { name: 'Kiribati', code: 'ki', aliases: [] },
    { name: 'Marshall Islands', code: 'mh', aliases: [] },
    { name: 'Micronesia', code: 'fm', aliases: [] },
    { name: 'Nauru', code: 'nr', aliases: [] },
    { name: 'New Zealand', code: 'nz', aliases: [] },
    { name: 'Palau', code: 'pw', aliases: [] },
    { name: 'Papua New Guinea', code: 'pg', aliases: [] },
    { name: 'Samoa', code: 'ws', aliases: [] },
    { name: 'Solomon Islands', code: 'sb', aliases: [] },
    { name: 'Tonga', code: 'to', aliases: [] },
    { name: 'Tuvalu', code: 'tv', aliases: [] },
    { name: 'Vanuatu', code: 'vu', aliases: [] }
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
const flashReadyOverlay = document.getElementById('flash-ready-overlay');
const readyBtn = document.getElementById('ready-btn');
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

// Ready button for flash mode
readyBtn.addEventListener('click', () => {
    flashReadyOverlay.classList.add('hidden');
    showFlashFlag();
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
        'flash': 'Flash Mode'
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

    // Reset all mode styles
    flagImage.style.transform = '';
    flagImage.style.filter = '';
    flagImage.style.opacity = '1';
    flagDisplay.style.clipPath = '';
    flashOverlay.classList.add('hidden');
    flashReadyOverlay.classList.add('hidden');

    // Set the image source
    flagImage.src = flagUrl;

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
    // Hide flag initially and show ready button
    flagImage.style.opacity = '0';
    flashReadyOverlay.classList.remove('hidden');
}

function showFlashFlag() {
    // Show flag for 0.2 seconds, then hide it
    flagImage.style.opacity = '1';

    setTimeout(() => {
        flagImage.style.opacity = '0';
        flashOverlay.classList.remove('hidden');
    }, 200);
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
