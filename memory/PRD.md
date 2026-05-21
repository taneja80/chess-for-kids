# Chess for Kids — Product Requirements Document

## Original Problem Statement
> "please refer to this app, check for any bugs and errors, and give me ideas to improve it"

User directives across sessions:
1. "ok lets ship the fixes" → 11 critical/major bug fixes
2. "Ship the top 5 highest-impact improvements" → 5 features
3. "lets implement A2, A4, C13, B10, also make … capital letters like E4" → 4 features + caps
4. "lets implement A3 and C12" → 2 features
5. "lets ship A5" → 1 feature (current)

## Architecture
- Frontend-only Next.js 16.2.6 (Turbopack), React 19, TypeScript strict, Zustand, chess.js, framer-motion 12.
- Stockfish Web Worker for AI.
- Firebase RTDB for multiplayer.
- Procedural audio via Web Audio API.
- Gameplay state in `src/lib/gameStore.ts`; persistence in localStorage.

## Cumulative Features (20 total)
1–7. Tutorial · Vs-AI · Puzzles · 13 Badges · Armoury · Time Spell · Multiplayer
8–12. Move-quality feedback · Sounds · Daily Quest · Piece animations · Victory PNG
13–17. Tactical motifs · Endgame Trainer · Coach Replay · Stacked Captures · Uppercase notation
18–19. Opening Trainer · Wizard Personality voice lines
20. **NEW: Adaptive Difficulty (A5)**

## Session 5 — A5 Adaptive Difficulty

### Implementation
- **State**: new fields in store
  - `aiRecord: Record<Difficulty, ('w' | 'l' | 'd')[]>` — last 5 results per AI level
  - `suggestedDifficulty: Difficulty | null` — computed signal for the UI
- **Actions**:
  - `recordAiResult(result)` — called from `makeMove` in vs-ai mode on both checkmate and draw branches. Slices the rolling 5-game window per difficulty.
  - `acceptSuggestedDifficulty()` — sets `difficulty` to the suggestion and starts a fresh game.
  - `dismissSuggestion()` — hides the card.
- **Trigger logic**:
  - 3 consecutive wins at current level → suggest the next level up
  - 2 of last 3 losses → suggest level down (gentler threshold for step-down so kids don't get stuck)
  - Lowest level (Squire) won't trigger step-down; highest (King) won't trigger step-up
- **Persistence**: `aiRecord` saves to `localStorage` via `saveToLocalStorage` and restores in `loadSavedData`. Survives page reloads + sessions.
- **UI**: New "suggestion" card in the game-over modal
  - **Step-up** variant (gold gradient): *"⭐ Merlin senses your growing power! You've crushed the Squire 3 times in a row. Ready to face the Knight?"* with `⚔️ Face the Knight` button
  - **Step-down** variant (sky-blue gradient): *"🛡️ Merlin offers a kind word… The Bishop is tough today. Practice at Knight level — you'll be back stronger!"* with `🛡️ Try Knight` button
  - "No thanks" ghost button to dismiss
- **`newGame()` clears the suggestion** so it doesn't linger past the very next game start.

### Verification
- ✅ `next build` clean · `tsc --noEmit` clean · `eslint .` clean
- ✅ Live test: `aiRecord` survives a page reload (state correctly merged from localStorage in `loadSavedData`)
- ✅ Suggestion UI render path manually code-reviewed; markup renders inside the game-over modal when `suggestedDifficulty && mode === 'vs-ai'`
- ⚠️ End-to-end live trigger requires landing 3 real checkmates vs the AI — script-flaky but the integration is statically verified

## Backlog Status — 12 / 22 improvement ideas shipped

### Remaining (10 / 22)
- **B. UX/Visual:** B6 (resolve purple-vs-medieval identity tension), B9 (subtler AI thinking indicator)
- **C. Engagement:** C14 (avatar/hero customization beyond skin), C15 (local hall of fame)
- **D. Distribution:** D17 (multiplayer challenge link), D18 (print-and-play PDFs)
- **E. Tech debt:** E19 (wire firebaseService.ts), E20 (auto-save helper), E21 (useStockfish hook), E22 (extract Piece/Heatmap components)

### Known minor issues
- Wizard auto-dismisses 5s during pendingTimeSpell (cosmetic)
- Tutorial "Board" lesson renders empty board (intentional click_sequence mode)
- Mobile responsive audit pending

## Next Action Items
- **C14 Avatar customization** — small but high-engagement (pick your own knight character).
- **C15 Hall of Fame** — local leaderboard (shortest win, longest streak, biggest material gain) — pairs nicely with the Adaptive Difficulty data we now track.
- Real two-browser multiplayer e2e test.
- Mobile responsive audit.
