# Chess for Kids — Product Requirements Document

## Original Problem Statement
> "please refer to this app, check for any bugs and errors, and give me ideas to improve it"

User then approved scope across two sessions:
1. **Session 1**: "ok lets ship the fixes" — shipped 11 critical/major bug fixes
2. **Session 2**: "Ship the top 5 highest-impact improvements" — shipped 5 feature improvements

## Architecture
- **Frontend-only Next.js 16.2.6** (Turbopack) — no separate backend.
- React 19 · TypeScript (strict) · Zustand · chess.js · framer-motion 12.
- **Stockfish** Web Worker (`/public/stockfish.js` + `.wasm`).
- **Firebase** (Auth + Firestore + RTDB) for multiplayer rooms.
- **Procedural sound** via Web Audio API (no audio files in the bundle).
- All gameplay state lives in `src/lib/gameStore.ts`; persistent fields saved to `localStorage` (`chess_kids_saved_data` + `chess_kids_sound_muted`).

## User Personas
- **Primary:** Kids aged 10–12 learning chess.
- **Secondary:** Parents / teachers.

## Core Requirements
1. Tutorial for 6 pieces + check/checkmate.
2. Vs-AI play (Squire → King) powered by Stockfish.
3. Tactical puzzles ("Quest Map") with hints & rewards.
4. Achievement system (13 badges + coins).
5. Shop ("Armoury") for board themes & wizard skins.
6. Time Spell mechanic for blunder rewinds.
7. Friend-vs-friend multiplayer via room codes.
8. **NEW: Move-quality coaching feedback** (instant Brilliant/Great/Sharp/Blunder badges).
9. **NEW: Sound design** (procedural Web Audio tones).
10. **NEW: Daily Quest + streak counter** (Duolingo-style retention loop).
11. **NEW: Piece slide animations** between squares.
12. **NEW: Shareable Victory PNG** generated client-side via Canvas.

## What's Been Done

### 2026-01-XX — Session 1: Bug audit + 11 critical/major fixes
- Reviewed full codebase, produced prioritized bug report (37 items).
- Shipped:
  1. Coins/badges auto-persist on earn.
  2. Puzzles work after toggling "Play as Black".
  3. Time Spell atomic locking, no double-cast.
  4. Time Spell decline forces AI to play the warned move.
  5. Multiplayer: `update()` instead of overwrite, history+captured sync, listener cleanup.
  6. Tightened Time Spell trigger threshold (capture ≥3 + checkmate only).
  7. Added missing "King's Conqueror" achievement (13 badges total).
  8. CapturedPieces color renders correctly for both player sides.
  9. Fixed invalid `<Link><button>` HTML on home.
  10. `useMemo` for `calculateTerritory` now uses `fen` (heatmap freshness).
  11. JOIN button no longer overflows its panel.

### 2026-01-XX — Session 2: Top 5 high-impact improvements
- **A1 — Move-quality coaching** (`src/lib/moveQuality.ts`): heuristic classifier returns
  Brilliant / Great / Good / Sharp / Safe / Promotion / Risky / Blunder based on
  capture value, defender/attacker counts, check, promotion, castling, checkmate.
  Wired into `makeMove` → store `lastMoveQuality`. Displayed as a floating badge
  above the destination square (framer-motion) — only fires for noteworthy moves
  (signal not noise; ordinary developing moves return null).
- **B7 — Piece slide animations**: framer-motion `motion.span` for every piece, with
  `initial={{ x: deltaX, y: deltaY }}` computed from `lastMove.from → lastMove.to`
  expressed as % of square width. Spring transition (stiffness 380, damping 30).
- **B8 — Procedural sound design** (`src/lib/sounds.ts`): Web Audio API oscillators
  with envelopes for select / move / capture / check / checkmate / loss / badge /
  coins. Header sound toggle (🔊/🔇) persists to localStorage. No audio files in
  the bundle. Auto-unlocks AudioContext on first pointer event (iOS Safari fix).
- **C11 — Daily Quest + streak counter** (`src/lib/daily.ts`):
  - Deterministic puzzle pick from PUZZLES indexed by day-since-epoch.
  - Featured card on Quest Map showing today's puzzle, 2× gold bonus, streak fire emoji.
  - Streak increments on consecutive days, resets on miss.
  - Bonus reward only awarded once per day.
  - Today's daily quest gets a star + golden glow on the quest map.
- **D16 — Shareable Victory PNG** (`src/lib/shareCard.ts`):
  - Canvas-based 800×1040 card with gradient background, title, difficulty pill,
    rendered final board, footer branding.
  - Triggered from a new "📸 Share Victory" button in the game-over modal (win only).
  - Auto-downloads + copies PNG to clipboard (where supported).
  - Toast notification confirms saved + copied.

### Verification (both sessions)
- ✅ `next build` clean
- ✅ `tsc --noEmit` clean
- ✅ `eslint .` clean (1 intentional `eslint-disable-next-line` for the `useMemo` dep)
- ✅ Playwright runs: confirmed sound toggle persists; daily quest card renders with
  Windmill puzzle and 🔥 streak; Time Spell warning still fires correctly (regression
  validation); puzzles work after "Play as Black"; auto-save catches the First Step
  badge + 5 gold within 1 move.

## Prioritized Backlog

### Remaining from the original 22 improvement ideas
**A. Educational Depth (3/5 remaining):**
- A2 — Wizard names tactical motifs ("That was a FORK!").
- A3 — Opening Trainer mini-quest (Italian, Ruy Lopez, Scandinavian).
- A4 — Endgame drills (K+Q vs K, K+R vs K).
- A5 — Adaptive difficulty suggestions.

**B. UX / Visual Polish (3/5 remaining):**
- B6 — Resolve purple-cosmic vs medieval-gold identity tension.
- B9 — Subtler "AI thinking" indicator (glow AI pieces vs board overlay).
- B10 — Captured-pieces stacked-overlap style + material badge.

**C. Engagement / Retention (4/5 remaining):**
- C12 — Wizard personality voice lines (30+ per emotion).
- C13 — Coach Replay after game over.
- C14 — Avatar/hero customization beyond wizard skin.
- C15 — Local hall of fame.

**D. Distribution Hooks (2/3 remaining):**
- D17 — "Copy challenge link" for multiplayer.
- D18 — Print-and-play tactics sheets PDF.

**E. Tech Debt (4/4 remaining):**
- E19 — Wire up `firebaseService.ts`, delete duplicate MP logic in store.
- E20 — Single auto-save helper for persistent fields.
- E21 — `useStockfish` hook owning worker lifecycle.
- E22 — Extract `<Piece>` and `<Heatmap>` components from ChessBoard.

### Known minor issues still in code
- Wizard speech bubble auto-dismisses 5s during pendingTimeSpell modal (cosmetic).
- Tutorial "Board" lesson renders an empty board (intentional `click_sequence` mode).
- Mobile responsive audit pending.

## Next Action Items
- Continue with remaining improvements from the backlog (A2, A4, C13 are the
  highest-leverage educational wins; B6 + B10 are the highest-leverage visual wins).
- End-to-end multiplayer test with two real browsers.
