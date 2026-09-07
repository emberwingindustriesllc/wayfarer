// The Wayfarer's Journey - Enhanced Web Audio Synthesis & Retro Chiptune Engine
// Inspired by Shovel Knight, Mega Man, Zelda & Super Mario Bros.

class AudioManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public isUnlocked: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

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

  // Retro 8-bit Map Footstep (like Mario Bros / Zelda overworld step)
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
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      this.haptic(12);
    } catch {}
  }

  // Retro 8-bit Stage Select / Jump Fanfare (Mega Man / Shovel Knight style)
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

        gain.gain.setValueAtTime(0.16, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.13);
      });
      this.haptic([20, 30, 40]);
    } catch {}
  }

  // Retro 8-bit Discovery / Zelda Secret Jingle
  public playZeldaSecret() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // G4, F#4, D#4, A3, G#3, E4, G#4, C5
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

  // Sacred Singing Bowl / Meditative Chime tone
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

  // Encouraging warm chord
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

  public toggleAmbientSanctuary(enable: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!enable || !this.soundEnabled) {
      if (this.ambientGain) {
        try {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        } catch {}
      }
      this.isAmbientPlaying = false;
      return;
    }

    if (this.isAmbientPlaying) return;

    try {
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.08, now + 2.0);
      this.ambientGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(108, now);
      osc1.connect(this.ambientGain);
      osc1.start(now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(162, now);
      osc2.connect(this.ambientGain);
      osc2.start(now);

      this.isAmbientPlaying = true;
    } catch {}
  }
}

export const audio = new AudioManager();
