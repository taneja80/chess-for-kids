import { Chess, Move, Square } from 'chess.js';

/**
 * Lightweight tactical-motif detector.
 * After a player's move, identify whether it created a fork, pin, skewer,
 * discovered attack, double-attack, or simple capture-threat — and return
 * a kid-friendly explanation we can put in the wizard's mouth.
 */

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const PIECE_NAMES: Record<string, string> = {
  k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn',
};

export interface Motif {
  type: 'fork' | 'pin' | 'skewer' | 'discovered' | 'double_attack' | 'hanging_piece';
  icon: string;
  title: string;
  explanation: string;
}

interface AttackerInfo {
  from: Square;
  piece: string;
}

/** Build a map of which enemy squares each of our pieces currently attacks. */
function attackedEnemies(chess: Chess, attackerColor: 'w' | 'b'): Map<Square, AttackerInfo[]> {
  const map = new Map<Square, AttackerInfo[]>();
  // chess.js doesn't expose attack arrays directly, so we walk legal moves.
  // We force the side-to-move temporarily by reloading FEN if needed.
  const fen = chess.fen();
  const parts = fen.split(' ');
  if (parts[1] !== attackerColor) {
    parts[1] = attackerColor;
    parts[3] = '-'; // clear en-passant to keep FEN valid
    try {
      chess = new Chess(parts.join(' '));
    } catch {
      return map;
    }
  }
  const moves = chess.moves({ verbose: true }) as Move[];
  for (const m of moves) {
    if (m.captured) {
      const list = map.get(m.to as Square) ?? [];
      list.push({ from: m.from as Square, piece: m.piece });
      map.set(m.to as Square, list);
    }
  }
  return map;
}

/**
 * Inspect every square along a sliding direction from `from` (exclusive) toward
 * the edge of the board, returning the first piece encountered. Used for pin/skewer detection.
 */
function rayCast(chess: Chess, from: Square, dFile: number, dRank: number): { square: Square; piece: { type: string; color: 'w' | 'b' } } | null {
  let file = from.charCodeAt(0) - 97;
  let rank = parseInt(from[1], 10) - 1;
  for (let step = 0; step < 7; step++) {
    file += dFile;
    rank += dRank;
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    const sq = (String.fromCharCode(97 + file) + (rank + 1)) as Square;
    const p = chess.get(sq);
    if (p) return { square: sq, piece: p };
  }
  return null;
}

/** Direction vectors for each sliding piece. */
const SLIDING_DIRS: Record<string, [number, number][]> = {
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  q: [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]],
};

/** Find pin/skewer for a sliding piece that just moved to `square`. */
function detectPinOrSkewer(
  chess: Chess,
  square: Square,
  pieceType: string,
  attackerColor: 'w' | 'b'
): { kind: 'pin' | 'skewer'; front: { sq: Square; piece: string }; back: { sq: Square; piece: string } } | null {
  const dirs = SLIDING_DIRS[pieceType];
  if (!dirs) return null;
  const enemy = attackerColor === 'w' ? 'b' : 'w';
  for (const [df, dr] of dirs) {
    const first = rayCast(chess, square, df, dr);
    if (!first || first.piece.color !== enemy) continue;
    const second = rayCast(chess, first.square, df, dr);
    if (!second || second.piece.color !== enemy) continue;
    const fv = PIECE_VALUES[first.piece.type] ?? 0;
    const bv = PIECE_VALUES[second.piece.type] ?? 0;
    if (bv > fv) {
      return {
        kind: 'pin',
        front: { sq: first.square, piece: first.piece.type },
        back: { sq: second.square, piece: second.piece.type },
      };
    }
    if (fv > bv && fv >= 5) {
      // Front piece is more valuable — moving it exposes weaker piece. Classic skewer.
      return {
        kind: 'skewer',
        front: { sq: first.square, piece: first.piece.type },
        back: { sq: second.square, piece: second.piece.type },
      };
    }
  }
  return null;
}

/** Number of valuable enemy pieces the moved piece now attacks directly. */
function attackedByMover(chess: Chess, square: Square, attackerColor: 'w' | 'b'): { sq: Square; piece: string; value: number }[] {
  const enemies = attackedEnemies(chess, attackerColor);
  const out: { sq: Square; piece: string; value: number }[] = [];
  for (const [sq, attackers] of enemies.entries()) {
    if (attackers.some(a => a.from === square)) {
      const tgt = chess.get(sq);
      if (tgt) {
        out.push({ sq, piece: tgt.type, value: PIECE_VALUES[tgt.type] ?? 0 });
      }
    }
  }
  return out;
}

/**
 * Main classifier. Pass the chess instance AFTER the move was played plus the move object.
 * Returns the highest-value motif detected, or null if nothing special happened.
 */
export function detectMotif(
  chessBefore: Chess,
  chessAfter: Chess,
  move: Move,
  playerColor: 'w' | 'b'
): Motif | null {
  if (move.color !== playerColor) return null;
  // Capturing checkmate is celebrated elsewhere — focus on threats created.
  if (chessAfter.isCheckmate()) return null;

  const targets = attackedByMover(chessAfter, move.to as Square, playerColor);
  const valuableTargets = targets.filter(t => t.value >= 3 || t.piece === 'k');

  // ── 1. FORK — moved piece attacks 2+ valuable pieces ───────────────────
  if (valuableTargets.length >= 2) {
    const names = valuableTargets
      .slice(0, 3)
      .map(t => PIECE_NAMES[t.piece])
      .join(' and ');
    const movedName = PIECE_NAMES[move.piece];
    return {
      type: 'fork',
      icon: '🍴',
      title: 'FORK!',
      explanation: `Your ${movedName} attacks the ${names} at the same time — your opponent can't save them both!`,
    };
  }

  // ── 2. PIN / SKEWER for sliding pieces ─────────────────────────────────
  if (['b', 'r', 'q'].includes(move.piece)) {
    const ps = detectPinOrSkewer(chessAfter, move.to as Square, move.piece, playerColor);
    if (ps) {
      const frontName = PIECE_NAMES[ps.front.piece];
      const backName = PIECE_NAMES[ps.back.piece];
      const movedName = PIECE_NAMES[move.piece];
      if (ps.kind === 'pin') {
        return {
          type: 'pin',
          icon: '📌',
          title: 'PIN!',
          explanation: `The enemy ${frontName} is stuck — if it moves, your ${movedName} will capture the ${backName} behind it!`,
        };
      }
      return {
        type: 'skewer',
        icon: '🍢',
        title: 'SKEWER!',
        explanation: `Brilliant! Your ${movedName} forces the enemy ${frontName} to move, exposing the ${backName} behind it!`,
      };
    }
  }

  // ── 3. DISCOVERED ATTACK — moving the piece let a friend behind it attack ─
  // Compare: pieces that attack something now (not counting attacks from move.to) vs before.
  // Cheap heuristic: look at all our other pieces' attacks; if any new valuable target appears
  // because of the move, call it a discovered attack.
  {
    const beforeAttacks = attackedByMover(chessBefore, move.from as Square, playerColor); // ignored — used to scaffold types
    void beforeAttacks;
    const afterEnemies = attackedEnemies(chessAfter, playerColor);
    const beforeEnemies = attackedEnemies(chessBefore, playerColor);
    for (const [sq, attackers] of afterEnemies.entries()) {
      const beforeList = beforeEnemies.get(sq) ?? [];
      for (const a of attackers) {
        if (a.from === move.to) continue; // moved piece, not a discovery
        const wasAttacking = beforeList.some(b => b.from === a.from);
        if (!wasAttacking) {
          const tgt = chessAfter.get(sq);
          if (tgt && (PIECE_VALUES[tgt.type] ?? 0) >= 3) {
            return {
              type: 'discovered',
              icon: '🎯',
              title: 'DISCOVERED ATTACK!',
              explanation: `Sneaky! By moving the ${PIECE_NAMES[move.piece]}, you uncovered your ${PIECE_NAMES[a.piece]} which now attacks the ${PIECE_NAMES[tgt.type]}!`,
            };
          }
        }
      }
    }
  }

  // ── 4. Threatens to capture an undefended valuable piece next turn ─────
  if (valuableTargets.length === 1) {
    const t = valuableTargets[0];
    if (t.value >= 5) {
      return {
        type: 'hanging_piece',
        icon: '⚠️',
        title: 'BIG THREAT!',
        explanation: `Your ${PIECE_NAMES[move.piece]} is now attacking the enemy ${PIECE_NAMES[t.piece]} — that's worth ${t.value} points!`,
      };
    }
  }

  return null;
}
