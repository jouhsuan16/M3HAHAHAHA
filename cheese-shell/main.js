const SLOT_X = [-160, -50, 60];

const state = {
  phase: "init",
  eggs: [0, 1, 2],
  cheeseEggId: 1,
  message: "Let's play a game...",
  sniffing: false,
  shuffleTimer: null,
  revealTimer: null,
  stopTimer: null
};

const eggsArea = document.getElementById("eggs-area");
const messageBoard = document.getElementById("message-board");
const sniffMeter = document.getElementById("sniff-meter");
const mouseArea = document.getElementById("mouse-area");
const startBtn = document.getElementById("start-btn");

function renderCheeseSvg() {
  return `
    <svg width="80" height="60" viewBox="0 0 60 50" style="overflow:visible;">
      <path d="M 5 40 L 55 40 L 30 5 Z" fill="#f6e05e" stroke="#d69e2e" stroke-width="4" stroke-linejoin="round"></path>
      <circle cx="20" cy="30" r="5" fill="#d69e2e" opacity="0.6"></circle>
      <circle cx="45" cy="32" r="4" fill="#d69e2e" opacity="0.6"></circle>
      <circle cx="30" cy="20" r="3" fill="#d69e2e" opacity="0.6"></circle>
      <circle cx="35" cy="35" r="3.5" fill="#d69e2e" opacity="0.6"></circle>
    </svg>
  `;
}

function renderEggBottomSvg() {
  return `
    <svg width="100" height="60" viewBox="0 0 100 60">
      <defs>
        <linearGradient id="gold-grad-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fbd38d"></stop>
          <stop offset="100%" stop-color="#d69e2e"></stop>
        </linearGradient>
      </defs>
      <path d="M 10 0 L 20 15 L 35 5 L 50 20 L 65 5 L 80 15 L 90 0 C 90 40 70 60 50 60 C 30 60 10 40 10 0 Z" fill="url(#gold-grad-bottom)"></path>
    </svg>
  `;
}

function renderEggTopSvg() {
  return `
    <svg width="100" height="70" viewBox="0 0 100 70">
      <defs>
        <linearGradient id="gold-grad-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef08a"></stop>
          <stop offset="100%" stop-color="#f6ad55"></stop>
        </linearGradient>
      </defs>
      <path d="M 10 70 L 20 55 L 35 65 L 50 50 L 65 65 L 80 55 L 90 70 C 90 20 70 0 50 0 C 30 0 10 20 10 70 Z" fill="url(#gold-grad-top)"></path>
    </svg>
  `;
}

function renderMouseSvg() {
  return `
    <svg width="100" height="80" viewBox="0 0 100 80" style="overflow:visible;">
      <g transform="translate(10, 20)">
        <path d="M 20 40 Q 0 40 5 25 Q 10 10 -5 15" stroke="#a0aec0" stroke-width="4" fill="none" stroke-linecap="round"></path>
        <circle cx="25" cy="15" r="12" fill="#cbd5e0" stroke="#a0aec0" stroke-width="3"></circle>
        <circle cx="25" cy="15" r="6" fill="#fbb6ce"></circle>
        <circle cx="55" cy="15" r="12" fill="#cbd5e0" stroke="#a0aec0" stroke-width="3"></circle>
        <circle cx="55" cy="15" r="6" fill="#fbb6ce"></circle>
        <path d="M 15 45 Q 15 25 40 25 Q 70 25 80 45 Z" fill="#cbd5e0" stroke="#a0aec0" stroke-width="3"></path>
        <circle cx="45" cy="32" r="2.5" fill="#4a5568"></circle>
        <circle cx="60" cy="32" r="2.5" fill="#4a5568"></circle>
        <circle cx="80" cy="45" r="4" fill="#4a5568"></circle>
        <path d="M 65 40 L 85 35 M 65 43 L 88 43 M 65 46 L 85 53" stroke="#4a5568" stroke-width="2" stroke-linecap="round"></path>
        ${state.sniffing ? '<g><path d="M 50 15 L 45 5 L 55 5 Z" fill="#f56565"></path><circle cx="50" cy="20" r="2.5" fill="#f56565"></circle></g>' : ""}
      </g>
    </svg>
  `;
}

function ensureMouse() {
  let mouse = document.getElementById("mouse-dragger");
  if (!mouse) {
    mouseArea.innerHTML = `<div class="mouse-dragger" id="mouse-dragger"></div>`;
    mouse = document.getElementById("mouse-dragger");
  }
  mouse.innerHTML = renderMouseSvg();
  bindMouseDrag(mouse);
}

function ensureEggs() {
  if (eggsArea.children.length) return;
  eggsArea.innerHTML = "";
  [0, 1, 2].forEach((eggId) => {
    const egg = document.createElement("button");
    egg.className = "egg";
    egg.type = "button";
    egg.dataset.eggId = String(eggId);
    egg.innerHTML = `
      <div class="cheese-piece">${renderCheeseSvg()}</div>
      <div class="egg-bottom">${renderEggBottomSvg()}</div>
      <div class="egg-top">${renderEggTopSvg()}</div>
    `;
    egg.addEventListener("click", () => handleEggClick(eggId));
    eggsArea.appendChild(egg);
  });
}

function updateEggs() {
  ensureEggs();
  document.querySelectorAll(".egg").forEach((egg) => {
    const eggId = Number(egg.dataset.eggId);
    const slot = state.eggs.indexOf(eggId);
    const cheese = egg.querySelector(".cheese-piece");
    egg.style.transform = `translateX(${SLOT_X[slot]}px)`;
    const activeCheeseEgg = eggId === state.cheeseEggId;
    const showCheese = activeCheeseEgg && (state.phase === "loading" || state.phase === "finished");
    egg.classList.toggle("open", activeCheeseEgg && (state.phase === "loading" || state.phase === "finished"));
    egg.classList.toggle("loading", activeCheeseEgg && state.phase === "loading");
    cheese.classList.toggle("visible", showCheese);
    cheese.classList.toggle("dropping", activeCheeseEgg && state.phase === "loading");
  });
}

function render() {
  messageBoard.textContent = state.message;
  sniffMeter.textContent = " ";
  ensureMouse();
  updateEggs();
  startBtn.style.display = state.phase === "init" || state.phase === "finished" ? "block" : "none";
  startBtn.textContent = state.phase === "init" ? "Start Game" : "Play Again";
}

function bindMouseDrag(mouse) {
  if (mouse.dataset.bound === "true") return;
  mouse.dataset.bound = "true";

  mouse.addEventListener("pointerdown", (event) => {
    if (state.phase !== "guessing") return;
    event.preventDefault();
    const rect = mouse.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    mouse.style.position = "fixed";
    mouse.style.left = `${rect.left}px`;
    mouse.style.top = `${rect.top}px`;
    mouse.style.zIndex = "1000";

    const move = (moveEvent) => {
      mouse.style.left = `${moveEvent.clientX - offsetX}px`;
      mouse.style.top = `${moveEvent.clientY - offsetY}px`;
      updateMouseCollision(mouse);
    };

    const end = () => {
      state.sniffing = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      render();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  });
}

function updateMouseCollision(mouse) {
  const mouseRect = mouse.getBoundingClientRect();
  let hitCheese = false;
  document.querySelectorAll(".egg").forEach((egg) => {
    const eggId = Number(egg.dataset.eggId);
    const rect = egg.getBoundingClientRect();
    const hitRect = {
      left: rect.left + rect.width * 0.3,
      right: rect.right - rect.width * 0.3,
      top: rect.top + rect.height * 0.2,
      bottom: rect.bottom - rect.height * 0.28
    };
    const overlap = !(mouseRect.right < hitRect.left || mouseRect.left > hitRect.right || mouseRect.bottom < hitRect.top || mouseRect.top > hitRect.bottom);
    if (overlap && eggId === state.cheeseEggId) hitCheese = true;
  });
  state.sniffing = hitCheese;
  mouse.innerHTML = renderMouseSvg();
  if (hitCheese) finishGame("mouse");
}

function shuffleEggs() {
  const next = state.eggs.slice();
  const move = Math.random() < 0.5 ? [0, 1] : [1, 2];
  if (Math.random() < 0.35) {
    move[0] = 0;
    move[1] = 2;
  }
  [next[move[0]], next[move[1]]] = [next[move[1]], next[move[0]]];
  state.eggs = next;
  updateEggs();
}

function handleEggClick(eggId) {
  if (state.phase !== "guessing") return;
  if (eggId === state.cheeseEggId) {
    state.sniffing = true;
    finishGame("click");
    return;
  }
  state.sniffing = false;
  state.message = "Oops! Wrong egg, try again!";
  render();
}

function finishGame(source = "mouse") {
  if (state.phase === "finished") return;
  clearInterval(state.shuffleTimer);
  state.shuffleTimer = null;
  clearTimeout(state.stopTimer);
  state.stopTimer = null;
  state.phase = "finished";
  state.message = source === "click" ? "You found it!" : "You found it! (Or did the mouse help?)";
  render();
}

function resetMousePosition() {
  const mouse = document.getElementById("mouse-dragger");
  if (!mouse) return;
  mouse.style.position = "relative";
  mouse.style.left = "0";
  mouse.style.top = "0";
  mouse.style.zIndex = "20";
}

function resetGame() {
  clearInterval(state.shuffleTimer);
  state.shuffleTimer = null;
  clearTimeout(state.revealTimer);
  clearTimeout(state.stopTimer);
  state.revealTimer = null;
  state.stopTimer = null;
  state.phase = "init";
  state.eggs = [0, 1, 2];
  state.cheeseEggId = Math.floor(Math.random() * 3);
  state.message = "Let's play a game...";
  state.sniffing = false;
  render();
  resetMousePosition();
}

function startGame() {
  clearInterval(state.shuffleTimer);
  clearTimeout(state.revealTimer);
  clearTimeout(state.stopTimer);
  state.shuffleTimer = null;
  state.revealTimer = null;
  state.stopTimer = null;
  state.phase = "loading";
  state.eggs = [0, 1, 2];
  state.cheeseEggId = Math.floor(Math.random() * 3);
  state.message = "The cheese goes into one egg...";
  state.sniffing = false;
  render();
  resetMousePosition();

  state.revealTimer = setTimeout(() => {
    state.phase = "shuffling";
    state.message = "Watch closely!";
    render();

    state.shuffleTimer = setInterval(() => {
      if (state.phase !== "shuffling") return;
      shuffleEggs();
    }, 260);

    state.stopTimer = setTimeout(() => {
      clearInterval(state.shuffleTimer);
      state.shuffleTimer = null;
      state.phase = "guessing";
      state.message = "Find the cheese egg!";
      render();
    }, 3000);
  }, 950);
}

startBtn.addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
resetGame();
