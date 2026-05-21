# Chess for Kids — Product Requirements Document

## Original Problem Statement
> "please refer to this app, check for any bugs and errors, and give me ideas to improve it"

Subsequent user directives:
1. "ok lets ship the fixes" — shipped 11 critical/major bug fixes (Session 1)
2. "Ship the top 5 highest-impact improvements" — shipped 5 features (Session 2)
3. "lets implement, A2, A4, C13, B10, also make the chess pieces and name in capital letters like E4 etc" — shipped 4 more features + capitalization (Session 3)

## Architecture
- **Frontend-only Next.js 16.2.6** (Turbopack) — no backend.
- React 19 · TypeScript (strict) · Zustand · chess.js · framer-motion 12.
- **Stockfish** Web Worker for AI.
- **Firebase** (Auth + Firestore + RTDB) for multiplayer.
- **Procedural audio** via Web Audio API (no asset files).
- **All gameplay state** in `src/lib/gameStore.ts`; persistent fields in `localStorage`.

## User Personas
- **Primary:** Kids aged 10–12 learning chess.
- **Secondary:** Parents / teachers.

## Core Requirements (cumulative)
1. Tutorial for 6 pieces + check/checkmate.
2. Vs-AI play (Squire → King) powered by Stockfish.
3. Tactical puzzles ("Quest Map") with hints & rewards.
4. Achievement system (13 badges + coins).
5. Shop ("Armoury") for board themes & wizard skins.
6. Time Spell blunder rewind mechanic.
7. Friend-vs-friend multiplayer via room codes.
8. Move-quality coaching feedback (Brilliant/Great/Sharp/Blunder badges).
9. Procedural sound design (Web Audio tones).
10. Daily Quest + streak counter.
11. Piece slide animations.
12. Shareable Victory PNG (Canvas).
13. **NEW: Tactical motif naming** (wizard explains forks, pins, skewers, discoveries).
14. **NEW: Endgame Trainer** (K+Q, K+R, K+2R, K+P drills with par-move bonus).
15. **NEW: Coach Replay** (interactive game review with per-move classification).
16. **NEW: Stacked captured pieces + material badge** (Battle Trophies UI).
17. **NEW: Uppercase chess notation** (A-H board labels, uppercase SAN in modals).

## What's Been Done

### Session 1 — Bug audit + 11 critical/major fixes (see prior PRD versions)

### Session 2 — Top 5 improvement features (see prior PRD versions)

### Session 3 — 4 improvement features + capitalization (current)
- **A2 Tactical motif naming** (`src/lib/motifs.ts`):
  - Detects FORK (piece attacks ≥2 valuable enemy pieces)
  - Detects PIN / SKEWER (sliding piece with two enemy pieces behind on the same ray)
  - Detects DISCOVERED ATTACK (moving a piece uncovers a friendly attacker)
  - Detects BIG THREAT (single high-value undefended target)
  - Verified live: PIN message after Bc4 ("📌 PIN! The enemy Pawn is stuck — if it moves, your Bishop will capture the Knight behind it!")
- **A4 Endgame Trainer** (`src/lib/endgameDrills.ts` + `src/app/components/EndgameTrainer.tsx`):
  - 4 drills: K+Q vs K, K+R vs K, K+2R ladder mate, K+P vs K promotion
  - Par-moves system with 2× gold bonus for completing under par
  - New "Endgame Trainer" tab in game header
  - Squire AI plays the lone king (semi-random) — gives kids the chase satisfaction
  - Exit Drill button to return to drill menu
- **C13 Coach Replay** (`src/app/components/CoachReplay.tsx`):
  - "📜 Review Game" button in the game-over modal
  - Modal with mini 8×8 board + commentary panel
  - Each move shows: SAN (uppercase), quality badge, tactical motif explanation if any
  - Prev/Next navigation with progress counter
  - Frames are re-derived from `moveHistory` using the same classifier + motif detector
- **B10 Stacked Captured Pieces + material badge** (`src/app/components/CapturedPieces.tsx` rewrite):
  - Overlapping stack design (-9px margin) like Chess.com
  - Pieces sorted by value (Q→R→B→N→P) so the stack reads trophy-pile style
  - Hover lifts piece for inspection
  - Live material advantage badge (e.g., `+3` green or `-3` red) in the header
  - "BATTLE TROPHIES" Cinzel-serif heading
- **Capitalization tweak**:
  - Board file labels A–H (was a–h)
  - Time Spell modal renders move SAN uppercase (`DXC4` instead of `dxc4`)
  - Coach Replay shows all move SANs uppercase
  - Wizard messages about specific moves use `.toUpperCase()`

### Verification
- ✅ `next build` clean
- ✅ `tsc --noEmit` clean
- ✅ `eslint .` clean (2 intentional `eslint-disable-next-line` comments for known-good patterns)
- ✅ Playwright run: all features live-verified:
  - Endgame Trainer tab + 4 drill cards rendered with par-move/reward labels
  - Queen Endgame drill loads correctly (K e5/d1/e1, AI king dodges intelligently)
  - PIN motif fires live in normal gameplay after Bc4 vs developed knight
  - "⚡ Sharp Check!" badge appears after Ra5+
  - Uppercase file labels A-H rendered on top + bottom
  - BATTLE TROPHIES panel shows `-3` red badge when material is lost
  - Time Spell warning still fires on hung bishop (Bug #11 regression-clean)

## Prioritized Backlog

### Remaining from the 22 improvement ideas (9 shipped so far)
**A. Educational Depth:** A3 (Opening trainer), A5 (Adaptive difficulty)
**B. UX/Visual:** B6 (resolve identity tension), B9 (subtler AI indicator)
**C. Engagement:** C12 (wizard personality voice lines), C14 (avatar/hero), C15 (hall of fame)
**D. Distribution:** D17 (multiplayer challenge links), D18 (print-and-play PDFs)
**E. Tech Debt:** E19, E20, E21, E22 (refactoring, all 4 still pending)

### Known minor issues
- Wizard speech bubble auto-dismisses 5s during pendingTimeSpell (cosmetic).
- Tutorial "Board" lesson empty board (intentional `click_sequence`).
- Mobile responsive audit pending.

## Next Action Items
- Real two-browser multiplayer end-to-end test.
- Highest-leverage next improvement: **A3 Opening Trainer** (would complete the educational trilogy: tactics from Quest Map, motifs from real games, openings as guided 4-move stories) or **C12 Wizard personality voice lines** (30+ per emotion for character depth).
