/**
 * Lightweight procedural sound system using the Web Audio API.
 * No asset files — every sound is generated from oscillators with envelopes.
 * Keeps the bundle small and lets us tune timbre without dragging in audio files.
 */

let ctx: AudioContext | null = null;
let muted = false;
let initialized = false;

const STORAGE_KEY = 'chess_kids_sound_muted';

interface AudioCtor {
  new (): AudioContext;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const Ctor =
        (window.AudioContext as AudioCtor | undefined) ??
        ((window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext);
      if (!Ctor) return null;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function initSound(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    muted = localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    /* localStorage blocked — leave muted=false */
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(v: boolean): void {
  muted = v;
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {}
}

/** Resume the audio context — needed on iOS Safari after a user gesture. */
export function unlock(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

interface ToneOpts {
  freq: number;
  duration: number; // seconds
  type?: OscillatorType;
  volume?: number;
  glideTo?: number; // optional frequency to glide to
  attack?: number;
}

function tone({ freq, duration, type = 'sine', volume = 0.12, glideTo, attack = 0.005 }: ToneOpts): void {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (glideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), now + duration);
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}

function chord(freqs: number[], duration: number, type: OscillatorType = 'triangle', volume = 0.08): void {
  freqs.forEach((f, i) => {
    setTimeout(() => tone({ freq: f, duration, type, volume }), i * 80);
  });
}

// ── Public sound API ───────────────────────────────────────────────────────

export function playSelect(): void {
  if (muted) return;
  tone({ freq: 880, duration: 0.05, type: 'sine', volume: 0.06 });
}

export function playMove(): void {
  if (muted) return;
  tone({ freq: 280, duration: 0.09, type: 'triangle', volume: 0.12, glideTo: 180 });
}

export function playCapture(): void {
  if (muted) return;
  tone({ freq: 600, duration: 0.16, type: 'sawtooth', volume: 0.14, glideTo: 90 });
  setTimeout(() => tone({ freq: 220, duration: 0.08, type: 'triangle', volume: 0.08 }), 40);
}

export function playCheck(): void {
  if (muted) return;
  tone({ freq: 988, duration: 0.12, type: 'square', volume: 0.1 });
  setTimeout(() => tone({ freq: 740, duration: 0.16, type: 'square', volume: 0.1 }), 100);
}

export function playCheckmate(): void {
  if (muted) return;
  // C major triumphant arpeggio: C5, E5, G5, C6
  chord([523.25, 659.25, 783.99, 1046.5], 0.45, 'triangle', 0.1);
}

export function playLoss(): void {
  if (muted) return;
  // Descending minor arpeggio: C5, Ab4, F4
  chord([523.25, 415.3, 349.23], 0.5, 'sine', 0.09);
}

export function playBadge(): void {
  if (muted) return;
  // Sparkly two-tone for badge unlock
  tone({ freq: 1318.5, duration: 0.1, type: 'triangle', volume: 0.1 });
  setTimeout(() => tone({ freq: 1760, duration: 0.18, type: 'triangle', volume: 0.1 }), 90);
}

export function playCoins(n: number = 1): void {
  if (muted) return;
  const count = Math.min(4, Math.max(1, n));
  for (let i = 0; i < count; i++) {
    setTimeout(() => tone({ freq: 1500 + i * 200, duration: 0.06, type: 'sine', volume: 0.07 }), i * 60);
  }
}
