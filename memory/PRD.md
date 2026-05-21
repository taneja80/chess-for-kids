# Chess for Kids — Product Requirements Document

## Original Problem Statement
> "please refer to this app, check for any bugs and errors, and give me ideas to improve it"

User directives across sessions:
1. "ok lets ship the fixes" → 11 critical/major bug fixes
2. "Ship the top 5 highest-impact improvements" → 5 features
3. "lets implement A2, A4, C13, B10, also make … capital letters like E4" → 4 features + caps
4. "lets implement A3 and C12" → 2 features (current)

## Architecture
- **Frontend-only Next.js 16.2.6** (Turbopack), React 19, TypeScript strict, Zustand, chess.js, framer-motion 12.
- **Stockfish** Web Worker for AI.
- **Firebase** for multiplayer (RTDB).
- **Procedural audio** via Web Audio API.
- Gameplay state in `src/lib/gameStore.ts`; persistence in localStorage.

## Core Requirements (cumulative — 17 features now)
1–7. Tutorial · Vs-AI · Puzzles · 13 Badges · Armoury Shop · Time Spell · Multiplayer
8–12. Move-quality feedback · Sounds · Daily Quest · Piece animations · Victory PNG
13–17. Tactical motifs · Endgame Trainer · Coach Replay · Stacked captures · Uppercase notation
18–19. **NEW: Opening Trainer · Wizard Personality Voice Lines**

## Session 4 — A3 + C12 (current)

### A3 — Opening Trainer
- **`src/lib/openings.ts`**: 5 famous openings (Italian Game, Ruy Lopez, Scandinavian Defense, Sicilian Defense, Queen's Gambit) each with 6 plies of SAN + kid-friendly commentary, era flavor, difficulty, gold reward.
- **`src/app/components/OpeningTrainer.tsx`** (+ CSS): card grid with era badge, difficulty pill, move-chip preview, "📖 LEARN THIS OPENING" CTA.
- **gameStore extensions**:
  - New `'opening'` GameMode + `activeOpeningId` + `openingStep` state.
  - `startOpening(id)` / `exitOpeningMode()` actions.
  - `makeMove` pre-checks player's move against the canonical SAN; **rejects wrong moves with coaching message** (no board mutation on miss).
  - On correct player move: shows commentary, advances step, then auto-plays the opponent's book reply after 1.2s with its own commentary.
  - On final step: awards opening gold reward + congrats message.
  - `return true` short-circuit skips badge/endgame/time-spell logic — clean lesson flow.
- **Game page integration**: new "📚 Openings" tab; "📚 Opening Lesson — Step N: Play the suggested move!" indicator banner with "Exit Lesson" button; AI useEffect skips opening mode (book moves play themselves).
- **Live-verified**: Italian Game start → E4 → wizard explains → system auto-plays E5 with commentary → wrong move D4 → wizard rejects: *"✋ Not quite! In the The Italian Game, the book move here is NF3. Try again!"* and board state preserved.

### C12 — Wizard Personality Voice Lines
- **`src/lib/wizardVoice.ts`**: pools of 5–10 medieval-flavored quotes for 10 contexts:
  - first_capture, queen_capture, first_castle, first_check, pawn_promote, first_checkmate, draw, game_lose, check_warning, idle_hint, endgame_intro
  - 60+ unique quotes total across all categories
- **`pickWizardLine(category)`**: randomly selects from a pool; returns empty string if unknown (caller may fallback).
- **gameStore wiring**: 6 hardcoded badge-trigger and warning messages replaced with `pickWizardLine(...)`-or-fallback pattern — variety without losing safety.
- Examples:
  - First capture: *"⚔️ First blood!"* OR *"⚔️ Hark! A brave squire draws first blood!"* OR *"⚔️ By my beard — your sword finds its mark!"* (etc.)
  - Queen capture: *"🐉 By the stars! The mighty Queen has fallen!"* / *"🐉 Even the elder wizards bow to this!"*
  - Check warning: 5 variants
  - Checkmate: 6 variants — *"🏆 Merlin himself salutes you — a perfect mate!"*
- Idle hints pool ready for future use (e.g., a quiet-game prompt timer).

### Verification
- ✅ `next build` clean
- ✅ `tsc --noEmit` clean
- ✅ `eslint .` clean
- ✅ Live screenshots confirmed:
  - Openings tab present with all 5 openings rendered
  - Italian Game lesson plays end-to-end with correct commentary
  - Wrong-move detection works ("book move here is NF3")
  - Opening indicator banner shows "Step N"
  - Auto-play of opponent's book reply happens after 1.2s
  - All earlier features (Endgame Trainer, Quest Map, Daily Quest, etc.) still functional

## Backlog Status — 11/22 improvement ideas shipped

### Remaining (out of original 22)
- **A. Educational:** A5 (adaptive difficulty)
- **B. UX:** B6 (identity tension), B9 (subtler AI indicator)
- **C. Engagement:** C14 (avatar/hero), C15 (hall of fame)
- **D. Distribution:** D17 (challenge link), D18 (print-and-play PDFs)
- **E. Tech debt:** E19, E20, E21, E22

### Known minor issues
- Wizard auto-dismisses 5s during pendingTimeSpell (cosmetic).
- Tutorial "Board" lesson empty board (intentional click_sequence).
- Mobile responsive audit pending.

## Next Action Items
- **A5 Adaptive difficulty** — track recent win/loss ratio and suggest difficulty changes (highest pedagogical leverage of the remaining items).
- **C14 Avatar customization** — pick your own knight character beyond just the wizard skin.
- Real two-browser multiplayer end-to-end test.
- Mobile responsive audit.
