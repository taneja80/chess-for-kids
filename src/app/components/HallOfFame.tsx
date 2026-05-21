'use client';

import React, { useMemo } from 'react';
import { useGameStore } from '../../lib/gameStore';
import { KNIGHT_AVATARS } from './ArmouryShop';
import styles from './HallOfFame.module.css';

interface DifficultyRow {
  id: string;
  name: string;
  emoji: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
}

const DIFFICULTY_META: Array<{ id: 'squire' | 'knight' | 'bishop' | 'king'; name: string; emoji: string }> = [
  { id: 'squire',  name: 'Squire',  emoji: '🛡️' },
  { id: 'knight',  name: 'Knight',  emoji: '🐴' },
  { id: 'bishop',  name: 'Bishop',  emoji: '⛪' },
  { id: 'king',    name: 'King',    emoji: '👑' },
];

function computeRank(totalWins: number, badgesEarned: number): { rank: string; emoji: string } {
  const score = totalWins * 2 + badgesEarned;
  if (score >= 60) return { rank: 'Grand Master',     emoji: '🏆' };
  if (score >= 35) return { rank: 'Master Strategist', emoji: '⚔️' };
  if (score >= 20) return { rank: 'Champion',          emoji: '🎖️' };
  if (score >= 10) return { rank: 'Adept',             emoji: '🌟' };
  if (score >= 3)  return { rank: 'Apprentice',        emoji: '🔰' };
  return { rank: 'Novice', emoji: '🐣' };
}

export default function HallOfFame() {
  const {
    goldCoins,
    badges,
    aiRecord,
    puzzleProgress,
    dailyStreak,
    dailyBestStreak,
    currentAvatar,
  } = useGameStore();

  const avatar = KNIGHT_AVATARS.find(a => a.id === (currentAvatar || 'squire')) || KNIGHT_AVATARS[0];

  const rows: DifficultyRow[] = useMemo(() => {
    return DIFFICULTY_META.map(meta => {
      const results = aiRecord?.[meta.id] || [];
      const wins   = results.filter(r => r === 'w').length;
      const losses = results.filter(r => r === 'l').length;
      const draws  = results.filter(r => r === 'd').length;
      const total  = results.length;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return { id: meta.id, name: meta.name, emoji: meta.emoji, wins, losses, draws, total, winRate };
    });
  }, [aiRecord]);

  const totalWins = rows.reduce((s, r) => s + r.wins, 0);
  const totalGames = rows.reduce((s, r) => s + r.total, 0);

  const earnedBadges = badges.filter(b => b.earned);
  const totalBadges = badges.length;
  const puzzlesSolved = Object.values(puzzleProgress || {}).filter(Boolean).length;

  const { rank, emoji: rankEmoji } = computeRank(totalWins, earnedBadges.length);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🏆 Hall of Fame</h2>
        <p>Your legendary chronicles, brave warrior.</p>
      </div>

      {/* Player Card */}
      <div className={styles.playerCard}>
        <div className={styles.bigAvatar} style={{ borderColor: avatar.color, boxShadow: `0 0 22px ${avatar.color}55` }}>
          <span>{avatar.emoji}</span>
        </div>
        <div className={styles.playerMeta}>
          <h3 className={styles.playerName} style={{ color: avatar.color }}>{avatar.name}</h3>
          <p className={styles.playerTitle}>{avatar.title}</p>
          <p className={styles.playerRank}>
            <strong>{rankEmoji} {rank}</strong> · {totalWins} wins across {totalGames} games
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🪙</div>
          <p className={styles.statValue}>{goldCoins}</p>
          <p className={styles.statLabel}>Gold Coins</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎖️</div>
          <p className={styles.statValue}>{earnedBadges.length}<span style={{ fontSize: '0.9rem', opacity: 0.6 }}>/{totalBadges}</span></p>
          <p className={styles.statLabel}>Badges Earned</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <p className={styles.statValue}>{puzzlesSolved}</p>
          <p className={styles.statLabel}>Puzzles Solved</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <p className={styles.statValue}>{dailyStreak ?? 0}</p>
          <p className={styles.statLabel}>Daily Streak</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <p className={styles.statValue}>{dailyBestStreak ?? 0}</p>
          <p className={styles.statLabel}>Best Streak</p>
        </div>
      </div>

      {/* Difficulty Leaderboard */}
      <div className={styles.section}>
        <h3>⚔️ Battle Record vs AI</h3>
        <div className={styles.diffTable}>
          {rows.map(row => {
            const denom = Math.max(row.total, 1);
            return (
              <div key={row.id} className={styles.diffRow}>
                <span className={styles.diffName}>{row.emoji} {row.name}</span>
                {row.total === 0 ? (
                  <span className={styles.diffEmpty}>No battles yet — challenge this opponent!</span>
                ) : (
                  <div className={styles.diffBar}>
                    <div className={styles.diffBarWin}  style={{ width: `${(row.wins   / denom) * 100}%` }} />
                    <div className={styles.diffBarDraw} style={{ width: `${(row.draws  / denom) * 100}%` }} />
                    <div className={styles.diffBarLoss} style={{ width: `${(row.losses / denom) * 100}%` }} />
                  </div>
                )}
                <span className={styles.diffStats}>
                  {row.total > 0
                    ? `${row.wins}W ${row.draws}D ${row.losses}L · ${row.winRate}%`
                    : '—'}
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.legend}>
          <span><span className={styles.legendDot} style={{ background: '#22c55e' }} /> Wins</span>
          <span><span className={styles.legendDot} style={{ background: '#94a3b8' }} /> Draws</span>
          <span><span className={styles.legendDot} style={{ background: '#ef4444' }} /> Losses</span>
          <span style={{ marginLeft: 'auto' }}>Last 5 results per opponent</span>
        </div>
      </div>

      {/* Badge Showcase */}
      <div className={styles.section}>
        <h3>🎖️ Badge Collection ({earnedBadges.length}/{totalBadges})</h3>
        <div className={styles.badgesRow}>
          {badges.map(badge => (
            <span
              key={badge.id}
              className={[styles.badgeChip, badge.earned ? '' : styles.locked].join(' ')}
              title={badge.description}
            >
              <span>{badge.icon}</span>
              <span>{badge.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
