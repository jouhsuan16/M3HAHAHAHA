const state = {
  stones: [],
  waterLevel: 30,
  message: "You are thirsty need water now",
  drank: false,
  pitcher: { x: 0, y: 0 }
};

const stonesArea = document.getElementById("stones-area");
const messageBoard = document.getElementById("message-board");
const pitcher = document.getElementById("pitcher");
const water = document.getElementById("water");
const pitcherStones = document.getElementById("pitcher-stones");

function resetGame() {
  state.stones = Array.from({ length: 10 }, (_, index) => ({ id: `stone-${index}`, dropped: false }));
  state.waterLevel = 30;
  state.message = "You are thirsty need water now";
  state.drank = false;
  state.pitcher = { x: 0, y: 0 };
  render();
}

function render() {
  messageBoard.textContent = state.message;
  water.style.height = `${state.waterLevel}%`;
  pitcher.style.transform = `translate(${state.pitcher.x}px, ${state.pitcher.y}px) rotate(${mapPitcherRotation()}deg)`;
  pitcherStones.innerHTML = state.stones
    .filter((stone) => stone.dropped)
    .map((stone, index) => `<div class="dropped-stone" style="bottom:${Math.floor(index / 3) * 15}px;left:${10 + (index % 3) * 20}%;">🪨</div>`)
    .join("");

  stonesArea.innerHTML = state.stones
    .filter((stone) => !stone.dropped)
    .map((stone) => `<button class="stone" data-stone-id="${stone.id}">🪨</button>`)
    .join("");

  document.querySelectorAll("[data-stone-id]").forEach((stone) => {
    stone.addEventListener("pointerdown", startStoneDrag);
  });
}

function mapPitcherRotation() {
  const lifted = Math.max(0, Math.min(150, -state.pitcher.y));
  return (lifted / 150) * 110;
}

function dropStone(stoneId) {
  state.stones = state.stones.map((stone) => stone.id === stoneId ? { ...stone, dropped: true } : stone);
  state.waterLevel = Math.min(100, state.waterLevel + 15);
  if (!state.drank) {
    state.message = state.waterLevel >= 90 ? "The crow drank the water! But wait... aren't you human?" : "The water level rises... Caw!";
  }
  render();
}

function startStoneDrag(event) {
  event.preventDefault();
  const stone = event.currentTarget;
  const rect = stone.getBoundingClientRect();
  const drag = {
    stoneId: stone.getAttribute("data-stone-id"),
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };

  stone.style.position = "fixed";
  stone.style.left = `${rect.left}px`;
  stone.style.top = `${rect.top}px`;
  stone.style.zIndex = "1000";

  const move = (moveEvent) => {
    stone.style.left = `${moveEvent.clientX - drag.offsetX}px`;
    stone.style.top = `${moveEvent.clientY - drag.offsetY}px`;
  };

  const end = () => {
    const stoneRect = stone.getBoundingClientRect();
    const pitcherRect = pitcher.getBoundingClientRect();
    const hit = rectsOverlap(stoneRect, pitcherRect);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    if (hit) dropStone(drag.stoneId);
    else render();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
}

function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

pitcher.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  const start = { x: event.clientX, y: event.clientY };
  const base = { ...state.pitcher };

  const move = (moveEvent) => {
    state.pitcher.x = Math.max(-200, Math.min(200, base.x + (moveEvent.clientX - start.x)));
    state.pitcher.y = Math.max(-150, Math.min(50, base.y + (moveEvent.clientY - start.y)));
    const rotate = mapPitcherRotation();
    if (rotate > 90 && state.waterLevel > 0) {
      state.waterLevel = Math.max(0, state.waterLevel - 2);
      if (!state.drank) {
        state.drank = true;
        state.message = "Glug glug... We are human! We can just drink it!";
      }
    }
    render();
  };

  const end = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
});

document.getElementById("reset-btn").addEventListener("click", resetGame);
resetGame();
