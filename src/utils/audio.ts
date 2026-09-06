// The Wayfarer's Journey - Web Audio Synthesis & Haptics Engine
// Pure browser-native Web Audio API: Zero external dependencies, offline-ready

class AudioManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Trigger light haptic feedback on mobile / Android WebView
  public haptic(pattern: number | number[] = 25) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on platforms where vibrate is restricted
      }
    }
  }

  // Sacred Singing Bowl / Meditative Chime tone
  public playChime(freq: number = 432, duration: number = 2.5) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      // Fundamental harmonic
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.connect(masterGain);

      // Warm overtones (golden ratio / sacred interval)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.5, now);
      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.08, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);
      osc2.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      this.haptic([15, 30, 20]);
    } catch {
      // Audio fallback
    }
  }

  // Encouraging warm chord (Faith or Wisdom gain)
  public playGraceChord() {
    if (!this.soundEnabled) return;
    this.playChime(396, 2.0); // C-root
    setTimeout(() => this.playChime(528, 2.8), 120); // Miraculous tone (528 Hz)
    setTimeout(() => this.playChime(660, 2.5), 240);
  }

  // Deep grounding note for Patience or quiet pause
  public playGroundingTone() {
    if (!this.soundEnabled) return;
    this.playChime(216, 3.0);
    this.haptic(35);
  }

  // Breath guide tones
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
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 3.8);
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
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 3.8);
      gain.gain.linearRampToValueAtTime(0.001, now + 4.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 4.0);
    } catch {}
  }

  // Gentle Campfire / Sanctuary ambient drone
  public toggleAmbientSanctuary(enable: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!enable || !this.soundEnabled) {
      if (this.ambientGain) {
        try {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
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
      this.ambientGain.gain.linearRampToValueAtTime(0.05, now + 2.0);
      this.ambientGain.connect(ctx.destination);

      // Warm low drone
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(108, now); // Root drone
      osc1.connect(this.ambientGain);
      osc1.start(now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(162, now); // Fifth
      osc2.connect(this.ambientGain);
      osc2.start(now);

      this.isAmbientPlaying = true;
    } catch {}
  }
}

export const audio = new AudioManager();
