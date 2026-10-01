import { CANVAS_WIDTH, GROUND_Y, GRAVITY } from './constants.js';
import { sound } from './audio.js';

export class DamageText {
  constructor(x, y, text, color = '#f8fafc', size = 16) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 45;
    this.maxLife = 45;
    this.vy = -1.5;
  }

  update() {
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${this.size}px monospace`;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity on particles
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ShockwaveRing {
  constructor(x, y, maxRadius, color = '#38bdf8', lineWidth = 4) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.maxRadius = maxRadius;
    this.color = color;
    this.lineWidth = lineWidth;
    this.life = 25;
    this.maxLife = 25;
  }

  update() {
    this.radius += (this.maxRadius - 5) / this.maxLife;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export class Projectile {
  constructor(x, y, vx, damage, fromPlayer, type = 'plasma', color = '#10b981', size = 16) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.damage = damage;
    this.fromPlayer = fromPlayer;
    this.type = type;
    this.color = color;
    this.size = size;
    this.active = true;
    this.life = 120;
    this.hitEntities = new Set();
  }

  update() {
    this.x += this.vx;
    this.life--;
    if (this.x < -50 || this.x > CANVAS_WIDTH + 50 || this.life <= 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;

    if (this.type === 'plasma') {
      // Cylindrical glowing beam
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.size * 1.8, this.size * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.size * 1.0, this.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'bullet') {
      // Pistol bullet
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(this.x - 8, this.y - 3, 16, 6);
    } else if (this.type === 'shadowOrb') {
      // Dark void orb
      ctx.fillStyle = '#a21caf';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'fireball') {
      // Magma fireball
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'iceShard') {
      // Glacial crystal shard
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(this.x + 12, this.y);
      ctx.lineTo(this.x - 12, this.y - 6);
      ctx.lineTo(this.x - 6, this.y);
      ctx.lineTo(this.x - 12, this.y + 6);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'windBlade') {
      // High-speed air cutter
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class Player {
  constructor(rosterData) {
    this.data = rosterData;
    this.id = rosterData.id;
    this.name = rosterData.name;
    this.width = 44;
    this.height = 76;
    this.x = 120;
    this.y = GROUND_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.facing = 'right';

    this.hp = rosterData.maxHp;
    this.maxHp = rosterData.maxHp;
    this.energy = rosterData.maxEnergy;
    this.maxEnergy = rosterData.maxEnergy;
    this.score = 0;
    this.comboCount = 0;
    this.comboTimer = 0;

    // States
    this.isGrounded = true;
    this.isCrouching = false;
    this.isAttacking = false;
    this.isSpecial = false;
    this.attackFrame = 0;
    this.attackPhase = 1; // 1, 2, or 3 combo stage
    this.specialFrame = 0;
    this.hitstun = 0;
    this.invulnerable = 0;
    this.animTimer = 0;
  }

  resetPosition() {
    this.x = 120;
    this.y = GROUND_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.facing = 'right';
    this.isAttacking = false;
    this.isSpecial = false;
  }

  jump() {
    if (this.isGrounded && !this.isCrouching && this.hitstun <= 0) {
      this.vy = this.data.jumpForce;
      this.isGrounded = false;
      sound.playJump();
    }
  }

  crouch(isDown) {
    if (!isDown) {
      this.isCrouching = false;
      return;
    }
    if (this.isGrounded && !this.isAttacking && !this.isSpecial && this.hitstun <= 0) {
      this.isCrouching = true;
    }
  }

  lightAttack() {
    if (this.isAttacking || this.isSpecial || this.hitstun > 0) return null;

    this.isAttacking = true;
    this.attackFrame = 0;

    // Advance combo if pressed within window
    if (this.comboTimer > 0) {
      this.attackPhase = (this.attackPhase % 3) + 1;
    } else {
      this.attackPhase = 1;
    }
    this.comboTimer = 35;
    sound.playPunch();

    return {
      phase: this.attackPhase,
      damage: this.data.attackPower * (1 + (this.attackPhase - 1) * 0.35),
    };
  }

  specialAttack() {
    if (this.isAttacking || this.isSpecial || this.hitstun > 0) return null;
    if (this.energy < this.data.specialCost) return null;

    this.energy -= this.data.specialCost;
    this.isSpecial = true;
    this.specialFrame = 0;
    this.invulnerable = 25; // momentary i-frames
    sound.playSpecial();

    return {
      type: this.id,
      damage: this.data.attackPower * 2.6,
    };
  }

  takeDamage(amount, fromX) {
    if (this.invulnerable > 0) return { actual: 0, blocked: false };

    let actual = amount;
    let blocked = false;

    if (this.isCrouching) {
      actual = Math.round(amount * 0.25); // 75% damage reduction when crouching/blocking
      blocked = true;
      sound.playBlock();
      this.energy = Math.min(this.maxEnergy, this.energy + 8); // gain energy on block
    } else {
      sound.playHeavyHit();
      this.hitstun = 14;
      this.vx = fromX < this.x ? 4.5 : -4.5;
    }

    this.hp = Math.max(0, this.hp - actual);
    this.invulnerable = 20;

    // Reset combo if hit
    this.comboCount = 0;
    return { actual, blocked };
  }

  update(keys) {
    this.animTimer++;
    if (this.comboTimer > 0) this.comboTimer--;
    if (this.hitstun > 0) this.hitstun--;
    if (this.invulnerable > 0) this.invulnerable--;

    // Key release watchdog: never get stuck in crouch if down key is not pressed
    if (!keys || !keys.down) {
      this.isCrouching = false;
    }

    // Passive energy recharge
    if (this.energy < this.maxEnergy && this.animTimer % 10 === 0) {
      this.energy += 1;
    }

    // Horizontal movement
    if (this.hitstun <= 0 && !this.isCrouching && !this.isSpecial) {
      if (keys.left) {
        this.vx = -this.data.speed;
        this.facing = 'left';
      } else if (keys.right) {
        this.vx = this.data.speed;
        this.facing = 'right';
      } else {
        this.vx *= 0.7;
        if (Math.abs(this.vx) < 0.2) this.vx = 0;
      }
    } else if (this.isCrouching) {
      this.vx = 0;
    }

    // Attack state progression with failsafe
    if (this.isAttacking) {
      this.attackFrame++;
      if (this.attackFrame > 14) {
        this.isAttacking = false;
        this.attackFrame = 0;
      }
    }

    // Special state progression with failsafe
    if (this.isSpecial) {
      this.specialFrame++;
      if (this.id === 'sayon') {
        // Dash kick forward rapidly
        this.vx = this.facing === 'right' ? 7.5 : -7.5;
      }
      if (this.specialFrame > 28) {
        this.isSpecial = false;
        this.specialFrame = 0;
      }
    }

    // State watchdog: clamp excessive hitstun
    if (this.hitstun > 25) this.hitstun = 0;

    // Gravity & Vertical Physics
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Ground check
    const currentHeight = this.isCrouching ? this.height * 0.7 : this.height;
    if (this.y + currentHeight >= GROUND_Y) {
      this.y = GROUND_Y - currentHeight;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Screen bounds check
    if (this.x < 15) this.x = 15;
    if (this.x + this.width > CANVAS_WIDTH - 15) this.x = CANVAS_WIDTH - 15 - this.width;
  }

  getHitbox() {
    if (!this.isAttacking && !this.isSpecial) return null;

    const reach = this.isSpecial ? 75 : 55;
    const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
    const hy = this.isCrouching ? this.y + 10 : this.y + 15;
    const hw = reach;
    const hh = 40;

    return { x: hx, y: hy, width: hw, height: hh };
  }

  getHurtbox() {
    const h = this.isCrouching ? this.height * 0.7 : this.height;
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: h,
    };
  }
}

export class Enemy {
  constructor(x, config) {
    this.x = x;
    this.width = 40;
    this.height = 72;
    this.y = GROUND_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.facing = 'left';

    this.type = config.enemyType;
    this.color = config.enemyColor;
    this.hp = config.enemyHp;
    this.maxHp = config.enemyHp;
    this.speed = config.enemySpeed;
    this.damage = config.enemyDamage;

    this.hitstun = 0;
    this.attackCooldown = Math.floor(Math.random() * 40) + 40;
    this.isAttacking = false;
    this.attackFrame = 0;
    this.active = true;
    this.animTimer = Math.floor(Math.random() * 60);
  }

  update(player) {
    this.animTimer++;
    if (this.hitstun > 0) {
      this.hitstun--;
      this.x += this.vx;
      this.vx *= 0.85;
      if (this.x < 10) this.x = 10;
      if (this.x + this.width > CANVAS_WIDTH - 10) this.x = CANVAS_WIDTH - 10 - this.width;
      return;
    }

    // Face player
    this.facing = player.x > this.x ? 'right' : 'left';
    const dist = Math.abs(player.x - this.x);

    if (this.isAttacking) {
      this.attackFrame++;
      if (this.attackFrame > 20) {
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackCooldown = Math.floor(Math.random() * 45) + 40;
      }
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.hitstun > 18) this.hitstun = 0;

    // Move toward player
    if (dist > 52) {
      this.vx = this.facing === 'right' ? this.speed : -this.speed;
      this.x += this.vx;
    } else {
      this.vx = 0;
      // In attack range
      if (this.attackCooldown <= 0) {
        this.isAttacking = true;
        this.attackFrame = 0;
        sound.playPunch();
      }
    }

    // Keep on screen
    if (this.x < 10) this.x = 10;
    if (this.x + this.width > CANVAS_WIDTH - 10) this.x = CANVAS_WIDTH - 10 - this.width;
  }

  takeDamage(amount, fromX) {
    this.hp -= amount;
    this.hitstun = 16;
    this.isAttacking = false;
    this.attackFrame = 0;
    this.vx = fromX < this.x ? 5 : -5;
    sound.playHeavyHit();
    if (this.hp <= 0) {
      this.active = false;
    }
    if (this.x < 10) this.x = 10;
    if (this.x + this.width > CANVAS_WIDTH - 10) this.x = CANVAS_WIDTH - 10 - this.width;
  }

  getHitbox() {
    if (!this.isAttacking || this.attackFrame < 8 || this.attackFrame > 16) return null;
    const reach = 38;
    const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
    return {
      x: hx,
      y: this.y + 18,
      width: reach,
      height: 35,
    };
  }

  getHurtbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

export class Boss {
  constructor(bossData) {
    this.data = bossData;
    this.name = bossData.name;
    this.title = bossData.title;
    this.attackType = bossData.attackType;
    this.width = 52;
    this.height = 86;
    this.x = CANVAS_WIDTH - 130;
    this.y = GROUND_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.facing = 'left';

    this.hp = bossData.hp;
    this.maxHp = bossData.hp;
    this.speed = bossData.speed;
    this.damage = bossData.damage;
    this.color = bossData.color;

    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackCooldown = 0;
    this.specialCooldown = 90;
    this.specialTimer = 0;
    this.isSpecial = false;
    this.hitstun = 0;
    this.active = true;
    this.animTimer = 0;

    // Multi-phase flags for Overlord Shadow or Boss Duos
    this.phase = 1;
    this.shieldActive = this.attackType === 'shieldWall';
  }

  update(player, spawnProjectile, spawnShockwave) {
    this.animTimer++;
    if (this.hitstun > 0) {
      this.hitstun--;
      this.x += this.vx;
      this.vx *= 0.88;
      if (this.x < 20) this.x = 20;
      if (this.x + this.width > CANVAS_WIDTH - 20) this.x = CANVAS_WIDTH - 20 - this.width;
      return;
    }

    this.facing = player.x > this.x ? 'right' : 'left';
    const dist = Math.abs(player.x - this.x);

    // Check boss phase (Overlord Shadow transitions at 50% HP)
    if (this.attackType === 'teleportShadow' && this.hp < this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.speed *= 1.25;
      if (spawnShockwave) spawnShockwave(this.x + this.width / 2, GROUND_Y - 20, 120, '#ec4899', 6);
    }

    if (this.specialTimer > 0) this.specialTimer--;
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.hitstun > 18) this.hitstun = 0;
    if (this.specialFrame > 50) {
      this.isSpecial = false;
      this.specialFrame = 0;
    }

    // Attack action execution
    if (this.isSpecial) {
      this.updateSpecial(player, spawnProjectile, spawnShockwave);
      return;
    }

    if (this.isAttacking) {
      this.attackFrame++;
      if (this.attackFrame > 24) {
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackCooldown = Math.floor(Math.random() * 25) + 30; // breather window for player!
      }
      return;
    }

    // Decide whether to initiate Special Attack
    if (this.specialTimer <= 0) {
      this.initiateSpecial(player, spawnShockwave);
      return;
    }

    // Standard chase logic with attack cooldown
    if (dist > 60) {
      this.vx = this.facing === 'right' ? this.speed : -this.speed;
      this.x += this.vx;
    } else {
      this.vx = 0;
      if (this.attackCooldown <= 0) {
        this.isAttacking = true;
        this.attackFrame = 0;
        sound.playPunch();
      }
    }

    // Keep inside boundaries
    if (this.x < 20) this.x = 20;
    if (this.x + this.width > CANVAS_WIDTH - 20) this.x = CANVAS_WIDTH - 20 - this.width;
  }

  initiateSpecial(player, spawnShockwave) {
    this.isSpecial = true;
    this.specialFrame = 0;
    this.specialTimer = this.data.specialCooldown;
    sound.playBossAlert();

    if (this.attackType === 'unstoppableGrab' || this.attackType === 'sonicDash') {
      this.vx = this.facing === 'right' ? 9.5 : -9.5;
    } else if (this.attackType === 'divebomb') {
      this.vy = -12; // launch up
    } else if (this.attackType === 'teleportShadow' || this.attackType === 'apexCataclysm') {
      // Vanish and teleport behind player
      if (spawnShockwave) spawnShockwave(this.x + this.width / 2, this.y + this.height / 2, 80, '#a21caf', 5);
      const targetOffset = player.facing === 'right' ? -70 : 70;
      this.x = Math.max(30, Math.min(CANVAS_WIDTH - 90, player.x + targetOffset));
      this.facing = this.x < player.x ? 'right' : 'left';
    }
  }

  updateSpecial(player, spawnProjectile, spawnShockwave) {
    this.specialFrame++;

    if (this.attackType === 'hammer') {
      // Sledge slams hammer onto ground
      if (this.specialFrame === 18) {
        sound.playHeavyHit();
        if (spawnShockwave) {
          spawnShockwave(this.x + (this.facing === 'right' ? 70 : -30), GROUND_Y - 10, 90, '#ef4444', 5);
        }
      }
      if (this.specialFrame > 35) this.isSpecial = false;
    } else if (this.attackType === 'dash') {
      // Viper dashes forward
      this.vx = this.facing === 'right' ? 9.5 : -9.5;
      this.x += this.vx;
      if (this.specialFrame > 22) {
        this.vx = 0;
        this.isSpecial = false;
      }
    } else if (this.attackType === 'staff') {
      // Master Lee spins bo staff
      this.vx = this.facing === 'right' ? 2.5 : -2.5;
      this.x += this.vx;
      if (this.specialFrame > 40) this.isSpecial = false;
    } else if (this.attackType === 'hook') {
      // Anchor throws chain hook
      if (this.specialFrame === 15 && spawnProjectile) {
        const pvx = this.facing === 'right' ? 8 : -8;
        spawnProjectile(this.x + (this.facing === 'right' ? 50 : -20), this.y + 35, pvx, this.damage * 0.8, false, 'bullet', '#94a3b8', 12);
      }
      if (this.specialFrame > 30) this.isSpecial = false;
    } else if (this.attackType === 'pistol') {
      // Cross fires shots
      if ((this.specialFrame === 10 || this.specialFrame === 22) && spawnProjectile) {
        const pvx = this.facing === 'right' ? 9 : -9;
        spawnProjectile(this.x + (this.facing === 'right' ? 50 : -20), this.y + 30, pvx, this.damage * 0.7, false, 'bullet', '#f59e0b', 8);
        sound.playPunch();
      }
      if (this.specialFrame > 36) this.isSpecial = false;
    } else if (this.attackType === 'divebomb') {
      // Helios flying down
      this.vy += GRAVITY * 0.8;
      this.y += this.vy;
      if (this.y + this.height >= GROUND_Y) {
        this.y = GROUND_Y - this.height;
        this.vy = 0;
        sound.playHeavyHit();
        if (spawnShockwave) spawnShockwave(this.x + this.width / 2, GROUND_Y - 10, 100, '#fbbf24', 6);
        this.isSpecial = false;
      }
    } else if (this.attackType === 'unstoppableGrab') {
      this.x += this.vx;
      if (this.specialFrame > 25) {
        this.vx = 0;
        this.isSpecial = false;
      }
    } else if (this.attackType === 'shockAoE') {
      if (this.specialFrame === 16 && spawnShockwave) {
        spawnShockwave(this.x + this.width / 2, GROUND_Y - 15, 130, '#06b6d4', 6);
        sound.playSpecial();
      }
      if (this.specialFrame > 35) this.isSpecial = false;
    } else if (this.attackType === 'shieldWall') {
      this.vx = this.facing === 'right' ? 4 : -4;
      this.x += this.vx;
      if (this.specialFrame > 35) {
        this.vx = 0;
        this.isSpecial = false;
      }
    } else if (this.attackType === 'teleportShadow') {
      if (this.specialFrame === 12 && spawnProjectile) {
        // Multi-directional shadow orbs
        const pvx = this.facing === 'right' ? 7 : -7;
        spawnProjectile(this.x + (this.facing === 'right' ? 40 : -20), this.y + 30, pvx, this.damage * 0.85, false, 'shadowOrb', '#d946ef', 14);
      }
      if (this.specialFrame > 32) this.isSpecial = false;
    } else if (this.attackType === 'fireStomp') {
      // Ignis: Ground-splitting magma stomp + fireballs
      if (this.specialFrame === 16) {
        sound.playHeavyHit();
        if (spawnShockwave) spawnShockwave(this.x + this.width / 2, GROUND_Y - 10, 140, '#f97316', 7);
        if (spawnProjectile) {
          const pvx = this.facing === 'right' ? 8 : -8;
          spawnProjectile(this.x + (this.facing === 'right' ? 40 : -20), GROUND_Y - 30, pvx, this.damage * 0.8, false, 'fireball', '#f97316', 15);
        }
      }
      if (this.specialFrame > 35) this.isSpecial = false;
    } else if (this.attackType === 'iceShards') {
      // Frostbite: Ice crystal flurry
      if (this.specialFrame === 12 && spawnProjectile) {
        const pvx = this.facing === 'right' ? 9 : -9;
        spawnProjectile(this.x + (this.facing === 'right' ? 40 : -20), this.y + 20, pvx, this.damage * 0.8, false, 'iceShard', '#38bdf8', 12);
        spawnProjectile(this.x + (this.facing === 'right' ? 40 : -20), this.y + 40, pvx * 0.9, this.damage * 0.8, false, 'iceShard', '#7dd3fc', 10);
      }
      this.vx = this.facing === 'right' ? 4 : -4;
      this.x += this.vx;
      if (this.specialFrame > 30) {
        this.vx = 0;
        this.isSpecial = false;
      }
    } else if (this.attackType === 'sonicDash') {
      // Phantom Bullet: Mach 3 sonic dash with wind blades
      this.x += this.vx;
      if (this.specialFrame === 10 && spawnProjectile) {
        const pvx = this.facing === 'right' ? 12 : -12;
        spawnProjectile(this.x + (this.facing === 'right' ? 40 : -20), this.y + 30, pvx, this.damage * 0.9, false, 'windBlade', '#c7d2fe', 16);
      }
      if (this.specialFrame > 24) {
        this.vx = 0;
        this.isSpecial = false;
      }
    } else if (this.attackType === 'orbitalBeam') {
      // Omega Core: Orbital ion beam
      if (this.specialFrame === 16 && spawnShockwave) {
        sound.playSpecial();
        spawnShockwave(player.x + player.width / 2, GROUND_Y - 10, 160, '#10b981', 8);
      }
      if (this.specialFrame > 35) this.isSpecial = false;
    } else if (this.attackType === 'apexCataclysm') {
      // Arch-Overlord Shin: Cataclysmic void strike
      if (this.specialFrame === 14) {
        sound.playHeavyHit();
        if (spawnShockwave) spawnShockwave(this.x + this.width / 2, GROUND_Y - 15, 160, '#ec4899', 8);
        if (spawnProjectile) {
          const pvx = this.facing === 'right' ? 8.5 : -8.5;
          spawnProjectile(this.x + (this.facing === 'right' ? 50 : -20), this.y + 20, pvx, this.damage * 0.9, false, 'shadowOrb', '#f43f5e', 16);
          spawnProjectile(this.x + (this.facing === 'right' ? 50 : -20), this.y + 45, pvx * 0.8, this.damage * 0.9, false, 'shadowOrb', '#a855f7', 14);
        }
      }
      if (this.specialFrame > 36) this.isSpecial = false;
    }
  }

  takeDamage(amount, fromX) {
    let actual = amount;
    // Shield wall reduces damage if attacked from front
    if (this.attackType === 'shieldWall') {
      const isFromFront = (this.facing === 'left' && fromX < this.x) || (this.facing === 'right' && fromX > this.x);
      if (isFromFront) {
        actual = Math.round(amount * 0.55); // 45% reduction instead of 70%
        sound.playBlock();
      }
    }

    this.hp -= actual;
    this.hitstun = 10;
    if (!this.isSpecial) {
      this.isAttacking = false;
      this.attackFrame = 0;
      this.attackCooldown = 20;
    }
    this.vx = fromX < this.x ? 3 : -3;
    sound.playHeavyHit();

    if (this.hp <= 0) {
      this.active = false;
      this.isSpecial = false;
      this.isAttacking = false;
    }
    if (this.x < 20) this.x = 20;
    if (this.x + this.width > CANVAS_WIDTH - 20) this.x = CANVAS_WIDTH - 20 - this.width;
    return actual;
  }

  getHitbox() {
    if (!this.isAttacking && !this.isSpecial) return null;

    // Regular attack active frames check
    if (this.isAttacking) {
      if (this.attackFrame < 8 || this.attackFrame > 16) return null;
      const reach = 42;
      const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
      return {
        x: hx,
        y: this.y + 20,
        width: reach,
        height: 44,
      };
    }

    // Special attack active frames check
    if (this.isSpecial) {
      if (this.attackType === 'staff') {
        // Master Lee staff: active only during active swing frames
        if (this.specialFrame < 12 || this.specialFrame > 24) return null;
        const reach = 45;
        const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
        return { x: hx, y: this.y + 20, width: reach, height: 44 };
      }
      if (this.attackType === 'hammer') {
        if (this.specialFrame < 16 || this.specialFrame > 28) return null;
        const reach = 50;
        const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
        return { x: hx, y: this.y + 20, width: reach, height: 48 };
      }
      if (this.attackType === 'dash') {
        if (this.specialFrame < 4 || this.specialFrame > 18) return null;
        const reach = 46;
        const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
        return { x: hx, y: this.y + 20, width: reach, height: 44 };
      }
      if (this.attackType === 'unstoppableGrab') {
        if (this.specialFrame < 10 || this.specialFrame > 22) return null;
        const reach = 46;
        const hx = this.facing === 'right' ? this.x + this.width : this.x - reach;
        return { x: hx, y: this.y + 20, width: reach, height: 46 };
      }
    }

    return null;
  }

  getHurtbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

// Breakable Crates / Barrels scattered across arenas for players to smash
export class BreakableProp {
  constructor(x, type = 'crate') {
    this.type = type; // 'crate', 'barrel'
    this.width = 38;
    this.height = 42;
    this.x = x;
    this.y = GROUND_Y - this.height;
    this.hp = 25;
    this.maxHp = 25;
    this.shake = 0;
    this.active = true;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.shake = 6;
    if (this.hp <= 0) {
      this.active = false;
      sound.playCrateBreak();
      return true;
    } else {
      sound.playPunch();
      return false;
    }
  }

  dropItem() {
    const roll = Math.random();
    let type = 'health'; // 50% health roast
    if (roll > 0.5 && roll <= 0.8) type = 'energy'; // 30% battery
    else if (roll > 0.8) type = 'coin'; // 20% gold coin
    return new DroppedItem(this.x + this.width / 2 - 12, this.y + 8, type);
  }

  update() {
    if (this.shake > 0) this.shake--;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    const sx = this.shake > 0 ? (Math.random() - 0.5) * 6 : 0;

    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, GROUND_Y - 2, this.width * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'crate') {
      // Wooden Supply Crate
      ctx.fillStyle = '#92400e';
      ctx.fillRect(this.x + sx, this.y, this.width, this.height);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.x + sx, this.y, this.width, this.height);

      // Diagonal cross brace
      ctx.beginPath();
      ctx.moveTo(this.x + sx + 3, this.y + 3);
      ctx.lineTo(this.x + sx + this.width - 3, this.y + this.height - 3);
      ctx.moveTo(this.x + sx + this.width - 3, this.y + 3);
      ctx.lineTo(this.x + sx + 3, this.y + this.height - 3);
      ctx.stroke();

      // Highlight bevel
      ctx.fillStyle = '#b45309';
      ctx.fillRect(this.x + sx + 2, this.y + 2, this.width - 4, 4);
    } else {
      // Steel Explosive / Fuel Barrel
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(this.x + sx, this.y, this.width, this.height);
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x + sx, this.y, this.width, this.height);

      // Warning hazard stripes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(this.x + sx, this.y + 14, this.width, 10);
      ctx.fillStyle = '#000000';
      ctx.fillRect(this.x + sx + 6, this.y + 14, 6, 10);
      ctx.fillRect(this.x + sx + 18, this.y + 14, 6, 10);
      ctx.fillRect(this.x + sx + 30, this.y + 14, 6, 10);
    }
    ctx.restore();
  }

  getHurtbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

// Dropped Food, Power Batteries, and Gold Ingots
export class DroppedItem {
  constructor(x, y, type = 'health') {
    this.x = x;
    this.y = y;
    this.type = type; // 'health', 'energy', 'coin'
    this.value = type === 'health' ? 35 : type === 'energy' ? 40 : 500;
    this.vy = -4.5;
    this.vx = (Math.random() - 0.5) * 2.5;
    this.width = 24;
    this.height = 24;
    this.active = true;
    this.life = 700;
    this.animTimer = 0;
  }

  getHurtbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  update() {
    this.animTimer++;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY * 0.7;

    if (this.y + this.height >= GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.vy = -this.vy * 0.35;
      if (Math.abs(this.vy) < 0.8) this.vy = 0;
      this.vx *= 0.8;
    }
    this.life--;
    if (this.life <= 0) this.active = false;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    const floatY = Math.sin(this.animTimer * 0.12) * 4;
    const cy = this.y + floatY;

    // Soft glow shadow
    if (this.type === 'health') {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      // Roast Chicken / Meat
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(this.x + 12, cy + 12, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(this.x + 1, cy + 10, 5, 4);
    } else if (this.type === 'energy') {
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      // High-Voltage Battery Cell
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(this.x + 5, cy + 4, 14, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(this.x + 8, cy + 2, 8, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 8, cy + 8, 8, 8);
    } else {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14;
      // Champion Gold Coin / Ingot
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(this.x + 12, cy + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', this.x + 12, cy + 16);
    }
    ctx.restore();
  }
}
