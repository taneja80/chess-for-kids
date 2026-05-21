/**
 * Endgame Drills — small, focused practice positions.
 * Each drill is a setup the player can mate from. The AI plays as the lone king
 * (defender) — at Squire difficulty it'll move semi-randomly, giving kids the
 * satisfying experience of chasing the king into a corner and delivering mate.
 */

export interface EndgameDrill {
  id: string;
  title: string;
  description: string;
  /** Starting FEN — player is whoever has to move (always white in these drills). */
  fen: string;
  /** Maximum moves to consider it a "perfect" win for extra coins. */
  parMoves: number;
  /** Base reward in gold. */
  reward: number;
  /** Star icon for visual flair. */
  icon: string;
  /** Recommended difficulty. Defender king plays at Squire (semi-random). */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const ENDGAME_DRILLS: EndgameDrill[] = [
  {
    id: 'kq-vs-k',
    title: 'Queen Endgame',
    description: 'You have a Queen and King against a lone King. Force checkmate by trapping the enemy King in a corner!',
    // White Queen on d1, White King on e1, Black King on e5
    fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1',
    parMoves: 10,
    reward: 80,
    icon: '👑',
    difficulty: 'beginner',
  },
  {
    id: 'kr-vs-k',
    title: 'Rook Endgame',
    description: 'A King and Rook can win against a lone King. Box the enemy King in and deliver checkmate!',
    // White Rook on a1, White King on e1, Black King on e5
    fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1',
    parMoves: 16,
    reward: 100,
    icon: '🏰',
    difficulty: 'intermediate',
  },
  {
    id: 'k-two-rooks',
    title: 'Two Rooks Mate',
    description: 'With two Rooks you can mate without your King\'s help — the "ladder mate" technique.',
    // White Rooks on a1 and h1, White King on e1, Black King on e5
    fen: '8/8/8/4k3/8/8/8/R3K2R w - - 0 1',
    parMoves: 8,
    reward: 60,
    icon: '🪜',
    difficulty: 'beginner',
  },
  {
    id: 'kp-vs-k',
    title: 'Pawn Promotion',
    description: 'Push your pawn safely to the back rank and promote to a Queen. Then deliver checkmate!',
    // White Pawn on e2, White King on e1, Black King on e8
    fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
    parMoves: 18,
    reward: 120,
    icon: '♟️',
    difficulty: 'advanced',
  },
];
