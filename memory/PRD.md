# Chess for Kids — Product Requirements Document

## Original Problem Statement
> "please refer to this app, check for any bugs and errors, and give me ideas to improve it"

User then approved scope: "ok lets ship the fixes" (after reviewing a full bug & improvement report).

## Architecture
- **Frontend-only Next.js 16.2.6 app** (Turbopack) — no separate backend.
- React 19 · TypeScript (strict) · Zustand for state · chess.js for game logic.
- **Stockfish** runs in-browser as a Web Worker (`/public/stockfish.js` + `stockfish.wasm`).
- **Firebase** (Auth + Firestore + Realtime DB) for multiplayer rooms; configured via `NEXT_PUBLIC_FIREBASE_*` env vars in `src/lib/firebase.ts`.
- All gameplay state lives in `src/lib/gameStore.ts`; persistent fields (coins, badges, themes, skins, puzzle progress) are saved to `localStorage` under key `chess_kids_saved_data`.

## User Personas
- **Primary:** Kids aged 10–12 learning chess for the first time.
- **Secondary:** Parents / teachers who set up the app and observe progress.

## Core Requirements (static)
1. Teach all 6 pieces + check/checkmate via interactive tutorial.
2. Vs-AI play across 4 difficulty levels (Squire → King) powered by Stockfish.
3. Tactical puzzles ("Quest Map") with hints and gold rewards.
4. Achievement system (badges + coins) with progression.
5. Shop ("Armoury") to spend coins on board themes & wizard skins.
6. Time Spell mechanic — warn kids of blunders, let them rewind the timeline.
7. Friend-vs-friend multiplayer via room codes (Firebase RTDB).

## What's Been Done
### 2026-01-XX — Bug audit + critical/major fix pass
- **Reviewed** full codebase, produced a detailed prioritized bug + improvement report (37 items across critical/major/minor).
- **Shipped the following critical & major fixes:**
  1. Coins & badges now auto-persist to localStorage immediately on earn (was lost on tab close).
  2. `startPuzzle` resets `playerColor` to match puzzle FEN turn — puzzles no longer break when user has toggled "Play as Black".
  3. `castTimeSpell` is now atomic: closes modal + locks AI + decrements spell charge up-front. Eliminates the double-cast exploit.
  4. `declineTimeSpell` now FORCES the AI to play the exact warned move (was previously deferring to Stockfish, which could pick a different reply and make Merlin look like a liar).
  5. Time Spell trigger threshold tightened: only fires for captures of pieces worth ≥3 that are undefended, OR immediate checkmate. Removed noisy "any check" trigger.
  6. Multiplayer rewrites: uses `update()` instead of `setDb()` (preserves room metadata), syncs `history` + `capturedPieces` on inbound moves, properly unsubscribes listeners on `leaveMultiplayerRoom`.
  7. Added missing "King's Conqueror" achievement (defeating King-difficulty AI).
  8. `CapturedPieces` now renders captured-piece glyphs in the correct color regardless of player side.
  9. Fixed invalid `<Link><button>` HTML nesting on home page — now uses imperative `router.push` after state update.
  10. `useMemo` for `calculateTerritory` now depends on `fen` so heatmap recalculates every move (was stale because `chess` object is mutated in place).
  11. Fixed JOIN button overflow in multiplayer panel (`min-width: 0` on input + `flex-shrink: 0` on button).

### Verification
- `next build` ✅ clean
- `tsc --noEmit` ✅ clean
- `eslint .` ✅ clean (1 intentional `eslint-disable-next-line` for the `useMemo` dep above)
- Playwright smoke test: confirmed puzzle is selectable after toggling Play-as-Black; confirmed JOIN button no longer overflows; confirmed `<a>` doesn't wrap any `<button>` on home; confirmed Play Now navigates to /game.

## Prioritized Backlog (P0/P1/P2)
### P0 — not addressed in this pass (still relevant)
- **Educational depth:** move-quality classification (Brilliant/Good/Inaccurate/Blunder) per move using Stockfish eval diff. This is the single highest-leverage feature for "chess for kids" positioning.
- **Sound design:** zero audio currently. Even basic click/move/win sounds would 3× perceived quality.

### P1
- Daily quest with streak counter (Duolingo-style retention loop).
- Coach Replay after game-over — wizard walks through the 2-3 turning points of the last game.
- Adaptive difficulty: track win/loss ratio and suggest difficulty changes.
- Wire up `firebaseService.ts` properly and delete duplicate multiplayer logic in `gameStore.ts`.
- Piece-move animations using framer-motion (already installed!).

### P2
- Shareable PNG game cards after a win.
- Print-and-play tactics sheets.
- More wizard personality voice lines (30+ per emotion).
- Local hall-of-fame stats (shortest win, biggest material gain, hardest AI beaten).
- Stockfish handshake polish: `isready`/`readyok`, lazy worker init only when needed.
- Mobile audit + tighter responsive layout for phones.
- Remove unused Google Fonts (MedievalSharp, Inter) — bundle savings.
- Lazy-load Firebase only when entering multiplayer (reduces initial bundle).

## Known Remaining Issues (deferred this round)
- Wizard speech bubble auto-dismisses after 5s even when `pendingTimeSpell` is shown (minor cosmetic).
- Tutorial "Board" lesson renders an empty board because pieces are hidden in `click_sequence` mode (intentional design but kid-confusing).
- Two duplicate multiplayer implementations (`gameStore.ts` + `firebaseService.ts`) — `firebaseService` is cleaner but unused.
- Visual identity tension between "medieval gold/parchment" tokens in `globals.css` and the purple-cosmic gradient on the home page.

## Next Action Items
- Decide on P0 next feature: "move quality coaching" or "sound design".
- Test multiplayer end-to-end with two browser tabs after Firebase config is confirmed live.
