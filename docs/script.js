const socket = io('https://typing-fighter-server-production.up.railway.app');

// DOM Elements
const screens = {
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

const menuElements = {
    btnFindMatch: document.getElementById('btn-find-match'),
    status: document.getElementById('matchmaking-status')
};

const gameElements = {
    roomId: document.getElementById('display-room-id'),
    playerHealthFill: document.getElementById('player-health-fill'),
    playerHealthText: document.getElementById('player-health-text'),
    opponentHealthFill: document.getElementById('opponent-health-fill'),
    opponentHealthText: document.getElementById('opponent-health-text'),
    countdown: document.getElementById('countdown-display'),
    phraseContainer: document.getElementById('phrase-container'),
    targetPhrase: document.getElementById('target-phrase'),
    typeInput: document.getElementById('type-input'),
    gameOverPanel: document.getElementById('game-over-panel'),
    resultTitle: document.getElementById('result-title'),
    btnRematch: document.getElementById('btn-rematch'),
    playerAvatar: document.querySelector('.player-avatar'),
    opponentAvatar: document.querySelector('.opponent-avatar'),
    damageOverlay: document.getElementById('damage-overlay')
};

// Game State
let currentRoom = null;
let currentPhraseStr = "";
let isPlaying = false;
const MAX_HEALTH = 100;

// Utility functions
function switchScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active', 'hidden'));

    // Quick hack to hide all then show one
    Object.keys(screens).forEach(k => {
        if (k === screenId) {
            screens[k].classList.add('active');
        } else {
            screens[k].classList.add('hidden');
        }
    });
}

function updateHealth(playerId, health, playersList) {
    const isMe = playerId === socket.id;
    const fill = isMe ? gameElements.playerHealthFill : gameElements.opponentHealthFill;
    const text = isMe ? gameElements.playerHealthText : gameElements.opponentHealthText;

    // Enforce min 0
    health = Math.max(0, health);
    const percentage = (health / MAX_HEALTH) * 100;

    fill.style.width = `${percentage}%`;
    text.textContent = `${health} / ${MAX_HEALTH}`;

    if (isMe && health < playersList[playerId]?.health) {
        // I took damage
        triggerDamageFlash();
        shakeElement(gameElements.playerAvatar);
    } else if (!isMe && health < playersList[playerId]?.health) {
        shakeElement(gameElements.opponentAvatar);
    }
}

function triggerDamageFlash() {
    gameElements.damageOverlay.classList.remove('flash-red');
    void gameElements.damageOverlay.offsetWidth; // trigger reflow
    gameElements.damageOverlay.classList.add('flash-red');
}

function shakeElement(el) {
    el.style.animation = 'none';
    void el.offsetWidth; // reflow
    el.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
}

function createAttackAnimation(isPlayerAttacking) {
    const startEl = isPlayerAttacking ? gameElements.playerAvatar : gameElements.opponentAvatar;
    const endEl = isPlayerAttacking ? gameElements.opponentAvatar : gameElements.playerAvatar;

    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const particle = document.createElement('div');
    particle.className = 'attack-particle';
    particle.style.left = `${startRect.left + startRect.width / 2}px`;
    particle.style.top = `${startRect.top + startRect.height / 2}px`;

    // Color based on attacker
    particle.style.background = isPlayerAttacking ? 'var(--primary-cyan)' : 'var(--primary-pink)';
    particle.style.boxShadow = `0 0 15px ${particle.style.background}`;
    document.body.appendChild(particle);

    // Animate
    const animation = particle.animate([
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px) scale(3)` }
    ], {
        duration: 250,
        easing: 'ease-in'
    });

    animation.onfinish = () => {
        particle.remove();
        // Create an impact effect
        createImpact(endRect.left + endRect.width / 2, endRect.top + endRect.height / 2, particle.style.background);
    };
}

function createImpact(x, y, color) {
    const impact = document.createElement('div');
    impact.style.position = 'absolute';
    impact.style.left = `${x - 20}px`;
    impact.style.top = `${y - 20}px`;
    impact.style.width = '40px';
    impact.style.height = '40px';
    impact.style.borderRadius = '50%';
    impact.style.background = color;
    impact.style.opacity = '0.8';
    impact.style.zIndex = '50';
    document.body.appendChild(impact);

    const anim = impact.animate([
        { transform: 'scale(0)', opacity: 0.8 },
        { transform: 'scale(2.5)', opacity: 0 }
    ], {
        duration: 300,
        easing: 'ease-out'
    });

    anim.onfinish = () => impact.remove();
}

// Event Listeners
menuElements.btnFindMatch.addEventListener('click', () => {
    menuElements.btnFindMatch.classList.add('hidden');
    menuElements.status.classList.remove('hidden');
    socket.emit('join_match');
});

gameElements.btnRematch.addEventListener('click', () => {
    switchScreen('lobby');
    gameElements.gameOverPanel.classList.add('hidden');
    menuElements.btnFindMatch.classList.remove('hidden');
    menuElements.status.classList.add('hidden');

    // Reset Health UI
    gameElements.playerHealthFill.style.width = '100%';
    gameElements.playerHealthText.textContent = '100 / 100';
    gameElements.opponentHealthFill.style.width = '100%';
    gameElements.opponentHealthText.textContent = '100 / 100';
});

gameElements.typeInput.addEventListener('input', (e) => {
    if (!isPlaying) {
        e.target.value = "";
        return;
    }

    const typed = e.target.value;

    // Replace visual representation
    if (currentPhraseStr.startsWith(typed)) {
        gameElements.typeInput.classList.remove('error');
        // Highlight logic
        const matchedPart = currentPhraseStr.substring(0, typed.length);
        const remPart = currentPhraseStr.substring(typed.length);
        gameElements.targetPhrase.innerHTML = `<span class="matched-text">${matchedPart}</span>${remPart}`;

        // Full match
        if (typed === currentPhraseStr) {
            isPlaying = false;
            gameElements.typeInput.disabled = true;
            socket.emit('type_word', { roomId: currentRoom, input: typed });
        }
    } else {
        gameElements.typeInput.classList.add('error');
        // Add error class to input field
        const commonLength = Array.from(typed).findIndex((char, i) => currentPhraseStr[i] !== char);
        const safeCommon = commonLength === -1 ? 0 : commonLength;

        const matchedPart = currentPhraseStr.substring(0, safeCommon);
        const errorChar = currentPhraseStr.substring(safeCommon, safeCommon + 1) || " ";
        const remPart = currentPhraseStr.substring(safeCommon + 1);

        gameElements.targetPhrase.innerHTML = `<span class="matched-text">${matchedPart}</span><span class="error-text">${errorChar}</span>${remPart}`;
    }
});

// Default enter prevent form submit or odd behaviors
gameElements.typeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
});


// Socket Listeners
socket.on('match_joined', (data) => {
    currentRoom = data.roomId;
    gameElements.roomId.textContent = `SALA: ${data.roomId}`;
});

socket.on('match_started', (data) => {
    switchScreen('game');
    gameElements.gameOverPanel.classList.add('hidden');
    gameElements.typeInput.value = "";
    gameElements.typeInput.disabled = true;
    gameElements.playerHealthFill.style.width = '100%';
    gameElements.opponentHealthFill.style.width = '100%';
    gameElements.targetPhrase.innerHTML = "PREPÁRATE";
});

socket.on('countdown', (data) => {
    let count = data.seconds;
    gameElements.countdown.classList.remove('hidden');
    gameElements.countdown.textContent = count;

    const ioCode = setInterval(() => {
        count--;
        if (count > 0) {
            gameElements.countdown.textContent = count;
            gameElements.countdown.style.animation = 'none';
            void gameElements.countdown.offsetWidth;
            gameElements.countdown.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        } else {
            clearInterval(ioCode);
            gameElements.countdown.classList.add('hidden');
        }
    }, 1000);
});

socket.on('new_phrase', (data) => {
    currentPhraseStr = data.phrase;
    gameElements.targetPhrase.innerHTML = currentPhraseStr;
    isPlaying = true;
    gameElements.typeInput.disabled = false;
    gameElements.typeInput.value = "";
    gameElements.typeInput.focus();
});

socket.on('phrase_completed', (data) => {
    const isWinnerMe = data.winnerId === socket.id;

    // Animate attack
    createAttackAnimation(isWinnerMe);

    // Update health
    const myHealth = data.players[socket.id].health;
    const oppId = Object.keys(data.players).find(id => id !== socket.id);
    const oppHealth = data.players[oppId]?.health || 0;

    // Temporary pass old state
    const oldPlayersState = data.players; // In reality we'd want what they were before but visual update is fine.

    setTimeout(() => {
        gameElements.playerHealthFill.style.width = `${Math.max(0, (myHealth / MAX_HEALTH) * 100)}%`;
        gameElements.playerHealthText.textContent = `${Math.max(0, myHealth)} / ${MAX_HEALTH}`;
        gameElements.opponentHealthFill.style.width = `${Math.max(0, (oppHealth / MAX_HEALTH) * 100)}%`;
        gameElements.opponentHealthText.textContent = `${Math.max(0, oppHealth)} / ${MAX_HEALTH}`;

        if (!isWinnerMe) triggerDamageFlash();
        shakeElement(isWinnerMe ? gameElements.opponentAvatar : gameElements.playerAvatar);
    }, 250); // wait for particle to land
});

socket.on('game_over', (data) => {
    isPlaying = false;
    gameElements.typeInput.disabled = true;

    setTimeout(() => {
        gameElements.gameOverPanel.classList.remove('hidden');
        const isWinnerMe = data.winnerId === socket.id;
        gameElements.resultTitle.textContent = isWinnerMe ? "¡VICTORIA!" : "¡DERROTA!";
        gameElements.resultTitle.style.color = isWinnerMe ? "var(--primary-cyan)" : "var(--primary-pink)";
        gameElements.resultTitle.style.textShadow = `0 0 20px ${gameElements.resultTitle.style.color}`;
    }, 1000);
});

socket.on('opponent_disconnected', () => {
    if (screens.game.classList.contains('active')) {
        alert("El oponente se ha desconectado.");
        gameElements.btnRematch.click();
    }
});
