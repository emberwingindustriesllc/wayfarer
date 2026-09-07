// The Wayfarer's Journey - Advanced Procedural Audio Engine
// Realistic Campfire with dual-snap wood pops, Living Water Well drips, and Sacred Sanctuary Chimes.

class AudioManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public isUnlocked: boolean = false;

  // Active ambient sound nodes
  private activeAmbientType: 'campfire' | 'well' | 'circle' | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSources: (AudioNode | number)[] = [];
  private ambientInterval: NodeJS.Timeout | null = null;

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

  // Stop any currently playing sanctuary ambient audio cleanly
  public stopAllAmbience() {
    const ctx = this.getContext();
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }

    if (this.ambientGain && ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      } catch {}
    }

    setTimeout(() => {
      this.ambientSources.forEach(node => {
        if (typeof node === 'object' && node && 'stop' in node) {
          try { (node as AudioScheduledSourceNode).stop(); } catch {}
          try { (node as AudioNode).disconnect(); } catch {}
        }
      });
      this.ambientSources = [];
      this.ambientGain = null;
      this.activeAmbientType = null;
    }, 450);
  }

  // ========================================================
  // 1. REALISTIC CAMPFIRE SOUNDSCAPE
  // Deep warm combustion rumble + dual-snap timber pops + ember sizzle
  // ========================================================
  public toggleCampfire(enable: boolean) {
    if (!enable || !this.soundEnabled) {
      if (this.activeAmbientType === 'campfire') this.stopAllAmbience();
      return;
    }
    if (this.activeAmbientType === 'campfire') return;

    this.stopAllAmbience();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.activeAmbientType = 'campfire';
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.28, now + 1.0);
      this.ambientGain.connect(ctx.destination);

      // --- Layer A: Warm Low Rumble of Burning Wood Charcoal ---
      const bufferSize = 3 * ctx.sampleRate;
      const rumbleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const rumbleData = rumbleBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.018 * white) / 1.018;
        rumbleData[i] = lastOut * 4.0;
      }
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;
      rumbleSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(260, now);

      rumbleSource.connect(lowpass);
      lowpass.connect(this.ambientGain);
      rumbleSource.start(now);
      this.ambientSources.push(rumbleSource);

      // --- Layer B: Soft Ember Hiss ---
      const hissBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const hissData = hissBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        hissData[i] = (Math.random() * 2 - 1) * 0.015;
      }
      const hissSource = ctx.createBufferSource();
      hissSource.buffer = hissBuffer;
      hissSource.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1400, now);
      bandpass.Q.setValueAtTime(1.5, now);

      hissSource.connect(bandpass);
      bandpass.connect(this.ambientGain);
      hissSource.start(now);
      this.ambientSources.push(hissSource);

      // --- Layer C: Randomized Realistic Wood Cracks & Timber Snaps ---
      const triggerWoodPop = () => {
        if (this.activeAmbientType !== 'campfire' || !this.soundEnabled) return;
        this.playOrganicWoodPop();
        // Realistic spacing: random between 60ms and 380ms
        const nextTime = 70 + Math.random() * 310;
        this.ambientInterval = setTimeout(triggerWoodPop, nextTime) as unknown as NodeJS.Timeout;
      };
      triggerWoodPop();
    } catch (e) {
      console.warn('Campfire error:', e);
    }
  }

  // Dual-snap organic wood pop
  private playOrganicWoodPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // 1. High frequency snap (bark bursting)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      const snapFreq = 1200 + Math.random() * 1600;
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(snapFreq, now);
      snapOsc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      snapGain.gain.setValueAtTime(0.04 + Math.random() * 0.12, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.03);

      // 2. Low hollow thud (wood log resonance)
      if (Math.random() > 0.3) {
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(120 + Math.random() * 60, now + 0.005);
        thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

        thudGain.gain.setValueAtTime(0.08 + Math.random() * 0.08, now + 0.005);
        thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start(now + 0.005);
        thudOsc.stop(now + 0.07);
      }
    } catch {}
  }

  // ========================================================
  // 2. SCRIPTURE WELL: LIVING WATER SPRING & DRIPS
  // Tranquil subterranean spring + resonant water drops into the stone well
  // ========================================================
  public toggleWellWater(enable: boolean) {
    if (!enable || !this.soundEnabled) {
      if (this.activeAmbientType === 'well') this.stopAllAmbience();
      return;
    }
    if (this.activeAmbientType === 'well') return;

    this.stopAllAmbience();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.activeAmbientType = 'well';
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.22, now + 1.0);
      this.ambientGain.connect(ctx.destination);

      // Gentle flowing spring background trickle (filtered pink noise)
      const bufferSize = 3 * ctx.sampleRate;
      const brookBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const brookData = brookBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        brookData[i] = (Math.random() * 2 - 1) * 0.02;
      }
      const brookSource = ctx.createBufferSource();
      brookSource.buffer = brookBuffer;
      brookSource.loop = true;

      const waterFilter = ctx.createBiquadFilter();
      waterFilter.type = 'bandpass';
      waterFilter.frequency.setValueAtTime(800, now);
      waterFilter.Q.setValueAtTime(2.0, now);

      brookSource.connect(waterFilter);
      waterFilter.connect(this.ambientGain);
      brookSource.start(now);
      this.ambientSources.push(brookSource);

      // Rhythmic resonant stone well water drops
      const triggerWellDrop = () => {
        if (this.activeAmbientType !== 'well' || !this.soundEnabled) return;
        this.playWaterDrop();
        const nextDrop = 350 + Math.random() * 750;
        this.ambientInterval = setTimeout(triggerWellDrop, nextDrop) as unknown as NodeJS.Timeout;
      };
      triggerWellDrop();
    } catch (e) {
      console.warn('Well water error:', e);
    }
  }

  // Individual acoustic water drop ("plink / plop" into well)
  private playWaterDrop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch sweep mimicking water droplet tension
      const baseFreq = 650 + Math.random() * 550;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.1);

      gain.gain.setValueAtTime(0.08 + Math.random() * 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // ========================================================
  // 3. SUPPORT CIRCLE: SACRED WIND CHIMES & CHORD DRONE
  // Peaceful meditation bell chimes drifting gently in sacred fellowship
  // ========================================================
  public toggleCircleChimes(enable: boolean) {
    if (!enable || !this.soundEnabled) {
      if (this.activeAmbientType === 'circle') this.stopAllAmbience();
      return;
    }
    if (this.activeAmbientType === 'circle') return;

    this.stopAllAmbience();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.activeAmbientType = 'circle';
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.2, now + 1.2);
      this.ambientGain.connect(ctx.destination);

      // Sacred Wind Chimes Pentatonic notes: C5, D5, E5, G5, A5, C6 (528Hz tuning)
      const chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

      const triggerChime = () => {
        if (this.activeAmbientType !== 'circle' || !this.soundEnabled) return;
        const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        this.playWindChimeNote(note);
        const nextChime = 600 + Math.random() * 1400;
        this.ambientInterval = setTimeout(triggerChime, nextChime) as unknown as NodeJS.Timeout;
      };
      triggerChime();
    } catch (e) {
      console.warn('Circle chimes error:', e);
    }
  }

  private playWindChimeNote(freq: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.9);
    } catch {}
  }

  // ========================================================
  // FOOTSTEPS, JINGLES & SACRED BOWLS
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
      const notes = [261.63, 329.63, 392.00, 523.25];
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
