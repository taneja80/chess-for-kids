import { Chess } from 'chess.js';

export interface SquareControl {
  whiteControls: number;
  blackControls: number;
}

export type TerritoryMap = Record<string, SquareControl>;

// Helper: Convert row, col to algebraic square name
const getSquareName = (row: number, col: number): string => {
  return String.fromCharCode(col + 97) + (8 - row);
};

// Helper: Check if a coordinate is within 8x8 board bounds
const isOutOfBounds = (row: number, col: number): boolean => {
  return row < 0 || row > 7 || col < 0 || col > 7;
};

/**
 * Computes the attack and defense control weight for every square on the board.
 * Controlled squares include empty squares attacked/controlled, friendly occupied squares
 * defended, and enemy occupied squares threatened.
 */
export function calculateTerritory(chess: Chess): TerritoryMap {
  const map: TerritoryMap = {};

  // Initialize all 64 squares
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sqName = getSquareName(r, c);
      map[sqName] = { whiteControls: 0, blackControls: 0 };
    }
  }

  const board = chess.board();

  // Directions for sliding pieces
  const rookDirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const bishopDirs = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const queenDirs = [...rookDirs, ...bishopDirs];

  // Knight jump moves
  const knightMoves = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  // King standard steps
  const kingMoves = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  // Traverse the 8x8 board to find all pieces and compute their influence
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const color = piece.color; // 'w' or 'b'
      const type = piece.type; // 'p', 'r', 'n', 'b', 'q', 'k'

      const incrementControl = (targetRow: number, targetCol: number) => {
        if (isOutOfBounds(targetRow, targetCol)) return;
        const targetSq = getSquareName(targetRow, targetCol);
        if (color === 'w') {
          map[targetSq].whiteControls += 1;
        } else {
          map[targetSq].blackControls += 1;
        }
      };

      // 1. Knight Influence
      if (type === 'n') {
        for (const [dr, dc] of knightMoves) {
          incrementControl(r + dr, c + dc);
        }
      }

      // 2. King Influence
      else if (type === 'k') {
        for (const [dr, dc] of kingMoves) {
          incrementControl(r + dr, c + dc);
        }
      }

      // 3. Pawn Influence (Diagonal capture threat squares only)
      else if (type === 'p') {
        const rowOffset = color === 'w' ? -1 : 1; // White pawns attack up (smaller row index), Black pawns attack down
        incrementControl(r + rowOffset, c - 1);
        incrementControl(r + rowOffset, c + 1);
      }

      // 4. Sliding Influence (Rook, Bishop, Queen)
      else if (type === 'r' || type === 'b' || type === 'q') {
        const dirs = type === 'r' ? rookDirs : type === 'b' ? bishopDirs : queenDirs;

        for (const [dr, dc] of dirs) {
          let step = 1;
          while (true) {
            const tr = r + dr * step;
            const tc = c + dc * step;

            if (isOutOfBounds(tr, tc)) break;

            incrementControl(tr, tc);

            // If there's any piece blocking, the sliding influence stops at this target square
            if (board[tr][tc] !== null) {
              break;
            }
            step++;
          }
        }
      }
    }
  }

  return map;
}
