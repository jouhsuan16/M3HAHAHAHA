// Game Logic and State Management
document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    redRidingHood: document.getElementById('red-riding-hood'),
    momDialog: document.getElementById('mom-dialog'),
    closeDialogBtn: document.getElementById('close-dialog'),
    winDialogContainer: document.getElementById('win-dialog-container'),
    closeWinDialogBtn: document.getElementById('close-win-dialog'),
    phoneWrapper: document.getElementById('phone-wrapper'),
    phone: document.getElementById('phone'),
    forest: document.getElementById('forest'),
    mushroom: document.getElementById('hidden-mushroom'),
    pond: document.getElementById('pond'),
    grandmaHouse: document.getElementById('grandma-house'),
    grandma: document.getElementById('grandma'),
    topWolf: document.getElementById('top-wolf'),
    bottomWolf: document.getElementById('bottom-wolf'),
    gameContainer: document.getElementById('game-container')
  };

  let gameState = {
    isForestRevealed: false,
    deliveryInProgress: false,
    hasMushrooms: false,
    isDragging: false,
    isGrandmaDragging: false,
    isPlaneRiding: false,
    introFinished: false,
    isGameOver: false
  };

  const resetBtn = document.getElementById('reset-btn');

  function checkGameOver() {
    return gameState.isGameOver;
  }

  function resetGame() {
    window.location.reload();
  }

  function triggerWin(element) {
    element.innerHTML = '<span class="win-burst">🍄✨</span>';
    gameState.isGameOver = true;
    setTimeout(() => {
      elements.winDialogContainer.classList.remove('hidden');
    }, 120);
  }

  // 1. Initial Phone Vibration -> Mom's Dialog
  setTimeout(() => {
    elements.phoneWrapper.classList.remove('vibrate');
    document.getElementById('phone-container').classList.remove('hidden');
  }, 1500);

  // Mom's Dialog -> Phone moves to Red Riding Hood
  elements.closeDialogBtn.addEventListener('click', () => {
    elements.momDialog.parentElement.classList.add('hidden');
    elements.phoneWrapper.classList.remove('center-phone');
    gameState.introFinished = true;
  });

  // 2. Phone -> Delivery Worker
  elements.phone.addEventListener('click', () => {
    if (gameState.deliveryInProgress || !gameState.introFinished || checkGameOver()) return;
    gameState.deliveryInProgress = true;
    
    const worker = document.createElement('div');
    worker.classList.add('entity-animated');
    worker.innerText = '🛵';
    
    const startHouse = document.getElementById('red-house');
    const houseRect = startHouse.getBoundingClientRect();
    const containerRect = elements.gameContainer.getBoundingClientRect();
    
    worker.style.transition = 'none'; // Prevent flying from sky
    worker.style.left = `${houseRect.left - containerRect.left}px`;
    worker.style.top = `${houseRect.top - containerRect.top}px`;
    
    elements.gameContainer.appendChild(worker);
    
    const grandmaRect = elements.grandmaHouse.getBoundingClientRect();
    const targetX = grandmaRect.left - containerRect.left + 50;
    const targetY = grandmaRect.top - containerRect.top + 50;
    
    worker.getBoundingClientRect(); // Force reflow
    worker.style.transition = 'all 4s linear';
    
    worker.style.left = `${targetX}px`;
    worker.style.top = `${targetY}px`;

    setTimeout(() => {
      triggerWin(worker);
    }, 4000);
  });

  // 3. Forest Interaction
  elements.forest.addEventListener('click', () => {
    if (gameState.isForestRevealed || checkGameOver() || !gameState.introFinished) return;
    const trees = elements.forest.querySelectorAll('.tree');
    trees.forEach(t => t.classList.add('parted'));
    elements.forest.classList.add('revealed');
    gameState.isForestRevealed = true;
  });

  // 4. Drag & Drop for Red Riding Hood
  let initialX, initialY, currentX, currentY, startLeft, startTop;

  elements.redRidingHood.addEventListener('pointerdown', dragStart);

  function dragStart(e) {
    if (gameState.isPlaneRiding || elements.redRidingHood.classList.contains('hidden') || checkGameOver() || !gameState.introFinished) return;

    initialX = e.clientX;
    initialY = e.clientY;
    
    const rect = elements.redRidingHood.getBoundingClientRect();
    const containerRect = elements.gameContainer.getBoundingClientRect();
    
    startLeft = rect.left - containerRect.left;
    startTop = rect.top - containerRect.top;
    
    elements.redRidingHood.style.left = `${startLeft}px`;
    elements.redRidingHood.style.top = `${startTop}px`;
    elements.redRidingHood.style.transform = `none`;

    gameState.isDragging = true;

    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', dragEnd);
  }

  function drag(e) {
    if (!gameState.isDragging) return;
    
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY; 
    
    elements.redRidingHood.style.left = `${startLeft + currentX}px`;
    elements.redRidingHood.style.top = `${startTop + currentY}px`;
  }

  function dragEnd(e) {
    gameState.isDragging = false;
    document.removeEventListener('pointermove', drag);
    document.removeEventListener('pointerup', dragEnd);

    checkCollisions();
  }

  function getCenterRect(element) {
    if (!element) return { x: -999, y: -999 };
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  function checkCollisions() {
    const redRect = elements.redRidingHood.getBoundingClientRect();
    const redCenter = { x: redRect.left + redRect.width / 2, y: redRect.top + redRect.height / 2 };

    const pondCenter = getCenterRect(elements.pond);
    const mushroomCenter = getCenterRect(elements.mushroom);
    const grandmaHouseCenter = getCenterRect(elements.grandmaHouse);
    const grandmaCenter = getCenterRect(elements.grandma);
    
    // Determine closest wolf
    let wolfCollision = false;
    if (elements.topWolf && distance(redCenter, getCenterRect(elements.topWolf)) < 100) wolfCollision = true;
    if (elements.bottomWolf && distance(redCenter, getCenterRect(elements.bottomWolf)) < 100) wolfCollision = true;

    const COLLISION_THRESHOLD = 90;

    // Direct to Grandma's (Death by wolves if dragged across and hits wolf or right of screen while wolves live)
    // Here we can simply check if she is dragged over a wolf
    if (wolfCollision) {
        elements.redRidingHood.innerText = '💀';
        setTimeout(() => {
            alert('Oh no! The wolves got you. 🐺');
            resetRedRidingHood();
        }, 500);
        return;
    } else if (distance(redCenter, grandmaHouseCenter) < COLLISION_THRESHOLD * 2 || distance(redCenter, grandmaCenter) < COLLISION_THRESHOLD * 2) {
        // Dragged straight to grandma - check if crossed middle
        if (elements.topWolf || elements.bottomWolf) {
           elements.redRidingHood.innerText = '💀';
           setTimeout(() => {
             alert('Oh no! The wolves got you. 🐺');
             resetRedRidingHood();
           }, 500);
           return;
        }
    }

    // Fishes -> Airplane
    let touchedFish = false;
    document.querySelectorAll('.fish').forEach(fish => {
      if (distance(redCenter, getCenterRect(fish)) < COLLISION_THRESHOLD) touchedFish = true;
    });

    if (touchedFish) {
      gameState.isPlaneRiding = true;
      elements.redRidingHood.innerHTML = '<div class="plane-rider"><span class="plane-icon">✈️</span><span class="rider-icon">👧</span></div>';
      elements.redRidingHood.style.transition = 'all 4s ease-in-out';
      
      const containerRect = elements.gameContainer.getBoundingClientRect();
      
      setTimeout(() => {
        elements.redRidingHood.style.left = `${grandmaHouseCenter.x - containerRect.left}px`;
        elements.redRidingHood.style.top = `${grandmaHouseCenter.y - containerRect.top}px`;
      }, 50);
      
      setTimeout(() => {
        triggerWin(elements.redRidingHood);
      }, 4050);
      return;
    }

    // Mushroom squad
    if (gameState.isForestRevealed && distance(redCenter, mushroomCenter) < COLLISION_THRESHOLD) {
      elements.redRidingHood.classList.add('hidden');

      setTimeout(() => {
        spawnMushroomSquad();
      }, 500);
      return;
    }

    // Reset position if no collision and hasn't triggered special events
    resetRedRidingHood();
  }

  function resetRedRidingHood() {
    if (gameState.isPlaneRiding) return;
    elements.redRidingHood.style.transition = 'all 0.5s ease';
    elements.redRidingHood.style.left = `5%`;
    elements.redRidingHood.style.top = `50%`;
    elements.redRidingHood.style.transform = `translateY(-50%)`;
    elements.redRidingHood.innerText = '👧';
    elements.redRidingHood.classList.remove('hidden');
    
    setTimeout(() => {
      elements.redRidingHood.style.transition = 'none';
      elements.mushroom.style.display = 'block';
      elements.mushroom.style.visibility = 'visible';
      elements.mushroom.innerHTML = '🍄';
    }, 500);
  }

  function spawnMushroomSquad() {
    const squadEl = document.createElement('div');
    squadEl.classList.add('entity-animated');
    squadEl.classList.add('mushroom-squad');
    squadEl.style.zIndex = '4';
    squadEl.style.alignItems = 'flex-end';

    for (let i = 0; i < 4; i++) {
      const follower = document.createElement('div');
      follower.className = 'squad-member mini-mushroom';
      follower.style.animationDelay = `${(i + 1) * 0.16}s`;
      follower.textContent = '🍄';
      squadEl.appendChild(follower);
    }

    const leader = document.createElement('div');
    leader.className = 'squad-member mushroom-leader';
    leader.innerHTML = '<span class="mushroom-body">🍄</span><span class="mushroom-eyes">👀</span>';
    squadEl.appendChild(leader);

    elements.mushroom.innerHTML = '<span class="mushroom-body">🍄</span><span class="mushroom-eyes">👀</span>';

    const mushroomRect = elements.mushroom.getBoundingClientRect();
    const containerRect = elements.gameContainer.getBoundingClientRect();

    squadEl.style.transition = 'none';
    squadEl.style.left = `${mushroomRect.left - containerRect.left - 6}px`;
    squadEl.style.top = `${mushroomRect.top - containerRect.top + 2}px`;

    elements.gameContainer.appendChild(squadEl);
    elements.mushroom.style.visibility = 'hidden';

    const grandmaRect = elements.grandmaHouse.getBoundingClientRect();
    squadEl.getBoundingClientRect();

    squadEl.style.transition = 'all 4s linear';
    squadEl.style.left = `${grandmaRect.left - containerRect.left - 88}px`;
    squadEl.style.top = `${grandmaRect.top - containerRect.top + 46}px`;

    setTimeout(() => {
      triggerWin(squadEl);
    }, 4000);
  }

  // 5. Grandma Drag and Drop
  let gInitialX, gInitialY, gCurrentX, gCurrentY, gStartLeft, gStartTop;

  elements.grandma.addEventListener('pointerdown', runGrandmaDragStart);

  function runGrandmaDragStart(e) {
    if (checkGameOver() || !gameState.introFinished) return;
    gInitialX = e.clientX;
    gInitialY = e.clientY;
    
    const rect = elements.grandma.getBoundingClientRect();
    const containerRect = elements.gameContainer.getBoundingClientRect();
    
    gStartLeft = rect.left - containerRect.left;
    gStartTop = rect.top - containerRect.top;
    
    elements.grandma.style.left = `${gStartLeft}px`;
    elements.grandma.style.top = `${gStartTop}px`;
    elements.grandma.style.transform = `none`;

    gameState.isGrandmaDragging = true;
    document.addEventListener('pointermove', grandmaDrag);
    document.addEventListener('pointerup', grandmaDragEnd);
  }

  function grandmaDrag(e) {
    if (!gameState.isGrandmaDragging) return;
    
    gCurrentX = e.clientX - gInitialX;
    gCurrentY = e.clientY - gInitialY; 
    
    elements.grandma.style.left = `${gStartLeft + gCurrentX}px`;
    elements.grandma.style.top = `${gStartTop + gCurrentY}px`;
  }

  function grandmaDragEnd(e) {
    gameState.isGrandmaDragging = false;
    document.removeEventListener('pointermove', grandmaDrag);
    document.removeEventListener('pointerup', grandmaDragEnd);

    checkGrandmaCollisions();
  }

  function checkGrandmaCollisions() {
    const grandmaRect = elements.grandma.getBoundingClientRect();
    const currentCenter = { x: grandmaRect.left + grandmaRect.width / 2, y: grandmaRect.top + grandmaRect.height / 2 };

    const redHouseElem = document.getElementById('red-house');
    const COLLISION_THRESHOLD = 90;

    elements.grandma.innerText = '🔫👵';

    // Strike wolves
    if (elements.topWolf && distance(currentCenter, getCenterRect(elements.topWolf)) < COLLISION_THRESHOLD) {
      elements.topWolf.innerText = '💥';
      setTimeout(() => elements.topWolf.remove(), 500);
    }
    if (elements.bottomWolf && distance(currentCenter, getCenterRect(elements.bottomWolf)) < COLLISION_THRESHOLD) {
      elements.bottomWolf.innerText = '💥';
      setTimeout(() => elements.bottomWolf.remove(), 500);
    }

    // Reach Red house
    if (distance(currentCenter, getCenterRect(redHouseElem)) < COLLISION_THRESHOLD) {
       elements.grandma.style.transition = 'none';
       elements.grandma.style.right = 'auto'; // Fix bounding box stretch bug
       elements.grandma.style.left = `5%`;
       elements.grandma.style.top = `50%`;
       elements.grandma.style.transform = `translateY(-50%)`;
       
       triggerWin(elements.grandma);
       return;
    }

    // Otherwise swap back icon
    setTimeout(() => {
      if (elements.grandma.innerText === '🔫👵') elements.grandma.innerText = '👵';
    }, 1000);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
  }

  if (elements.closeWinDialogBtn) {
    elements.closeWinDialogBtn.addEventListener('click', resetGame);
  }
});
