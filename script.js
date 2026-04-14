(function () {
  const app = document.getElementById("app");

  const games = [
    {
      id: "shape-sorter",
      title: "Shape Sorter",
      emoji: "🟦",
      description: "Match the shapes. Very normal.",
      color: "#e0e7ff"
    },
    {
      id: "crow-pitcher",
      title: "Thirsty Crow",
      emoji: "🐦‍⬛",
      description: "Help the crow drink water.",
      color: "#fce7f3"
    },
    {
      id: "red-riding-hood",
      title: "Mushroom Delivery",
      emoji: "🍄",
      description: "Help Little Red deliver mushrooms safely!",
      color: "#fed7d7"
    },
    {
      id: "cheese-shell",
      title: "Golden Egg Shell",
      emoji: "🥚",
      description: "Find the cheese in the golden eggs!",
      color: "#fef08a"
    },
    {
      id: "panic-tetris",
      title: "Panic Tetris",
      emoji: "😫",
      description: "The blocks are in a hurry. Slap them away!",
      color: "#e2e8f0"
    }
  ];

  const shapes = ["square", "triangle", "circle", "star"];

  const shapeState = {
    bottles: [],
    blocks: [],
    message: "Match the shapes..."
  };

  const crowState = {
    stones: Array.from({ length: 10 }, function (_, index) {
      return { id: "stone-" + index, dropped: false };
    }),
    waterLevel: 30,
    message: "You are thirsty need water now",
    drank: false
  };

  const rrhState = {
    introOpen: true,
    introFinished: false,
    forestRevealed: false,
    wolves: { top: true, bottom: true },
    result: "",
    locking: false
  };

  const cheeseState = {
    phase: "init",
    order: [0, 1, 2],
    cheeseEggId: 1,
    message: "Let's play a game...",
    win: null,
    sniffing: false,
    guessReady: false
  };

  const tetris = {
    cols: 10,
    rows: 20,
    grid: [],
    activePiece: null,
    dropTime: 1000,
    dropTimer: null,
    speedTimer: null,
    startTime: 0,
    gameOver: false,
    score: 0,
    speedLevel: 1,
    chargingSlap: false,
    slapVisible: false,
    slapTimer: null,
    slapPos: { x: 0, y: 0 },
    cheatMode: false,
    wallHitCount: { left: 0, right: 0, lastTime: 0 },
    holeDug: false,
    blocksFalling: false
  };

  const tetrominos = {
    I: { shape: [[1, 1, 1, 1]], color: "#00f0f0" },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#0000f0" },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#f0a000" },
    O: { shape: [[1, 1], [1, 1]], color: "#f0f000" },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#00f000" },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#a000f0" },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#f00000" }
  };

  function randomTetromino() {
    const keys = Object.keys(tetrominos);
    return tetrominos[keys[Math.floor(Math.random() * keys.length)]];
  }

  function createEmptyGrid() {
    return Array.from({ length: tetris.rows }, function () {
      return Array(tetris.cols).fill(null);
    });
  }

  function cloneShape(shape) {
    return shape.map(function (row) {
      return row.slice();
    });
  }

  function resetShapeSorter() {
    shapeState.bottles = shapes.map(function (shape) {
      return { id: "bottle-" + shape, shape: shape, broken: false, placedIn: null };
    });

    shapeState.blocks = [
      { id: "wood-square", shape: "square", material: "wood", state: "normal", placedIn: null, clicks: 0 },
      { id: "wood-triangle", shape: "triangle", material: "wood", state: "normal", placedIn: null, clicks: 0 },
      { id: "wood-circle", shape: "circle", material: "wood", state: "normal", placedIn: null, clicks: 0 },
      { id: "wood-star", shape: "star", material: "wood", state: "normal", placedIn: null, clicks: 0 },
      { id: "rock-circle", shape: "circle", material: "rock", state: "normal", placedIn: null, clicks: 0 },
      { id: "sponge-square", shape: "square", material: "sponge", state: "normal", placedIn: null, clicks: 0 },
      { id: "glass-triangle", shape: "triangle", material: "glass", state: "normal", placedIn: null, clicks: 0 },
      { id: "acrylic-star", shape: "star", material: "acrylic", state: "normal", placedIn: null, clicks: 0 },
      { id: "rubber-square", shape: "square", material: "rubber", state: "normal", placedIn: null, clicks: 0 }
    ];

    shapeState.message = "Match the shapes...";
  }

  function resetCrowGame() {
    crowState.stones = Array.from({ length: 10 }, function (_, index) {
      return { id: "stone-" + index, dropped: false };
    });
    crowState.waterLevel = 30;
    crowState.message = "You are thirsty need water now";
    crowState.drank = false;
  }

  function resetRrhGame() {
    rrhState.introOpen = true;
    rrhState.introFinished = false;
    rrhState.forestRevealed = false;
    rrhState.wolves = { top: true, bottom: true };
    rrhState.result = "";
    rrhState.locking = false;
  }

  function resetCheeseGame() {
    cheeseState.phase = "init";
    cheeseState.order = [0, 1, 2];
    cheeseState.cheeseEggId = 1;
    cheeseState.message = "Let's play a game...";
    cheeseState.win = null;
    cheeseState.sniffing = false;
    cheeseState.guessReady = false;
  }

  function resetTetris() {
    clearInterval(tetris.dropTimer);
    clearInterval(tetris.speedTimer);
    clearTimeout(tetris.slapTimer);
    tetris.grid = createEmptyGrid();
    tetris.activePiece = { pos: { x: 3, y: 0 }, tetromino: randomTetromino() };
    tetris.dropTime = 1000;
    tetris.startTime = Date.now();
    tetris.gameOver = false;
    tetris.score = 0;
    tetris.speedLevel = 1;
    tetris.chargingSlap = false;
    tetris.slapVisible = false;
    tetris.cheatMode = false;
    tetris.wallHitCount = { left: 0, right: 0, lastTime: 0 };
    tetris.holeDug = false;
    tetris.blocksFalling = false;
    startDropLoop();
  }

  function initGameIfNeeded(route) {
    if (route === "shape-sorter" && !shapeState.bottles.length) resetShapeSorter();
    if (route === "crow-pitcher" && !crowState.stones.length) resetCrowGame();
    if (route === "red-riding-hood" && rrhState.introOpen === undefined) resetRrhGame();
    if (route === "cheese-shell" && cheeseState.phase === undefined) resetCheeseGame();
    if (route === "panic-tetris" && !tetris.grid.length) resetTetris();
  }

  function route() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    return hash || "home";
  }

  function setRoute(next) {
    window.location.hash = next === "home" ? "#/" : "#/" + next;
  }

  function render() {
    const current = route();
    initGameIfNeeded(current);
    clearNonRouteTimers(current);

    const body = current === "home" ? renderHome() : renderGame(current);
    app.innerHTML =
      '<div class="app-shell">' +
      '<header class="site-header">' +
      '<a class="logo" href="#/">M³. HAHAHA</a>' +
      "</header>" +
      body +
      "</div>";

    bindCommonEvents();

    if (current === "shape-sorter") bindShapeSorter();
    if (current === "crow-pitcher") bindCrowGame();
    if (current === "red-riding-hood") bindRrhGame();
    if (current === "cheese-shell") bindCheeseGame();
    if (current === "panic-tetris") bindTetrisGame();
  }

  function clearNonRouteTimers(current) {
    if (current !== "panic-tetris") {
      clearInterval(tetris.dropTimer);
      clearInterval(tetris.speedTimer);
      clearTimeout(tetris.slapTimer);
    } else if (!tetris.dropTimer && tetris.grid.length) {
      startDropLoop();
    }
  }

  function renderHome() {
    return (
      '<main class="page"><section class="home-page">' +
      '<h1 class="home-title">M³. HAHAHA</h1>' +
      '<p class="home-subtitle">Grab a flying game to play!</p>' +
      '<div class="game-grid">' +
      games.map(function (game) {
        return (
          '<a class="game-card" href="#/' +
          game.id +
          '" style="background:' +
          game.color +
          ';">' +
          '<div class="game-emoji">' +
          game.emoji +
          "</div>" +
          '<h2 class="game-title">' +
          game.title +
          "</h2>" +
          '<p class="game-desc">' +
          game.description +
          "</p>" +
          "</a>"
        );
      }).join("") +
      "</div></section></main>"
    );
  }

  function renderGame(id) {
    if (id === "shape-sorter") return renderShapeSorter();
    if (id === "crow-pitcher") return renderCrowGame();
    if (id === "red-riding-hood") return renderRrhGame();
    if (id === "cheese-shell") return renderCheeseGame();
    if (id === "panic-tetris") return renderTetrisGame();
    return renderHome();
  }

  function bindCommonEvents() {
    const resets = app.querySelectorAll("[data-reset]");
    resets.forEach(function (button) {
      button.addEventListener("click", function () {
        const game = button.getAttribute("data-reset");
        if (game === "shape-sorter") resetShapeSorter();
        if (game === "crow-pitcher") resetCrowGame();
        if (game === "red-riding-hood") resetRrhGame();
        if (game === "cheese-shell") resetCheeseGame();
        if (game === "panic-tetris") resetTetris();
        render();
      });
    });
  }

  function renderShapeSorter() {
    const visibleBottles = shapeState.bottles.filter(function (bottle) {
      return !bottle.placedIn;
    });
    const freeBlocks = shapeState.blocks.filter(function (block) {
      return !block.placedIn;
    });

    return (
      '<main class="page game-page">' +
      '<section class="game-stage shape-sorter">' +
      '<a class="back-link" href="#/">🏠 Home</a>' +
      '<button class="control-btn" style="position:absolute;top:1rem;right:1rem;z-index:30;" data-reset="shape-sorter">Reset</button>' +
      '<div class="shape-sun" data-sun="true">☀️</div>' +
      '<div class="message-board">' +
      shapeState.message +
      "</div>" +
      '<div class="bottles-area">' +
      visibleBottles.map(function (bottle) {
        const placedBlocks = shapeState.blocks.filter(function (block) {
          return block.placedIn === bottle.id;
        });
        const placedBottles = shapeState.bottles.filter(function (nestedBottle) {
          return nestedBottle.placedIn === bottle.id;
        });

        return (
          '<button class="bottle ' +
          (bottle.broken ? "broken" : "") +
          '" data-bottle-id="' +
          bottle.id +
          '">' +
          '<div class="bottle-hole">' +
          renderShapeSvg(bottle.shape, "bottle", "normal", "shape-svg") +
          "</div>" +
          '<div class="placed-stack">' +
          placedBlocks.map(function (block) {
            return (
              '<div class="mini-block ' +
              block.state +
              '">' +
              renderShapeSvg(block.shape, block.material, block.state, "shape-svg") +
              "</div>"
            );
          }).join("") +
          placedBottles.map(function (nestedBottle) {
            return '<div class="mini-bottle">' + renderShapeSvg(nestedBottle.shape, "bottle", "normal", "shape-svg") + "</div>";
          }).join("") +
          "</div>" +
          '<div class="bottle-label">' +
          bottle.shape +
          "</div>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<div class="blocks-area">' +
      freeBlocks.map(function (block) {
        return (
          '<button class="shape-item" data-block-id="' +
          block.id +
          '">' +
          renderShapeSvg(block.shape, block.material, block.state, "shape-svg") +
          '<div class="shape-hint">' +
          block.material +
          " " +
          block.shape +
          "</div>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      "</section></main>"
    );
  }

  function bindShapeSorter() {
    const blockButtons = app.querySelectorAll("[data-block-id]");
    const bottleButtons = app.querySelectorAll("[data-bottle-id]");
    const sun = app.querySelector("[data-sun]");
    let selectedBlockId = null;

    blockButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const blockId = button.getAttribute("data-block-id");
        const block = findShapeBlock(blockId);
        if (!block) return;

        if (selectedBlockId === blockId) {
          selectedBlockId = null;
          handleShapeBlockClick(blockId);
        } else {
          selectedBlockId = blockId;
          shapeState.message = "Selected " + block.material + " " + block.shape + ". Click a bottle or the sun.";
          render();
        }
      });
    });

    bottleButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const bottleId = button.getAttribute("data-bottle-id");
        if (!selectedBlockId) {
          const bottle = shapeState.bottles.find(function (item) {
            return item.id === bottleId;
          });
          if (bottle && bottle.broken) {
            shapeState.message = "Broken bottles can go into another bottle. Select another bottle to nest it? Not today. This version auto-nests after breaking.";
            render();
          }
          return;
        }
        placeBlockIntoBottle(selectedBlockId, bottleId);
        selectedBlockId = null;
        render();
      });
    });

    if (sun) {
      sun.addEventListener("click", function () {
        if (!selectedBlockId) {
          shapeState.message = "Pick acrylic or rubber first, then tap the sun.";
          render();
          return;
        }
        meltBlock(selectedBlockId);
        selectedBlockId = null;
        render();
      });
    }
  }

  function findShapeBlock(blockId) {
    return shapeState.blocks.find(function (block) {
      return block.id === blockId;
    });
  }

  function handleShapeBlockClick(blockId) {
    shapeState.blocks = shapeState.blocks.map(function (block) {
      if (block.id !== blockId || block.placedIn) return block;
      const clicks = block.clicks + 1;
      let state = block.state;
      if (block.material === "sponge" && clicks >= 3) state = "squished";
      if (block.material === "glass" && clicks >= 3) state = "broken";
      if (block.material === "rubber" && clicks >= 5) state = "squished";
      if (state !== block.state) shapeState.message = "The " + block.material + " got " + state + "!";
      else shapeState.message = "Still poking the " + block.material + "...";
      return { id: block.id, shape: block.shape, material: block.material, state: state, placedIn: block.placedIn, clicks: clicks };
    });
  }

  function meltBlock(blockId) {
    shapeState.blocks = shapeState.blocks.map(function (block) {
      if (block.id !== blockId) return block;
      if ((block.material === "acrylic" || block.material === "rubber") && block.state === "normal") {
        shapeState.message = block.material + " melted in the heat! It can now fit anywhere.";
        return { id: block.id, shape: block.shape, material: block.material, state: "melted", placedIn: block.placedIn, clicks: block.clicks };
      }
      shapeState.message = "That one does not care about the sun.";
      return block;
    });
  }

  function placeBlockIntoBottle(blockId, bottleId) {
    const block = findShapeBlock(blockId);
    const bottle = shapeState.bottles.find(function (item) {
      return item.id === bottleId;
    });
    if (!block || !bottle) return;

    if (block.material === "rock") {
      shapeState.bottles = shapeState.bottles.map(function (item) {
        return item.id === bottleId ? { id: item.id, shape: item.shape, broken: true, placedIn: item.placedIn } : item;
      });

      const brokenBottle = shapeState.bottles.find(function (item) {
        return item.id === bottleId;
      });

      const targetBottle = shapeState.bottles.find(function (item) {
        return item.id !== bottleId && !item.placedIn;
      });

      if (brokenBottle && targetBottle) {
        brokenBottle.placedIn = targetBottle.id;
        shapeState.message = "Stupid rock broke the bottle. Bottleception unlocked.";
      } else {
        shapeState.message = "Stupid rock broke the bottle! Anything goes in now.";
      }
      return;
    }

    const canFit =
      bottle.broken ||
      block.state === "squished" ||
      block.state === "broken" ||
      block.state === "melted" ||
      block.shape === bottle.shape;

    if (!canFit) {
      shapeState.message = "Doesn't fit. Try something else.";
      return;
    }

    shapeState.blocks = shapeState.blocks.map(function (item) {
      return item.id === blockId
        ? { id: item.id, shape: item.shape, material: item.material, state: item.state, placedIn: bottleId, clicks: item.clicks }
        : item;
    });
    shapeState.message = block.shape === bottle.shape && !bottle.broken ? "Perfect fit." : "Well, it fits now.";
  }

  function renderCrowGame() {
    const droppedStones = crowState.stones.filter(function (stone) {
      return stone.dropped;
    });

    return (
      '<main class="page game-page"><section class="game-stage crow-game">' +
      '<a class="back-link" href="#/">🏠 Home</a>' +
      '<button class="control-btn" style="position:absolute;top:1rem;right:1rem;z-index:30;" data-reset="crow-pitcher">Reset</button>' +
      '<div class="message-board">' +
      crowState.message +
      "</div>" +
      '<div class="scene-area">' +
      '<div class="crow">🐦‍⬛</div>' +
      '<div class="pitcher">' +
      '<div class="pitcher-opening"></div>' +
      '<div class="pitcher-body">' +
      '<div class="water" style="height:' +
      crowState.waterLevel +
      '%;"></div>' +
      '<div class="pitcher-stones">' +
      droppedStones.map(function (_, index) {
        return '<div class="dropped-stone" style="bottom:' + Math.floor(index / 3) * 16 + "px;left:" + (12 + (index % 3) * 22) + '%;">🪨</div>';
      }).join("") +
      "</div></div></div></div>" +
      '<div class="stones-area">' +
      crowState.stones.filter(function (stone) {
        return !stone.dropped;
      }).map(function (stone) {
        return '<button class="stone" data-stone-id="' + stone.id + '">🪨</button>';
      }).join("") +
      "</div>" +
      "</section></main>"
    );
  }

  function bindCrowGame() {
    const stones = app.querySelectorAll("[data-stone-id]");
    stones.forEach(function (stone) {
      stone.addEventListener("click", function () {
        const stoneId = stone.getAttribute("data-stone-id");
        crowState.stones = crowState.stones.map(function (item) {
          return item.id === stoneId ? { id: item.id, dropped: true } : item;
        });
        crowState.waterLevel = Math.min(100, crowState.waterLevel + 15);
        if (!crowState.drank && crowState.waterLevel >= 90) {
          crowState.drank = true;
          crowState.message = "The crow drank the water! But wait... aren't you human?";
        } else if (!crowState.drank) {
          crowState.message = "The water level rises... Caw!";
        } else {
          crowState.waterLevel = Math.max(0, crowState.waterLevel - 10);
          crowState.message = "Glug glug... We are human! We can just drink it!";
        }
        render();
      });
    });

    const pitcher = app.querySelector(".pitcher");
    if (pitcher) {
      pitcher.addEventListener("click", function () {
        if (crowState.waterLevel > 0) {
          crowState.drank = true;
          crowState.waterLevel = Math.max(0, crowState.waterLevel - 10);
          crowState.message = "Glug glug... We are human! We can just drink it!";
          render();
        }
      });
    }
  }

  function renderRrhGame() {
    return (
      '<main class="page game-page" style="padding:0;">' +
      '<section class="game-stage rrh-game">' +
      '<a class="back-link" href="#/">🏠 Home</a>' +
      '<button class="control-btn" style="position:absolute;top:1rem;right:1rem;z-index:90;" data-reset="red-riding-hood">Reset</button>' +
      (rrhState.result ? '<div class="rrh-result-banner">' + rrhState.result + "</div>" : "") +
      '<div class="rrh-board">' +
      (rrhState.introOpen
        ? '<div class="phone-overlay"><div class="dialog">👩 Grandma has no mushrooms, send some to Grandma\'s house!<button class="game-button" data-rrh-intro="close">OK</button></div></div>'
        : "") +
      '<div class="rrh-pond">' +
      '<div class="fish one">🐟</div><div class="fish two">🐟</div><div class="fish three">🐟</div>' +
      "</div>" +
      '<div class="rrh-house red">🏠</div>' +
      '<div class="phone-wrapper vibrate ' + (rrhState.introFinished ? "active" : "") + '"><button class="phone" data-rrh-action="phone">📱</button></div>' +
      '<button class="rrh-character red" data-rrh-action="red">👧</button>' +
      '<div class="rrh-road top"><button class="rrh-forest ' + (rrhState.forestRevealed ? "revealed" : "") + '" data-rrh-action="forest"><span class="rrh-tree">🌲</span><span class="rrh-tree">🌲</span><span class="rrh-tree">🌲</span><span class="hidden-mushroom">🍄</span></button>' +
      (rrhState.wolves.top ? '<div class="rrh-wolf">🐺</div>' : "") +
      "</div>" +
      '<div class="rrh-road bottom">' +
      (rrhState.wolves.bottom ? '<div class="rrh-wolf">🐺</div>' : "") +
      "</div>" +
      '<div class="rrh-house grandma">🏡</div>' +
      '<button class="rrh-character grandma" data-rrh-action="grandma">👵</button>' +
      "</div></section></main>"
    );
  }

  function bindRrhGame() {
    const introClose = app.querySelector("[data-rrh-intro='close']");
    const redBtn = app.querySelector("[data-rrh-action='red']");
    const forestBtn = app.querySelector("[data-rrh-action='forest']");
    const phoneBtn = app.querySelector("[data-rrh-action='phone']");
    const grandmaBtn = app.querySelector("[data-rrh-action='grandma']");
    const board = app.querySelector(".rrh-board");

    if (introClose) {
      introClose.addEventListener("click", function () {
        rrhState.introOpen = false;
        rrhState.introFinished = true;
        render();
      });
    }

    if (phoneBtn) {
      phoneBtn.addEventListener("click", function () {
        if (!rrhState.introFinished || rrhState.locking) return;
        rrhState.locking = true;
        rrhState.result = "";
        render();
        setTimeout(function () {
          if (!board) return;
          const rider = document.createElement("div");
          rider.className = "rrh-animated";
          rider.textContent = "🛵";
          rider.style.left = "8%";
          rider.style.top = "50%";
          board.appendChild(rider);
          requestAnimationFrame(function () {
            rider.style.left = "82%";
            rider.style.top = "50%";
          });
          setTimeout(function () {
            rrhState.result = "Grandma has plenty of mushrooms now!";
            rrhState.locking = false;
            render();
          }, 4100);
        }, 0);
      });
    }

    if (forestBtn) {
      forestBtn.addEventListener("click", function () {
        if (!rrhState.introFinished || rrhState.locking || rrhState.forestRevealed) return;
        rrhState.forestRevealed = true;
        rrhState.locking = true;
        render();
        setTimeout(function () {
          if (!board) return;
          const squad = document.createElement("div");
          squad.className = "rrh-animated";
          squad.style.left = "28%";
          squad.style.top = "28%";
          squad.style.fontSize = "3rem";
          squad.textContent = "🍄🍄🍄🍄🍄";
          board.appendChild(squad);
          requestAnimationFrame(function () {
            squad.style.left = "73%";
            squad.style.top = "46%";
          });
          setTimeout(function () {
            rrhState.result = "Grandma has plenty of mushrooms now!";
            rrhState.locking = false;
            render();
          }, 4100);
        }, 100);
      });
    }

    if (redBtn) {
      redBtn.addEventListener("click", function () {
        if (!rrhState.introFinished || rrhState.locking) return;
        if (rrhState.wolves.top || rrhState.wolves.bottom) {
          rrhState.result = "Oh no! The wolves got you. 🐺";
        } else {
          rrhState.result = "✈️ Fish airline accepted the shortcut. Grandma wins.";
        }
        render();
      });
    }

    if (grandmaBtn) {
      grandmaBtn.addEventListener("click", function () {
        if (!rrhState.introFinished || rrhState.locking) return;
        if (rrhState.wolves.top || rrhState.wolves.bottom) {
          rrhState.wolves = { top: false, bottom: false };
          rrhState.result = "👵🔫 Grandma removed the wolves. Try Little Red again.";
        } else {
          rrhState.result = "Grandma walked over herself. Honestly iconic.";
        }
        render();
      });
    }
  }

  function renderCheeseGame() {
    return (
      '<main class="page game-page"><section class="game-stage cheese-game">' +
      '<a class="back-link" href="#/">🏠 Home</a>' +
      '<button class="control-btn" style="position:absolute;top:1rem;right:1rem;z-index:30;" data-reset="cheese-shell">Reset</button>' +
      '<div class="message-board">' +
      cheeseState.message +
      "</div>" +
      '<div class="mouse-area"><div class="cute-mouse">' + renderMouseSvg() + "</div></div>" +
      '<div class="sniff-meter">' +
      (cheeseState.sniffing ? "The mouse smells something..." : "&nbsp;") +
      "</div>" +
      '<div class="table-line"></div>' +
      '<div class="eggs-area">' +
      cheeseState.order.map(function (eggId) {
        const open = (cheeseState.phase === "showing" && eggId === cheeseState.cheeseEggId) || cheeseState.phase === "finished";
        const showCheese = open && eggId === cheeseState.cheeseEggId;
        return (
          '<button class="egg ' +
          (open ? "open " : "") +
          (showCheese ? "show-cheese" : "") +
          '" data-egg-id="' +
          eggId +
          '">' +
          '<div class="cheese-piece">' + renderCheeseSvg() + "</div>" +
          '<div class="egg-bottom"></div>' +
          '<div class="egg-top"></div>' +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<button class="start-btn" data-cheese-start="true">' +
      (cheeseState.phase === "init" ? "Start Game" : cheeseState.phase === "finished" ? "Play Again" : "Sniff" ) +
      "</button>" +
      "</section></main>"
    );
  }

  function bindCheeseGame() {
    const eggs = app.querySelectorAll("[data-egg-id]");
    const startBtn = app.querySelector("[data-cheese-start='true']");

    eggs.forEach(function (egg) {
      egg.addEventListener("click", function () {
        if (cheeseState.phase !== "guessing") return;
        const eggId = Number(egg.getAttribute("data-egg-id"));
        cheeseState.phase = "finished";
        cheeseState.win = eggId === cheeseState.cheeseEggId;
        cheeseState.message = cheeseState.win ? "You found it! (Or did the mouse help?)" : "Oops! Wrong egg. Try again.";
        render();
      });

      egg.addEventListener("mouseenter", function () {
        if (cheeseState.phase !== "guessing") return;
        const eggId = Number(egg.getAttribute("data-egg-id"));
        cheeseState.sniffing = eggId === cheeseState.cheeseEggId;
        render();
      });
    });

    if (startBtn) {
      startBtn.addEventListener("click", function () {
        if (cheeseState.phase === "init" || cheeseState.phase === "finished") {
          startCheeseGame();
          return;
        }
        if (cheeseState.phase === "guessing") {
          cheeseState.sniffing = true;
          cheeseState.message = "The mouse is giving you a very suspicious hint...";
          render();
          setTimeout(function () {
            cheeseState.sniffing = false;
            render();
          }, 800);
        }
      });
    }
  }

  function startCheeseGame() {
    cheeseState.cheeseEggId = Math.floor(Math.random() * 3);
    cheeseState.order = [0, 1, 2];
    cheeseState.phase = "showing";
    cheeseState.message = "Keep your eye on the cheese!";
    cheeseState.win = null;
    cheeseState.sniffing = false;
    render();

    setTimeout(function () {
      cheeseState.phase = "shuffling";
      cheeseState.message = "Shuffling...";
      render();

      let count = 0;
      const shuffler = setInterval(function () {
        const temp = cheeseState.order.slice();
        const first = Math.floor(Math.random() * 3);
        let second = Math.floor(Math.random() * 3);
        while (first === second) second = Math.floor(Math.random() * 3);
        const swap = temp[first];
        temp[first] = temp[second];
        temp[second] = swap;
        cheeseState.order = temp;
        render();
        count += 1;

        if (count >= 8) {
          clearInterval(shuffler);
          cheeseState.phase = "guessing";
          cheeseState.message = "Which egg has the cheese?";
          render();
        }
      }, 350);
    }, 1800);
  }

  function renderTetrisGame() {
    const cells = [];
    for (let y = 0; y < tetris.rows; y += 1) {
      for (let x = 0; x < tetris.cols; x += 1) {
        const cell = tetris.grid[y][x];
        cells.push(
          '<div class="cell" style="background:' +
            (cell || "rgba(255, 255, 255, 0.05)") +
            ";box-shadow:" +
            (cell ? "inset 0 0 10px rgba(0,0,0,0.5)" : "none") +
            ';"></div>'
        );
      }
    }

    const activeCells = [];
    if (tetris.activePiece) {
      tetris.activePiece.tetromino.shape.forEach(function (row, y) {
        row.forEach(function (value, x) {
          if (!value) return;
          const gx = tetris.activePiece.pos.x + x;
          const gy = tetris.activePiece.pos.y + y;
          activeCells.push(
            '<div class="active-cell" style="left:' +
              gx * 30 +
              "px;top:" +
              gy * 30 +
              "px;background:" +
              tetris.activePiece.tetromino.color +
              ';"></div>'
          );
        });
      });
    }

    return (
      '<main class="page game-page"><section class="game-stage tetris-game">' +
      '<a class="back-link" href="#/">🏠 Home</a>' +
      '<div class="tetris-wrap">' +
      '<div class="tetris-hud">' +
      '<div class="hud-left"><button class="shovel-logo" data-tetris-action="shovel">🪏</button><div class="stat-box">Score: ' + tetris.score + '</div><div class="stat-box">Speed: ' + tetris.speedLevel + "</div></div>" +
      '<div class="hud-right"><button class="control-btn" data-tetris-action="reset">Reset</button></div>' +
      "</div>" +
      '<div class="tetris-board-wrap">' +
      (tetris.gameOver ? '<div class="game-over">GAME OVER! (Wait, just slap it away?)</div>' : "") +
      '<div class="tetris-board" tabindex="0" data-tetris-board="true">' +
      cells.join("") +
      activeCells.join("") +
      (tetris.chargingSlap
        ? '<div class="charge-indicator" style="left:' + tetris.slapPos.x + "px;top:" + tetris.slapPos.y + 'px;"></div>'
        : "") +
      (tetris.slapVisible
        ? '<div class="slap-hand play" style="left:' + tetris.slapPos.x + "px;top:" + tetris.slapPos.y + 'px;">🖐️</div>'
        : "") +
      (tetris.cheatMode ? '<div class="cheat-indicator">WALL HACK ACTIVE</div>' : "") +
      (tetris.holeDug ? '<div class="giant-hole">🕳️</div>' : "") +
      "</div></div>" +
      '<div class="mobile-controls">' +
      '<button class="control-btn" data-tetris-move="-1">←</button>' +
      '<button class="control-btn" data-tetris-rotate="true">⟳</button>' +
      '<button class="control-btn" data-tetris-move="1">→</button>' +
      '<button class="control-btn" data-tetris-drop="true">↓</button>' +
      "</div></div></section></main>"
    );
  }

  function bindTetrisGame() {
    const board = app.querySelector("[data-tetris-board='true']");
    const resetBtn = app.querySelector("[data-tetris-action='reset']");
    const shovelBtn = app.querySelector("[data-tetris-action='shovel']");
    const moveButtons = app.querySelectorAll("[data-tetris-move]");
    const rotateBtn = app.querySelector("[data-tetris-rotate='true']");
    const dropBtn = app.querySelector("[data-tetris-drop='true']");

    if (board) {
      board.focus();
      board.addEventListener("mousedown", function (event) {
        const rect = board.getBoundingClientRect();
        tetris.slapPos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        tetris.chargingSlap = true;
        clearTimeout(tetris.slapTimer);
        tetris.slapTimer = setTimeout(function () {
          tetris.chargingSlap = false;
          tetris.slapVisible = true;
          tetris.grid = createEmptyGrid();
          tetris.gameOver = false;
          render();
          setTimeout(function () {
            tetris.slapVisible = false;
            render();
          }, 180);
        }, 500);
        render();
      });

      ["mouseup", "mouseleave"].forEach(function (type) {
        board.addEventListener(type, function () {
          tetris.chargingSlap = false;
          clearTimeout(tetris.slapTimer);
          render();
        });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        resetTetris();
        render();
      });
    }

    if (shovelBtn) {
      shovelBtn.addEventListener("click", function () {
        tetris.holeDug = true;
        tetris.blocksFalling = true;
        clearInterval(tetris.dropTimer);
        render();
        setTimeout(function () {
          tetris.grid = createEmptyGrid();
          tetris.holeDug = false;
          tetris.blocksFalling = false;
          startDropLoop();
          render();
        }, 1200);
      });
    }

    moveButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        movePiece(Number(button.getAttribute("data-tetris-move")));
      });
    });

    if (rotateBtn) rotateBtn.addEventListener("click", rotatePiece);
    if (dropBtn) dropBtn.addEventListener("click", dropPiece);
  }

  function checkCollision(piece, moveX, moveY, newShape) {
    const shape = newShape || piece.tetromino.shape;
    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (!shape[y][x]) continue;
        const newX = piece.pos.x + x + moveX;
        const newY = piece.pos.y + y + moveY;
        if (newY >= tetris.rows) return true;
        if (!tetris.cheatMode && (newX < 0 || newX >= tetris.cols)) return true;
        if (newY >= 0 && tetris.grid[newY] && tetris.grid[newY][newX]) return true;
      }
    }
    return false;
  }

  function movePiece(direction) {
    if (tetris.gameOver || tetris.blocksFalling) return;
    if (!checkCollision(tetris.activePiece, direction, 0)) {
      tetris.activePiece.pos.x += direction;
      tetris.wallHitCount = { left: 0, right: 0, lastTime: 0 };
      render();
      return;
    }

    const now = Date.now();
    if (now - tetris.wallHitCount.lastTime < 500) {
      if (direction === -1) tetris.wallHitCount.left += 1;
      if (direction === 1) tetris.wallHitCount.right += 1;
    } else {
      tetris.wallHitCount.left = direction === -1 ? 1 : 0;
      tetris.wallHitCount.right = direction === 1 ? 1 : 0;
    }

    tetris.wallHitCount.lastTime = now;
    if (tetris.wallHitCount.left >= 3 || tetris.wallHitCount.right >= 3) {
      tetris.cheatMode = true;
      tetris.activePiece.pos.x += direction;
    }
    render();
  }

  function rotatePiece() {
    if (tetris.gameOver || tetris.blocksFalling) return;
    const currentShape = tetris.activePiece.tetromino.shape;
    const rotated = currentShape[0].map(function (_, index) {
      return currentShape.map(function (row) {
        return row[index];
      }).reverse();
    });
    if (!checkCollision(tetris.activePiece, 0, 0, rotated)) {
      tetris.activePiece.tetromino.shape = rotated;
      render();
    }
  }

  function mergeActivePiece() {
    tetris.activePiece.tetromino.shape.forEach(function (row, y) {
      row.forEach(function (value, x) {
        if (!value) return;
        const gy = tetris.activePiece.pos.y + y;
        const gx = tetris.activePiece.pos.x + x;
        if (gy >= 0 && gy < tetris.rows && gx >= 0 && gx < tetris.cols) {
          tetris.grid[gy][gx] = tetris.activePiece.tetromino.color;
        }
      });
    });

    const filtered = tetris.grid.filter(function (row) {
      return row.some(function (cell) {
        return cell === null;
      });
    });

    const cleared = tetris.rows - filtered.length;
    if (cleared > 0) {
      tetris.score += cleared * 100;
      const newRows = Array.from({ length: cleared }, function () {
        return Array(tetris.cols).fill(null);
      });
      tetris.grid = newRows.concat(filtered);
    }
  }

  function dropPiece() {
    if (tetris.gameOver || tetris.blocksFalling) return;
    if (!checkCollision(tetris.activePiece, 0, 1)) {
      tetris.activePiece.pos.y += 1;
      render();
      return;
    }

    if (tetris.activePiece.pos.y < 1) {
      tetris.gameOver = true;
      clearInterval(tetris.dropTimer);
      render();
      return;
    }

    mergeActivePiece();
    tetris.activePiece = { pos: { x: 3, y: 0 }, tetromino: randomTetromino() };
    render();
  }

  function startDropLoop() {
    clearInterval(tetris.dropTimer);
    clearInterval(tetris.speedTimer);
    tetris.dropTimer = setInterval(dropPiece, tetris.dropTime);
    tetris.speedTimer = setInterval(function () {
      const elapsed = (Date.now() - tetris.startTime) / 1000;
      const newSpeed = Math.floor(elapsed / 15) + 1;
      if (newSpeed !== tetris.speedLevel) {
        tetris.speedLevel = newSpeed;
        tetris.dropTime = Math.max(100, 1000 - (newSpeed - 1) * 150);
        startDropLoop();
        render();
      }
    }, 1000);
  }

  function handleKeydown(event) {
    if (route() !== "panic-tetris") return;
    if (event.key === "ArrowLeft") movePiece(-1);
    if (event.key === "ArrowRight") movePiece(1);
    if (event.key === "ArrowDown") dropPiece();
    if (event.key === "ArrowUp") rotatePiece();
  }

  function renderShapeSvg(shape, material, state, className) {
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
        ? '<rect x="15" y="15" width="70" height="70" rx="20" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"></rect>'
        : shape === "circle"
        ? '<circle cx="50" cy="50" r="38" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '"></circle>'
        : shape === "triangle"
        ? '<polygon points="50,15 85,82 15,82" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-linejoin="round"></polygon>'
        : '<polygon points="50,12 61,38 90,38 66,54 75,85 50,66 25,85 34,54 10,38 39,38" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-linejoin="round"></polygon>';

    const textures =
      material === "sponge"
        ? '<g fill="#ecc94b"><circle cx="30" cy="30" r="6"></circle><circle cx="70" cy="35" r="8"></circle><circle cx="45" cy="75" r="5"></circle><circle cx="75" cy="65" r="4"></circle><circle cx="20" cy="60" r="5"></circle></g>'
        : material === "wood"
        ? '<g stroke="#d69e2e" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.3"><path d="M 25 30 Q 50 20 75 35"></path><path d="M 20 50 Q 50 40 80 55"></path><path d="M 25 70 Q 50 60 75 75"></path></g>'
        : material === "rock"
        ? '<g fill="#a0aec0" opacity="0.3"><polygon points="25,30 35,25 30,40"></polygon><polygon points="70,60 80,65 75,50"></polygon><polygon points="65,25 75,30 60,35"></polygon></g>'
        : "";

    const shine =
      (material === "glass" || material === "acrylic") && state !== "broken"
        ? '<path d="M 25 40 Q 30 25 45 25" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.9"></path>'
        : "";

    const broken =
      material === "glass" && state === "broken"
        ? '<g stroke="#ffffff" stroke-width="3" stroke-linecap="round"><path d="M 50 20 L 45 50 L 70 70 L 45 80" fill="none"></path><path d="M 45 50 L 20 40" fill="none"></path><path d="M 70 70 L 80 50" fill="none"></path></g>'
        : "";

    return (
      '<svg class="' +
      className +
      '" viewBox="0 0 100 100" style="opacity:' +
      opacity +
      ';">' +
      '<defs>' +
      '<radialGradient id="glass-grad" cx="40%" cy="40%" r="60%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"></stop>' +
      '<stop offset="60%" stop-color="#c1efff" stop-opacity="0.7"></stop>' +
      '<stop offset="100%" stop-color="#90cdf4" stop-opacity="0.9"></stop>' +
      "</radialGradient>" +
      '<radialGradient id="acrylic-grad" cx="30%" cy="30%" r="70%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"></stop>' +
      '<stop offset="30%" stop-color="#fbb6ce" stop-opacity="0.9"></stop>' +
      '<stop offset="100%" stop-color="#ed64a6" stop-opacity="0.8"></stop>' +
      "</radialGradient>" +
      "</defs>" +
      shapeMarkup +
      textures +
      shine +
      broken +
      "</svg>"
    );
  }

  function renderCheeseSvg() {
    return (
      '<svg width="80" height="60" viewBox="0 0 60 50" style="overflow:visible;">' +
      '<path d="M 5 40 L 55 40 L 30 5 Z" fill="#f6e05e" stroke="#d69e2e" stroke-width="4" stroke-linejoin="round"></path>' +
      '<circle cx="20" cy="30" r="5" fill="#d69e2e" opacity="0.6"></circle>' +
      '<circle cx="45" cy="32" r="4" fill="#d69e2e" opacity="0.6"></circle>' +
      '<circle cx="30" cy="20" r="3" fill="#d69e2e" opacity="0.6"></circle>' +
      '<circle cx="35" cy="35" r="3.5" fill="#d69e2e" opacity="0.6"></circle>' +
      "</svg>"
    );
  }

  function renderMouseSvg() {
    return (
      '<svg width="100" height="80" viewBox="0 0 100 80" style="overflow:visible;">' +
      '<g transform="translate(10, 20)">' +
      '<path d="M 20 40 Q 0 40 5 25 Q 10 10 -5 15" stroke="#a0aec0" stroke-width="4" fill="none" stroke-linecap="round"></path>' +
      '<circle cx="25" cy="15" r="12" fill="#cbd5e0" stroke="#a0aec0" stroke-width="3"></circle>' +
      '<circle cx="25" cy="15" r="6" fill="#fbb6ce"></circle>' +
      '<circle cx="55" cy="15" r="12" fill="#cbd5e0" stroke="#a0aec0" stroke-width="3"></circle>' +
      '<circle cx="55" cy="15" r="6" fill="#fbb6ce"></circle>' +
      '<path d="M 15 45 Q 15 25 40 25 Q 70 25 80 45 Z" fill="#cbd5e0" stroke="#a0aec0" stroke-width="3"></path>' +
      '<circle cx="45" cy="32" r="2.5" fill="#4a5568"></circle>' +
      '<circle cx="60" cy="32" r="2.5" fill="#4a5568"></circle>' +
      '<circle cx="80" cy="45" r="4" fill="#4a5568"></circle>' +
      '<path d="M 65 40 L 85 35 M 65 43 L 88 43 M 65 46 L 85 53" stroke="#4a5568" stroke-width="2" stroke-linecap="round"></path>' +
      (cheeseState.sniffing
        ? '<g><path d="M 50 15 L 45 5 L 55 5 Z" fill="#f56565"></path><circle cx="50" cy="20" r="2.5" fill="#f56565"></circle></g>'
        : "") +
      "</g>" +
      "</svg>"
    );
  }

  resetShapeSorter();
  resetCrowGame();
  resetRrhGame();
  resetCheeseGame();
  resetTetris();

  window.addEventListener("hashchange", render);
  window.addEventListener("keydown", handleKeydown);
  render();
})();
