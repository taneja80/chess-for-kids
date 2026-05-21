# 🏰 Chess for Kids — Developer & Player Academy Guide 🧙‍♂️

Welcome to **Chess for Kids**, a gamified, medieval-themed chess application designed specifically to teach tactical foresight, spatial awareness, and strategic planning to kids aged 10-12! 

This guide serves as a complete **one-page tutorial** covering how to install and run the application as a developer, alongside an interactive player handbook on how to play the game and leverage its magical features.

---

## 🚀 Part 1: How to Run the Application

This application is built with **Next.js (React)** and **TypeScript**, using a lightweight local **Stockfish Chess Engine** for AI play. Follow these simple steps to run the game on your computer:

### 1. Prerequisites
Ensure you have **Node.js** (v18.0.0 or higher recommended) installed on your system. You can check your version by running:
```bash
node -v
```

### 2. Installation
Clone or navigate to the workspace directory on your machine, open your terminal, and install the project dependencies:
```bash
npm install
```

### 3. Run the Development Server
Launch the local development server:
```bash
npm run dev
```
Once started, open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

The page will automatically reload as you make changes to the source files!

### 4. Code Diagnostics & Quality Checks
To ensure the app remains fully robust and bug-free, run the automated linting and type-checking suites:
* **TypeScript compilation check**:
  ```bash
  npx tsc --noEmit
  ```
* **ESLint code style compliance check**:
  ```bash
  npm run lint
  ```

### 5. Production Compilation
To build a highly optimized, production-ready static bundle:
```bash
npm run build
npm start
```

---

## ⚔️ Part 2: How to Play and Learn Chess

**Chess for Kids** transforms traditional chess into a magical medieval quest. Below is a breakdown of the visual dashboard, core rules, and gamified mechanisms that make learning fun!

```
                    [ BATTLE ARENA MAIN BOARD ]
 +-----------------------------------------------------------------+
 | [🧙‍♂️ Wizard Coach]                                               |
 | "Halt! Merlin sees danger in your move..."                       |
 |                                                                 |
 |   +---+---+---+---+---+---+---+---+    [🏰 SIDEBAR CONTROLS]    |
 | 8 |   |   |   |   |   |   |   |   |    +--------------------+   |
 | 7 |   |   |   |   |   |   |   |   |    | 🪙 150 Gold Coins   |   |
 | 6 |   |   | 🛡️ |   | 🎯 |   |   |    +--------------------+   |
 | 5 |   |   |   |   |   |   |   |   |    | ⚔️ AI DIFFICULTY   |   |
 | 4 |   |   |   |   |   |   |   |   |    | [Squire] [Knight]  |   |
 | 3 |   |   |   |   |   |   |   |   |    +--------------------+   |
 | 2 |   |   |   |   |   |   |   |   |    | 🧙‍♂️ SPELLS & VISION  |   |
 | 1 |   |   |   |   |   |   |   |   |    | [🔮 Territory Map] |   |
 |   +---+---+---+---+---+---+---+---+    | ⏳ Spells: ⚡ ⚡ ⚡  |   |
 |     a   b   c   d   e   f   g   h      +--------------------+   |
 +-----------------------------------------------------------------+
```

### 1. The Core Objective
Chess is an ancient battle of two armies: **White** and **Black**. Your goal is to capture the opponent’s **King** in a trap from which they cannot escape—a state called **Checkmate**!

### 2. Magical Spatial Features (The "Vision" Powers)
To teach kids chess geography and spatial relations, players can toggle magical visions on the board using the **Sidebar Controls**:

* **🔮 Territory Map Overlay**
  * **What it does**: Shades the squares of the board in real-time to show who controls them.
  * **Green Squares**: Player-controlled (your pieces command these squares).
  * **Red Squares**: Opponent-controlled (the AI controls these squares).
  * **Yellow Squares**: Highly contested (both armies attack this square equally).
  * **Educational Value**: Helps kids immediately see which areas of the board are safe to land on and which areas are heavily guarded.

* **🛡️ Golden Shield Auras**
  * **What it does**: Any friendly piece that is successfully defended by another friendly piece gets surrounded by a glowing, pulsing golden shield.
  * **Educational Value**: Teaches the importance of teamwork. Undefended pieces are easy targets; defended pieces are safe fortresses.

* **🎯 Red Target Crosshairs**
  * **What it does**: If one of your pieces is attacked by an enemy but has **0 defenders**, a rotating red crosshair target locks onto it.
  * **Educational Value**: Alerts kids instantly to impending loss, teaching them to scan the board for immediate threats before making a move.

---

### 3. Wizard Time Spells ⏳
Impulsive moves (known as *blunders*) are common for beginners. Merlin the Wizard Coach is here to save the day using **Time Spells**!

* **How it works**:
  1. Players start each game vs the AI with **3 Time Spells** (represented by glowing active energy crystals `⚡`).
  2. If the player makes a move that leaves a major piece (Queen, Rook, Bishop, Knight) completely undefended and attacked, or allows a check, Merlin intercepts!
  3. A magic **Temporal Foresight modal** pops up warning of the threat.
  4. If the player clicks **"Cast Time Spell"**:
     - The AI's devastating response is played temporarily so the child **"peeks into the future"** to see what happens.
     - After 2 seconds, the timeline is automatically rewound back to the player's turn. Previous board history is restored, and 1 spell charge is consumed.
     - The child can now choose a better, safer move!
  5. If the player clicks **"No, I am Brave!"**, they decline the spell and face the consequences.

---

### 4. Interactive Quest Map & Armoury 🪙
* **🗺️ The Quest Map**: Swaps out traditional chess play for focused, story-driven chess puzzle challenges. Succeeding unlocks the next quest along the map and pays out **Gold Coins**.
* **🪙 The Armoury Shop**: Spend your earned Gold Coins to buy premium customizable board themes (such as *Neon Magic*, *Obsidian Volcanic*, or *Emerald Forest*) and cool skins for your Wizard Coach (like the *Fire Archmage* or *Void Sorcerer*).

---

## 🧙‍♂️ Merlin’s Top Tips for Young Chess Apprentices

1. **Keep the Shield Active**: Try to move your pieces so they form defensive chains. Watch for the **Golden Shields** on your pieces!
2. **Consult the Territory Map**: Before leaping into enemy territory, toggle the `🔮 Territory Map` on. Avoid landing on red squares unless you have a tactical plan!
3. **Don't Waste Your Spells**: 3 charges are all you get per game. Use them when you make large mistakes, and pay close attention to *why* the move was a blunder during the future peek!
4. **Solve Quests Daily**: Puzzles are the fastest way to train your tactical eyes. Earn coins on the Quest Map to show off your style in the Armoury!

*Have fun, apprentice, and may the magic of the board guide your army to victory! 🏰♟*
