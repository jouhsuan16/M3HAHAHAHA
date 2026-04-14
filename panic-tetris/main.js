const COLS = 10;
const ROWS = 20;
const FALL_AWAY_DURATION = 1500;
const SIDE_SPILL_COLS = 4;
const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: "#00f0f0" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#0000f0" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#f0a000" },
  O: { shape: [[1, 1], [1, 1]], color: "#f0f000" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#00f000" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#a000f0" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#f00000" }
};

const board = document.getElementById("board");
const boardWrap = document.querySelector(".board-wrap");
const fallenLayer = document.getElementById("fallen-layer");
const scoreBox = document.getElementById("score-box");

const state = {
  grid: [],
  activePiece: null,
  dropTime: 1000,
  dropTimer: null,
  startTime: 0,
  gameOver: false,
  score: 0,
  speedLevel: 1,
  charging: false,
  slapVisible: false,
  slapPos: { x: 0, y: 0 },
  slapTimer: null,
  cheatMode: false,
  wallHits: { left: 0, right: 0, lastTime: 0 },
  holeDug: false,
  blocksFalling: false,
  shakePower: 0,
  sideBlocks: []
};

function randomTetromino() {
  const keys = Object.keys(TETROMINOS);
  return JSON.parse(JSON.stringify(TETROMINOS[keys[Math.floor(Math.random() * keys.length)]]));
}

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function resetGame() {
  clearInterval(state.dropTimer);
  clearTimeout(state.slapTimer);
  state.grid = emptyGrid();
  state.activePiece = { pos: { x: 3, y: -1 }, tetromino: randomTetromino() };
  state.dropTime = 1000;
  state.startTime = Date.now();
  state.gameOver = false;
  state.score = 0;
  state.speedLevel = 1;
  state.charging = false;
  state.slapVisible = false;
  state.cheatMode = false;
  state.wallHits = { left: 0, right: 0, lastTime: 0 };
  state.holeDug = false;
  state.blocksFalling = false;
  state.shakePower = 0;
  state.sideBlocks = [];
  boardWrap.style.transform = "";
  boardWrap.classList.remove("shaking");
  startDropLoop();
  render();
}

function render() {
  scoreBox.textContent = `Score: ${state.score}`;
  const cellSize = board.clientWidth / COLS;

  const cells = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = state.grid[y][x];
      cells.push(`<div class="cell ${cell && state.blocksFalling ? "falling-down" : ""}" style="background:${cell || "rgba(255,255,255,0.05)"};box-shadow:${cell ? "inset 0 0 10px rgba(0,0,0,0.5)" : "none"};"></div>`);
    }
  }

  const activeCells = [];
  const spillCells = [];
  state.activePiece.tetromino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const gx = state.activePiece.pos.x + x;
      const gy = state.activePiece.pos.y + y;
      if (gy < 0) return;
      const markup = `<div class="active-cell spill-cell" style="left:${gx * cellSize}px;top:${gy * cellSize}px;background:${state.activePiece.tetromino.color};"></div>`;
      if (gx >= 0 && gx < COLS) activeCells.push(markup);
      else spillCells.push(markup);
    });
  });

  board.innerHTML =
    cells.join("") +
    activeCells.join("") +
    (state.gameOver ? '<div class="game-over">GAME OVER!<br>Lift and shake the board.</div>' : "") +
    (state.charging ? `<div class="charge-indicator" style="left:${state.slapPos.x}px;top:${state.slapPos.y}px;"></div>` : "") +
    (state.slapVisible ? `<div class="slap-hand" style="left:${state.slapPos.x}px;top:${state.slapPos.y}px;">🖐️</div>` : "") +
    (state.cheatMode ? '<div class="cheat-indicator">WALL HACK ACTIVE</div>' : "") +
    (state.holeDug ? '<div class="giant-hole">🕳️</div>' : "");

  fallenLayer.innerHTML =
    state.sideBlocks.map((block) => `
      <div class="fallen-block spill-cell" style="left:${block.x * cellSize}px;top:${block.y * cellSize}px;background:${block.color};"></div>
    `).join("") +
    spillCells.join("");
}

function checkCollision(piece = state.activePiece, moveX = 0, moveY = 0, newShape) {
  const shape = newShape || piece.tetromino.shape;
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) continue;
      const nextX = piece.pos.x + x + moveX;
      const nextY = piece.pos.y + y + moveY;
      if (nextY >= ROWS) return true;
      if (!state.cheatMode && (nextX < 0 || nextX >= COLS)) return true;
      if (state.cheatMode && (nextX < -SIDE_SPILL_COLS || nextX >= COLS + SIDE_SPILL_COLS)) return true;
      if (nextY >= 0) {
        if (nextX >= 0 && nextX < COLS && state.grid[nextY] && state.grid[nextY][nextX]) return true;
        if ((nextX < 0 || nextX >= COLS) && state.sideBlocks.some((block) => block.x === nextX && block.y === nextY)) return true;
      }
    }
  }
  return false;
}

function movePiece(direction) {
  if (state.gameOver || state.blocksFalling) return;
  if (!checkCollision(state.activePiece, direction, 0)) {
    state.activePiece.pos.x += direction;
    state.wallHits = { left: 0, right: 0, lastTime: 0 };
    render();
    return;
  }

  const now = Date.now();
  if (now - state.wallHits.lastTime < 500) {
    if (direction === -1) state.wallHits.left += 1;
    if (direction === 1) state.wallHits.right += 1;
  } else {
    state.wallHits.left = direction === -1 ? 1 : 0;
    state.wallHits.right = direction === 1 ? 1 : 0;
  }
  state.wallHits.lastTime = now;

  if (state.wallHits.left >= 3 || state.wallHits.right >= 3) {
    state.cheatMode = true;
    state.activePiece.pos.x += direction;
    render();
  }
}

function rotatePiece() {
  if (state.gameOver || state.blocksFalling) return;
  const rotated = state.activePiece.tetromino.shape[0].map((_, index) => state.activePiece.tetromino.shape.map((row) => row[index]).reverse());
  if (!checkCollision(state.activePiece, 0, 0, rotated)) {
    state.activePiece.tetromino.shape = rotated;
    render();
  }
}

function mergeActivePiece() {
  state.activePiece.tetromino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const gy = state.activePiece.pos.y + y;
      const gx = state.activePiece.pos.x + x;
      if (gy < 0 || gy >= ROWS) return;
      if (gx >= 0 && gx < COLS) state.grid[gy][gx] = state.activePiece.tetromino.color;
      else state.sideBlocks.push({ x: gx, y: gy, color: state.activePiece.tetromino.color });
    });
  });

  const filtered = state.grid.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - filtered.length;
  if (cleared > 0) {
    state.score += cleared * 100;
    state.grid = Array.from({ length: cleared }, () => Array(COLS).fill(null)).concat(filtered);
  }
}

function nextSpeed() {
  const elapsed = (Date.now() - state.startTime) / 1000;
  return Math.floor(elapsed / 15) + 1;
}

function dropPiece() {
  if (state.gameOver || state.blocksFalling) return;
  const newSpeed = nextSpeed();
  if (newSpeed !== state.speedLevel) {
    state.speedLevel = newSpeed;
    state.dropTime = Math.max(100, 1000 - (newSpeed - 1) * 150);
    startDropLoop();
  }

  if (!checkCollision(state.activePiece, 0, 1)) {
    state.activePiece.pos.y += 1;
    render();
    return;
  }

  if (state.activePiece.pos.y < 1) {
    state.gameOver = true;
    clearInterval(state.dropTimer);
    render();
    return;
  }

  mergeActivePiece();
  state.activePiece = { pos: { x: 3, y: -1 }, tetromino: randomTetromino() };
  render();
}

function startDropLoop() {
  clearInterval(state.dropTimer);
  state.dropTimer = setInterval(dropPiece, state.dropTime);
}

function clearBoardAfterFall(callback) {
  state.blocksFalling = true;
  render();
  setTimeout(() => {
    state.grid = emptyGrid();
    state.sideBlocks = [];
    state.blocksFalling = false;
    state.holeDug = false;
    state.gameOver = false;
    callback();
    render();
  }, FALL_AWAY_DURATION);
}

board.addEventListener("mousedown", (event) => {
  if (state.gameOver) return;
  const rect = board.getBoundingClientRect();
  state.slapPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  state.charging = true;
  clearTimeout(state.slapTimer);
  state.slapTimer = setTimeout(() => {
    state.charging = false;
    state.slapVisible = true;
    clearBoardAfterFall(() => {
      startDropLoop();
      setTimeout(() => {
        state.slapVisible = false;
        render();
      }, 150);
    });
  }, 500);
  render();
});

["mouseup", "mouseleave"].forEach((type) => {
  board.addEventListener(type, () => {
    state.charging = false;
    clearTimeout(state.slapTimer);
    render();
  });
});

document.getElementById("shovel-btn").addEventListener("click", () => {
  if (state.blocksFalling) return;
  state.holeDug = true;
  clearInterval(state.dropTimer);
  clearBoardAfterFall(startDropLoop);
});

boardWrap.addEventListener("pointerdown", (event) => {
  if (!state.gameOver) return;
  const startX = event.clientX;
  const startY = event.clientY;
  let maxTravel = 0;
  boardWrap.classList.add("shaking");

  const move = (moveEvent) => {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    maxTravel = Math.max(maxTravel, Math.abs(dx) + Math.abs(dy));
    boardWrap.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.08}deg)`;
  };

  const end = () => {
    boardWrap.classList.remove("shaking");
    boardWrap.style.transform = "";
    if (maxTravel > 100) {
      clearBoardAfterFall(startDropLoop);
    }
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") movePiece(-1);
  if (event.key === "ArrowRight") movePiece(1);
  if (event.key === "ArrowDown") dropPiece();
  if (event.key === "ArrowUp") rotatePiece();
});

document.getElementById("reset-btn").addEventListener("click", resetGame);
resetGame();
