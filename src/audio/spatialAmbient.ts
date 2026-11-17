import { AudioSettings, LocationId } from '../types/game';
import { audioEngine } from './nusantaraAudio';
import {
  computeSpatialAttenuation,
  getLocationSpatialSources,
  SpatialSoundSource,
} from './spatialMath';

interface ActiveSpatialNode {
  source: SpatialSoundSource;
  gainNode: GainNode;
  panner: StereoPannerNode | null;
  currentGain: number;
  stopNodes: () => void;
}

function createLoopingNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Pink-tinted smooth noise with seamless wrap
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    const raw = (b0 + b1 + b2 + white * 0.18) * 0.12;
    data[i] = Math.max(-1, Math.min(1, raw));
  }
  return buffer;
}

export class SpatialAmbientSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private nodes: ActiveSpatialNode[] = [];
  private timers: number[] = [];
  private disposed = false;
  private initialized = false;
  private lastListenerPos: [number, number, number] = [0, 0, 2.2];
  private lastYaw = 0;
  private settings: AudioSettings;
  private readonly sources: SpatialSoundSource[];

  constructor(locationId: LocationId, initialSettings: AudioSettings) {
    this.sources = getLocationSpatialSources(locationId);
    this.settings = { ...initialSettings };
  }

  public unlockAndStart(): boolean {
    if (this.disposed) return false;
    const ctx = audioEngine.getUnlockedContext();
    if (!ctx) return false;
    this.ctx = ctx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!this.initialized) {
      this.setupGraph(ctx);
    }
    this.syncMasterGain();
    return this.initialized;
  }

  public updateSettings(next: AudioSettings): void {
    this.settings = { ...next };
    this.syncMasterGain();
  }

  private syncMasterGain(): void {
    if (!this.ctx || !this.masterGain) return;
    const level = this.settings.muted
      ? 0
      : Math.max(0, Math.min(1, this.settings.sfxVolume * 0.6 + this.settings.musicVolume * 0.4));
    this.masterGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.06);
  }

  private setupGraph(ctx: AudioContext): void {
    this.initialized = true;
    this.masterGain = ctx.createGain();
    this.masterGain.connect(ctx.destination);
    this.syncMasterGain();

    this.noiseBuffer = createLoopingNoiseBuffer(ctx, 3);

    for (const src of this.sources) {
      const sourceGain = ctx.createGain();
      sourceGain.gain.value = 0;

      const panner =
        typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      if (panner) {
        sourceGain.connect(panner);
        panner.connect(this.masterGain);
      } else {
        sourceGain.connect(this.masterGain);
      }

      const cleanups: Array<() => void> = [];

      if (src.kind === 'wind') {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 340;
        filter.Q.value = 1.65;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.22;
        lfoGain.gain.value = 160;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(sourceGain);
        noise.start();
        lfo.start();
        cleanups.push(() => {
          try {
            noise.stop();
            lfo.stop();
          } catch {
            /* ignore stopped */
          }
          noise.disconnect();
          filter.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        });
      } else if (src.kind === 'water' || src.kind === 'waterfall') {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        noise.loop = true;

        const lowFilter = ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.value = src.kind === 'waterfall' ? 780 : 480;

        const shimmerNoise = ctx.createBufferSource();
        shimmerNoise.buffer = this.noiseBuffer;
        shimmerNoise.loop = true;
        shimmerNoise.playbackRate.value = src.kind === 'waterfall' ? 1.35 : 0.92;

        const bandFilter = ctx.createBiquadFilter();
        bandFilter.type = 'bandpass';
        bandFilter.frequency.value = src.kind === 'waterfall' ? 1550 : 980;
        bandFilter.Q.value = 1.2;

        const shimmerGain = ctx.createGain();
        shimmerGain.gain.value = src.kind === 'waterfall' ? 0.55 : 0.35;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = src.kind === 'waterfall' ? 0.45 : 0.28;
        lfoGain.gain.value = 210;
        lfo.connect(lfoGain);
        lfoGain.connect(bandFilter.frequency);

        noise.connect(lowFilter);
        lowFilter.connect(sourceGain);
        shimmerNoise.connect(bandFilter);
        bandFilter.connect(shimmerGain);
        shimmerGain.connect(sourceGain);

        noise.start();
        shimmerNoise.start();
        lfo.start();

        cleanups.push(() => {
          try {
            noise.stop();
            shimmerNoise.stop();
            lfo.stop();
          } catch {
            /* ignore */
          }
          noise.disconnect();
          lowFilter.disconnect();
          shimmerNoise.disconnect();
          bandFilter.disconnect();
          shimmerGain.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        });
      } else if (src.kind === 'jungle') {
        const leafNoise = ctx.createBufferSource();
        leafNoise.buffer = this.noiseBuffer;
        leafNoise.loop = true;
        const leafFilter = ctx.createBiquadFilter();
        leafFilter.type = 'bandpass';
        leafFilter.frequency.value = 1450;
        leafFilter.Q.value = 1.9;
        const leafGain = ctx.createGain();
        leafGain.gain.value = 0.28;

        leafNoise.connect(leafFilter);
        leafFilter.connect(leafGain);
        leafGain.connect(sourceGain);
        leafNoise.start();

        cleanups.push(() => {
          try {
            leafNoise.stop();
          } catch {
            /* ignore */
          }
          leafNoise.disconnect();
          leafFilter.disconnect();
          leafGain.disconnect();
        });
      } else {
        // Gentle temple / heritage wind-chime pad (5th + octave shimmer)
        const baseFreq = 587.33; // D5 Melayu tone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const padGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = baseFreq;
        osc2.type = 'sine';
        osc2.frequency.value = 880.0; // A5

        padGain.gain.value = 0.06;
        lfo.type = 'sine';
        lfo.frequency.value = 0.35;
        lfoGain.gain.value = 0.04;
        lfo.connect(lfoGain);
        lfoGain.connect(padGain.gain);

        osc1.connect(padGain);
        osc2.connect(padGain);
        padGain.connect(sourceGain);

        osc1.start();
        osc2.start();
        lfo.start();

        cleanups.push(() => {
          try {
            osc1.stop();
            osc2.stop();
            lfo.stop();
          } catch {
            /* ignore */
          }
          osc1.disconnect();
          osc2.disconnect();
          padGain.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        });
      }

      this.nodes.push({
        source: src,
        gainNode: sourceGain,
        panner,
        currentGain: 0,
        stopNodes: () => {
          cleanups.forEach((fn) => fn());
          sourceGain.disconnect();
          panner?.disconnect();
        },
      });
    }

    // Periodic spatial bird / chime accent events only when nearby
    const accentTimer = window.setInterval(() => {
      if (this.disposed || !this.ctx || this.ctx.state !== 'running' || this.settings.muted) {
        return;
      }
      for (const node of this.nodes) {
        if (node.currentGain < 0.04) continue;
        if (node.source.kind === 'jungle' && Math.random() < 0.45) {
          this.triggerSpatialChirp(node);
        } else if (node.source.kind === 'chime' && Math.random() < 0.35) {
          this.triggerSpatialChimeBell(node);
        }
      }
    }, 2600);
    this.timers.push(accentTimer);
  }

  private triggerSpatialChirp(node: ActiveSpatialNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    const f = 2200 + Math.random() * 650;
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f * 1.28, now + 0.07);
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.09, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(env);
    env.connect(node.gainNode);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  private triggerSpatialChimeBell(node: ActiveSpatialNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 659.25, 783.99, 880.0];
    const f = notes[Math.floor(Math.random() * notes.length)];
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now);
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.075, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc.connect(env);
    env.connect(node.gainNode);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  public updateListener(playerPos: [number, number, number], cameraYaw: number): void {
    this.lastListenerPos = playerPos;
    this.lastYaw = cameraYaw;
    if (!this.ctx || !this.initialized || this.disposed) return;

    const now = this.ctx.currentTime;
    for (const node of this.nodes) {
      const att = computeSpatialAttenuation(
        playerPos,
        cameraYaw,
        node.source.position,
        node.source.refDistance,
        node.source.maxDistance,
      );
      const targetGain = att.gainFactor * node.source.baseVolume;
      node.currentGain = targetGain;
      node.gainNode.gain.setTargetAtTime(targetGain, now, 0.09);
      if (node.panner) {
        node.panner.pan.setTargetAtTime(att.pan, now, 0.08);
      }
    }
  }

  public getDebugSummary(): { sourceCount: number; activeGains: Record<string, number> } {
    const activeGains: Record<string, number> = {};
    for (const n of this.nodes) {
      activeGains[n.source.id] = Number(n.currentGain.toFixed(3));
    }
    return { sourceCount: this.sources.length, activeGains };
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.timers.forEach((id) => window.clearInterval(id));
    this.timers = [];
    for (const node of this.nodes) {
      node.stopNodes();
    }
    this.nodes = [];
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    void this.lastListenerPos;
    void this.lastYaw;
  }
}
