'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './ArmouryShop.module.css';

interface BoardThemeItem {
  id: string;
  name: string;
  description: string;
  lightColor: string;
  darkColor: string;
  cost: number;
}

interface WizardSkinItem {
  id: string;
  name: string;
  emoji: string;
  coachName: string;
  color: string;
  description: string;
  cost: number;
}

interface KnightAvatarItem {
  id: string;
  name: string;
  emoji: string;
  title: string;
  color: string;
  description: string;
  cost: number;
}

const BOARD_THEMES: BoardThemeItem[] = [
  {
    id: 'classic',
    name: 'Classic Kingdom',
    description: 'The ancient tournament battlefield of high knights.',
    lightColor: '#f0d9b5',
    darkColor: '#b58863',
    cost: 0,
  },
  {
    id: 'neon',
    name: 'Neon Magic',
    description: 'Electric squares crackling with wizard runes and techno sparks.',
    lightColor: '#38bdf8',
    darkColor: '#4c1d95',
    cost: 100,
  },
  {
    id: 'volcanic',
    name: 'Obsidian Volcanic',
    description: 'Carved from molten lava rock and amber dragon glass.',
    lightColor: '#fb923c',
    darkColor: '#1c1917',
    cost: 150,
  },
  {
    id: 'forest',
    name: 'Emerald Forest',
    description: 'A deep woodland glade protected by magical forest sprites.',
    lightColor: '#a7f3d0',
    darkColor: '#064e3b',
    cost: 200,
  },
];

const WIZARD_SKINS: WizardSkinItem[] = [
  {
    id: 'classic',
    name: 'Classic Merlin',
    emoji: '🧙‍♂️',
    coachName: 'Wizard Merlin',
    color: '#a78bfa',
    description: 'The legendary wizard of Camelot. Wise, patient, and kind.',
    cost: 0,
  },
  {
    id: 'fire',
    name: 'Archmage Ignis',
    emoji: '🔥🧙‍♂️',
    coachName: 'Archmage Ignis',
    color: '#ef4444',
    description: 'Master of flame spells. Enthusiastic, hot-headed, and powerful.',
    cost: 120,
  },
  {
    id: 'void',
    name: 'Sorcerer Malakar',
    emoji: '🔮🧙‍♂️',
    coachName: 'Sorcerer Malakar',
    color: '#8b5cf6',
    description: 'Guardian of space and time. Mysterious, deep, and brilliant.',
    cost: 180,
  },
  {
    id: 'gold',
    name: 'Emperor Aurelius',
    emoji: '👑🧙‍♂️',
    coachName: 'Emperor Aurelius',
    color: '#fbbf24',
    description: 'The gilded sovereign ruler. Shimmering, ancient, and glorious.',
    cost: 250,
  },
];

export const KNIGHT_AVATARS: KnightAvatarItem[] = [
  {
    id: 'squire',
    name: 'Young Squire',
    emoji: '🧑‍🎓',
    title: 'Apprentice of the Court',
    color: '#94a3b8',
    description: 'Every grand master starts here. Eager, brave, and ready to learn.',
    cost: 0,
  },
  {
    id: 'knight_silver',
    name: 'Sir Silverblade',
    emoji: '🗡️',
    title: 'Knight of the Silver Order',
    color: '#cbd5e1',
    description: 'A swift, honorable champion clad in moonlit armour.',
    cost: 80,
  },
  {
    id: 'knight_dragon',
    name: 'Lady Dragonheart',
    emoji: '🐉',
    title: 'Rider of the Crimson Wyrm',
    color: '#ef4444',
    description: 'Tamer of dragons. Fearless in the face of any king.',
    cost: 160,
  },
  {
    id: 'knight_archer',
    name: 'Robin the Swift',
    emoji: '🏹',
    title: 'Ranger of the Greenwood',
    color: '#22c55e',
    description: 'Master archer. Sees the whole board three moves ahead.',
    cost: 140,
  },
  {
    id: 'knight_paladin',
    name: 'Sir Lightbringer',
    emoji: '✨',
    title: 'Paladin of the Golden Dawn',
    color: '#fbbf24',
    description: 'A radiant champion blessed by divine strategy.',
    cost: 220,
  },
  {
    id: 'knight_shadow',
    name: 'The Shadow Knight',
    emoji: '🎭',
    title: 'Master of the Veiled Path',
    color: '#7c3aed',
    description: 'Strikes from places no one expected. Loved by tacticians.',
    cost: 200,
  },
];

export default function ArmouryShop() {
  const {
    goldCoins,
    unlockedThemes,
    currentTheme,
    unlockedSkins,
    currentSkin,
    unlockedAvatars,
    currentAvatar,
    buyTheme,
    equipTheme,
    buySkin,
    equipSkin,
    buyAvatar,
    equipAvatar,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'boards' | 'wizards' | 'avatars'>('boards');
  const [purchaseSparks, setPurchaseSparks] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const handleBuyTheme = (e: React.MouseEvent, id: string, cost: number) => {
    e.stopPropagation();
    const success = buyTheme(id, cost);
    if (success) {
      triggerSparks(e.clientX, e.clientY);
    }
  };

  const handleBuySkin = (e: React.MouseEvent, id: string, cost: number) => {
    e.stopPropagation();
    const success = buySkin(id, cost);
    if (success) {
      triggerSparks(e.clientX, e.clientY);
    }
  };

  const handleBuyAvatar = (e: React.MouseEvent, id: string, cost: number) => {
    e.stopPropagation();
    const success = buyAvatar(id, cost);
    if (success) {
      triggerSparks(e.clientX, e.clientY);
    }
  };

  const triggerSparks = (x: number, y: number) => {
    setPurchaseSparks({ active: true, x, y });
    setTimeout(() => {
      setPurchaseSparks({ active: false, x: 0, y: 0 });
    }, 800);
  };

  return (
    <div className={styles.shopContainer}>
      {/* Header with Treasury Coins */}
      <div className={styles.shopHeader}>
        <div className={styles.shopIntro}>
          <h2 className={styles.shopTitle}>🪙 The Gold Coin Armoury</h2>
          <p className={styles.shopSubtitle}>Spend your earned gold coins on gorgeous board themes and wizard skins!</p>
        </div>
        <div className={styles.treasuryCard}>
          <span className={styles.coinIcon}>🪙</span>
          <div className={styles.treasuryInfo}>
            <span className={styles.treasuryLabel}>Your Treasury</span>
            <span className={styles.treasuryAmount}>{goldCoins} Gold Coins</span>
          </div>
        </div>
      </div>

      {/* Shop Category Tabs */}
      <div className={styles.tabNav}>
        <button
          className={activeTab === 'boards' ? styles.tabActive : styles.tabBtn}
          onClick={() => setActiveTab('boards')}
        >
          🏁 Custom Boards
        </button>
        <button
          className={activeTab === 'wizards' ? styles.tabActive : styles.tabBtn}
          onClick={() => setActiveTab('wizards')}
        >
          🧙‍♂️ Wizard Skins
        </button>
        <button
          className={activeTab === 'avatars' ? styles.tabActive : styles.tabBtn}
          onClick={() => setActiveTab('avatars')}
        >
          🤵 Knight Avatars
        </button>
      </div>

      {/* Boards Grid */}
      {activeTab === 'boards' && (
        <div className={styles.grid}>
          {BOARD_THEMES.map((theme) => {
            const isUnlocked = unlockedThemes.includes(theme.id);
            const isEquipped = currentTheme === theme.id;
            const canAfford = goldCoins >= theme.cost;

            return (
              <div
                key={theme.id}
                className={[styles.card, isEquipped ? styles.cardEquipped : ''].join(' ')}
                onClick={() => isUnlocked && equipTheme(theme.id)}
              >
                {/* 2x2 Board Squares Preview */}
                <div className={styles.boardPreview}>
                  <div style={{ backgroundColor: theme.lightColor }} />
                  <div style={{ backgroundColor: theme.darkColor }} />
                  <div style={{ backgroundColor: theme.darkColor }} />
                  <div style={{ backgroundColor: theme.lightColor }} />
                </div>

                <div className={styles.cardDetails}>
                  <h3 className={styles.cardName}>{theme.name}</h3>
                  <p className={styles.cardDesc}>{theme.description}</p>
                </div>

                <div className={styles.actionArea}>
                  {isEquipped ? (
                    <div className={styles.equippedBadge}>🛡️ Equipped</div>
                  ) : isUnlocked ? (
                    <button className={styles.equipBtn}>Equip Theme</button>
                  ) : (
                    <button
                      className={[styles.buyBtn, !canAfford ? styles.btnDisabled : ''].join(' ')}
                      disabled={!canAfford}
                      onClick={(e) => handleBuyTheme(e, theme.id, theme.cost)}
                    >
                      <span>🪙 {theme.cost} Gold</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wizards Grid */}
      {activeTab === 'wizards' && (
        <div className={styles.grid}>
          {WIZARD_SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isEquipped = currentSkin === skin.id;
            const canAfford = goldCoins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={[styles.card, isEquipped ? styles.cardEquipped : ''].join(' ')}
                onClick={() => isUnlocked && equipSkin(skin.id)}
              >
                {/* Wizard Avatar Preview */}
                <div
                  className={styles.avatarPreview}
                  style={{
                    boxShadow: `0 0 20px ${skin.color}40`,
                    borderColor: skin.color,
                  }}
                >
                  <span className={styles.avatarEmoji}>{skin.emoji}</span>
                </div>

                <div className={styles.cardDetails}>
                  <h3 className={styles.cardName}>{skin.name}</h3>
                  <p className={styles.cardDesc}>{skin.description}</p>
                </div>

                <div className={styles.actionArea}>
                  {isEquipped ? (
                    <div className={styles.equippedBadge}>🧙‍♂️ Mentoring</div>
                  ) : isUnlocked ? (
                    <button className={styles.equipBtn}>Invite Wizard</button>
                  ) : (
                    <button
                      className={[styles.buyBtn, !canAfford ? styles.btnDisabled : ''].join(' ')}
                      disabled={!canAfford}
                      onClick={(e) => handleBuySkin(e, skin.id, skin.cost)}
                    >
                      <span>🪙 {skin.cost} Gold</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Avatars Grid */}
      {activeTab === 'avatars' && (
        <div className={styles.grid}>
          {KNIGHT_AVATARS.map((avatar) => {
            const isUnlocked = unlockedAvatars.includes(avatar.id);
            const isEquipped = currentAvatar === avatar.id;
            const canAfford = goldCoins >= avatar.cost;

            return (
              <div
                key={avatar.id}
                className={[styles.card, isEquipped ? styles.cardEquipped : ''].join(' ')}
                onClick={() => isUnlocked && equipAvatar(avatar.id)}
              >
                <div
                  className={styles.wizardPreview}
                  style={{
                    boxShadow: `0 0 20px ${avatar.color}40`,
                  }}
                >
                  <span className={styles.wizardEmoji}>{avatar.emoji}</span>
                </div>

                <div className={styles.cardDetails}>
                  <h3 className={styles.cardName}>{avatar.name}</h3>
                  <p className={styles.coachName} style={{ color: avatar.color }}>
                    {avatar.title}
                  </p>
                  <p className={styles.cardDesc}>{avatar.description}</p>
                </div>

                <div className={styles.actionArea}>
                  {isEquipped ? (
                    <div className={styles.equippedBadge}>🛡️ Worn</div>
                  ) : isUnlocked ? (
                    <button className={styles.equipBtn}>Wear Avatar</button>
                  ) : (
                    <button
                      className={[styles.buyBtn, !canAfford ? styles.btnDisabled : ''].join(' ')}
                      disabled={!canAfford}
                      onClick={(e) => handleBuyAvatar(e, avatar.id, avatar.cost)}
                    >
                      <span>🪙 {avatar.cost} Gold</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Spark Overlay */}
      {purchaseSparks.active && (
        <div
          className={styles.sparkOverlay}
          style={{ left: purchaseSparks.x, top: purchaseSparks.y }}
        >
          ✨🎉🪙
        </div>
      )}
    </div>
  );
}
