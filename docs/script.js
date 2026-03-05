const socket = io('https://typing-fighter-server-production.up.railway.app');

// DOM Elements
const screens = {
    mainMenu: document.getElementById('main-menu-screen'),
    mission: document.getElementById('mission-screen'),
    ranking: document.getElementById('ranking-screen'),
    profile: document.getElementById('profile-screen'),
    settings: document.getElementById('settings-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

const navElements = {
    btnPlay: document.getElementById('nav-btn-play'),
    btnDiffEasy: document.getElementById('btn-diff-easy'),
    btnDiffNormal: document.getElementById('btn-diff-normal'),
    btnDiffHard: document.getElementById('btn-diff-hard'),
    btnProfile: document.getElementById('nav-btn-profile'),
    btnSettings: document.getElementById('nav-btn-settings'),
    btnRanking: document.getElementById('nav-btn-ranking'),
    btnBackMission: document.getElementById('btn-back-mission'),
    btnBackProfile: document.getElementById('btn-back-profile'),
    btnBackSettings: document.getElementById('btn-back-settings'),
    btnBackRanking: document.getElementById('btn-back-ranking'),
    btnCancelSearch: document.getElementById('btn-cancel-search')
};

const profileElements = {
    nameInput: document.getElementById('player-name-input'),
    wins: document.getElementById('stat-wins'),
    losses: document.getElementById('stat-losses')
};

const settingsElements = {
    toggleAnimations: document.getElementById('toggle-animations'),
    toggleAudio: document.getElementById('toggle-audio'),
    toggleAutofire: document.getElementById('toggle-autofire'),
    selectTheme: document.getElementById('select-theme'),
    volumeSlider: document.getElementById('volume-slider'),
    btnFullscreen: document.getElementById('btn-fullscreen')
};

const rankingElements = {
    tableBody: document.getElementById('ranking-body'),
    loadingText: document.getElementById('ranking-loading')
};

const menuElements = {
    btnFindMatch: document.getElementById('btn-find-match'),
    status: document.getElementById('matchmaking-status')
};

const gameElements = {
    roomId: document.getElementById('display-room-id'),
    playerNameText: document.getElementById('player-name-lbl'), // New dynamically generated in JS later if needed, right now we'll target the H3
    opponentNameText: document.getElementById('opponent-name-lbl'),
    playerHealthFill: document.getElementById('player-health-fill'),
    playerHealthText: document.getElementById('player-health-text'),
    playerNameLabel: document.querySelector('.player-card h3'),
    opponentHealthFill: document.getElementById('opponent-health-fill'),
    opponentHealthText: document.getElementById('opponent-health-text'),
    opponentNameLabel: document.querySelector('.opponent-card h3'),
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
let currentDifficulty = "normal";
let userProfile = { username: "Piloto Espacial", wins: 0, losses: 0 };
let userSettings = { animations: true, audio: true, autoFire: true, theme: '#00f0ff', volume: 0.5 };
const MAX_HEALTH = 100;

// Initialize Storage
function initStorage() {
    const savedProfile = localStorage.getItem('tf_profile');
    if (savedProfile) {
        userProfile = { ...userProfile, ...JSON.parse(savedProfile) };
    }
    const savedSettings = localStorage.getItem('tf_settings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
    }

    // Update UI with loaded data
    profileElements.nameInput.value = userProfile.username;
    profileElements.wins.textContent = userProfile.wins;
    profileElements.losses.textContent = userProfile.losses;

    settingsElements.toggleAnimations.checked = userSettings.animations;
    settingsElements.toggleAudio.checked = userSettings.audio;
    settingsElements.toggleAutofire.checked = userSettings.autoFire;
    settingsElements.selectTheme.value = userSettings.theme;
    settingsElements.volumeSlider.value = userSettings.volume;

    // Apply theme
    document.documentElement.style.setProperty('--primary-cyan', userSettings.theme);
}

function saveProfile() {
    userProfile.username = profileElements.nameInput.value.trim() || "Piloto Espacial";
    localStorage.setItem('tf_profile', JSON.stringify(userProfile));
}

function saveSettings() {
    userSettings.animations = settingsElements.toggleAnimations.checked;
    userSettings.audio = settingsElements.toggleAudio.checked;
    userSettings.autoFire = settingsElements.toggleAutofire.checked;
    userSettings.theme = settingsElements.selectTheme.value;
    userSettings.volume = parseFloat(settingsElements.volumeSlider.value);
    localStorage.setItem('tf_settings', JSON.stringify(userSettings));

    // Apply theme on change
    document.documentElement.style.setProperty('--primary-cyan', userSettings.theme);
}

// Ensure init occurs at startup
initStorage();

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
    if (!userSettings.animations) return;
    gameElements.damageOverlay.classList.remove('flash-red');
    void gameElements.damageOverlay.offsetWidth; // trigger reflow
    gameElements.damageOverlay.classList.add('flash-red');
}

function shakeElement(el) {
    if (!userSettings.animations) return;
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

// Fullscreen Toggle
settingsElements.btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Event Listeners - Navigation
navElements.btnPlay.addEventListener('click', () => switchScreen('mission'));

function startMatchmaking(diff) {
    currentDifficulty = diff;
    switchScreen('lobby');
    socket.emit('join_match', { username: userProfile.username, difficulty: currentDifficulty });
}

navElements.btnDiffEasy.addEventListener('click', () => startMatchmaking('easy'));
navElements.btnDiffNormal.addEventListener('click', () => startMatchmaking('normal'));
navElements.btnDiffHard.addEventListener('click', () => startMatchmaking('hard'));

navElements.btnCancelSearch.addEventListener('click', () => {
    socket.emit('cancel_match');
    switchScreen('mainMenu');
});

navElements.btnProfile.addEventListener('click', () => switchScreen('profile'));
navElements.btnSettings.addEventListener('click', () => switchScreen('settings'));
navElements.btnRanking.addEventListener('click', () => {
    switchScreen('ranking');
    rankingElements.loadingText.classList.remove('hidden');
    rankingElements.tableBody.innerHTML = '';
    socket.emit('get_leaderboard');
});

navElements.btnBackMission.addEventListener('click', () => switchScreen('mainMenu'));
navElements.btnBackRanking.addEventListener('click', () => switchScreen('mainMenu'));

navElements.btnBackProfile.addEventListener('click', () => {
    saveProfile();
    switchScreen('mainMenu');
});

navElements.btnBackSettings.addEventListener('click', () => {
    saveSettings();
    switchScreen('mainMenu');
});

profileElements.nameInput.addEventListener('blur', saveProfile);
settingsElements.toggleAnimations.addEventListener('change', saveSettings);
settingsElements.toggleAudio.addEventListener('change', saveSettings);
settingsElements.toggleAutofire.addEventListener('change', saveSettings);
settingsElements.selectTheme.addEventListener('change', saveSettings);
settingsElements.volumeSlider.addEventListener('input', saveSettings);

gameElements.btnRematch.addEventListener('click', () => {
    switchScreen('mainMenu');
    gameElements.gameOverPanel.classList.add('hidden');

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
            if (userSettings.autoFire) {
                submitCurrentPhrase();
            }
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

function submitCurrentPhrase() {
    isPlaying = false;
    gameElements.typeInput.disabled = true;
    socket.emit('type_word', { roomId: currentRoom, input: gameElements.typeInput.value });
}

// Default enter prevent form submit or odd behaviors, trigger submit if Autofire is off
gameElements.typeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!userSettings.autoFire && isPlaying && gameElements.typeInput.value === currentPhraseStr) {
            submitCurrentPhrase();
        }
    }
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

    // Set Names
    const myData = data.players[socket.id];
    const oppId = Object.keys(data.players).find(id => id !== socket.id);
    const oppData = data.players[oppId];

    if (myData) gameElements.playerNameLabel.textContent = myData.username.toUpperCase();
    if (oppData) gameElements.opponentNameLabel.textContent = oppData.username.toUpperCase();

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

socket.on('leaderboard_data', (topPlayers) => {
    rankingElements.loadingText.classList.add('hidden');
    rankingElements.tableBody.innerHTML = '';

    if (topPlayers.length === 0) {
        rankingElements.tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#8b9bb4;">No hay datos aún. ¡Sé el primero en ganar!</td></tr>';
        return;
    }

    topPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        const posClass = index === 0 ? 'ranking-row-top1' : index === 1 ? 'ranking-row-top2' : index === 2 ? 'ranking-row-top3' : '';

        row.innerHTML = `
            <td class="${posClass}">${index + 1}</td>
            <td class="${posClass}">${player.username}</td>
            <td class="${posClass}">${player.wins}</td>
        `;
        rankingElements.tableBody.appendChild(row);
    });
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

        // Update stats
        if (isWinnerMe) userProfile.wins += 1;
        else userProfile.losses += 1;

        saveProfile();
        profileElements.wins.textContent = userProfile.wins;
        profileElements.losses.textContent = userProfile.losses;

    }, 1000);
});

socket.on('opponent_disconnected', () => {
    if (screens.game.classList.contains('active')) {
        alert("El oponente se ha desconectado.");
        gameElements.btnRematch.click();
    }
});
