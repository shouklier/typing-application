let position = {
  word: 0,
  letter: 0,
  space: false,
};

function keyDownHandler(e) {
  console.log("keydowned");
  if (e.key == "Backspace" && position.space) {
    position.space = false;
    getLetter().style.opacity = 0.7;
    getLetter().style.color = "white";
    renderCursor();
    return;
  }

  if (e.key == "Backspace") {
    getLetter().style.opacity = 0.7;
    console.log(position.word);
    if (position.word == 0 && position.letter == 0) return;
    if (position.letter == 0) {
      getLetter().style.opacity = 0.7;
      getLetter().style.color = "white";
      position.word--;
      position.letter = words[position.word].length - 1;
      position.space = true;
      renderCursor();
    } else {
      position.letter--;
      getLetter().style.opacity = 0.7;
      getLetter().style.color = "white";
      renderCursor();
    }
  }
}

let isTiming = false;
let intervalKey;

function keyPressHandler(e) {
  const currentWord = words[position.word];
  const currentLetter = currentWord[position.letter];
  const currentKey = e.key;

  let newIsTiming = !(
    currentKey == currentLetter &&
    position.word == words.length - 1 &&
    position.letter == words[words.length - 1].length - 1
  );

  if (!isTiming && newIsTiming) {
    // Start the Timer
    startDate = new Date();
    intervalKey = setInterval(() => {
      const diff = Date.now() - startDate.getTime();
      document.querySelector(".timer").innerText =
        Math.floor(diff / 1000).toString() + "." + (diff % 1000).toString();
    }, 10);
    isTiming = newIsTiming;
  }

  if (!newIsTiming && isTiming) {
    clearInterval(intervalKey);
    isTiming = false;
    endSession();
  }

  if (currentKey == " " && position.space) {
    position.word++;
    position.space = false;
    position.letter = 0;
    renderCursor();
    return;
  }

  if (currentKey == currentLetter) {
    getLetter().style.opacity = 1;
    if (position.letter == currentWord.length - 1) {
      position.space = true;
      renderCursor();
    } else {
      position.letter++;
      renderCursor();
    }
  } else {
    getLetter().style.opacity = 1;
    getLetter().style.color = "red";
    if (position.letter == currentWord.length - 1) {
      position.space = true;
      renderCursor();
    } else {
      position.letter++;
      renderCursor();
    }
  }
}

let startDate = new Date();

let words = [];

let charcount = 0;

function getWord() {
  const wordsdiv = document.querySelector(".words");
  return wordsdiv.children[position.word];
}

function getLetter() {
  return getWord().children[position.letter];
}

function renderCursor() {
  const cursor = document.querySelector(".cursor");
  const letter = getLetter();
  if (!position.space) {
    cursor.style.left = letter.getBoundingClientRect().left.toString() + "px";
  } else {
    cursor.style.left = letter.getBoundingClientRect().right.toString() + "px";
  }
  cursor.style.top = (letter.getBoundingClientRect().top + 7).toString() + "px";
}

async function endSession(wpm) {
  window.removeEventListener("keydown", keyDownHandler);
  window.removeEventListener("keypress", keyPressHandler);

  const wordsDiv = document.querySelector(".words");
  wordsDiv.remove("typingbox");
}

async function startSession() {
  const response = await fetch("./100words.txt");
  const text = await response.text();
  const shit = text.split("\n").map((s) => s.trim());

  var i = 0;
  while (i < 15) {
    words.push(shit[Math.floor(Math.random() * (shit.length - 1))]);
    i += 1;
  }

  const bottomSection = document.querySelector(".bottomsection");

  const typingbox = document.createElement("div");
  typingbox.className = "typingbox";
  const timerDiv = document.createElement("div");
  timerDiv.className = "timer";
  timerDiv.innerHTML = "0.00";
  bottomSection.appendChild(timerDiv);
  bottomSection.appendChild(typingbox);

  const wordsdiv = document.createElement("div");
  wordsdiv.className = "words";

  typingbox.appendChild(wordsdiv);
  for (let i = 0; i < 15; i++) {
    const word = document.createElement("div");
    word.className = "word";
    for (let j = 0; j < words[i].length; j++) {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.innerText = words[i][j];
      word.appendChild(letter);
    }

    wordsdiv.appendChild(word);
  }

  const cursor = document.createElement("div");
  cursor.className = "cursor";
  wordsdiv.appendChild(cursor);

  renderCursor();

  isTiming = false;
  intervalKey = undefined;

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keypress", keyPressHandler);
}

startSession();
