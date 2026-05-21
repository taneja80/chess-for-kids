# 🌐 Page 3 — Multiplayer: Duel a Friend Online

Want to challenge a friend, a sibling, or a classmate? **Chess for Kids** has built‑in real‑time multiplayer. You don't need to install anything, sign up, or share emails — just a **6‑letter room code**.

---

## 🚪 Find the Multiplayer Menu

1. Open the app at <https://chess-for-kids-one.vercel.app>
2. Click **⚔️ Play Now!** to enter the **Battle Arena**
3. In the right sidebar, scroll to the **🌐 Play with a Friend** panel

You'll see two options: **Create New Room** or **Join with a Code**.

---

## 🪄 Option A: Create a Room (you're the host)

1. Click **🪄 Create New Room**
2. The app instantly generates a 6‑letter **Room Code** (e.g. `KZQ4MX`) and shows it in big letters
3. **Share that code** with your friend — text, WhatsApp, paper, shouting across the room — whatever works
4. Wait for them to join. As soon as they do, the board comes alive and **you play as White**
5. Make your first move — your friend will see it in real time

> **Note:** The host is always White and moves first. The guest is Black.

---

## 🔑 Option B: Join a Room (your friend hosts)

1. Ask your friend for their 6‑letter room code
2. Type it into the **Enter Room Code** box (it's auto‑uppercased — case doesn't matter)
3. Click **Join**
4. You're in! You'll play as **Black** and move second after White's first move

---

## ♟ Playing the Game

Once both players have joined:

- The board behaves exactly like a single‑player game
- **You can only move on your turn** — the app locks the board when it's not your color
- Moves sync **instantly** between both browsers (powered by Firebase Realtime DB)
- The **Wizard Coach** narrates for both players
- **Captured pieces, check warnings, and checkmate** all work the same way

### Features available in multiplayer
| Feature | Works in multiplayer? |
|---|---|
| Wizard Coach commentary | ✅ Yes |
| Territory Map | ✅ Yes (each player sees their own perspective) |
| Golden Shields / Red Crosshairs | ✅ Yes |
| Takeback ↩️ | ❌ No (fair‑play — moves are final) |
| Time Spells ⏳ | ❌ No (those are for AI games only) |
| Change difficulty | ❌ N/A (no AI involved) |

---

## 🚪 Leaving a Game

Either player can click **Leave Game** in the multiplayer panel to exit. The room is closed, and you can start a new one or switch to single‑player.

If your friend disconnects (closes their tab, loses internet, etc.), you'll see a notification and can leave the room to start fresh.

---

## 💡 Tips for a Great Multiplayer Match

1. **Agree on a difficulty mindset** — pair up players of similar skill, or let the stronger one play with fewer pieces (a "handicap")
2. **Keep the room code private** — anyone with the code can join your room, so don't post it publicly
3. **Use voice chat** alongside the game for extra fun — call your friend on the phone while you play
4. **Be a good sport** — even Merlin loses sometimes! Say "good game" at the end
5. **No takebacks in multiplayer** — think before you click. This trains real‑game discipline

---

## 🛠️ For Curious Kids & Parents — How It Works

When you create a room, the app writes a tiny entry to a **Firebase Realtime Database**:
```
rooms/
  KZQ4MX/
    host: <anonymous-id-1>
    guest: <anonymous-id-2>
    moves: ["e2e4", "e7e5", "g1f3", ...]
    status: "active"
```

Both browsers **listen** to that entry. When one player makes a move, the move string (like `g1f3`) is pushed to the `moves` array. The other browser instantly sees the update and animates the piece. No personal info is stored — just anonymous IDs and the move list.

Rooms are automatically cleaned up when both players leave.

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| "Room not found" when joining | Double‑check the code (no zeros vs O's). Ask your friend to re‑create the room. |
| Board doesn't update after my friend moves | Check your internet connection. Refresh the page — your spot is held by the room code. |
| Can't create a room at all | The app may be running without Firebase credentials. Multiplayer only works on the deployed site, not on `localhost` unless you've set up your own Firebase project. |
| My move plays for me but my friend doesn't see it | Network blip — wait a few seconds, or have one of you leave & rejoin. |

---

## ➡️ Next Page

You can now play solo OR with a friend. Time to talk about **rewards** — the gold, badges, knight avatars, and the legendary Hall of Fame.

**[Continue to Page 4 — Quests, Badges & the Armoury →](04-quests-and-rewards.md)**
