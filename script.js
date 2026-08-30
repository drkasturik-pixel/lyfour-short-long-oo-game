const splashScreen = document.getElementById("splashScreen");
const gameContainer = document.getElementById("gameContainer");
const loadingScreen = document.getElementById("loadingScreen");

const replayInstructionsBtn = document.getElementById("replayInstructionsBtn");
const replayWordBtn = document.getElementById("replayWordBtn");
const scoreValue = document.getElementById("scoreValue");

const cardImage = document.getElementById("cardImage");
const cardWord = document.getElementById("cardWord");
const wordCard = document.getElementById("wordCard");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const backgroundMusic = document.getElementById("backgroundMusic");

const bookMonster = document.getElementById("bookMonster");
const moonMonster = document.getElementById("moonMonster");

const correctFeedback = document.getElementById("correctFeedback");
const wrongFeedback = document.getElementById("wrongFeedback");

const finalScore = document.getElementById("finalScore");
const starContainer = document.getElementById("starContainer");
const endScreen = document.getElementById("endScreen");
const playAgainBtn = document.getElementById("playAgainBtn");

const shortWords = [
    "book", "cook", "look", "hook", "good",
    "wood", "hood", "foot", "wool"
];

const longWords = [
    "moon", "room", "roof", "root", "pool",
    "spoon", "broom", "food", "zoo"
];

let gameWords = [];
let currentIndex = 0;
let score = 0;
let currentWord = null;
let busy = false;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function buildWordSequence() {
    const s = shuffle([...shortWords]);
    const l = shuffle([...longWords]);
    const result = [];
    for (let i = 0; i < 9; i++) {
        result.push({ word: s[i], type: "short" });
        result.push({ word: l[i], type: "long" });
    }
    return result;
}

function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

function playAudio(audio) {
    try {
        audio.pause();
        audio.currentTime = 0;
        const p = audio.play();
        if (p) p.catch(() => {});
    } catch (e) {}
}

function startBackgroundMusic() {
    backgroundMusic.volume = 0.2;
    const p = backgroundMusic.play();
    if (p) p.catch(() => {});
}

function updateScore() {
    scoreValue.textContent = score;
}

function loadCurrentCard() {
    if (currentIndex >= gameWords.length) {
        endGame();
        return;
    }

    currentWord = gameWords[currentIndex];
    cardImage.src = "assets/" + currentWord.word + ".png";
    cardImage.alt = currentWord.word;
    cardWord.textContent = currentWord.word.toUpperCase();

    wordCard.classList.remove("new-card");
    void wordCard.offsetWidth;
    wordCard.classList.add("new-card");

    setTimeout(() => speak(currentWord.word), 350);
}

function speakCurrentWord() {
    if (currentWord) speak(currentWord.word);
}

function speakInstructions() {
    speak(
        'Listen to the word. Tap the picture to hear it again. ' +
        'Then tap Book Monster for the short oo sound, or Moon Monster for the long oo sound.'
    );
}

function showFeedback(element) {
    correctFeedback.classList.add("hidden");
    wrongFeedback.classList.add("hidden");
    element.classList.remove("hidden");

    setTimeout(() => {
        element.classList.add("hidden");
    }, 900);
}

function checkAnswer(type) {
    if (!currentWord || busy) return;

    if (type === currentWord.type) {
        busy = true;
        score++;
        updateScore();

        playAudio(correctSound);
        showFeedback(correctFeedback);

        const target = type === "short" ? bookMonster : moonMonster;
        target.classList.add("bounce");

        setTimeout(() => {
            target.classList.remove("bounce");
            currentIndex++;
            busy = false;
            loadCurrentCard();
        }, 1100);
    } else {
        playAudio(wrongSound);
        showFeedback(wrongFeedback);
        speakCurrentWord();
    }
}

/* -----------------------------
   TAP GAME CONTROLS
   ----------------------------- */

wordCard.addEventListener("click", (event) => {
    event.preventDefault();
    speakCurrentWord();
});

wordCard.addEventListener("touchend", (event) => {
    event.preventDefault();
}, { passive: false });

bookMonster.addEventListener("click", () => checkAnswer("short"));
moonMonster.addEventListener("click", () => checkAnswer("long"));

replayWordBtn.addEventListener("click", (event) => {
    event.preventDefault();
    speakCurrentWord();
});

replayInstructionsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    speakInstructions();
});

playAgainBtn.addEventListener("click", () => {
    score = 0;
    currentIndex = 0;
    busy = false;
    gameWords = buildWordSequence();
    updateScore();
    endScreen.classList.add("hidden");
    startBackgroundMusic();
    loadCurrentCard();
});

/* Mobile-friendly audio unlock */
function unlockAudio() {
    try {
        correctSound.load();
        wrongSound.load();
        backgroundMusic.load();
    } catch (e) {}
}

document.addEventListener("pointerdown", unlockAudio, { once: true });

/* Start automatically after the logo.
   No drag-and-drop is required anywhere. */
window.addEventListener("load", () => {
    gameWords = buildWordSequence();

    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 300);

    setTimeout(() => {
        splashScreen.style.display = "none";
        gameContainer.classList.remove("hidden");
        startBackgroundMusic();
        loadCurrentCard();
    }, 1800);
});

function calculateStars() {
    if (score === 18) return "⭐⭐⭐⭐⭐";
    if (score >= 16) return "⭐⭐⭐⭐";
    if (score >= 13) return "⭐⭐⭐";
    if (score >= 10) return "⭐⭐";
    return "⭐";
}

function endGame() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    backgroundMusic.pause();
    finalScore.textContent = "Final Score: " + score + " / 18";
    starContainer.textContent = calculateStars();
    endScreen.classList.remove("hidden");
    speak("Congratulations! You did a great job.");
}

updateScore();
