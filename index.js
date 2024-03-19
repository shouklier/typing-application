const createDefaultState = () => ({
  wordcount: 15,
  word: 0,
  letter: 0,
  space: false,
  words: [],
  startDate: new Date(),
  endDate: new Date(),
  isTiming: false,
  intervalKey: undefined,
  stats: {
    chars: 0,
    correct: 0,
    incorrect: 0,
  },
});

let state = createDefaultState();

function generateResults() {
  const diff = state.endDate.getTime() - state.startDate.getTime();
  let rawwpm = state.stats.chars / 5 / (diff / 60000);
  let wpm = state.stats.correct / 5 / (diff / 60000);
  console.log(wpm, rawwpm);
  console.log(state);

  let resultsbox = document.querySelector(".resultsbox");
  resultsbox.style.display = "flex";
  document.querySelector(".default").innerText = "WPM: " + Math.round(wpm);
  document.querySelector(".raw").innerText = "Raw WPM: " + Math.round(rawwpm);
}

function keyDownHandler(e) {
  if (e.key == "Backspace" && state.space) {
    state.space = false;
    getLetter().style.opacity = 0.7;
    getLetter().style.color = "black";
    renderCursor();
    return;
  }

  if (e.key == "Backspace") {
    getLetter().style.opacity = 0.7;
    console.log(state.word);
    if (state.word == 0 && state.letter == 0) return;
    if (state.letter == 0) {
      getLetter().style.opacity = 0.7;
      getLetter().style.color = "black";
      state.word--;
      state.letter = state.words[state.word].length - 1;
      state.space = true;
      renderCursor();
    } else {
      state.letter--;
      getLetter().style.opacity = 0.7;
      getLetter().style.color = "black";
      renderCursor();
    }
  }
}

function keyPressHandler(e) {
  const currentWord = state.words[state.word];
  const currentLetter = currentWord[state.letter];
  const currentKey = e.key;

  let newIsTiming = !(
    currentKey == currentLetter &&
    state.word == state.words.length - 1 &&
    state.letter == state.words[state.words.length - 1].length - 1
  );

  if (!state.isTiming && newIsTiming) {
    // Start the Timer
    state.startDate = new Date();
    state.intervalKey = setInterval(() => {
      const diff = Date.now() - state.startDate.getTime();
    }, 10);
    state.isTiming = newIsTiming;
  }

  if (!newIsTiming && state.isTiming) {
    state.isTiming = false;
    state.endDate = new Date();
    endSession();
    generateResults();

    return;
  }

  if (currentKey == " " && state.space) {
    state.word++;
    state.stats.correct += 1;
    state.space = false;
    state.letter = 0;
    renderCursor();
    state.stats.chars++;
    return;
  }

  if (!state.space) {
    if (currentKey == currentLetter) {
      getLetter().style.opacity = 1;
      state.stats.correct += 1;
      if (state.letter == currentWord.length - 1) {
        state.space = true;
        renderCursor();
      } else {
        state.letter++;
        renderCursor();
      }
    } else {
      getLetter().style.opacity = 1;
      getLetter().style.color = "red";
      state.stats.incorrect += 1;

      if (state.letter == currentWord.length - 1) {
        state.space = true;
        renderCursor();
      } else {
        state.letter++;
        renderCursor();
      }
    }
    state.stats.chars++;
  }
}

function getWord() {
  const wordsdiv = document.querySelector(".words");
  return wordsdiv.children[state.word];
}

function getLetter() {
  return getWord().children[state.letter];
}

function renderCursor() {
  const cursor = document.querySelector(".cursor");
  const letter = getLetter();
  if (!state.space) {
    cursor.style.left = letter.getBoundingClientRect().left.toString() + "px";
  } else {
    cursor.style.left = letter.getBoundingClientRect().right.toString() + "px";
  }
  cursor.style.top = (letter.getBoundingClientRect().top + 7).toString() + "px";
}

async function endSession() {
  window.removeEventListener("keydown", keyDownHandler);
  window.removeEventListener("keypress", keyPressHandler);
  if (state.intervalKey) {
    clearInterval(state.intervalKey);
  }

  const wordsDiv = document.querySelector(".typingbox");
  const restartButton = document.querySelector(".restart-button");
  restartButton.remove();
  wordsDiv.remove();
}

async function startSession() {
  state = createDefaultState();
  const response = await fetch("./100words.txt");
  const text = await response.text();
  const shit = text.split("\n").map((s) => s.trim());

  var i = 0;
  while (i < state.wordcount) {
    state.words.push(shit[Math.floor(Math.random() * (shit.length - 1))]);
    i += 1;
  }

  const bottomSection = document.querySelector(".bottomsection");

  const typingbox = document.createElement("div");
  typingbox.className = "typingbox";
  const restartButton = document.createElement("button");
  restartButton.className = "restart-button";
  restartButton.innerHTML = '<i data-lucide="rotate-ccw"></i>';
  bottomSection.appendChild(restartButton);
  bottomSection.appendChild(typingbox);
  lucide?.createIcons();

  const wordsdiv = document.createElement("div");
  wordsdiv.className = "words";

  typingbox.appendChild(wordsdiv);
  for (let i = 0; i < state.wordcount; i++) {
    const word = document.createElement("div");
    word.className = "word";
    for (let j = 0; j < state.words[i].length; j++) {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.innerText = state.words[i][j];
      word.appendChild(letter);
    }

    wordsdiv.appendChild(word);
  }

  const cursor = document.createElement("div");
  cursor.className = "cursor";
  wordsdiv.appendChild(cursor);

  renderCursor();

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keypress", keyPressHandler);
  restartButton.addEventListener("click", (e) => {
    endSession();
    startSession();
  });
}

startSession();
