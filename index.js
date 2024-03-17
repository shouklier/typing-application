let state = {
  wordcount: 15,
  word: 0,
  letter: 0,
  space: false,
  words: [],
  startDate: new Date(),
  isTiming: false,
  intervalKey: undefined,
};

function keyDownHandler(e) {
  if (e.key == "Backspace" && state.space) {
    state.space = false;
    getLetter().style.opacity = 0.7;
    getLetter().style.color = "white";
    renderCursor();
    return;
  }

  if (e.key == "Backspace") {
    getLetter().style.opacity = 0.7;
    console.log(state.word);
    if (state.word == 0 && state.letter == 0) return;
    if (state.letter == 0) {
      getLetter().style.opacity = 0.7;
      getLetter().style.color = "white";
      state.word--;
      state.letter = state.words[state.word].length - 1;
      state.space = true;
      renderCursor();
    } else {
      state.letter--;
      getLetter().style.opacity = 0.7;
      getLetter().style.color = "white";
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
    const diff = Date.now() - state.startDate.getTime();
    let wpm = state.wordcount / (diff / 60000);
    console.log(wpm);
    endSession();
    return;
  }

  if (currentKey == " " && state.space) {
    state.word++;
    state.space = false;
    state.letter = 0;
    renderCursor();
    return;
  }

  if (currentKey == currentLetter) {
    getLetter().style.opacity = 1;
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
    if (state.letter == currentWord.length - 1) {
      state.space = true;
      renderCursor();
    } else {
      state.letter++;
      renderCursor();
    }
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

  state = {
    wordcount: 15,
    word: 0,
    letter: 0,
    space: false,
    words: [],
    isTiming: false,
    intervalKey: undefined,
  };

  const wordsDiv = document.querySelector(".typingbox");
  const restartButton = document.querySelector(".restart-button");
  restartButton.remove();
  wordsDiv.remove();
}

async function startSession() {
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
