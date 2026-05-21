'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import { KNIGHT_AVATARS } from './ArmouryShop';
import styles from './WizardCoach.module.css';

const SKIN_CONFIGS: Record<string, { label: string; emoji: string; color: string }> = {
  classic: { label: 'Wizard Merlin', emoji: '🧙‍♂️', color: '#a78bfa' },
  fire:    { label: 'Archmage Ignis', emoji: '🔥🧙‍♂️', color: '#ef4444' },
  void:    { label: 'Sorcerer Malakar', emoji: '🔮🧙‍♂️', color: '#8b5cf6' },
  gold:    { label: 'Emperor Aurelius', emoji: '👑🧙‍♂️', color: '#fbbf24' },
};

export default function WizardCoach() {
  const { wizardMessage, wizardEmotion, resetWizard, currentSkin, currentAvatar } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState<string | null>(null);

  useEffect(() => {
    if (wizardMessage) {
      const run = () => {
        setDisplayMsg(wizardMessage);
        setVisible(true);
      };
      const tick = setTimeout(run, 0);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(resetWizard, 400);
      }, 5000);

      return () => {
        clearTimeout(tick);
        clearTimeout(timer);
      };
    }
  }, [wizardMessage, resetWizard]);

  const skin = SKIN_CONFIGS[currentSkin || 'classic'] || SKIN_CONFIGS.classic;
  const avatar = KNIGHT_AVATARS.find(a => a.id === (currentAvatar || 'squire')) || KNIGHT_AVATARS[0];

  const getEmotionConfig = () => {
    switch (wizardEmotion) {
      case 'happy':
        return { emoji: `😊${skin.emoji}`, label: skin.label, color: '#4ade80' };
      case 'excited':
        return { emoji: `🤩${skin.emoji}`, label: skin.label, color: '#fbbf24' };
      case 'warning':
        return { emoji: `⚠️${skin.emoji}`, label: skin.label, color: '#f87171' };
      case 'sad':
        return { emoji: `😔${skin.emoji}`, label: skin.label, color: '#94a3b8' };
      default:
        return { emoji: skin.emoji, label: skin.label, color: skin.color };
    }
  };

  const cfg = getEmotionConfig();

  return (
    <div className={styles.wizardContainer}>
      {/* Player avatar header */}
      <div className={styles.playerHeader} style={{ borderColor: avatar.color }}>
        <span className={styles.playerEmoji}>{avatar.emoji}</span>
        <div className={styles.playerInfo}>
          <span className={styles.playerLabel}>You play as</span>
          <span className={styles.playerName} style={{ color: avatar.color }}>{avatar.name}</span>
        </div>
      </div>

      <div className={styles.coachRow}>
      {/* Wizard avatar - always visible */}
      <div className={styles.avatarWrapper}>
        <div
          className={[styles.avatar, wizardEmotion !== 'idle' ? styles.avatarActive : ''].join(' ')}
          style={{ '--wizard-color': cfg.color } as React.CSSProperties}
        >
          <span className={styles.avatarEmoji}>{skin.emoji}</span>
          {wizardEmotion !== 'idle' && (
            <span className={styles.emotionBadge}>
              {wizardEmotion === 'excited' ? '✨' :
               wizardEmotion === 'warning' ? '⚠️' :
               wizardEmotion === 'happy' ? '😊' :
               wizardEmotion === 'sad' ? '😔' : ''}
            </span>
          )}
        </div>
        <span className={styles.wizardName}>{cfg.label}</span>
      </div>

      {/* Speech bubble */}
      {visible && displayMsg && (
        <div
          className={[styles.bubble, styles.bubbleIn].join(' ')}
          style={{ borderColor: cfg.color }}
        >
          <div className={styles.bubbleArrow} style={{ borderRightColor: cfg.color }} />
          <p className={styles.bubbleText}>{displayMsg}</p>
          <button
            className={styles.dismissBtn}
            onClick={() => { setVisible(false); resetWizard(); }}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Idle hint when no message */}
      {!visible && (
        <div className={styles.idleHint}>
          <p>Tap a piece to see valid moves!</p>
        </div>
      )}
      </div>
    </div>
  );
}
