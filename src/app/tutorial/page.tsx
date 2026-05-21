'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import TutorialBoard, { QuestConfig } from '../components/TutorialBoard';

interface Lesson {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  content: string;
  quest: QuestConfig;
}

const LESSONS: Lesson[] = [
  {
    id: 'board',
    icon: '🏰',
    title: 'The Kingdom (Board)',
    subtitle: 'Learn the battlefield',
    color: '#fbbf24',
    content: `Welcome, brave Squire! Before we battle, you must know your **kingdom** — the chess board.

👑 **The Layout**
The board has **64 squares** in 8 rows and 8 columns:
- **Ranks** are the *rows* — numbered **1 to 8** from your side to the enemy's side
- **Files** are the *columns* — labeled **A to H** from your left to your right

💡 **Light on Right!** The square in your bottom-right corner is **always light**. If it's dark, the board is set up wrong — spin it 90°!

📍 **Square Names (Chess Notation)**
Every square has a unique name made of its file + rank — like **E4**, **A1**, or **H8**. Think of it like a treasure map address: "E" tells you which column, "4" tells you which row.

🟨🟫 **Alternating Colors**
Light and dark squares alternate in a checkerboard pattern. The Bishop you'll meet later lives on only **one color** for the entire game!

🛡️ **Starting Positions**
- **Your army** (White): ranks **1 and 2**
- **Enemy army** (Black): ranks **7 and 8**
- Ranks 3, 4, 5, 6 are the no-man's-land where battles rage!

🧠 **Did you know?** A board has more possible chess games than there are atoms in the universe. Every game you play is a brand-new adventure!`,
    quest: {
      id: 'board',
      mode: 'click_sequence',
      fen: 'k7/8/8/8/8/8/8/7K w - - 0 1',
      instruction: 'Brave Squire! Click on the coordinate E4, then D5, and finally F3!',
      targets: ['e4', 'd5', 'f3'],
    },
  },
  {
    id: 'king',
    icon: '♔',
    title: 'The King',
    subtitle: 'Protect the royal family!',
    color: '#fbbf24',
    content: `Meet the **King** (♔) — your most important piece. He's the heart of your army.

👑 **The Golden Rule**
If your King is **checkmated**, you lose. Period. So protecting him is mission #1, always.

🚶 **How the King Moves**
The King moves **one square** at a time in **any direction** — like a slow, grumpy old monarch:
- ⬆️ Up, ⬇️ down, ⬅️ left, ➡️ right
- ↖️↗️↙️↘️ All four diagonals

That's 8 possible squares — but only if they're safe!

⚠️ **Check & The Forbidden Zones**
The King can **never** walk into a square where an enemy piece could capture him. The game won't even let you try! When the King is under attack, that's called **check** — and you must escape it immediately.

🏰 **The King's Secret Trick: Castling**
Once per game, the King can do a special move called **castling** — he and a Rook swap places to hide him safely in a corner. We'll learn this in a later lesson!

♟ **Tip from Merlin:** Keep your King behind a wall of pawns during the early and middle game. Only bring him out to fight when most pieces are off the board.

🧠 **Did you know?** In chess history, the King was once allowed to leap two squares in one go — that's where castling came from!`,
    quest: {
      id: 'king',
      mode: 'move_piece',
      fen: 'k7/8/8/8/8/8/r7/4K3 w - - 0 1',
      instruction: 'Your King is trapped by the Rook on rank 2! March safely to F1.',
      targets: ['f1'],
    },
  },
  {
    id: 'queen',
    icon: '♕',
    title: 'The Queen',
    subtitle: 'The most powerful piece!',
    color: '#a78bfa',
    content: `Bow to Her Majesty — the **Queen** (♕)! She's the strongest warrior in the whole army.

💜 **The Power of Two-in-One**
The Queen combines the moves of a **Rook** *and* a **Bishop**:
- Slides in straight lines (like a Rook)
- Glides on diagonals (like a Bishop)
- Any direction, any distance — until she hits a piece or the edge

From the center of an empty board, she can attack up to **27 squares** at once! That's wild.

💰 **Point Value: 9**
The Queen is worth **9 points** — way more than any other piece (except the priceless King). Losing your Queen for a single pawn would be a disaster!

🛡️ **When to Bring Her Out**
Don't rush the Queen into battle on move 2! Beginners often attack with her too early and watch her get chased around the board. Develop your **Knights and Bishops first**, then unleash the Queen.

🐉 **Bonus:** In our game, capturing the enemy Queen earns you the legendary **Dragon Slayer** 🐉 badge!

🧠 **Did you know?** The Queen was once the weakest piece on the board — she could only move ONE square diagonally! Around the year 1475, the rules changed to give her her modern superpowers. People called the new game "Queen's Chess."`,
    quest: {
      id: 'queen',
      mode: 'move_piece',
      fen: 'k7/3p4/8/8/3Q4/8/6p1/7K w - - 0 1',
      instruction: 'The Warrior Queen is ready! Capture the pawn on D8 first, then on G7!',
      targets: ['d8', 'g7'],
    },
  },
  {
    id: 'rook',
    icon: '♖',
    title: 'The Rook',
    subtitle: 'The castle on wheels!',
    color: '#2dd4bf',
    content: `The **Rook** (♖) is your mighty castle tower on wheels — straight, strong, simple.

🏰 **How the Rook Moves**
Rooks slide in **straight lines** — up, down, left, or right — as far as the path is clear. **No diagonals!** They're like trains on a railroad.

💰 **Point Value: 5**
A Rook is worth **5 points** — more than a Bishop or Knight (3) but less than the Queen (9). Two Rooks together (10 points!) are slightly stronger than a Queen.

👯 **The Rook Buddy System**
Two Rooks on the same rank or file are called **"connected Rooks"** or a **"Rook battery"** — together they can blast through any defense. Always try to connect them in the middlegame!

📏 **Open Files = Rook Highways**
A file with no pawns on it is called an **"open file"** — and it's like a free highway for your Rook to zoom down. Place your Rook there to dominate the board.

🏰 **Castling**
The Rook has a famous teamwork move with the King called **castling** — a dedicated lesson is coming!

🧠 **Did you know?** "Rook" comes from the Persian word *rukh*, meaning chariot! It used to be drawn as a war chariot, not a castle.`,
    quest: {
      id: 'rook',
      mode: 'move_piece',
      fen: '4k2p/p7/8/8/8/8/8/R6K w - - 0 1',
      instruction: 'A castle on wheels! Capture the pawn on A8 first, then turn right and capture H8!',
      targets: ['a8', 'h8'],
    },
  },
  {
    id: 'bishop',
    icon: '♗',
    title: 'The Bishop',
    subtitle: 'The diagonal master!',
    color: '#f87171',
    content: `The **Bishop** (♗) is the elegant priest of your army — gliding silently across the diagonals.

✝️ **How the Bishop Moves**
The Bishop slides **only on diagonals**, as far as the path is clear:
- ↖️ Up-left
- ↗️ Up-right
- ↙️ Down-left
- ↘️ Down-right

No straight lines, no jumping — just smooth diagonal swooshes.

🎨 **One Color Forever**
Here's the wild part: each Bishop is **stuck on one color of squares its whole life**. Your **light-square Bishop** can never touch a dark square, and vice versa. They're color-loyal forever!

You start with:
- 🟨 One **light-square Bishop**
- 🟫 One **dark-square Bishop**

Together they cover the whole board — keep BOTH alive if you can!

💰 **Point Value: 3**
The Bishop is worth **3 points** — same as the Knight. In open positions with lots of empty squares, Bishops shine brighter than Knights. The **"Bishop pair"** (both bishops working together) is a huge advantage.

🎯 **Tip:** Don't trade your strong Bishop for the enemy's Knight unless you have a great reason!

🧠 **Did you know?** In old French, the Bishop was called *fou* — "the jester"! In Russian chess, it's called *слон* (slon) — "the elephant!"`,
    quest: {
      id: 'bishop',
      mode: 'move_piece',
      fen: 'k7/2p5/8/8/5p2/8/8/2B4K w - - 0 1',
      instruction: 'Glide on the dark squares! Capture both goblin pawns: first F4, then C7!',
      targets: ['f4', 'c7'],
    },
  },
  {
    id: 'knight',
    icon: '♘',
    title: 'The Knight',
    subtitle: 'The tricky jumper!',
    color: '#4ade80',
    content: `Meet the **Knight** (♘) — the most magical and confusing piece in chess!

🐎 **The L-Shape Jump**
The Knight is the **only** piece that can jump over others (friend or foe). It moves in an **"L" shape**:
- **2 squares** one direction (up/down/left/right)
- then **1 square** at a 90° angle

That gives a Knight up to **8 possible destinations** from the middle of the board!

🌈 **Color-Switching Trick**
Every Knight move lands on the **opposite color** square. If you start on dark, you land on light. Always. It's like the Knight is allergic to staying the same color!

🏔️ **The Jumping Power**
Knights are unstoppable in crowded positions. While Rooks and Bishops get stuck behind their own pawns in the opening, Knights happily **leap right over** them. That's why we usually develop Knights *first*!

💰 **Point Value: 3**
Worth **3 points** — same as a Bishop. Knights are **kings of closed positions** (lots of pawns) while Bishops rule open ones.

📐 **Knight Tip: Stay in the Center!**
A Knight on the edge of the board only reaches 4 squares. In the center, it reaches 8! There's a saying: **"A Knight on the rim is dim!"**

🧠 **Did you know?** The Knight is the only piece whose move pattern hasn't changed in 1500+ years. Even ancient Indian chess (chaturanga) had the same L-jump!`,
    quest: {
      id: 'knight',
      mode: 'move_piece',
      fen: 'k7/8/8/8/8/8/8/6NK w - - 0 1',
      instruction: 'The tricky Knight jumps over boundaries! Hop to F3, then jump to target E5!',
      targets: ['f3', 'e5'],
    },
  },
  {
    id: 'pawn',
    icon: '♙',
    title: 'The Pawn',
    subtitle: 'Little heroes with big dreams!',
    color: '#94a3b8',
    content: `The **Pawn** (♙) looks small, but every Grandmaster says: *"Pawns are the soul of chess!"*

⚡ **Forward March**
- Pawns move **one square forward** at a time
- On their **very first move only**, they can leap **two squares** forward
- Pawns **never go backwards** — once they march, they don't retreat!

⚔️ **Diagonal Captures**
Here's the twist: Pawns **capture diagonally**, one square ahead. They march straight but bite sideways! This is the #1 thing that confuses beginners. Remember:
- **Move = straight ahead**
- **Attack = diagonally ahead**

✨ **The Promotion Miracle**
If a Pawn fights all the way to the enemy's back rank (rank 8 for White, rank 1 for Black), it gets **promoted**! You can turn it into:
- ♛ A Queen (almost always the best choice!)
- ♜ A Rook
- ♝ A Bishop
- ♞ A Knight (occasionally useful for tricky checks!)

You can even have **multiple Queens** at the same time. Imagine TWO Queens on the board — unstoppable!

⚡ **En Passant** ("In Passing")
A legendary, weird rule: if an enemy Pawn uses its 2-square dash to slip past your Pawn, you can capture it as if it had only moved 1 square — but only on the **very next move**! It's like grabbing a thief by the cape mid-sprint. Our game handles this automatically when it's possible.

💰 **Point Value: 1**
Each Pawn is worth just **1 point** — but a connected chain of Pawns is a fortress, and a promoted Pawn becomes a Queen!

🏆 In our game, promoting a Pawn earns the **Royal Ascension** ✨ badge!

🧠 **Did you know?** A famous chess teacher named Philidor said over 250 years ago: "Pawns are the soul of chess." He meant: good Pawn play decides most games — not the fancy pieces!`,
    quest: {
      id: 'pawn',
      mode: 'move_piece',
      fen: 'k7/2p5/3P4/8/8/8/8/7K w - - 0 1',
      instruction: 'Capture the goblin pawn on C7, then advance to C8 to promote to a Queen!',
      targets: ['c7', 'c8'],
    },
  },
  {
    id: 'values',
    icon: '💰',
    title: 'Piece Values & Trading',
    subtitle: 'Know what each piece is worth!',
    color: '#fbbf24',
    content: `Now that you've met the whole army, let's learn the **secret economy** of chess!

💰 **The Point Chart**
| Piece | Symbol | Value |
|---|---|---|
| Pawn | ♙ | 1 |
| Knight | ♘ | 3 |
| Bishop | ♗ | 3 |
| Rook | ♖ | 5 |
| Queen | ♕ | 9 |
| King | ♔ | ∞ (priceless!) |

🔄 **Trading Pieces**
When you capture a piece and the enemy captures one of yours back, that's a **trade**. The rule of thumb:
- ✅ Trade **down** (give 3, get 5) — you WIN material
- ❌ Trade **up** (give 9, get 3) — you LOSE material
- 🤝 Trade **equal** (give 3, get 3) — fair swap

🎯 **The Magic Word: "Hanging"**
A piece is **hanging** when it can be captured for free — no defenders! In our game, the **red crosshair** 🎯 appears on your hanging pieces. **Always scan for hanging pieces** before you move!

🛡️ **The Defender Rule**
A piece is *safe to capture* only if attackers ≥ defenders. If your Knight (3) attacks an enemy Pawn (1) defended by a Queen (9), capturing it loses you 3-1 = 2 points!

🏆 **Hot Tip from Merlin:**
- Two Bishops + two Knights = 12 points
- A Queen alone = 9 points
The "minor pieces" are stronger than people think!

🧠 **Did you know?** Grandmasters sometimes sacrifice a Queen (9 points!) on purpose for a brilliant checkmate. Material isn't everything — winning the King is!`,
    quest: {
      id: 'values',
      mode: 'move_piece',
      fen: '7k/8/8/3p4/8/8/3R4/7K w - - 0 1',
      instruction: 'Your Rook (5 pts) attacks a free Pawn (1 pt). Capture it on D5 — free material!',
      targets: ['d5'],
    },
  },
  {
    id: 'castling',
    icon: '🏰',
    title: 'Castling — The King\'s Escape',
    subtitle: 'Hide the King in a magic fortress!',
    color: '#2dd4bf',
    content: `**Castling** is the ONLY move where two pieces move at once — your King and one of your Rooks team up to keep the King safe.

🏰 **How It Works**
- The **King** slides **two squares** toward a Rook
- That **Rook** jumps to the square right next to the King on the other side
- Done in one move!

There are two flavors:
- 🟢 **Kingside castle (short castle)** — King goes to G1, Rook to F1 (faster, more common)
- 🔵 **Queenside castle (long castle)** — King goes to C1, Rook to D1 (the Rook travels farther)

✅ **You CAN castle if ALL of these are true:**
1. The King has **never moved** before
2. The chosen Rook has **never moved** before
3. **No pieces** are between them
4. The King is **not currently in check**
5. The King doesn't **pass through** or **end on** a square attacked by an enemy

❌ **You CANNOT castle if even ONE rule above is broken!**

🎯 **Why Castle?**
- Tucks your King safely in a corner behind pawns
- Connects your Rooks (they can now defend each other)
- Brings a Rook out of its corner into the action

⏰ **When to Castle**
Usually within the first **6–10 moves**! Don't delay — a King stuck in the center is a sitting duck.

🏆 In our game, your first castle earns the **Castle Builder** 🏰 badge!

🧠 **Did you know?** Castling was invented around the year 1500. Before then, the King had a different special leap that wasn't as cool!`,
    quest: {
      id: 'castling',
      mode: 'move_piece',
      fen: '4k3/8/8/8/8/8/8/4K2R w K - 0 1',
      instruction: 'Time to castle kingside! Click your King on E1 and slide him to G1 — the Rook will follow magically!',
      targets: ['g1'],
    },
  },
  {
    id: 'fork',
    icon: '🍴',
    title: 'The Fork — Two for One!',
    subtitle: 'Attack two pieces at the same time!',
    color: '#f87171',
    content: `Time to learn **tactics** — the sneaky tricks that win games!

🍴 **What is a Fork?**
A **fork** is when ONE of your pieces attacks **TWO (or more!) enemy pieces at the same time**. The opponent can only save one — you grab the other for free!

🏇 **The Knight Fork — King's Favorite**
Knights are the **kings of forking** because they attack 8 squares at once in their L-shape and can jump over anything.

The deadliest fork: a Knight that attacks both the enemy **King AND Queen** at the same time! That's called a **"Royal Fork"** — and it usually wins the game!

♛ **Queen Forks**
The Queen can fork too, often catching two undefended pieces on a long diagonal or rank.

♗ **Bishop Forks**
Bishops can fork two pieces on the same color diagonal.

♖ **Rook Forks**
Rooks fork pieces on the same rank or file.

♙ **Even Pawn Forks!**
When a Pawn advances, it can attack TWO pieces with its diagonal capture squares. Tiny but mighty!

🎯 **How to Spot Forks**
1. Find undefended enemy pieces
2. Find squares that attack two of them at once
3. Make sure YOUR piece is safe there!

🧠 **Did you know?** Grandmasters often "sacrifice" a piece to set up a fork two moves later. Tactics are like little chess magic tricks!`,
    quest: {
      id: 'fork',
      mode: 'move_piece',
      fen: '4k3/8/3r4/8/4N3/8/8/4K3 w - - 0 1',
      instruction: 'Royal Fork incoming! Hop your Knight from E4 to C5 — attacking the King AND the Rook at once!',
      targets: ['c5'],
    },
  },
  {
    id: 'pin',
    icon: '📌',
    title: 'The Pin — Freeze the Enemy!',
    subtitle: 'Lock a piece in place forever!',
    color: '#a78bfa',
    content: `A **pin** is one of the prettiest tactics in chess — you freeze an enemy piece so it can't move.

📌 **How a Pin Works**
When you attack an enemy piece, but moving that piece would **expose a more valuable piece behind it**, the enemy is *pinned*. They have to leave it there… helpless!

🔪 **Only Sliding Pieces Pin**
Three pieces can create pins because they move in straight lines:
- ♗ **Bishops** (diagonal pins)
- ♖ **Rooks** (straight pins)
- ♕ **Queens** (both kinds!)

Knights can't pin — they jump, they don't shoot beams!

🔥 **Two Types of Pins**
1. **Absolute Pin** — the piece behind is the **King**. The pinned piece **literally cannot legally move**!
2. **Relative Pin** — the piece behind is just valuable (Queen, Rook). The opponent *could* move the pinned piece, but it'd be a disaster.

🎯 **What to Do After You Pin**
- **Pile up** on the pinned piece — attack it with another piece. The enemy can't move it!
- The pinned piece is basically a sitting duck

🛡️ **How to Avoid Being Pinned**
Don't line up your King and Queen on the same file, rank, or diagonal with no piece between — it's begging for a pin!

🧠 **Did you know?** The opposite of a pin is a **skewer** — same idea but the *more* valuable piece is in front. The enemy has to move it, exposing the cheap one behind!`,
    quest: {
      id: 'pin',
      mode: 'move_piece',
      fen: '4k3/8/3n4/8/8/8/8/B3K3 w - - 0 1',
      instruction: 'Pin the Knight against the King! Slide your Bishop from A1 to E5 — the Knight will be frozen!',
      targets: ['e5'],
    },
  },
  {
    id: 'opening',
    icon: '📍',
    title: 'Opening Principles',
    subtitle: 'How to start every game like a pro!',
    color: '#4ade80',
    content: `The first **10 moves** of any chess game are called the **opening**. Get this right and you'll have a strong position for the whole game!

✨ **The 4 Golden Rules of the Opening**

**1️⃣ Control the Center**
The four squares D4, D5, E4, E5 are the **center of the board**. Whoever controls them controls the game! Push a center pawn (1.e4 or 1.d4) on your very first move.

**2️⃣ Develop Your Knights and Bishops**
Get your Knights out **before** your Bishops, and BOTH before your Queen. Don't move the same piece twice in the opening unless you have to!

A great early move order:
- 1. e4 (center pawn)
- 2. Knight to f3
- 3. Bishop to c4 or b5
- 4. Castle!

**3️⃣ Castle Early**
Get your King to safety within the first 6–10 moves. A castled King is much harder to attack!

**4️⃣ Don't Bring Out the Queen Too Early**
It's tempting to attack with the Queen on move 2, but she'll get chased around by the enemy's Knights and Bishops — wasting your time while *they* develop!

❌ **Common Opening Mistakes (Don't Do These!)**
- Moving only Pawns and forgetting about pieces
- Moving the same Knight 3 times before anything else moves
- Bringing the Queen out on move 2 ("Scholar's Mate Trap" trolls only — a good player will punish you!)
- Forgetting to castle
- Pushing edge pawns (a3, h3) when there's no plan

✅ **Easy Opening Plan to Memorize**
1. **e4** — grab center
2. **Nf3** — Knight out
3. **Bc4** — Bishop out
4. **Castle** — King safe
5. **Nc3** — other Knight out
6. **d3** — support center

Now you're ready to attack!

🧠 **Did you know?** Magnus Carlsen — the World Champion — says even HE follows the opening principles when he's not sure what to play!`,
    quest: {
      id: 'opening',
      mode: 'move_piece',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'The classic start! Push your King\'s pawn from E2 to E4 — claim the center!',
      targets: ['e4'],
    },
  },
  {
    id: 'check',
    icon: '⚠️',
    title: 'Check & Checkmate',
    subtitle: 'The grand finale — how to WIN!',
    color: '#f87171',
    content: `You've mastered the army, the values, castling, and tactics. Now: how to actually **win the game**!

⚠️ **Check — The King is in Danger!**
When you attack the enemy King, that's **check**. The opponent **must** respond on their very next move — they can't ignore it!

There are exactly **3 ways** to escape check:
1. 🏃 **Run** — move the King to a safe square
2. 🛡️ **Block** — put one of your pieces in the way
3. ⚔️ **Capture** — take the attacking piece

If at least ONE of these is possible, the game continues.

🏆 **Checkmate — Game Over!**
If the King is in check AND **none of the 3 escapes work**, that's **CHECKMATE**. The King is captured (in theory) and the game ends — YOU WIN!

🤝 **Stalemate — The Sneaky Draw**
⚠️ WATCH OUT: if the enemy King is **NOT in check**, but they have **zero legal moves** anywhere, that's **stalemate** — a **DRAW**! Even if you have way more pieces, the game ends in a tie!

Lesson: don't be careless when you're winning. Always leave the enemy King at least one legal move (unless you're delivering checkmate)!

🎁 **Other Ways the Game Can End**
- **Resignation** — one player gives up
- **Threefold repetition** — same position appears 3 times
- **50-move rule** — 50 moves with no captures or pawn moves
- **Insufficient material** — too few pieces left to checkmate

✨ **Basic Checkmate Patterns to Learn**
- **Back-rank mate** — Rook or Queen on the 8th rank when enemy King is trapped by its own pawns
- **Queen + King mate** — the classic finishing move with just two pieces
- **Two Rooks mate** — "the ladder" — force the King to the edge!

🏆 Winning a full game earns you the legendary **Grand Master** 🏆 badge — the highest honor!

🧠 **Did you know?** The word "checkmate" comes from the Persian *shah mat* — "the king is helpless!"`,
    quest: {
      id: 'check',
      mode: 'move_piece',
      fen: '7k/5Q2/8/8/3B4/8/8/6K1 w - - 0 1',
      instruction: 'Deliver the final blow! Move your Queen to G7 to deliver checkmate!',
      targets: ['g7'],
    },
  },
];

export default function TutorialPage() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  const lesson = LESSONS[currentLesson];

  const handleQuestSuccess = () => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson);
    setCompletedLessons(newCompleted);
  };

  const goNext = () => {
    if (currentLesson < LESSONS.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const goPrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const allDone = completedLessons.size === LESSONS.length;

  // Parse **bold** markdown
  const renderContent = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: '#fbbf24' }}>{part}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/">
          <button className={`btn btn-ghost ${styles.backBtn}`}>← Home</button>
        </Link>
        <h1 className={styles.title}>🎓 Chess Tutorial</h1>
        <div className={styles.progressText}>
          {completedLessons.size}/{LESSONS.length} done
        </div>
      </header>

      <main className={styles.main}>
        {/* Lesson sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>📚 Lessons</h2>
          <div className={styles.lessonList}>
            {LESSONS.map((l, i) => (
              <button
                key={l.id}
                id={`lesson-${l.id}`}
                className={[
                  styles.lessonBtn,
                  i === currentLesson ? styles.lessonBtnActive : '',
                  completedLessons.has(i) ? styles.lessonBtnDone : '',
                ].join(' ')}
                onClick={() => { setCurrentLesson(i); }}
              >
                <span className={styles.lessonBtnIcon}>{l.icon}</span>
                <span className={styles.lessonBtnLabel}>{l.title}</span>
                {completedLessons.has(i) && <span className={styles.doneCheck}>✓</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Lesson content */}
        <div className={styles.content}>
          <div
            className={styles.lessonCard}
            style={{ '--lesson-color': lesson.color } as React.CSSProperties}
          >
            {/* Lesson header */}
            <div className={styles.lessonHeader}>
              <span className={styles.lessonIcon}>{lesson.icon}</span>
              <div>
                <h2 className={styles.lessonTitle}>{lesson.title}</h2>
                <p className={styles.lessonSubtitle}>{lesson.subtitle}</p>
              </div>
            </div>

            {/* Lesson text */}
            <div className={styles.lessonBody}>
              {lesson.content.split('\n\n').map((para, i) => (
                <p key={i} className={styles.lessonPara}>
                  {renderContent(para)}
                </p>
              ))}
            </div>

            {/* Interactive Chess Board Mini-Quest */}
            <div className={styles.quiz}>
              <h3 className={styles.quizTitle}>🧠 Interactive Challenge</h3>
              <TutorialBoard
                key={lesson.id}
                quest={lesson.quest}
                onSuccess={handleQuestSuccess}
              />
            </div>

            {/* Navigation */}
            <div className={styles.navigation}>
              <button
                id="lesson-prev"
                className="btn btn-ghost"
                onClick={goPrev}
                disabled={currentLesson === 0}
              >
                ← Previous
              </button>
              <span className={styles.navProgress}>
                {currentLesson + 1} / {LESSONS.length}
              </span>
              {currentLesson < LESSONS.length - 1 ? (
                <button
                  id="lesson-next"
                  className="btn btn-primary"
                  onClick={goNext}
                >
                  Next →
                </button>
              ) : (
                <Link href="/game">
                  <button id="btn-start-game" className="btn btn-gold">
                    ⚔️ Play Now!
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* All done banner */}
          {allDone && (
            <div className={styles.allDoneBanner}>
              <span className={styles.allDoneEmoji}>🏆</span>
              <div>
                <h3 className={styles.allDoneTitle}>You&apos;ve completed all lessons!</h3>
                <p className={styles.allDoneDesc}>You&apos;re ready for battle. Go challenge the Wizard AI!</p>
              </div>
              <Link href="/game">
                <button id="btn-done-play" className="btn btn-gold">⚔️ Play!</button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
