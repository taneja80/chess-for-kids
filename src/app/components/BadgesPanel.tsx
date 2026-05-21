'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './BadgesPanel.module.css';

export default function BadgesPanel() {
  const { badges } = useGameStore();
  const [expanded, setExpanded] = useState(false);

  const earned = badges.filter(b => b.earned);
  const displayBadges = expanded ? badges : badges.slice(0, 6);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>🏅 Achievements</h3>
          <span className={styles.count}>{earned.length}/{badges.length}</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(earned.length / badges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {displayBadges.map(badge => (
          <div
            key={badge.id}
            className={[
              styles.badge,
              badge.earned ? styles.badgeEarned : styles.badgeLocked,
            ].join(' ')}
            title={`${badge.name}: ${badge.description}`}
            id={`badge-${badge.id}`}
          >
            <span className={styles.badgeIcon}>{badge.earned ? badge.icon : '🔒'}</span>
            <span className={styles.badgeName}>{badge.name}</span>
            {badge.earned && (
              <span className={styles.earnedGlow} />
            )}
          </div>
        ))}
      </div>

      {badges.length > 6 && (
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▲ Show less' : `▼ Show all ${badges.length}`}
        </button>
      )}
    </div>
  );
}
