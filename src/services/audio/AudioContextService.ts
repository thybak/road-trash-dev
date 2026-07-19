export type AudioContextFactory = () => AudioContextLike;

export interface AudioContextLike {
  readonly state: 'suspended' | 'running' | 'closed';
  resume(): Promise<void>;
  suspend(): Promise<void>;
  close(): Promise<void>;
  createOscillator(): OscillatorLike;
  createGain(): GainLike;
  get currentTime(): number;
  get destination(): AudioDestinationLike;
}

export interface OscillatorLike {
  type: 'sine' | 'square' | 'sawtooth' | 'triangle';
  frequency: { value: number };
  connect(node: AudioNodeLike): void;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface GainLike extends AudioNodeLike {
  gain: { value: number; setValueAtTime(value: number, when: number): void };
}

export interface AudioNodeLike {
  connect(node: AudioNodeLike): void;
}

export type AudioDestinationLike = AudioNodeLike;

export type AudioActivationState = 'locked' | 'unlocked' | 'suspended';

export interface AudioContextServiceOptions {
  readonly factory?: AudioContextFactory;
}

const DEFAULT_FACTORY: AudioContextFactory = () => {
  const Ctx =
    typeof window !== 'undefined'
      ? (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : undefined;
  if (!Ctx) {
    throw new Error('Web Audio is not available in this environment');
  }
  return new Ctx() as unknown as AudioContextLike;
};

export class AudioContextService {
  private context: AudioContextLike | null = null;
  private state: AudioActivationState = 'locked';
  private readonly factory: AudioContextFactory;

  constructor(options: AudioContextServiceOptions = {}) {
    this.factory = options.factory ?? DEFAULT_FACTORY;
  }

  getState(): AudioActivationState {
    return this.state;
  }

  isUnlocked(): boolean {
    return this.state === 'unlocked';
  }

  async unlock(): Promise<void> {
    if (this.state === 'unlocked') return;
    if (!this.context) {
      this.context = this.factory();
    }
    await this.context.resume();
    this.playBlip();
    this.state = 'unlocked';
  }

  async suspend(): Promise<void> {
    if (this.state === 'suspended' || !this.context) return;
    await this.context.suspend();
    this.state = 'suspended';
  }

  async shutdown(): Promise<void> {
    if (!this.context) return;
    await this.context.close();
    this.context = null;
    this.state = 'locked';
  }

  private playBlip(): void {
    if (!this.context) return;
    try {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = 'square';
      osc.frequency.value = 440;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(this.context.destination);
      const now = this.context.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      /* audio proof is best-effort; silence is non-fatal */
    }
  }
}