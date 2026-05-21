/**
 * Wizard "personality" voice lines — many flavours per emotional context.
 * Replaces the static, repeating strings with a randomized pool so Merlin feels alive.
 *
 * Call `pickWizardLine(category)` from gameStore wherever you'd previously hard-code a message.
 */

const POOLS: Record<string, string[]> = {
  // ── Capture / combat ────────────────────────────────────────────
  first_capture: [
    '⚔️ First blood! You captured your first piece!',
    '⚔️ Hark! A brave squire draws first blood!',
    '⚔️ By my beard — your sword finds its mark!',
    '⚔️ The enemy ranks tremble — you have struck first!',
    '⚔️ Hammer fall, iron clang — your first conquest!',
    '⚔️ A taste of victory! Press the attack, young Apprentice!',
  ],

  queen_capture: [
    '🐉 You slew the Dragon Queen! LEGENDARY move!',
    '🐉 By the stars! The mighty Queen has fallen to your blade!',
    '🐉 Magnificent! You toppled the most powerful piece on the board!',
    '🐉 The enemy court weeps — their Queen is yours!',
    '🐉 A queen-slaying maneuver worthy of legend, young Apprentice!',
    '🐉 Even the elder wizards bow to this! You captured a QUEEN!',
  ],

  first_castle: [
    '🏰 Brilliant! Your castle walls grow stronger!',
    '🏰 The King is safe! Castling is the mark of a wise general.',
    '🏰 Stone upon stone — your fortress rises!',
    '🏰 A castled King is a happy King. Excellent strategy!',
    '🏰 The Rook and King clasp arms — your kingdom is fortified!',
    '🏰 By the bricks of Camelot! A textbook castle!',
  ],

  first_check: [
    '👑 The enemy King trembles before you!',
    '👑 CHECK! The opposing monarch must answer your threat!',
    '👑 Your blade kisses the royal cheek — check!',
    '👑 The whole board hears your war-cry! Check!',
    '👑 Forced to dance — the enemy King has no choice but to move!',
    '👑 Strike at the head and the body falls! Check!',
  ],

  pawn_promote: [
    '✨ Your brave pawn ascends to royalty!',
    '✨ The lowliest soldier becomes a Queen! Such is the magic of chess!',
    '✨ A pawn no more — a hero crowned!',
    '✨ By trial and march, your foot-soldier earned the crown!',
    '✨ The eighth rank is reached — a new piece is born!',
    '✨ All hail the new Queen! What a triumphant march!',
  ],

  first_checkmate: [
    '🏆 CHECKMATE! You are a true Grand Master!',
    '🏆 The enemy King has no escape — victory is yours!',
    '🏆 Game, set, and CHECKMATE! Legendary play!',
    '🏆 The realm is saved! You have delivered checkmate!',
    '🏆 By the laws of the board, the kingdom is yours!',
    '🏆 Merlin himself salutes you — a perfect mate!',
  ],

  draw: [
    '🤝 A valiant draw! Both armies fought with honour.',
    '🤝 Stalemate of equals — a fine, hard-fought peace.',
    '🤝 No victor today, but no shame either. A wise draw.',
    '🤝 The two armies sheathe their swords. A noble result.',
  ],

  game_lose: [
    '😔 The Wizard wins this time. Even Grandmasters lose battles to win wars!',
    '😔 Defeat is a teacher, young Apprentice. What did this game teach you?',
    '😔 Every mighty knight has known the bitter cup. Rise — and play again!',
    '😔 The enemy was crafty this round. Sharpen your blade — REVENGE awaits!',
    '😔 No shame in this loss. Even Merlin had teachers!',
  ],

  // ── Warnings ────────────────────────────────────────────────────
  check_warning: [
    '⚠️ Watch out! Your King is in check! Defend quickly!',
    '⚠️ The royal head is in danger — answer the check NOW!',
    '⚠️ Hark! A blade hovers over your King — react!',
    '⚠️ Your King must move, block, or capture. CHECK!',
    '⚠️ Beware! The enemy strikes at your monarch — defend!',
  ],

  // ── Misc / Idle (sprinkle whenever a soft hint helps) ──────────
  idle_hint: [
    '🤔 Castle early — a safe King is a happy King!',
    '🤔 Knights leap before bishops slide. Develop in order!',
    '🤔 Control the centre with pawns, then bring knights and bishops!',
    '🤔 Never bring your Queen out too early — she\'ll be chased everywhere!',
    '🤔 Look for "hanging" pieces — undefended enemies are free lunches!',
    '🤔 Every move should do TWO things — attack AND defend, if possible!',
    '🤔 Trading queens often favours the side that\'s ahead in material.',
    '🤔 A passed pawn must be PUSHED! Once it crosses, promote it!',
    '🤔 Doubled pawns on a file are weak — try to avoid them!',
    '🤔 If you see a good move, look for a BETTER one. Always check twice!',
  ],

  endgame_intro: [
    '🛡️ Endgame Trainer! Mastery is built in the simplest positions.',
    '🛡️ The endgame is the chessboard\'s purest test — show me your technique!',
    '🛡️ When few pieces remain, every move shouts. Make each one count!',
  ],
};

/**
 * Pick a random voice line from a category.
 * Returns an empty string if the category is unknown — caller may fall back.
 */
export function pickWizardLine(category: keyof typeof POOLS | string): string {
  const pool = POOLS[category];
  if (!pool || pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}

/** For tests / debug — exposed for inspecting all available categories. */
export function getCategories(): string[] {
  return Object.keys(POOLS);
}
