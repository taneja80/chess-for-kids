import { Chess, Move } from 'chess.js';
import { calculateTerritory } from './territory';

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

export type MoveQualityType =
  | 'brilliant'   // checkmate, queen sac that wins, capture of undefended major
  | 'great'       // big capture (rook/queen)
  | 'good'        // capture of knight/bishop/pawn, or solid developing move
  | 'sharp'       // delivers check (non-mating)
  | 'safe'        // castling — castle to safety
  | 'promo'       // pawn promotion
  | 'risky'       // moves into a square with more attackers than defenders
  | 'blunder';    // hangs a major piece on an undefended attacked square

export interface MoveQuality {
  type: MoveQualityType;
  icon: string;
  label: string;
  color: string;
}

const QUALITY_PRESETS: Record<MoveQualityType, Omit<MoveQuality, 'type'>> = {
  brilliant: { icon: '🏆', label: 'Brilliant!',    color: '#fbbf24' },
  great:     { icon: '✨', label: 'Great Move!',   color: '#a78bfa' },
  good:      { icon: '⚔️', label: 'Nice Capture',  color: '#4ade80' },
  sharp:     { icon: '⚡',  label: 'Sharp Check!',  color: '#f87171' },
  safe:      { icon: '🏰', label: 'Castled Safe',  color: '#38bdf8' },
  promo:     { icon: '👑', label: 'Promotion!',    color: '#fbbf24' },
  risky:     { icon: '🤔', label: 'Risky',         color: '#f59e0b' },
  blunder:   { icon: '💥', label: 'Blunder!',      color: '#ef4444' },
};

const make = (type: MoveQualityType): MoveQuality => ({ type, ...QUALITY_PRESETS[type] });

/**
 * Classify a player move using lightweight heuristics so we can give instant feedback
 * to a child without round-tripping to Stockfish. Returns null when the move is
 * unremarkable (don't spam labels).
 *
 * @param chessAfter chess instance with the move already applied
 * @param move the chess.js Move object just played
 * @param playerColor the color of the player whose move this is
 */
export function classifyMove(
  chessAfter: Chess,
  move: Move,
  playerColor: 'w' | 'b'
): MoveQuality | null {
  // 1. Checkmate is always brilliant.
  if (chessAfter.isCheckmate()) {
    return make('brilliant');
  }

  const territory = calculateTerritory(chessAfter);
  const sqControl = territory[move.to];
  // After our move it's the opponent's turn, so "attackers of our piece" are opponent-controls.
  const attackers = playerColor === 'w' ? sqControl.blackControls : sqControl.whiteControls;
  const defenders = playerColor === 'w' ? sqControl.whiteControls : sqControl.blackControls;

  const capturedVal = move.captured ? PIECE_VALUES[move.captured] ?? 0 : 0;
  const movedVal = PIECE_VALUES[move.piece] ?? 0;

  // 2. Capture of undefended knight-or-better → free material, brilliant for kids.
  if (capturedVal >= 3 && attackers === 0) {
    return make('brilliant');
  }

  // 3. Big-piece capture (rook or queen) — always celebrate.
  if (capturedVal >= 5) {
    return make('great');
  }

  // 4. Hanging a major piece on an undefended attacked square.
  if (movedVal >= 3 && attackers > 0 && defenders === 0) {
    return make('blunder');
  }

  // 5. Trading down badly — moved a major piece to a square where attackers outnumber defenders.
  if (movedVal >= 3 && attackers > defenders) {
    return make('risky');
  }

  // 6. Promotion is its own celebration.
  if (move.flags.includes('p')) {
    return make('promo');
  }

  // 7. Castling — explicit "you castled" recognition.
  if (move.flags.includes('k') || move.flags.includes('q')) {
    return make('safe');
  }

  // 8. Check (non-mating) — sharp tactical move.
  if (chessAfter.isCheck()) {
    return make('sharp');
  }

  // 9. Solid capture of minor piece (knight/bishop).
  if (capturedVal >= 3) {
    return make('good');
  }

  // Unremarkable — no badge.
  return null;
}
