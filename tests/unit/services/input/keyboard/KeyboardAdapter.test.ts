import { describe, expect, it } from 'vitest';
import { KeyboardAdapter } from '../../../../../src/services/input/keyboard/KeyboardAdapter';
import { KeyboardService } from '../../../../../src/services/input/keyboard/KeyboardService';

class FakeKeyboardEvent extends Event {
  readonly code: string;
  preventDefaultCalled = false;
  constructor(type: 'keydown' | 'keyup', code: string) {
    super(type);
    this.code = code;
  }
  override preventDefault(): void {
    this.preventDefaultCalled = true;
  }
}

describe('KeyboardAdapter', () => {
  it('forwards keydown to the service without diverting unbound keys', () => {
    const target = new EventTarget();
    const service = new KeyboardService();
    const adapter = new KeyboardAdapter({ target, visibilityTarget: null, service });
    adapter.attach();

    const event = new FakeKeyboardEvent('keydown', 'KeyW');
    target.dispatchEvent(event);
    expect(service.isDown('KeyW')).toBe(true);
    expect(event.preventDefaultCalled).toBe(false);
    adapter.detach();
  });

  it('prevents default only for codes in the active allowlist', () => {
    const target = new EventTarget();
    const service = new KeyboardService();
    service.setPreventDefaultCodes(['KeyW']);
    const adapter = new KeyboardAdapter({ target, visibilityTarget: null, service });
    adapter.attach();

    const bound = new FakeKeyboardEvent('keydown', 'KeyW');
    target.dispatchEvent(bound);
    expect(bound.preventDefaultCalled).toBe(true);

    const unbound = new FakeKeyboardEvent('keydown', 'KeyA');
    target.dispatchEvent(unbound);
    expect(unbound.preventDefaultCalled).toBe(false);
    expect(service.isDown('KeyA')).toBe(true);
    adapter.detach();
  });

  it('clears the service on blur', () => {
    const target = new EventTarget();
    const service = new KeyboardService();
    const adapter = new KeyboardAdapter({ target, visibilityTarget: null, service });
    adapter.attach();
    service.onKeyDown('KeyW');
    expect(service.isDown('KeyW')).toBe(true);
    target.dispatchEvent(new Event('blur'));
    expect(service.isDown('KeyW')).toBe(false);
    adapter.detach();
  });

  it('clears the service on visibilitychange to hidden, but not to visible', () => {
    const target = new EventTarget();
    const visibilityTarget = new EventTarget();
    const service = new KeyboardService();
    const adapter = new KeyboardAdapter({
      target,
      visibilityTarget,
      service,
    });
    adapter.attach();
    service.onKeyDown('KeyW');
    expect(service.isDown('KeyW')).toBe(true);

    const visibleEvent = new Event('visibilitychange');
    Object.defineProperty(visibleEvent, 'target', {
      value: { visibilityState: 'visible' },
      writable: false,
    });
    visibilityTarget.dispatchEvent(visibleEvent);
    expect(service.isDown('KeyW')).toBe(true);

    const hiddenEvent = new Event('visibilitychange');
    Object.defineProperty(hiddenEvent, 'target', {
      value: { visibilityState: 'hidden' },
      writable: false,
    });
    visibilityTarget.dispatchEvent(hiddenEvent);
    expect(service.isDown('KeyW')).toBe(false);
    adapter.detach();
  });

  it('detach clears state and stops forwarding events', () => {
    const target = new EventTarget();
    const service = new KeyboardService();
    const adapter = new KeyboardAdapter({ target, visibilityTarget: null, service });
    adapter.attach();
    service.onKeyDown('KeyW');
    adapter.detach();
    expect(service.isDown('KeyW')).toBe(false);

    target.dispatchEvent(new FakeKeyboardEvent('keydown', 'KeyA'));
    expect(service.isDown('KeyA')).toBe(false);
  });
});