# 🏰 Chess for Kids — Medieval Chess Academy 🧙‍♂️

A gamified, medieval‑themed chess web app built to teach tactical foresight, spatial awareness, and strategic planning to kids aged **8–12**. Battle a real chess engine, solve quests, duel a friend online, and rise through the **Hall of Fame**.

🌐 **Live app:** <https://chess-for-kids-one.vercel.app>
📖 **Player tutorial:** [docs/tutorial/01-getting-started.md](docs/tutorial/01-getting-started.md)

---

## ✨ Features at a Glance

| Category | What's inside |
|---|---|
| **Single Player** | Local Stockfish AI with 4 difficulty levels — Squire, Knight, Bishop, King |
| **Multiplayer** | Real‑time online play via Firebase Realtime DB — create or join a 6‑char room code |
| **Wizard Coach** | Merlin narrates your game, warns about blunders, and celebrates great moves |
| **Time Spells ⏳** | 3 charges per game — rewind a blunder by "peeking into the future" |
| **Quest Map 🗺️** | Story‑driven chess puzzles (forks, pins, back‑rank mates) that pay out gold |
| **Endgame & Openings Trainers** | Focused practice modes for fundamentals |
| **Armoury Shop 🪙** | Spend gold on board themes, wizard skins, and **Knight Avatars** |
| **Hall of Fame 🏆** | Personal trophy room — equipped avatar, earned badges, lifetime stats |
| **12 Badges** | Dragon Slayer, Castle Builder, Puzzle Master, and more |
| **Tutorial Mode 🎓** | Learn every piece interactively, one at a time |
| **Vision Powers** | Territory Map overlay, Golden Shield auras, Red Target crosshairs |
| **Takeback ↩️** | Undo your last move and learn from the mistake |
| **PWA‑friendly** | Works on phone, tablet, and desktop browsers |

---

## 🚀 Quick Start (Developers)

### Prerequisites
- **Node.js 18+** (`node -v` to check)
- An optional Firebase project if you want to test multiplayer locally (see below)

### Install & Run
```bash
npm install
npm run dev
```
Open <http://localhost:3000>.

### Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript type‑check |
| `npm run test:e2e` | Playwright end‑to‑end tests |
| `npm run test:e2e:ui` | Playwright UI mode |

### Environment Variables (for Multiplayer)
Create `.env.local` with your Firebase web‑app config:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```
Single‑player works without these — the multiplayer menu just won't be able to create or join rooms.

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**
- **Zustand 5** — game state store
- **chess.js 1.4** — move generation & legality
- **stockfish.js** — local WASM chess engine (in `public/`)
- **firebase 12** (Realtime Database) — multiplayer rooms
- **framer‑motion** — UI animations
- **react‑hot‑toast** — notifications
- **Playwright** — end‑to‑end tests
- **Vercel** — production hosting

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx               # Landing page
│   ├── game/page.tsx          # Main game with tabbed UI
│   ├── tutorial/page.tsx      # Step-by-step piece tutorials
│   └── components/
│       ├── ChessBoard.tsx     # Interactive 8x8 board
│       ├── WizardCoach.tsx    # Merlin character + speech
│       ├── MultiplayerMenu.tsx
│       ├── HallOfFame.tsx
│       ├── ArmouryShop.tsx    # Themes + knight avatars
│       ├── QuestMap.tsx       # Puzzle quest selector
│       ├── BadgesPanel.tsx
│       ├── TimeSpellModal.tsx
│       ├── PiecePromotion.tsx
│       ├── CapturedPieces.tsx
│       ├── GameControls.tsx
│       ├── PuzzleControls.tsx
│       └── TutorialBoard.tsx
└── lib/
    ├── gameStore.ts           # Zustand store (game + UI state)
    ├── gameData.ts            # Puzzles, tutorials, badges
    ├── stockfish.ts           # AI worker wrapper
    ├── territory.ts           # Square-control calculator
    ├── firebase.ts            # Firebase init
    └── firebaseService.ts     # Multiplayer room API
public/
├── stockfish.js               # Stockfish WASM engine
└── stockfish.wasm.js
```

---

## 📖 Player Tutorial

The complete player handbook lives in **[docs/tutorial/](docs/tutorial/)**:

1. **[Getting Started](docs/tutorial/01-getting-started.md)** — where to play, the home screen, your first game
2. **[How to Play](docs/tutorial/02-how-to-play.md)** — pieces, rules, the board, vision powers, time spells
3. **[Multiplayer](docs/tutorial/03-multiplayer.md)** — duel a friend online with a 6‑letter room code
4. **[Quests, Badges & the Armoury](docs/tutorial/04-quests-and-rewards.md)** — earn gold, unlock avatars, climb the Hall of Fame

---

## 🧪 Testing

End‑to‑end Playwright tests cover the multiplayer flow against a real Firebase instance:

```bash
npm run test:e2e
```

The test in `e2e/multiplayer.spec.ts` opens two browser contexts, creates a room in one, joins from the other, and validates that moves sync in both directions.

---

## 🚢 Deploying

The app auto‑deploys to Vercel on every push to `main`. Preview deployments are spun up for non‑main branches and PRs (Firebase env vars are configured for Production, Preview, and Development).

---

## 🤝 Contributing

PRs welcome! Please run `npm run lint` and `npx tsc --noEmit` before pushing.

---

*Have fun, apprentice — and may the magic of the board guide your army to victory! 🏰♟*
