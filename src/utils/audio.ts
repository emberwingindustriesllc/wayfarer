// The Wayfarer's Journey - Organic Acoustic Sound Engine
// Features Karplus-Strong physical string modeling (Acoustic Guitar/Lute),
// Physiological Heartbeat tension monitor, and Organic Campfire Woodcrackles.

class AudioManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public isUnlocked: boolean = false;

  // Ambient sound management
  private activeAmbient: 'campfire' | 'well' | 'circle' | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSources: (AudioNode | number)[] = [];
  private ambientTimer: NodeJS.Timeout | null = null;

  // Heartbeat loop for low resilience
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isHeartbeatActive: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockContext();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  public unlockContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => { this.isUnlocked = true; }).catch(() => {});
      } else if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
      }
    } catch (e) {
      console.warn('Audio unlock error:', e);
    }
    return this.ctx;
  }

  private getContext(): AudioContext | null {
    return this.unlockContext();
  }

  public haptic(pattern: number | number[] = 25) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch {}
    }
  }

  // ========================================================
  // 1. KARPLUS-STRONG PHYSICAL ACOUSTIC STRING SYNTHESIZER
  // Physically models acoustic vibrating strings (Nylon & Bronze Guitar/Lute)
  // ========================================================
  public pluckAcousticString(freq: number, decay: number = 2.8, volume: number = 0.22) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const sampleRate = ctx.sampleRate;
      const period = Math.round(sampleRate / freq);
      const bufferLength = Math.round(sampleRate * decay);
      const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Noise burst for initial string strike (fingertip / plectrum pluck)
      const noise = new Float32Array(period);
      for (let i = 0; i < period; i++) {
        noise[i] = (Math.random() * 2 - 1) * 0.95;
      }

      // Karplus-Strong feedback delay loop with low-pass dampening
      const feedback = 0.991;
      let prevSample = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (i < period) {
          channelData[i] = noise[i];
        } else {
          // Average adjacent samples (low-pass filter simulates physical string loss)
          const currentSample = channelData[i - period];
          const filtered = (currentSample + prevSample) * 0.5 * feedback;
          channelData[i] = filtered;
          prevSample = filtered;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);

      // Warm acoustic body resonance filter (simulates hollow wood chamber)
      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = 'peaking';
      bodyFilter.frequency.setValueAtTime(220, ctx.currentTime);
      bodyFilter.Q.setValueAtTime(1.5, ctx.currentTime);
      bodyFilter.gain.setValueAtTime(4.0, ctx.currentTime);

      source.connect(bodyFilter);
      bodyFilter.connect(gain);
      gain.connect(ctx.destination);

      source.start(ctx.currentTime);
    } catch (e) {
      console.warn('String pluck error:', e);
    }
  }

  // Melancholic Acoustic Guitar Chords (plucked by human hands beside the fire)
  public playAcousticGuitarChord(chordType: 'sorrow' | 'grace' | 'peace' | 'dusk' = 'grace') {
    if (!this.soundEnabled) return;

    const chords: Record<string, number[]> = {
      // D minor 9 (deep sorrow and longing)
      sorrow: [146.83, 220.00, 261.63, 293.66, 329.63],
      // D major 7 add 9 (warm spiritual grace)
      grace: [146.83, 220.00, 277.18, 329.63, 440.00],
      // C add 9 (peace beside quiet waters)
      peace: [130.81, 196.00, 261.63, 293.66, 329.63],
      // A minor 11 (dusk reflection)
      dusk: [110.00, 164.81, 220.00, 261.63, 329.63]
    };

    const notes = chords[chordType] || chords.grace;
    notes.forEach((freq, idx) => {
      // Strum delay: natural finger-arpeggio across 60ms - 90ms
      setTimeout(() => {
        this.pluckAcousticString(freq, 3.2 - (idx * 0.2), 0.18 + (idx === 0 ? 0.08 : 0));
      }, idx * 75);
    });

    this.haptic([15, 25, 20]);
  }

  // ========================================================
  // 2. PHYSIOLOGICAL HEARTBEAT (Tension / Critical HP monitor)
  // ========================================================
  public setHeartbeat(active: boolean) {
    if (!active || !this.soundEnabled) {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      this.isHeartbeatActive = false;
      return;
    }

    if (this.isHeartbeatActive) return;
    this.isHeartbeatActive = true;

    // Pulse double-beat (lub-dub) every 1100ms
    const triggerBeat = () => {
      if (!this.isHeartbeatActive || !this.soundEnabled) return;
      this.playHeartbeatPulse();
      setTimeout(() => {
        if (this.isHeartbeatActive && this.soundEnabled) {
          this.playHeartbeatPulse(true); // second muffled beat
        }
      }, 220);
    };

    triggerBeat();
    this.heartbeatInterval = setInterval(triggerBeat, 1100);
  }

  private playHeartbeatPulse(isSubBeat: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSubBeat ? 55 : 68, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);

      const vol = isSubBeat ? 0.25 : 0.38;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);

      this.haptic(isSubBeat ? 20 : 35);
    } catch {}
  }

  // ========================================================
  // 3. ORGANIC CAMPFIRE WITH EMBERS & ACOUSTIC GUITAR
  // ========================================================
  public toggleCampfire(enable: boolean) {
    if (!enable || !this.soundEnabled) {
      if (this.activeAmbient === 'campfire') this.stopAllAmbience();
      return;
    }
    if (this.activeAmbient === 'campfire') return;

    this.stopAllAmbience();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.activeAmbient = 'campfire';
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.28, now + 1.0);
      this.ambientGain.connect(ctx.destination);

      // Deep combustion rumble
      const bufferSize = 3 * ctx.sampleRate;
      const rumbleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const rumbleData = rumbleBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        rumbleData[i] = lastOut * 4.2;
      }
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;
      rumbleSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(240, now);

      rumbleSource.connect(lowpass);
      lowpass.connect(this.ambientGain);
      rumbleSource.start(now);
      this.ambientSources.push(rumbleSource);

      // Natural timber snaps
      const triggerWoodPop = () => {
        if (this.activeAmbient !== 'campfire' || !this.soundEnabled) return;
        this.playWoodPop();
        const nextTime = 80 + Math.random() * 320;
        this.ambientTimer = setTimeout(triggerWoodPop, nextTime) as unknown as NodeJS.Timeout;
      };
      triggerWoodPop();

      // Soft fingerpicked acoustic chord as you sit down
      setTimeout(() => {
        if (this.activeAmbient === 'campfire') {
          this.playAcousticGuitarChord('dusk');
        }
      }, 600);
    } catch (e) {
      console.warn('Campfire error:', e);
    }
  }

  private playWoodPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const snapFreq = 1200 + Math.random() * 1400;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(snapFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

      gain.gain.setValueAtTime(0.04 + Math.random() * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);

      if (Math.random() > 0.35) {
        const thud = ctx.createOscillator();
        const thudG = ctx.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(110 + Math.random() * 50, now);
        thud.frequency.exponentialRampToValueAtTime(40, now + 0.06);

        thudG.gain.setValueAtTime(0.07 + Math.random() * 0.07, now);
        thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

        thud.connect(thudG);
        thudG.connect(ctx.destination);
        thud.start(now);
        thud.stop(now + 0.07);
      }
    } catch {}
  }

  // ========================================================
  // 4. SCRIPTURE WELL: NATURAL LIVING SPRING
  // ========================================================
  public toggleWellWater(enable: boolean) {
    if (!enable || !this.soundEnabled) {
      if (this.activeAmbient === 'well') this.stopAllAmbience();
      return;
    }
    if (this.activeAmbient === 'well') return;

    this.stopAllAmbience();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.activeAmbient = 'well';
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.22, now + 1.0);
      this.ambientGain.connect(ctx.destination);

      // Brook sound
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
      waterFilter.frequency.setValueAtTime(750, now);
      waterFilter.Q.setValueAtTime(2.2, now);

      brookSource.connect(waterFilter);
      waterFilter.connect(this.ambientGain);
      brookSource.start(now);
      this.ambientSources.push(brookSource);

      const triggerWaterDrop = () => {
        if (this.activeAmbient !== 'well' || !this.soundEnabled) return;
        this.playWaterDrop();
        const nextDrop = 380 + Math.random() * 700;
        this.ambientTimer = setTimeout(triggerWaterDrop, nextDrop) as unknown as NodeJS.Timeout;
      };
      triggerWaterDrop();

      // Pluck peaceful acoustic note
      setTimeout(() => {
        if (this.activeAmbient === 'well') {
          this.pluckAcousticString(261.63, 3.5, 0.2); // C4
        }
      }, 500);
    } catch (e) {
      console.warn('Well error:', e);
    }
  }

  private playWaterDrop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 650 + Math.random() * 450;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.1);

      gain.gain.setValueAtTime(0.08 + Math.random() * 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // ========================================================
  // 5. SUPPORT CIRCLE: SACRED CELLO & CELTIC HARP
  // ========================================================
  public toggleCircleChimes(enable: boolean) {
    if (!enable || !this.soundEnabled) {
      if (this.activeAmbient === 'circle') this.stopAllAmbience();
      return;
    }
    if (this.activeAmbient === 'circle') return;

    this.stopAllAmbience();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.activeAmbient = 'circle';
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.2, now + 1.2);
      this.ambientGain.connect(ctx.destination);

      // Ancient pentatonic harp strings
      const harpPitches = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

      const triggerHarp = () => {
        if (this.activeAmbient !== 'circle' || !this.soundEnabled) return;
        const note = harpPitches[Math.floor(Math.random() * harpPitches.length)];
        this.pluckAcousticString(note, 3.5, 0.16);
        const nextTime = 700 + Math.random() * 1500;
        this.ambientTimer = setTimeout(triggerHarp, nextTime) as unknown as NodeJS.Timeout;
      };
      triggerHarp();
    } catch (e) {
      console.warn('Circle error:', e);
    }
  }

  public stopAllAmbience() {
    const ctx = this.getContext();
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
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
      this.activeAmbient = null;
    }, 450);
  }

  // Soft Footstep
  public playFootstep() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + (Math.random() * 25), now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
      this.haptic(15);
    } catch {}
  }

  // Dramatic Encounter Launch: resonant acoustic octave pluck + low bell
  public playEncounterStart() {
    if (!this.soundEnabled) return;
    this.pluckAcousticString(146.83, 3.0, 0.28); // Low D
    setTimeout(() => this.pluckAcousticString(293.66, 2.5, 0.22), 120); // High D
    this.haptic([25, 45]);
  }

  // Grace chord
  public playGraceChord() {
    this.playAcousticGuitarChord('grace');
  }

  public playChime(freq: number = 432, duration: number = 2.5) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const partials = [
        { mult: 1.0, gain: 0.16 },
        { mult: 2.76, gain: 0.07 },
        { mult: 5.4, gain: 0.03 }
      ];
      partials.forEach(p => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * p.mult, now);
        g.gain.setValueAtTime(p.gain, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      });
      this.haptic(20);
    } catch {}
  }

  public playGroundingTone() {
    this.pluckAcousticString(110.00, 3.2, 0.25);
    this.haptic(30);
  }

  public playZeldaSecret() {
    this.playAcousticGuitarChord('peace');
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
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.exponentialRampToValueAtTime(392, now + 4.0);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 3.8);
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
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.exponentialRampToValueAtTime(196, now + 4.0);
      gain.gain.setValueAtTime(0.18, now);
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
