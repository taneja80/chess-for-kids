import { PUZZLES } from './gameData';

/** Returns YYYY-MM-DD for the user's local timezone. */
export function getTodayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Days-since-epoch for streak math (timezone-independent enough for kids). */
function daysSinceEpoch(dateStr: string): number {
  return Math.floor(new Date(dateStr + 'T00:00:00').getTime() / 86_400_000);
}

/** Deterministic puzzle pick — same day always yields same puzzle. */
export function getDailyPuzzleId(dateStr: string = getTodayDateStr()): string {
  const dn = daysSinceEpoch(dateStr);
  const pick = PUZZLES[((dn % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];
  return pick.id;
}

/** Compute the new streak given the prior streak and the prior daily-claim date. */
export function nextStreak(prevStreak: number, prevDate: string | null, today: string): number {
  if (!prevDate) return 1;
  const diff = daysSinceEpoch(today) - daysSinceEpoch(prevDate);
  if (diff <= 0) return prevStreak; // already claimed today (or weird clock)
  if (diff === 1) return prevStreak + 1;
  return 1; // streak broken
}
