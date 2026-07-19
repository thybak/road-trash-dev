import type { KeyboardService } from './KeyboardService';

export interface KeyboardAdapterOptions {
  readonly target?: EventTarget | null;
  readonly visibilityTarget?: EventTarget | null;
  readonly service: KeyboardService;
}

export class KeyboardAdapter {
  private readonly target: EventTarget | null;
  private readonly visibilityTarget: EventTarget | null;
  private readonly service: KeyboardService;
  private readonly onKeyDownRef: (e: KeyboardEvent) => void;
  private readonly onKeyUpRef: (e: KeyboardEvent) => void;
  private readonly onBlurRef: () => void;
  private readonly onVisibilityRef: (e: Event) => void;
  private attached = false;

  constructor(options: KeyboardAdapterOptions) {
    this.target = options.target ?? (typeof window !== 'undefined' ? window : null);
    this.visibilityTarget =
      options.visibilityTarget ?? (typeof document !== 'undefined' ? document : null);
    this.service = options.service;
    this.onKeyDownRef = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.onKeyUpRef = (e: KeyboardEvent) => this.handleKeyUp(e);
    this.onBlurRef = () => this.service.clearAll();
    this.onVisibilityRef = (e: Event) => {
      const visible = (e.target as Document | null)?.visibilityState;
      if (visible === undefined || visible === 'hidden') {
        this.service.clearAll();
      }
    };
  }

  attach(): void {
    if (this.attached || !this.target) return;
    this.target.addEventListener('keydown', this.onKeyDownRef as EventListener);
    this.target.addEventListener('keyup', this.onKeyUpRef as EventListener);
    this.target.addEventListener('blur', this.onBlurRef);
    if (this.visibilityTarget) {
      this.visibilityTarget.addEventListener('visibilitychange', this.onVisibilityRef);
    }
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    if (this.target) {
      this.target.removeEventListener('keydown', this.onKeyDownRef as EventListener);
      this.target.removeEventListener('keyup', this.onKeyUpRef as EventListener);
      this.target.removeEventListener('blur', this.onBlurRef);
    }
    if (this.visibilityTarget) {
      this.visibilityTarget.removeEventListener('visibilitychange', this.onVisibilityRef);
    }
    this.attached = false;
    this.service.clearAll();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.service.shouldPreventDefault(e.code)) {
      e.preventDefault();
    }
    this.service.onKeyDown(e.code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (this.service.shouldPreventDefault(e.code)) {
      e.preventDefault();
    }
    this.service.onKeyUp(e.code);
  }
}