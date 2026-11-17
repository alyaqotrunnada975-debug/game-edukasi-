import { AudioSettings } from '../types/game';

// Tangga Nada G Mayor Melayu Palembang (Hz)
const MELAYU_G_MAJOR = {
  G2: 98.0,
  D3: 146.83,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  D4: 293.66,
  E4: 329.63,
  Fs4: 369.99,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  Fs5: 739.99,
  G5: 783.99,
};

const MELODY_PATTERN = [
  MELAYU_G_MAJOR.G4,
  MELAYU_G_MAJOR.B4,
  MELAYU_G_MAJOR.D5,
  MELAYU_G_MAJOR.E5,
  MELAYU_G_MAJOR.D5,
  MELAYU_G_MAJOR.B4,
  MELAYU_G_MAJOR.A4,
  MELAYU_G_MAJOR.G4,
  MELAYU_G_MAJOR.B4,
  MELAYU_G_MAJOR.D5,
  MELAYU_G_MAJOR.G5,
  MELAYU_G_MAJOR.Fs5,
  MELAYU_G_MAJOR.E5,
  MELAYU_G_MAJOR.D5,
  MELAYU_G_MAJOR.B4,
  MELAYU_G_MAJOR.A4,
];

const GAMBUS_ARPEGGIO = [
  MELAYU_G_MAJOR.G3,
  MELAYU_G_MAJOR.B3,
  MELAYU_G_MAJOR.D4,
  MELAYU_G_MAJOR.G4,
  MELAYU_G_MAJOR.E4,
  MELAYU_G_MAJOR.C5,
  MELAYU_G_MAJOR.A4,
  MELAYU_G_MAJOR.D4,
];

class NusantaraAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private settings: AudioSettings = { muted: false, musicVolume: 0.45, sfxVolume: 0.7 };
  private stepTimer: number | null = null;
  private birdTimer: number | null = null;
  private stepIndex = 0;
  private isPlayingMusic = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.syncGains();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getUnlockedContext(): AudioContext | null {
    return this.ensureContext();
  }

  public updateSettings(next: AudioSettings) {
    this.settings = { ...next };
    this.syncGains();
  }

  private syncGains() {
    if (!this.ctx || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const mVol = this.settings.muted ? 0 : this.settings.musicVolume * 0.42;
    const sVol = this.settings.muted ? 0 : this.settings.sfxVolume * 0.65;
    this.musicGain.gain.setTargetAtTime(mVol, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(sVol, now, 0.03);
  }

  public startMusic() {
    const ctx = this.ensureContext();
    if (!ctx || this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.stepIndex = 0;

    const beatMs = 340;
    this.stepTimer = window.setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx || this.ctx.state !== 'running' || this.settings.muted) {
        return;
      }
      this.scheduleBeat(this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 16;
    }, beatMs);

    this.birdTimer = window.setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx || this.ctx.state !== 'running' || this.settings.muted) {
        return;
      }
      if (Math.random() < 0.55) {
        this.playBirdChirp();
      }
    }, 4500);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.stepTimer !== null) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.birdTimer !== null) {
      clearInterval(this.birdTimer);
      this.birdTimer = null;
    }
  }

  private scheduleBeat(step: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;
    const now = ctx.currentTime;

    // 1. Gong Bass on beat 0 and 8
    if (step === 0 || step === 8) {
      this.playGong(now, step === 0 ? MELAYU_G_MAJOR.G2 : MELAYU_G_MAJOR.D3);
    }

    // 2. Rebana & Marwas Melayu percussion
    if (step % 4 === 0) {
      this.playRebana(now, 125, 0.22);
    } else if (step % 2 === 1) {
      this.playMarwas(now, 0.11);
    }

    // 3. Petikan Gambus / Kecapi
    const gambusNote = GAMBUS_ARPEGGIO[step % GAMBUS_ARPEGGIO.length];
    this.playGambus(now, gambusNote, 0.14);

    // 4. Suling Bambu bervibrato (every 2 steps for airy phrasing)
    if (step % 2 === 0) {
      const sulingFreq = MELODY_PATTERN[step];
      this.playSuling(now, sulingFreq, 0.58, 0.14);
    }

    // 5. Kromong perunggu accent on select steps
    if (step === 2 || step === 6 || step === 10 || step === 14) {
      this.playKromong(now, MELODY_PATTERN[step], 0.08);
    }
  }

  private playSuling(time: number, freq: number, duration: number, gainPeak: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(5.4, time);
    vibGain.gain.setValueAtTime(freq * 0.015, time);
    vibrato.connect(vibGain);
    vibGain.connect(osc.frequency);

    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(gainPeak, time + 0.09);
    env.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(env);
    env.connect(this.musicGain);

    osc.start(time);
    vibrato.start(time);
    osc.stop(time + duration + 0.02);
    vibrato.stop(time + duration + 0.02);
  }

  private playGambus(time: number, freq: number, gainPeak: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + 0.35);

    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(gainPeak, time + 0.012);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.42);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.45);
  }

  private playKromong(time: number, freq: number, gainPeak: number) {
    if (!this.ctx || !this.musicGain) return;
    [1, 2.72].forEach((mult, idx) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, time);
      env.gain.setValueAtTime(0.001, time);
      env.gain.linearRampToValueAtTime(gainPeak / (idx + 1), time + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
      osc.connect(env);
      env.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.58);
    });
  }

  private playRebana(time: number, baseFreq: number, gainPeak: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.6, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, time + 0.11);
    env.gain.setValueAtTime(gainPeak, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(env);
    env.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playMarwas(time: number, gainPeak: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, time);
    osc.frequency.exponentialRampToValueAtTime(210, time + 0.06);
    env.gain.setValueAtTime(gainPeak, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(env);
    env.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playGong(time: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(0.24, time + 0.04);
    env.gain.exponentialRampToValueAtTime(0.001, time + 1.9);
    osc.connect(env);
    env.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 2.0);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const chirps = Math.random() > 0.5 ? 2 : 3;
    for (let i = 0; i < chirps; i++) {
      const t = now + i * 0.11;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      const startF = 2400 + Math.random() * 600;
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(startF * 1.35, t + 0.06);
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(0.055, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
      osc.connect(env);
      env.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  // --- SFX Methods ---

  public playClick() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.055);
    env.gain.setValueAtTime(0.18, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playStep() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    const pitch = 135 + (Math.random() - 0.5) * 24;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.05);
    env.gain.setValueAtTime(0.09, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playJump() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);
    env.gain.setValueAtTime(0.22, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playDialog() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480 + Math.random() * 90, now);
    env.gain.setValueAtTime(0.11, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playRelic() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const notes = [MELAYU_G_MAJOR.G4, MELAYU_G_MAJOR.B4, MELAYU_G_MAJOR.D5, MELAYU_G_MAJOR.G5];
    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + idx * 0.075;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      env.gain.setValueAtTime(0.24, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(env);
      env.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  public playError() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.16);
    env.gain.setValueAtTime(0.15, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playFanfare() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.settings.muted) return;
    const now = ctx.currentTime;
    const melody = [
      { f: MELAYU_G_MAJOR.G4, t: 0, d: 0.15 },
      { f: MELAYU_G_MAJOR.B4, t: 0.12, d: 0.15 },
      { f: MELAYU_G_MAJOR.D5, t: 0.24, d: 0.15 },
      { f: MELAYU_G_MAJOR.G5, t: 0.38, d: 0.55 },
      { f: MELAYU_G_MAJOR.E5, t: 0.58, d: 0.2 },
      { f: MELAYU_G_MAJOR.G5, t: 0.78, d: 0.7 },
    ];
    for (const n of melody) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      env.gain.setValueAtTime(0.26, now + n.t);
      env.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(env);
      env.connect(this.sfxGain);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.05);
    }
  }
}

export const audioEngine = new NusantaraAudioEngine();
