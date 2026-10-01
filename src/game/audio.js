// Synthesized Web Audio API sound effects for arcade feel
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.hasInit = false;
    this.sharedNoiseBuffer = null;
    this.lastHeavyHitTime = 0;
  }

  init() {
    if (this.hasInit && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.hasInit = true;
        // Pre-allocate 1-second white noise buffer once to avoid runtime GC / latency
        try {
          const sampleRate = this.ctx.sampleRate || 44100;
          const bufferSize = sampleRate; // 1 second
          this.sharedNoiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
          const data = this.sharedNoiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
        } catch (bufErr) {
          // buffer allocation fallback
        }
      }
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  }

  resume() {
    try {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  toggleMute() {
    this.muted = !this.muted;
    return !this.muted;
  }

  // Basic punch sound
  playPunch() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // Heavy hit / Impact sound (safely throttled to prevent audio thread saturation)
  playHeavyHit() {
    if (this.muted || !this.ctx) return;
    try {
      const perfNow = performance.now();
      if (perfNow - this.lastHeavyHitTime < 25) {
        return; // throttle sub-frame rapid collisions
      }
      this.lastHeavyHitTime = perfNow;

      this.resume();
      const now = this.ctx.currentTime;

      // Sub rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      // Noise burst with pre-allocated buffer
      this.playNoise(0.15, 0.35);
    } catch (e) {}
  }

  // Metallic Block sound
  playBlock() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Jump swoosh
  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Special attack surge
  playSpecial() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(680, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  // Pre-allocated Noise generator for explosions and impacts
  playNoise(duration, volume = 0.3) {
    if (this.muted || !this.ctx) return;
    try {
      if (!this.sharedNoiseBuffer) {
        const sampleRate = this.ctx.sampleRate || 44100;
        const bufLen = Math.max(1, Math.floor(sampleRate * duration));
        this.sharedNoiseBuffer = this.ctx.createBuffer(1, bufLen, sampleRate);
        const data = this.sharedNoiseBuffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.sharedNoiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Boss Alert Siren
  playBossAlert() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + i * 0.25;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, startTime);
        osc.frequency.linearRampToValueAtTime(640, startTime + 0.12);
        osc.frequency.linearRampToValueAtTime(320, startTime + 0.24);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.24);
      }
    } catch (e) {}
  }

  // Level Clear Fanfare
  playLevelClear() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.14;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }

  // Game Over Sad Chords
  playGameOver() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const notes = [330, 311, 293, 220]; // descending

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.22;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch (e) {}
  }

  // UI select beep
  playSelect() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Denied / Locked buzzer sound
  playDenied() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // Grand Unlock fanfare sound
  playUnlock() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const notes = [440, 554, 659, 880, 1108]; // Ascending triumphant major fanfare

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }

  // Breakable crate / barrel smash sound
  playCrateBreak() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  // Health / Energy / Coin pickup chime
  playItemPickup() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      [587, 880, 1174].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + i * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, st);
        gain.gain.setValueAtTime(0.25, st);
        gain.gain.exponentialRampToValueAtTime(0.005, st + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(st);
        osc.stop(st + 0.15);
      });
    } catch (e) {}
  }

  // Distant thunder rumble for stormy arenas
  playThunder() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {}
  }

  // Combo milestone sound
  playComboMilestone() {
    if (this.muted || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      [523, 659, 784, 1046].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + idx * 0.04;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, st);
        gain.gain.setValueAtTime(0.3, st);
        gain.gain.exponentialRampToValueAtTime(0.01, st + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(st);
        osc.stop(st + 0.2);
      });
    } catch (e) {}
  }
}

export const sound = new SoundSystem();
