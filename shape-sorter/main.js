const SHAPES = ["square", "triangle", "circle", "star"];
const initialBlocks = [
  ...SHAPES.map((shape) => ({ id: `wood-${shape}`, shape, material: "wood", state: "normal", placedIn: null, clicks: 0 })),
  { id: "rock-circle", shape: "circle", material: "rock", state: "normal", placedIn: null, clicks: 0 },
  { id: "sponge-square", shape: "square", material: "sponge", state: "normal", placedIn: null, clicks: 0 },
  { id: "glass-triangle", shape: "triangle", material: "glass", state: "normal", placedIn: null, clicks: 0 },
  { id: "acrylic-star", shape: "star", material: "acrylic", state: "normal", placedIn: null, clicks: 0 },
  { id: "rubber-square", shape: "square", material: "rubber", state: "normal", placedIn: null, clicks: 0 }
];

const state = {
  bottles: [],
  blocks: [],
  message: "Match the shapes...",
  dragging: null,
  layout: {},
  shatter: null
};

const messageBoard = document.getElementById("message-board");
const bottlesArea = document.getElementById("bottles-area");
const blocksArea = document.getElementById("blocks-area");
const sunArea = document.getElementById("sun-area");

function resetGame() {
  state.bottles = SHAPES.map((shape) => ({ id: `bottle-${shape}`, shape, broken: false, placedIn: null }));
  state.blocks = initialBlocks.map((block) => ({ ...block }));
  state.message = "Match the shapes...";
  state.dragging = null;
  state.layout = {};
  state.shatter = null;
  state.blocks.forEach((block, index) => {
    state.layout[block.id] = {
      x: 20 + (index % 5) * 165 + Math.random() * 30,
      y: 10 + Math.floor(index / 5) * 115 + Math.random() * 40
    };
  });
  render();
}

function renderShapeSvg(shape, material, blockState) {
  let fill = "transparent";
  let stroke = "#cbd5e0";
  let strokeWidth = 5;
  let opacity = 1;
  if (material !== "bottle") {
    strokeWidth = 0;
    if (material === "wood") fill = "#f3cfab";
    if (material === "rock") fill = "#cbd5e0";
    if (material === "sponge") fill = "#fef08a";
    if (material === "glass") {
      fill = "url(#glass-grad)";
      stroke = "#ffffff";
      strokeWidth = 3;
      opacity = 0.85;
    }
    if (material === "acrylic") {
      fill = "url(#acrylic-grad)";
      opacity = 0.9;
    }
    if (material === "rubber") fill = "#fbd38d";
  }

  const shapeMarkup =
    shape === "square"
      ? `<rect x="15" y="15" width="70" height="70" rx="20" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`
      : shape === "circle"
      ? `<circle cx="50" cy="50" r="38" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`
      : shape === "triangle"
      ? `<polygon points="50,15 85,82 15,82" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`
      : `<polygon points="50,12 61,38 90,38 66,54 75,85 50,66 25,85 34,54 10,38 39,38" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;

  const textures =
    material === "sponge"
      ? `<g fill="#ecc94b"><circle cx="30" cy="30" r="6" /><circle cx="70" cy="35" r="8" /><circle cx="45" cy="75" r="5" /><circle cx="75" cy="65" r="4" /><circle cx="20" cy="60" r="5" /></g>`
      : material === "wood"
      ? `<g stroke="#d69e2e" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.3"><path d="M 25 30 Q 50 20 75 35" /><path d="M 20 50 Q 50 40 80 55" /><path d="M 25 70 Q 50 60 75 75" /></g>`
      : material === "rock"
      ? `<g fill="#a0aec0" opacity="0.3"><polygon points="25,30 35,25 30,40" /><polygon points="70,60 80,65 75,50" /><polygon points="65,25 75,30 60,35" /></g>`
      : "";

  const shine =
    (material === "glass" || material === "acrylic") && blockState !== "broken"
      ? `<path d="M 25 40 Q 30 25 45 25" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.9" />`
      : "";

  const broken =
    material === "glass" && blockState === "broken"
      ? `<g stroke="#ffffff" stroke-width="3" stroke-linecap="round"><path d="M 50 20 L 45 50 L 70 70 L 45 80" fill="none" /><path d="M 45 50 L 20 40" fill="none" /><path d="M 70 70 L 80 50" fill="none" /></g>`
      : "";

  return `
    <svg class="shape-svg" viewBox="0 0 100 100" style="opacity:${opacity};">
      <defs>
        <radialGradient id="glass-grad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#c1efff" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#90cdf4" stop-opacity="0.9" />
        </radialGradient>
        <radialGradient id="acrylic-grad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="30%" stop-color="#fbb6ce" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#ed64a6" stop-opacity="0.8" />
        </radialGradient>
      </defs>
      ${shapeMarkup}
      ${textures}
      ${shine}
      ${broken}
    </svg>
  `;
}

function render() {
  messageBoard.textContent = state.message;
  bottlesArea.innerHTML = state.bottles.filter((bottle) => !bottle.placedIn).map((bottle) => {
    const placedBlocks = state.blocks.filter((block) => block.placedIn === bottle.id);
    const nestedBottle = state.bottles.find((item) => item.placedIn === bottle.id);
    return `
      <div class="bottle ${bottle.broken ? "broken" : ""}" data-bottle-id="${bottle.id}">
        <div class="bottle-hole">${renderShapeSvg(bottle.shape, "bottle", "normal")}</div>
        <div class="placed-stack">
          ${placedBlocks.map((block, index) => `<div class="mini-block ${block.state}" style="position:absolute;left:${8 + index * 8}px;bottom:${index * 2}px;transform:${placedTransform(block.state)};">${renderShapeSvg(block.shape, block.material, block.state)}</div>`).join("")}
          ${nestedBottle ? `<div class="mini-bottle" style="position:absolute;left:14px;bottom:0;transform:scale(0.5) rotate(-8deg);">${renderShapeSvg(nestedBottle.shape, "bottle", "normal")}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  blocksArea.innerHTML = state.blocks.filter((block) => !block.placedIn).map((block) => `
    <button class="shape-item ${block.state}" data-block-id="${block.id}" style="left:${state.layout[block.id].x}px;top:${state.layout[block.id].y}px;transform:${freeBlockTransform(block.state)};">
      ${renderShapeSvg(block.shape, block.material, block.state)}
    </button>
  `).join("") + renderShatter();

  bindInteractions();
}

function placedTransform(blockState) {
  if (blockState === "squished") return "scaleX(0.8) scaleY(0.3)";
  if (blockState === "broken") return "scale(0.6) rotate(-8deg)";
  if (blockState === "melted") return "scaleX(0.9) scaleY(0.4)";
  return "scale(0.6)";
}

function freeBlockTransform(blockState) {
  if (blockState === "squished") return "scaleX(0.96) scaleY(0.48)";
  if (blockState === "broken") return "scale(0.92) rotate(-10deg)";
  if (blockState === "melted") return "scaleX(1.04) scaleY(0.62)";
  return "none";
}

function renderShatter() {
  if (!state.shatter) return "";
  return `
    <div class="shatter-effect" style="left:${state.shatter.x}px;top:${state.shatter.y}px;">
      <span></span><span></span><span></span><span></span><span></span><span></span>
    </div>
  `;
}

function bindInteractions() {
  document.querySelectorAll("[data-block-id]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => startDrag(event, { type: "block", id: button.getAttribute("data-block-id"), element: button }));
  });

  document.querySelectorAll(".bottle.broken").forEach((bottle) => {
    bottle.addEventListener("pointerdown", (event) => startDrag(event, { type: "bottle", id: bottle.getAttribute("data-bottle-id"), element: bottle }));
  });
}

function startDrag(event, dragging) {
  event.preventDefault();
  const rect = dragging.element.getBoundingClientRect();
  const containerRect = blocksArea.getBoundingClientRect();
  const startPoint = { x: event.clientX, y: event.clientY };
  let moved = false;

  const move = (moveEvent) => {
    const deltaX = moveEvent.clientX - startPoint.x;
    const deltaY = moveEvent.clientY - startPoint.y;
    if (!moved && Math.hypot(deltaX, deltaY) > 8) {
      moved = true;
      state.dragging = { ...dragging, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      dragging.element.style.position = "fixed";
      dragging.element.style.left = `${rect.left}px`;
      dragging.element.style.top = `${rect.top}px`;
      dragging.element.style.zIndex = "1000";
      dragging.element.classList.add("dragging");
    }
    if (!moved) return;
    dragging.element.style.left = `${moveEvent.clientX - state.dragging.offsetX}px`;
    dragging.element.style.top = `${moveEvent.clientY - state.dragging.offsetY}px`;
  };

  const end = () => {
    if (!moved) {
      if (dragging.type === "block") handleBlockClick(dragging.id);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      return;
    }
    const now = dragging.element.getBoundingClientRect();
    const point = { x: now.left + now.width / 2, y: now.top + now.height / 2 };
    const dropped = finishDrop(dragging, point);
    if (!dropped && dragging.type === "block") {
      state.layout[dragging.id] = {
        x: now.left - containerRect.left,
        y: now.top - containerRect.top
      };
    }
    state.dragging = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
}

function finishDrop(dragging, point) {
  if (dragging.type === "block") {
    const block = state.blocks.find((item) => item.id === dragging.id);
    if (block && block.material === "glass" && block.state === "normal" && hitRockBlock(dragging.id)) {
      shatterGlassBlock(dragging.id);
      render();
      return true;
    }
    const sunRect = sunArea.getBoundingClientRect();
    if (block && (block.material === "wood" || block.material === "acrylic") && block.state === "normal" && point.x >= sunRect.left && point.x <= sunRect.right && point.y >= sunRect.top && point.y <= sunRect.bottom) {
      state.blocks = state.blocks.map((item) => item.id === dragging.id ? { ...item, state: "melted" } : item);
      state.message = `${block.material} softened in the heat! It can now fit anywhere.`;
      render();
      return true;
    }
  }

  for (const bottleEl of document.querySelectorAll("[data-bottle-id]")) {
    const bottleId = bottleEl.getAttribute("data-bottle-id");
    const rect = bottleEl.getBoundingClientRect();
    if (point.x < rect.left - 40 || point.x > rect.right + 40 || point.y < rect.top - 60 || point.y > rect.bottom) continue;
    if (dragging.type === "block") {
      placeBlockIntoBottle(dragging.id, bottleId);
      render();
      return true;
    }
    if (dragging.type === "bottle" && dragging.id !== bottleId) {
      placeBottleIntoBottle(dragging.id, bottleId);
      render();
      return true;
    }
  }

  render();
  return false;
}

function hitRockBlock(blockId) {
  const current = document.querySelector(`[data-block-id="${blockId}"]`);
  const rock = state.blocks.find((item) => item.material === "rock" && !item.placedIn);
  if (!current || !rock || rock.id === blockId) return false;
  const rockEl = document.querySelector(`[data-block-id="${rock.id}"]`);
  if (!rockEl) return false;
  const a = current.getBoundingClientRect();
  const b = rockEl.getBoundingClientRect();
  return !(a.right < b.left + 12 || a.left > b.right - 12 || a.bottom < b.top + 12 || a.top > b.bottom - 12);
}

function shatterGlassBlock(blockId) {
  const element = document.querySelector(`[data-block-id="${blockId}"]`);
  const containerRect = blocksArea.getBoundingClientRect();
  if (element) {
    const rect = element.getBoundingClientRect();
    state.shatter = {
      x: rect.left - containerRect.left + rect.width / 2 - 24,
      y: rect.top - containerRect.top + rect.height / 2 - 24
    };
    window.setTimeout(() => {
      state.shatter = null;
      render();
    }, 450);
  }
  state.blocks = state.blocks.map((item) => item.id === blockId ? { ...item, state: "broken" } : item);
  state.message = "The glass hit the rock and shattered.";
}

function handleBlockClick(blockId) {
  state.blocks = state.blocks.map((block) => {
    if (block.id !== blockId || block.placedIn) return block;
    const clicks = block.clicks + 1;
    let nextState = block.state;
    if (block.material === "sponge" && clicks >= 2) nextState = "squished";
    if (nextState !== block.state) state.message = `The ${block.material} got ${nextState}!`;
    return { ...block, clicks, state: nextState };
  });
  render();
}

function placeBlockIntoBottle(blockId, bottleId) {
  const block = state.blocks.find((item) => item.id === blockId);
  const bottle = state.bottles.find((item) => item.id === bottleId);
  if (!block || !bottle) return;

  if (block.material === "rock") {
    if (!bottle.broken) {
      state.bottles = state.bottles.map((item) => item.id === bottleId ? { ...item, broken: true } : item);
      state.blocks = state.blocks.map((item) => item.material === "glass" ? { ...item, state: "broken" } : item);
      state.message = "Stupid rock broke the bottle! Glass can fit anywhere now.";
    }
    return;
  }

  const canFit = bottle.broken || block.state === "squished" || block.state === "broken" || block.state === "melted" || block.shape === bottle.shape;
  if (!canFit) {
    state.message = "Doesn't fit. Try something else.";
    return;
  }
  state.blocks = state.blocks.map((item) => item.id === blockId ? { ...item, placedIn: bottleId } : item);
  state.message = block.shape === bottle.shape && !bottle.broken ? "Perfect fit." : "Well, it fits now.";
}

function placeBottleIntoBottle(sourceBottleId, targetBottleId) {
  const sourceBottle = state.bottles.find((item) => item.id === sourceBottleId);
  if (!sourceBottle || !sourceBottle.broken) return;
  state.bottles = state.bottles.map((item) => item.id === sourceBottleId ? { ...item, placedIn: targetBottleId } : item);
  state.message = "Bottleception! You put a broken bottle inside another bottle!";
}

document.getElementById("reset-btn").addEventListener("click", resetGame);
resetGame();
