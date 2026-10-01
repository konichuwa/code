import { CANVAS_WIDTH, CANVAS_HEIGHT, ROSTER, LEVELS, ARENAS, getArenaInfo, GROUND_Y, DEFAULT_HIGH_SCORES } from './constants.js';
import { sound } from './audio.js';
import { DamageText, Particle, ShockwaveRing, Projectile, Player, Enemy, Boss, BreakableProp, DroppedItem } from './entities.js';
import { GameRenderer } from './renderer.js';

// Game States
const STATE_SELECT = 'SELECT';
const STATE_PLAYING = 'PLAYING';
const STATE_LEVEL_CLEAR = 'LEVEL_CLEAR';
const STATE_GAMEOVER = 'GAMEOVER';
const STATE_VICTORY = 'VICTORY';

class UrbanClashGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderer = new GameRenderer(this.ctx);

    this.state = STATE_SELECT;
    this.isSayonUnlocked = true;
    try {
      localStorage.setItem('urban_clash_sayon_unlocked', 'true');
    } catch (e) {}

    // Default to Sayon (or Bob)
    this.selectedFighterId = 'sayon';
    this.rosterKeys = Object.keys(ROSTER);
    this.lockNotice = '';
    this.lockNoticeTimer = 0;
    this.hasCelebratedUnlock = false;

    // Arena Background Customization
    this.arenaKeys = ARENAS.map((a) => a.id).filter((id) => id !== 'auto');
    this.customArenaTheme = null; // null = use level default; string = player override
    this.arenaBannerTimer = 0;
    this.lightningFlash = 0;

    // Level progression & Unlocks saved in localStorage
    this.maxUnlockedLevel = 1;
    try {
      const savedUnlocked = localStorage.getItem('urban_clash_unlocked_level');
      if (savedUnlocked) {
        const parsed = parseInt(savedUnlocked, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          this.maxUnlockedLevel = Math.max(1, Math.min(LEVELS.length, parsed));
        }
      }
    } catch (e) {}

    this.selectedLevelIndex = 0;
    try {
      const savedSelected = localStorage.getItem('urban_clash_selected_level');
      if (savedSelected !== null) {
        const parsed = parseInt(savedSelected, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < this.maxUnlockedLevel) {
          this.selectedLevelIndex = parsed;
        }
      }
    } catch (e) {}

    this.currentLevelIndex = this.selectedLevelIndex;
    this.player = null;
    this.enemies = [];
    this.enemiesRemainingToSpawn = 0;
    this.boss = null;
    this.bossSpawned = false;

    this.props = [];
    this.droppedItems = [];
    this.projectiles = [];
    this.particles = [];
    this.damageTexts = [];
    this.shockwaves = [];

    this.levelClearTimer = 0;
    this.animTimer = 0;
    this.screenShake = 0;
    this.devIntroTimer = 0;
    this.currentAttackHitSet = new Set();

    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      attack: false,
      special: false,
    };

    this.initEventListeners();
    this.initTouchControls();
    this.initStartButton();
    this.initRestartButton();
    this.initMuteButton();
    this.initArenaButtons();
    this.initHighScoresBox();
    this.initStageSelector();

    // Expose helpers for testing unlock state
    window.lockSayon = () => {
      this.isSayonUnlocked = false;
      try { localStorage.removeItem('urban_clash_sayon_unlocked'); } catch (e) {}
      if (this.selectedFighterId === 'sayon') this.selectedFighterId = 'bob';
      this.lockNotice = '🔒 Sayon locked! Conquer Level 15 to unlock!';
      this.lockNoticeTimer = 180;
    };
    window.unlockSayon = () => {
      this.isSayonUnlocked = true;
      try { localStorage.setItem('urban_clash_sayon_unlocked', 'true'); } catch (e) {}
      sound.playUnlock();
      this.lockNotice = '★ Grandmaster Sayon Unlocked!';
      this.lockNoticeTimer = 180;
    };
    window.unlockAllLevels = () => {
      this.maxUnlockedLevel = LEVELS.length;
      this.saveUnlockedLevel(LEVELS.length);
      sound.playUnlock();
    };

    // Auto focus canvas so keyboard works instantly
    setTimeout(() => {
      if (this.canvas) this.canvas.focus();
    }, 100);

    // Start butter-smooth 60 FPS game loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  saveUnlockedLevel(levelNum) {
    try {
      this.maxUnlockedLevel = Math.max(this.maxUnlockedLevel, Math.min(LEVELS.length, levelNum));
      localStorage.setItem('urban_clash_unlocked_level', String(this.maxUnlockedLevel));
    } catch (e) {}
    this.updateStageButtonUI();
    this.renderStageModalCards();
  }

  saveSelectedLevel(index) {
    try {
      this.selectedLevelIndex = Math.max(0, Math.min(this.maxUnlockedLevel - 1, index));
      localStorage.setItem('urban_clash_selected_level', String(this.selectedLevelIndex));
    } catch (e) {}
    this.updateStageButtonUI();
    this.renderStageModalCards();
  }

  initStartButton() {
    const btn = document.getElementById('start-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        sound.init();
        if (this.canvas) this.canvas.focus();
        if (this.state === STATE_SELECT) {
          this.startGame();
        } else if (this.state === STATE_GAMEOVER || this.state === STATE_VICTORY) {
          this.state = STATE_SELECT;
          sound.playSelect();
        }
      });
    }
  }

  initMuteButton() {
    const btn = document.getElementById('mute-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      sound.init();
      const unmuted = sound.toggleMute();
      btn.textContent = unmuted ? '🔊 Audio ON' : '🔇 Audio OFF';
    });
  }

  initArenaButtons() {
    const btn = document.getElementById('arena-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        sound.init();
        this.cycleArena(1);
      });
    }

    const touchArenaBtn = document.getElementById('btn-arena');
    if (touchArenaBtn) {
      touchArenaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sound.init();
        this.cycleArena(1);
      });
    }
  }

  initRestartButton() {
    const btn = document.getElementById('restart-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      sound.init();
      if (this.player && this.player.score > 0) {
        this.checkAndSaveHighScore(this.player.score, this.player.name);
      }
      this.state = STATE_SELECT;
      sound.playSelect();
    });
  }

  /* Stage / Level Selection System */
  initStageSelector() {
    const stageBtn = document.getElementById('stage-btn');
    const touchStageBtn = document.getElementById('btn-stage');
    const modal = document.getElementById('stage-modal');
    const closeBtn = document.getElementById('stage-modal-close');
    const unlockAllBtn = document.getElementById('stage-unlock-all-btn');
    const resetBtn = document.getElementById('stage-reset-btn');

    if (stageBtn) {
      stageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.init();
        this.toggleStageModal();
      });
    }

    if (touchStageBtn) {
      touchStageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sound.init();
        this.toggleStageModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeStageModal();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeStageModal();
        }
      });
    }

    if (unlockAllBtn) {
      unlockAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.init();
        this.maxUnlockedLevel = LEVELS.length;
        this.saveUnlockedLevel(LEVELS.length);
        sound.playUnlock();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.init();
        this.maxUnlockedLevel = 1;
        this.selectedLevelIndex = 0;
        try {
          localStorage.setItem('urban_clash_unlocked_level', '1');
          localStorage.setItem('urban_clash_selected_level', '0');
        } catch (err) {}
        this.updateStageButtonUI();
        this.renderStageModalCards();
        sound.playSelect();
      });
    }

    this.updateStageButtonUI();
    this.renderStageModalCards();
  }

  toggleStageModal() {
    const modal = document.getElementById('stage-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
      this.openStageModal();
    } else {
      this.closeStageModal();
    }
  }

  openStageModal() {
    const modal = document.getElementById('stage-modal');
    if (!modal) return;
    this.renderStageModalCards();
    modal.classList.remove('hidden');
    sound.playSelect();
  }

  closeStageModal() {
    const modal = document.getElementById('stage-modal');
    if (modal) modal.classList.add('hidden');
    if (this.canvas) this.canvas.focus();
  }

  updateStageButtonUI() {
    const stageBtn = document.getElementById('stage-btn');
    const badge = document.getElementById('stage-unlocked-badge');
    const activeIdx = this.state === STATE_PLAYING ? this.currentLevelIndex : this.selectedLevelIndex;
    const currentLvl = LEVELS[activeIdx] || LEVELS[0];

    if (stageBtn) {
      stageBtn.textContent = `🗺️ STAGE ${currentLvl.level} ▾`;
      stageBtn.title = `Current: Stage ${currentLvl.level} - ${currentLvl.name} (Press N to switch)`;
    }
    if (badge) {
      badge.textContent = `${this.maxUnlockedLevel} / ${LEVELS.length} UNLOCKED`;
    }
  }

  renderStageModalCards() {
    const grid = document.getElementById('stage-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const currentActive = this.state === STATE_PLAYING ? this.currentLevelIndex : this.selectedLevelIndex;

    LEVELS.forEach((lvl, index) => {
      const isUnlocked = lvl.level <= this.maxUnlockedLevel;
      const isCurrent = index === currentActive;

      const card = document.createElement('div');
      card.className = `stage-card ${isUnlocked ? '' : 'locked'} ${isCurrent ? 'active' : ''}`;

      card.innerHTML = `
        <div class="stage-num-badge">STAGE ${lvl.level}</div>
        <div class="stage-card-name" title="${lvl.name}">${lvl.name}</div>
        <div class="stage-boss-tag">Boss: <b>${lvl.boss.name}</b></div>
        <div class="stage-status-btn ${isCurrent ? 'btn-current' : (isUnlocked ? 'btn-play' : 'btn-locked')}">
          ${isCurrent ? 'ACTIVE' : (isUnlocked ? 'SELECT' : '🔒 LOCKED')}
        </div>
      `;

      card.addEventListener('click', () => {
        if (!isUnlocked) {
          sound.playDenied();
          return;
        }
        this.switchLevel(index);
      });

      grid.appendChild(card);
    });

    const badge = document.getElementById('stage-unlocked-badge');
    if (badge) {
      badge.textContent = `${this.maxUnlockedLevel} / ${LEVELS.length} UNLOCKED`;
    }
  }

  switchLevel(index) {
    if (index < 0 || index >= this.maxUnlockedLevel) {
      sound.playDenied();
      return;
    }

    this.saveSelectedLevel(index);
    if (this.state === STATE_PLAYING) {
      this.startLevel(index);
    }
    sound.playSelect();
    this.closeStageModal();
    this.updateStageButtonUI();
  }

  loadHighScores() {
    try {
      const stored = localStorage.getItem('urban_clash_high_scores');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch (e) {
      // fallback
    }
    return [...DEFAULT_HIGH_SCORES];
  }

  saveHighScores(scores) {
    try {
      localStorage.setItem('urban_clash_high_scores', JSON.stringify(scores.slice(0, 5)));
    } catch (e) {
      // fallback
    }
  }

  checkAndSaveHighScore(score, fighterName = 'Player') {
    if (!score || score <= 0) return false;
    const scores = this.loadHighScores();
    const minScore = scores.length >= 5 ? scores[scores.length - 1].score : 0;
    if (scores.length < 5 || score > minScore) {
      const entry = {
        name: fighterName.toUpperCase().slice(0, 8),
        score: score,
        char: fighterName,
      };
      scores.push(entry);
      scores.sort((a, b) => b.score - a.score);
      const top5 = scores.slice(0, 5);
      this.saveHighScores(top5);
      this.updateHighScoresUI(top5);
      return true;
    }
    return false;
  }

  updateHighScoresUI(scores = null) {
    const listEl = document.getElementById('hs-list');
    if (!listEl) return;
    const highScores = scores || this.loadHighScores();
    listEl.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    highScores.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'hs-row';
      if (this.player && item.score === this.player.score) {
        row.classList.add('hs-current');
      }
      row.innerHTML = `
        <span class="hs-rank">${medals[index] || index + 1}</span>
        <span class="hs-name" title="${item.char || item.name}">${item.name}</span>
        <span class="hs-score">${item.score.toLocaleString()}</span>
      `;
      listEl.appendChild(row);
    });
  }

  initHighScoresBox() {
    this.updateHighScoresUI();
    const box = document.getElementById('high-scores-box');
    const toggleBtn = document.getElementById('hs-toggle-btn');
    const headerBtn = document.getElementById('hs-header-btn');
    const toggleBox = (e) => {
      e.stopPropagation();
      if (!box) return;
      box.classList.toggle('minimized');
      if (toggleBtn) {
        toggleBtn.textContent = box.classList.contains('minimized') ? '▲' : '▼';
      }
    };
    if (toggleBtn) toggleBtn.addEventListener('click', toggleBox);
    if (headerBtn) headerBtn.addEventListener('click', toggleBox);
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      sound.init();
      const code = e.code;

      if (code === 'Escape') {
        this.closeStageModal();
        return;
      }

      if (code === 'KeyN') {
        e.preventDefault();
        this.toggleStageModal();
        return;
      }

      if (code === 'ArrowLeft' || code === 'KeyA') {
        this.keys.left = true;
        if (this.state === STATE_SELECT) this.cycleFighter(-1);
      }
      if (code === 'ArrowRight' || code === 'KeyD') {
        this.keys.right = true;
        if (this.state === STATE_SELECT) this.cycleFighter(1);
      }
      if (code === 'ArrowUp' || code === 'KeyW') {
        this.keys.up = true;
        if (this.state === STATE_PLAYING && this.player) {
          this.player.jump();
        }
      }
      if (code === 'ArrowDown' || code === 'KeyS') {
        this.keys.down = true;
        if (this.state === STATE_PLAYING && this.player) {
          this.player.crouch(true);
        }
      }
      if (code === 'Space' || code === 'Enter' || code === 'KeyJ' || code === 'KeyZ') {
        e.preventDefault();
        this.keys.attack = true;
        this.handleActionKey();
      }
      if (code === 'KeyX' || code === 'KeyK') {
        e.preventDefault();
        this.keys.special = true;
        if (this.state === STATE_PLAYING && this.player) {
          this.triggerPlayerSpecial();
        }
      }
      // Key 'B' cycles background arena
      if (code === 'KeyB') {
        e.preventDefault();
        this.cycleArena(1);
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = false;
      if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = false;
      if (code === 'ArrowUp' || code === 'KeyW') this.keys.up = false;
      if (code === 'ArrowDown' || code === 'KeyS') {
        this.keys.down = false;
        if (this.state === STATE_PLAYING && this.player) {
          this.player.crouch(false);
        }
      }
      if (code === 'Space' || code === 'Enter' || code === 'KeyJ' || code === 'KeyZ') {
        this.keys.attack = false;
      }
      if (code === 'KeyX' || code === 'KeyK') {
        this.keys.special = false;
      }
    });

    // Canvas click to select character, change stage/arena, or start battle
    this.canvas.addEventListener('click', (e) => {
      sound.init();
      this.canvas.focus();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      if (this.state === STATE_SELECT) {
        // Check character card clicked
        const cardWidth = 160;
        const cardHeight = 225;
        const spacing = 24;
        const totalW = this.rosterKeys.length * cardWidth + (this.rosterKeys.length - 1) * spacing;
        const startX = (CANVAS_WIDTH - totalW) / 2;
        const cardY = 80;

        let cardClicked = false;
        this.rosterKeys.forEach((key, idx) => {
          const cx = startX + idx * (cardWidth + spacing);
          if (mx >= cx && mx <= cx + cardWidth && my >= cardY && my <= cardY + cardHeight) {
            cardClicked = true;
            this.selectedFighterId = key;
            if (key === 'sayon' && !this.isSayonUnlocked) {
              sound.playDenied();
              this.lockNotice = '🔒 Sayon is LOCKED! Defeat the Level 15 Final Boss to unlock!';
              this.lockNoticeTimer = 180;
              this.screenShake = 4;
              return;
            }
            if (this.selectedFighterId === key) {
              // Clicked already selected unlocked card -> Start battle!
              this.startGame();
              return;
            }
            sound.playSelect();
            this.lockNotice = '';
          }
        });
        if (cardClicked) return;

        // Click Stage Selector Badge (Left Badge, Y: 365 to 395)
        if (mx >= CANVAS_WIDTH / 2 - 210 && mx < CANVAS_WIDTH / 2 && my >= 365 && my <= 395) {
          this.openStageModal();
          return;
        }

        // Click Arena Switcher Badge (Right Badge, Y: 365 to 395)
        if (mx >= CANVAS_WIDTH / 2 && mx <= CANVAS_WIDTH / 2 + 210 && my >= 365 && my <= 395) {
          this.cycleArena(1);
          return;
        }

        // Clicking anywhere else on select screen (including start battle button) starts the game!
        this.startGame();
      } else if (this.state === STATE_GAMEOVER || this.state === STATE_VICTORY) {
        this.state = STATE_SELECT;
        sound.playSelect();
      }
    });
  }

  initTouchControls() {
    const bindBtn = (id, onDown, onUp) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        sound.init();
        btn.classList.add('active');
        onDown();
      };
      const end = (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        if (onUp) onUp();
      };
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
    };

    bindBtn('btn-left', () => {
      this.keys.left = true;
      if (this.state === STATE_SELECT) this.cycleFighter(-1);
    }, () => { this.keys.left = false; });

    bindBtn('btn-right', () => {
      this.keys.right = true;
      if (this.state === STATE_SELECT) this.cycleFighter(1);
    }, () => { this.keys.right = false; });

    bindBtn('btn-up', () => {
      this.keys.up = true;
      if (this.state === STATE_PLAYING && this.player) this.player.jump();
    }, () => { this.keys.up = false; });

    bindBtn('btn-down', () => {
      this.keys.down = true;
      if (this.state === STATE_PLAYING && this.player) this.player.crouch(true);
    }, () => {
      this.keys.down = false;
      if (this.state === STATE_PLAYING && this.player) this.player.crouch(false);
    });

    bindBtn('btn-atk', () => {
      this.handleActionKey();
    });

    bindBtn('btn-sp', () => {
      if (this.state === STATE_PLAYING && this.player) {
        this.triggerPlayerSpecial();
      }
    });
  }

  cycleFighter(dir) {
    const currentIdx = this.rosterKeys.indexOf(this.selectedFighterId);
    let nextIdx = (currentIdx + dir + this.rosterKeys.length) % this.rosterKeys.length;
    this.selectedFighterId = this.rosterKeys[nextIdx];

    if (this.selectedFighterId === 'sayon' && !this.isSayonUnlocked) {
      sound.playDenied();
      this.lockNotice = '🔒 Sayon is locked! Complete all 15 stages to unlock!';
      this.lockNoticeTimer = 150;
    } else {
      sound.playSelect();
      this.lockNotice = '';
    }
  }

  cycleArena(dir) {
    const available = this.arenaKeys;
    let nextIndex = 0;
    if (this.customArenaTheme) {
      const curIdx = available.indexOf(this.customArenaTheme);
      nextIndex = (curIdx + dir + available.length) % available.length;
    } else {
      const levelTheme = LEVELS[this.currentLevelIndex]?.bgTheme || 'alley';
      const curIdx = available.indexOf(levelTheme);
      nextIndex = (curIdx + dir + available.length) % available.length;
    }
    this.customArenaTheme = available[nextIndex];
    this.arenaBannerTimer = 120; // 2 sec HUD notification banner
    sound.playSelect();
  }

  handleActionKey() {
    if (this.state === STATE_SELECT) {
      this.startGame();
    } else if (this.state === STATE_PLAYING) {
      if (this.player) {
        const attack = this.player.lightAttack();
        if (attack) {
          this.currentAttackHitSet.clear();
          sound.playPunch();
        }
      }
    } else if (this.state === STATE_GAMEOVER || this.state === STATE_VICTORY) {
      this.state = STATE_SELECT;
      sound.playSelect();
    }
  }

  startGame() {
    const fighterData = ROSTER[this.selectedFighterId] || ROSTER.sayon || ROSTER.bob;
    this.player = new Player(fighterData);
    this.currentLevelIndex = this.selectedLevelIndex;
    this.devIntroTimer = 210; // ~3.5s "DEVELOPED BY SAYON" intro splash!
    this.startLevel(this.currentLevelIndex);
    this.state = STATE_PLAYING;
    this.updateHighScoresUI();
    this.updateStageButtonUI();
    sound.playSelect();
  }

  startLevel(index) {
    this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    const levelConfig = LEVELS[this.currentLevelIndex];

    this.enemies = [];
    this.enemiesRemainingToSpawn = levelConfig.enemyCount;
    this.boss = null;
    this.bossSpawned = false;

    this.projectiles = [];
    this.particles = [];
    this.damageTexts = [];
    this.shockwaves = [];
    this.droppedItems = [];

    // Spawn 2-3 breakable crates and barrels per level
    this.props = [];
    const propPositions = [180 + Math.random() * 50, 420 + Math.random() * 50, 640 + Math.random() * 50];
    const numProps = index === 0 ? 2 : 3;
    for (let i = 0; i < numProps; i++) {
      const type = (i % 2 === 0) ? 'crate' : 'barrel';
      this.props.push(new BreakableProp(propPositions[i], type));
    }

    if (this.player) {
      this.player.resetPosition();
      // Partial heal on level start
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
      this.player.energy = this.player.maxEnergy;
    }

    this.updateStageButtonUI();
    this.spawnEnemyWave();
  }

  spawnEnemyWave() {
    const levelConfig = LEVELS[this.currentLevelIndex];
    const spawnCount = Math.min(2, this.enemiesRemainingToSpawn);

    for (let i = 0; i < spawnCount; i++) {
      // Alternate left and right side spawns
      const spawnX = Math.random() > 0.5 ? -40 : CANVAS_WIDTH + 40;
      this.enemies.push(new Enemy(spawnX, levelConfig));
      this.enemiesRemainingToSpawn--;
    }
  }

  spawnBoss() {
    const levelConfig = LEVELS[this.currentLevelIndex];
    const bossData = levelConfig.boss;
    const spawnX = CANVAS_WIDTH - 120;
    this.boss = new Boss(bossData, spawnX);
    this.bossSpawned = true;
    this.screenShake = 16;
    sound.playBossAlert();
    this.shockwaves.push(new ShockwaveRing(spawnX + 40, GROUND_Y - 20, 160, '#ef4444', 6));
  }

  triggerPlayerSpecial() {
    if (!this.player || this.player.energy < 40 || this.player.isSpecial || this.player.hitstun > 0) {
      sound.playDenied();
      return;
    }

    const specialCost = 40;
    this.player.energy -= specialCost;
    this.player.isSpecial = true;
    this.player.specialFrame = 0;
    this.screenShake = 10;
    sound.playSpecial();

    const charId = this.player.id;
    const px = this.player.x + (this.player.facing === 'right' ? this.player.width : 0);
    const py = this.player.y + 30;
    const dir = this.player.facing === 'right' ? 1 : -1;

    if (charId === 'bob') {
      // Bob: Ground Breaker Shockwave + Forward blast
      this.shockwaves.push(new ShockwaveRing(this.player.x + this.player.width / 2, GROUND_Y - 10, 130, '#ef4444', 6));
      this.checkPlayerAttackCollisions(
        { x: this.player.x - 30, y: GROUND_Y - 70, width: this.player.width + 60, height: 70 },
        this.player.data.attackPower * 2.2,
        true
      );
    } else if (charId === 'kira') {
      // Kira: Dual Wind Blades projectile volley
      this.projectiles.push(new Projectile(px, py - 12, dir * 11, this.player.data.attackPower * 1.3, true, 'energy', '#38bdf8', 14));
      this.projectiles.push(new Projectile(px, py + 12, dir * 11, this.player.data.attackPower * 1.3, true, 'energy', '#38bdf8', 14));
    } else if (charId === 'jax') {
      // Jax: Cyber Kinetic Cannon burst
      this.projectiles.push(new Projectile(px, py, dir * 12, this.player.data.attackPower * 2.4, true, 'beam', '#a855f7', 20));
      this.shockwaves.push(new ShockwaveRing(px, py, 90, '#a855f7', 4));
    } else if (charId === 'sayon') {
      // Grandmaster Sayon: Supreme Dragon God Barrage
      this.shockwaves.push(new ShockwaveRing(this.player.x + this.player.width / 2, GROUND_Y - 20, 180, '#f59e0b', 8));
      this.projectiles.push(new Projectile(px, py - 18, dir * 13, this.player.data.attackPower * 1.8, true, 'dragon', '#f59e0b', 18));
      this.projectiles.push(new Projectile(px, py, dir * 13, this.player.data.attackPower * 1.8, true, 'dragon', '#ef4444', 18));
      this.projectiles.push(new Projectile(px, py + 18, dir * 13, this.player.data.attackPower * 1.8, true, 'dragon', '#f59e0b', 18));
      this.checkPlayerAttackCollisions(
        { x: this.player.x - 50, y: this.player.y - 20, width: this.player.width + 100, height: this.player.height + 30 },
        this.player.data.attackPower * 2.6,
        true
      );
    }
  }

  checkPlayerAttackCollisions(hitbox, damage, isSpecialAttack = false) {
    if (!hitbox) return;

    // Check hit on regular enemies
    this.enemies.forEach((enemy) => {
      if (!this.currentAttackHitSet.has(enemy) || isSpecialAttack) {
        const eHurt = enemy.getHurtbox();
        if (this.rectsIntersect(hitbox, eHurt)) {
          this.currentAttackHitSet.add(enemy);
          enemy.takeDamage(damage, this.player.x);
          this.player.comboCount++;
          this.player.comboTimer = 70;
          this.player.score += Math.round(damage * 10);
          this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 6);

          this.damageTexts.push(new DamageText(enemy.x + 10, enemy.y, `-${Math.round(damage)}`, '#facc15', 18));
          this.spawnHitParticles(enemy.x + enemy.width / 2, enemy.y + 20, '#f59e0b');

          if (this.player.comboCount % 5 === 0) {
            sound.playComboMilestone();
          }

          if (enemy.hp <= 0 && Math.random() < 0.35) {
            // Chance to drop food or energy
            const dropType = Math.random() > 0.5 ? 'food' : 'energy';
            this.droppedItems.push(new DroppedItem(enemy.x, GROUND_Y - 20, dropType));
          }
        }
      }
    });

    // Check hit on Boss
    if (this.boss && this.boss.active && (!this.currentAttackHitSet.has(this.boss) || isSpecialAttack)) {
      const bHurt = this.boss.getHurtbox();
      if (this.rectsIntersect(hitbox, bHurt)) {
        this.currentAttackHitSet.add(this.boss);
        const actualDamage = this.boss.takeDamage(damage, this.player.x);
        this.player.comboCount++;
        this.player.comboTimer = 70;
        this.player.score += Math.round(actualDamage * 15);
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 8);

        this.damageTexts.push(new DamageText(this.boss.x + 15, this.boss.y, `-${Math.round(actualDamage)}`, '#ef4444', 22));
        this.spawnHitParticles(this.boss.x + this.boss.width / 2, this.boss.y + 30, '#ef4444');

        if (this.boss.hp <= 0) {
          this.boss.active = false;
          this.player.score += 5000;
          this.triggerLevelClear();
        }
      }
    }

    // Check hit on Breakable Props (Crates & Barrels)
    this.props.forEach((prop) => {
      if (!prop.destroyed && (!this.currentAttackHitSet.has(prop) || isSpecialAttack)) {
        if (this.rectsIntersect(hitbox, prop.getHurtbox())) {
          this.currentAttackHitSet.add(prop);
          const drop = prop.hit();
          this.damageTexts.push(new DamageText(prop.x + 10, prop.y, 'CRACK!', '#cbd5e1', 14));
          this.spawnHitParticles(prop.x + prop.width / 2, prop.y + 15, '#b45309');
          if (drop) {
            this.droppedItems.push(drop);
          }
        }
      }
    });
  }

  triggerLevelClear() {
    this.state = STATE_LEVEL_CLEAR;
    this.levelClearTimer = 180; // ~3 seconds at 60 FPS
    this.player.score += 1000;
    this.checkAndSaveHighScore(this.player.score, this.player.name);

    // Save and advance unlocked levels permanently to localStorage!
    const nextLevelNum = this.currentLevelIndex + 2; // e.g. beat lvl index 0 (lvl 1) -> unlocks level 2
    if (nextLevelNum > this.maxUnlockedLevel) {
      this.saveUnlockedLevel(nextLevelNum);
    }

    sound.playLevelClear();
  }

  rectsIntersect(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  spawnHitParticles(x, y, color = '#f59e0b') {
    for (let i = 0; i < 6; i++) {
      const vx = (Math.random() - 0.5) * 6;
      const vy = (Math.random() - 0.5) * 6 - 2;
      this.particles.push(new Particle(x, y, vx, vy, color, Math.random() * 3 + 2, 16));
    }
  }

  spawnShockwave(x, y, maxRadius, color, lineWidth) {
    this.shockwaves.push(new ShockwaveRing(x, y, maxRadius, color, lineWidth));
  }

  update() {
    this.animTimer++;
    if (this.screenShake > 0) this.screenShake--;
    if (this.lockNoticeTimer > 0) {
      this.lockNoticeTimer--;
      if (this.lockNoticeTimer === 0) this.lockNotice = '';
    }
    if (this.arenaBannerTimer > 0) this.arenaBannerTimer--;

    // Dynamic lightning trigger for storm/cyber themes
    const activeTheme = this.customArenaTheme || LEVELS[this.currentLevelIndex]?.bgTheme || 'alley';
    if ((activeTheme === 'docks' || activeTheme === 'highway') && Math.random() < 0.003) {
      this.lightningFlash = 12;
      sound.playThunder();
    }
    if (this.lightningFlash > 0) this.lightningFlash--;

    if (this.state === STATE_PLAYING) {
      if (this.devIntroTimer > 0) this.devIntroTimer--;

      // 1. Update Player
      if (this.player) {
        this.player.update(this.keys);

        // Check active attack collisions during swing frames (frames 1 to 9)
        if (this.player.isAttacking && this.player.attackFrame >= 1 && this.player.attackFrame <= 9) {
          const hitbox = this.player.getHitbox();
          if (hitbox) {
            const dmg = this.player.data.attackPower * (1 + (this.player.attackPhase - 1) * 0.35);
            this.checkPlayerAttackCollisions(hitbox, dmg, false);
          }
        }

        if (this.player.hp <= 0) {
          this.state = STATE_GAMEOVER;
          this.checkAndSaveHighScore(this.player.score, this.player.name);
          sound.playGameOver();
          return;
        }
      }

      // 2. Wave Progression & Spawning
      if (this.enemiesRemainingToSpawn > 0 && this.enemies.length < 3) {
        this.spawnEnemyWave();
      } else if (this.enemiesRemainingToSpawn <= 0 && this.enemies.length === 0 && !this.bossSpawned) {
        this.spawnBoss();
      }

      // 3. Update Regular Enemies
      this.enemies.forEach((enemy) => {
        enemy.update(this.player);

        // Check enemy attack on player
        const eHitbox = enemy.getHitbox();
        if (eHitbox && this.player) {
          const pHurt = this.player.getHurtbox();
          if (this.rectsIntersect(eHitbox, pHurt)) {
            const { actual, blocked } = this.player.takeDamage(enemy.damage, enemy.x);
            if (actual > 0 || blocked) {
              this.damageTexts.push(
                new DamageText(
                  this.player.x + 10,
                  this.player.y,
                  blocked ? 'BLOCKED!' : `-${actual}`,
                  blocked ? '#38bdf8' : '#ef4444',
                  blocked ? 14 : 18
                )
              );
              this.spawnHitParticles(this.player.x + this.player.width / 2, this.player.y + 30, blocked ? '#38bdf8' : '#dc2626');
            }
          }
        }
      });
      this.enemies = this.enemies.filter((e) => e.active);

      // 4. Update Boss
      if (this.boss && this.boss.active) {
        this.boss.update(
          this.player,
          (px, py, pvx, dmg, fromP, type, col, sz) => {
            this.projectiles.push(new Projectile(px, py, pvx, dmg, fromP, type, col, sz));
          },
          (sx, sy, mr, sc, lw) => {
            this.spawnShockwave(sx, sy, mr, sc, lw);
          }
        );

        // Check boss attack on player
        const bHitbox = this.boss.getHitbox();
        if (bHitbox && this.player) {
          const pHurt = this.player.getHurtbox();
          if (this.rectsIntersect(bHitbox, pHurt)) {
            const { actual, blocked } = this.player.takeDamage(this.boss.damage, this.boss.x);
            if (actual > 0 || blocked) {
              this.damageTexts.push(
                new DamageText(
                  this.player.x + 10,
                  this.player.y,
                  blocked ? 'BLOCKED!' : `-${actual}`,
                  blocked ? '#38bdf8' : '#ef4444',
                  blocked ? 16 : 22
                )
              );
              this.spawnHitParticles(this.player.x + this.player.width / 2, this.player.y + 30, blocked ? '#38bdf8' : '#dc2626');
            }
          }
        }
      }

      // 5. Update Projectiles
      this.projectiles.forEach((proj) => {
        proj.update();
        if (!proj.active) return;

        if (proj.fromPlayer) {
          // Hits enemies
          this.enemies.forEach((enemy) => {
            if (!proj.hitEntities.has(enemy) && this.rectsIntersect({ x: proj.x - proj.size, y: proj.y - proj.size, width: proj.size * 2, height: proj.size * 2 }, enemy.getHurtbox())) {
              proj.hitEntities.add(enemy);
              enemy.takeDamage(proj.damage, proj.x);
              this.damageTexts.push(new DamageText(enemy.x, enemy.y, `-${Math.round(proj.damage)}`, '#10b981', 18));
              this.spawnHitParticles(enemy.x + enemy.width / 2, enemy.y + 20, '#10b981');
            }
          });
          // Hits boss
          if (this.boss && this.boss.active && !proj.hitEntities.has(this.boss)) {
            if (this.rectsIntersect({ x: proj.x - proj.size, y: proj.y - proj.size, width: proj.size * 2, height: proj.size * 2 }, this.boss.getHurtbox())) {
              proj.hitEntities.add(this.boss);
              const actual = this.boss.takeDamage(proj.damage, proj.x);
              this.damageTexts.push(new DamageText(this.boss.x, this.boss.y, `-${Math.round(actual)}`, '#10b981', 20));
              this.spawnHitParticles(this.boss.x + this.boss.width / 2, this.boss.y + 25, '#10b981');
              if (this.boss.hp <= 0) {
                this.boss.active = false;
                this.triggerLevelClear();
              }
            }
          }
        } else {
          // Hits player
          if (this.player && this.rectsIntersect({ x: proj.x - proj.size, y: proj.y - proj.size, width: proj.size * 2, height: proj.size * 2 }, this.player.getHurtbox())) {
            proj.active = false;
            const { actual, blocked } = this.player.takeDamage(proj.damage, proj.x);
            if (actual > 0 || blocked) {
              this.damageTexts.push(new DamageText(this.player.x, this.player.y, blocked ? 'BLOCKED!' : `-${actual}`, blocked ? '#38bdf8' : '#ef4444', 18));
              this.spawnHitParticles(this.player.x + this.player.width / 2, this.player.y + 20, blocked ? '#38bdf8' : '#ef4444');
            }
          }
        }
      });
      this.projectiles = this.projectiles.filter((p) => p.active);

      // 6. Update Dropped Items (Food, Energy, Coins)
      this.droppedItems.forEach((item) => {
        item.update();
        if (item.active && this.player) {
          if (this.rectsIntersect(item.getHurtbox(), this.player.getHurtbox())) {
            const effect = item.collect(this.player);
            sound.playItemPickup();
            this.damageTexts.push(new DamageText(this.player.x, this.player.y - 20, effect.text, effect.color, 16));
          }
        }
      });
      this.droppedItems = this.droppedItems.filter((i) => i.active);

      // 7. Update Breakable Props
      this.props.forEach((prop) => prop.update());
      this.props = this.props.filter((pr) => !pr.destroyed || pr.breakTimer > 0);

      // 8. Update Particles, Damage Numbers, Shockwaves
      this.particles.forEach((p) => p.update());
      this.particles = this.particles.filter((p) => p.active);

      this.damageTexts.forEach((d) => d.update());
      this.damageTexts = this.damageTexts.filter((d) => d.active);

      this.shockwaves.forEach((s) => s.update());
      this.shockwaves = this.shockwaves.filter((s) => s.active);

      // High-performance garbage-collection limits
      if (this.particles.length > 70) this.particles.splice(0, this.particles.length - 70);
      if (this.damageTexts.length > 20) this.damageTexts.splice(0, this.damageTexts.length - 20);
      if (this.projectiles.length > 25) this.projectiles.splice(0, this.projectiles.length - 25);
    } else if (this.state === STATE_LEVEL_CLEAR) {
      this.levelClearTimer--;
      if (this.levelClearTimer <= 0) {
        if (this.currentLevelIndex + 1 >= LEVELS.length) {
          this.state = STATE_VICTORY;
          this.checkAndSaveHighScore(this.player.score, this.player.name);

          // Unlock Grandmaster Sayon if not yet unlocked
          if (!this.isSayonUnlocked) {
            this.isSayonUnlocked = true;
            try {
              localStorage.setItem('urban_clash_sayon_unlocked', 'true');
            } catch (e) {
              // fallback
            }
            this.hasCelebratedUnlock = true;
            sound.playUnlock();
          }
        } else {
          const nextIndex = this.currentLevelIndex + 1;
          this.saveSelectedLevel(nextIndex);
          this.startLevel(nextIndex);
          this.state = STATE_PLAYING;
        }
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake Effect
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    const levelConfig = LEVELS[this.currentLevelIndex] || LEVELS[0];
    const activeTheme = this.customArenaTheme || levelConfig?.bgTheme || 'alley';
    const activeArenaObj = getArenaInfo(activeTheme);
    const arenaName = activeArenaObj?.name || 'Downtown Alleyway';

    if (this.state === STATE_SELECT) {
      this.renderer.drawSelectScreen(
        ROSTER,
        this.selectedFighterId,
        this.animTimer,
        this.isSayonUnlocked,
        this.lockNotice,
        activeArenaObj,
        LEVELS[this.selectedLevelIndex] || LEVELS[0]
      );
    } else {
      // 1. Draw Parallax Background Arena & Lighting
      this.renderer.drawBackground(activeTheme, levelConfig.level, this.animTimer, this.lightningFlash, arenaName);

      // 2. Draw Breakable Props (Crates & Barrels)
      this.props.forEach((prop) => {
        prop.draw(ctx);
      });

      // 3. Draw Dropped Pickups
      this.droppedItems.forEach((item) => {
        item.draw(ctx);
      });

      // 4. Draw Regular Enemies
      this.enemies.forEach((enemy) => {
        this.renderer.drawEnemy(enemy);
      });

      // 5. Draw Boss
      if (this.boss && this.boss.active) {
        this.renderer.drawBoss(this.boss);
      }

      // 6. Draw Player
      if (this.player) {
        this.renderer.drawPlayer(this.player);
      }

      // 7. Draw Projectiles
      this.projectiles.forEach((proj) => {
        proj.draw(ctx);
      });

      // 8. Draw Shockwaves
      this.shockwaves.forEach((shock) => {
        shock.draw(ctx);
      });

      // 9. Draw Particle FX
      this.particles.forEach((part) => {
        part.draw(ctx);
      });

      // 10. Draw Damage Text Indicators
      this.damageTexts.forEach((d) => {
        d.draw(ctx);
      });

      // 11. Draw HUD with Active Arena Name & Toast
      if (this.player) {
        this.renderer.drawHUD(this.player, levelConfig, this.boss, arenaName, this.arenaBannerTimer, this.devIntroTimer);
      }

      // 12. Overlays for Level Clear, Game Over, Victory
      if (this.state === STATE_LEVEL_CLEAR) {
        this.renderer.drawLevelClear(levelConfig, this.player.score, this.levelClearTimer);
      } else if (this.state === STATE_GAMEOVER) {
        this.renderer.drawGameOver(this.player.score, levelConfig.level);
      } else if (this.state === STATE_VICTORY) {
        this.renderer.drawVictory(this.player.score, this.player.name, this.hasCelebratedUnlock);
      }
    }

    ctx.restore();
  }

  loop() {
    try {
      this.update();
      this.render();
    } catch (err) {
      console.error('Frame recovered:', err);
    } finally {
      requestAnimationFrame(this.loop);
    }
  }
}

// Instantiate game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new UrbanClashGame();
});
