// The Wayfarer's Journey - Procedural Audio & Soundscape Engine
// Realistic Campfire with Crackling Embers, Chiptune Jingles, and Sacred Singing Bowls.

class AudioManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public isUnlocked: boolean = false;

  // Campfire generator nodes
  private campfireSource: AudioBufferSourceNode | null = null;
  private campfireGain: GainNode | null = null;
  private crackleInterval: NodeJS.Timeout | null = null;
  public isCampfirePlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlockContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  public unlockContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
      }
    } catch (e) {
      console.warn('AudioContext init:', e);
    }
    return this.ctx;
  }

  private getContext(): AudioContext | null {
    return this.unlockContext();
  }

  public haptic(pattern: number | number[] = 25) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  // ========================================================
  // REALISTIC PROCEDURAL CAMPFIRE SOUND GENERATOR
  // Emulates burning wood hiss, warm draft, and random ember crackles/pops
  // ========================================================
  public toggleCampfire(enable: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!enable || !this.soundEnabled) {
      // Fade out campfire
      if (this.campfireGain) {
        try {
          this.campfireGain.gain.setValueAtTime(this.campfireGain.gain.value, ctx.currentTime);
          this.campfireGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
          setTimeout(() => {
            if (this.campfireSource) {
              try { this.campfireSource.stop(); } catch {}
              this.campfireSource.disconnect();
              this.campfireSource = null;
            }
          }, 650);
        } catch {}
      }
      if (this.crackleInterval) {
        clearInterval(this.crackleInterval);
        this.crackleInterval = null;
      }
      this.isCampfirePlaying = false;
      return;
    }

    if (this.isCampfirePlaying) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = 2 * ctx.sampleRate; // 2 seconds of loopable fire bed noise
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate warm brown/pink noise for roaring coals
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      this.campfireSource = ctx.createBufferSource();
      this.campfireSource.buffer = noiseBuffer;
      this.campfireSource.loop = true;

      // Filter: warm low-pass for wood combustion hum + gentle bandpass for hiss
      const lowFilter = ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(380, now);

      this.campfireGain = ctx.createGain();
      this.campfireGain.gain.setValueAtTime(0.001, now);
      this.campfireGain.gain.linearRampToValueAtTime(0.25, now + 1.2);

      this.campfireSource.connect(lowFilter);
      lowFilter.connect(this.campfireGain);
      this.campfireGain.connect(ctx.destination);
      this.campfireSource.start(now);

      // Random Wood Pops & Cracking Embers
      const scheduleCrackle = () => {
        if (!this.isCampfirePlaying || !this.soundEnabled) return;
        this.playWoodPop();
        // Next pop in random 80ms - 450ms
        const nextTime = 80 + Math.random() * 370;
        this.crackleInterval = setTimeout(scheduleCrackle, nextTime) as unknown as NodeJS.Timeout;
      };

      this.isCampfirePlaying = true;
      scheduleCrackle();
    } catch (e) {
      console.warn('Campfire audio error:', e);
    }
  }

  // Realistic individual wood snap / spark pop
  private playWoodPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sharp frequency drop mimicking wood snapping
      const startFreq = 800 + Math.random() * 1200;
      osc.type = Math.random() > 0.4 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(60 + Math.random() * 80, now + 0.035);

      const popVolume = 0.04 + Math.random() * 0.12;
      gain.gain.setValueAtTime(popVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // ========================================================
  // FOOTSTEPS & RETRO OVERWORLD SOUNDS
  // ========================================================
  public playFootstep() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + (Math.random() * 30), now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      this.haptic(12);
    } catch {}
  }

  public playEncounterStart() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.14, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.13);
      });
      this.haptic([20, 30, 40]);
    } catch {}
  }

  public playZeldaSecret() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [392.00, 369.99, 311.13, 220.00, 207.65, 329.63, 415.30, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.15);
      });
      this.haptic([15, 20, 15, 20, 40]);
    } catch {}
  }

  // ========================================================
  // SACRED SINGING BOWLS & CHIMES
  // ========================================================
  public playChime(freq: number = 432, duration: number = 2.5) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.connect(masterGain);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.5, now);
      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.15, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);
      osc2.connect(overtoneGain);
      overtoneGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      this.haptic([20, 35, 20]);
    } catch {}
  }

  public playGraceChord() {
    if (!this.soundEnabled) return;
    this.playChime(396, 2.2);
    setTimeout(() => this.playChime(528, 2.8), 100);
    setTimeout(() => this.playChime(660, 2.5), 200);
  }

  public playGroundingTone() {
    if (!this.soundEnabled) return;
    this.playChime(216, 2.5);
    this.haptic(30);
  }

  public playInhaleTone() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 4.0);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 3.8);
      gain.gain.linearRampToValueAtTime(0.001, now + 4.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 4.0);
    } catch {}
  }

  public playExhaleTone() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 4.0);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 3.8);
      gain.gain.linearRampToValueAtTime(0.001, now + 4.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 4.0);
    } catch {}
  }
}

export const audio = new AudioManager();
