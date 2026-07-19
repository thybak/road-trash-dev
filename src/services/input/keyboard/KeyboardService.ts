interface CodeState {
  down: boolean;
  pressed: boolean;
  released: boolean;
}

export class KeyboardService {
  private readonly state = new Map<string, CodeState>();
  private readonly preventDefaultCodes = new Set<string>();

  onKeyDown(code: string): void {
    const existing = this.state.get(code);
    if (existing) {
      existing.released = false;
      if (!existing.down) {
        existing.down = true;
        existing.pressed = true;
      }
      return;
    }
    this.state.set(code, { down: true, pressed: true, released: false });
  }

  onKeyUp(code: string): void {
    const existing = this.state.get(code);
    if (!existing) {
      this.state.set(code, { down: false, pressed: false, released: true });
      return;
    }
    if (existing.down) {
      existing.down = false;
      existing.released = true;
    }
  }

  isDown(code: string): boolean {
    return this.state.get(code)?.down ?? false;
  }

  pressed(code: string): boolean {
    return this.state.get(code)?.pressed ?? false;
  }

  released(code: string): boolean {
    return this.state.get(code)?.released ?? false;
  }

  pressedCodes(): readonly string[] {
    const out: string[] = [];
    for (const [code, s] of this.state) {
      if (s.pressed) out.push(code);
    }
    return out;
  }

  releasedCodes(): readonly string[] {
    const out: string[] = [];
    for (const [code, s] of this.state) {
      if (s.released) out.push(code);
    }
    return out;
  }

  downCodes(): readonly string[] {
    const out: string[] = [];
    for (const [code, s] of this.state) {
      if (s.down) out.push(code);
    }
    return out;
  }

  afterFrame(): void {
    for (const s of this.state.values()) {
      s.pressed = false;
      s.released = false;
    }
  }

  clearAll(): void {
    this.state.clear();
  }

  setPreventDefaultCodes(codes: Iterable<string>): void {
    this.preventDefaultCodes.clear();
    for (const c of codes) this.preventDefaultCodes.add(c);
  }

  shouldPreventDefault(code: string): boolean {
    return this.preventDefaultCodes.has(code);
  }

  activePreventDefaultCodes(): readonly string[] {
    return [...this.preventDefaultCodes];
  }
}