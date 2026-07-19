import { describe, expect, it } from 'vitest';
import {
  AudioContextService,
  type AudioContextLike,
  type AudioDestinationLike,
} from '../../../../src/services/audio/AudioContextService';

class FakeAudioContext implements AudioContextLike {
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  currentTime = 0;
  readonly oscillator = new FakeOscillator();
  readonly gain = new FakeGain();
  resumeCalled = 0;
  suspendCalled = 0;
  closeCalled = 0;
  async resume(): Promise<void> {
    this.resumeCalled += 1;
    this.state = 'running';
  }
  async suspend(): Promise<void> {
    this.suspendCalled += 1;
    this.state = 'suspended';
  }
  async close(): Promise<void> {
    this.closeCalled += 1;
    this.state = 'closed';
  }
  createOscillator(): FakeOscillator {
    return new FakeOscillator();
  }
  createGain(): FakeGain {
    return new FakeGain();
  }
  get destination(): AudioDestinationLike {
    return new FakeNode();
  }
}

class FakeOscillator {
  type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine';
  frequency = { value: 0 };
  started: number | undefined = undefined;
  stopped: number | undefined = undefined;
  connect(): void {}
  start(when?: number): void {
    this.started = when;
  }
  stop(when?: number): void {
    this.stopped = when;
  }
}

class FakeGain {
  gain = { value: 0.0001, setValueAtTime: () => {} };
  connect(): void {}
}

class FakeNode {
  connect(): void {}
}

describe('AudioContextService', () => {
  it('starts locked and reports unlocked after unlock', async () => {
    const ctx = new FakeAudioContext();
    const service = new AudioContextService({ factory: () => ctx });
    expect(service.getState()).toBe('locked');
    expect(service.isUnlocked()).toBe(false);
    await service.unlock();
    expect(ctx.resumeCalled).toBe(1);
    expect(service.isUnlocked()).toBe(true);
    expect(service.getState()).toBe('unlocked');
  });

  it('unlock is idempotent', async () => {
    const ctx = new FakeAudioContext();
    const service = new AudioContextService({ factory: () => ctx });
    await service.unlock();
    await service.unlock();
    expect(ctx.resumeCalled).toBe(1);
    expect(service.getState()).toBe('unlocked');
  });

  it('suspend transitions to suspended and back to unlocked on resume', async () => {
    const ctx = new FakeAudioContext();
    const service = new AudioContextService({ factory: () => ctx });
    await service.unlock();
    await service.suspend();
    expect(service.getState()).toBe('suspended');
    expect(ctx.suspendCalled).toBe(1);
    await service.unlock();
    expect(service.getState()).toBe('unlocked');
    expect(ctx.resumeCalled).toBe(2);
  });

  it('suspend before unlock is a no-op', async () => {
    const ctx = new FakeAudioContext();
    const service = new AudioContextService({ factory: () => ctx });
    await service.suspend();
    expect(ctx.suspendCalled).toBe(0);
    expect(service.getState()).toBe('locked');
  });

  it('shutdown closes the underlying context and returns to locked', async () => {
    const ctx = new FakeAudioContext();
    const service = new AudioContextService({ factory: () => ctx });
    await service.unlock();
    await service.shutdown();
    expect(ctx.closeCalled).toBe(1);
    expect(service.getState()).toBe('locked');
  });

  it('plays a short blip on unlock', async () => {
    class CountingAudioContext extends FakeAudioContext {
      readonly oscillators: FakeOscillator[] = [];
      override createOscillator(): FakeOscillator {
        const osc = new FakeOscillator();
        this.oscillators.push(osc);
        return osc;
      }
    }
    const ctx = new CountingAudioContext();
    const service = new AudioContextService({ factory: () => ctx });
    await service.unlock();
    expect(ctx.oscillators.length).toBe(1);
    const osc = ctx.oscillators[0];
    expect(osc.started).toBe(0);
    expect(osc.stopped).toBe(0.08);
    expect(osc.type).toBe('square');
    expect(osc.frequency.value).toBe(440);
  });
});