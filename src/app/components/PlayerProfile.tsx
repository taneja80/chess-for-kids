'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/gameStore';
import styles from './PlayerProfile.module.css';

const AVATAR_CHOICES = ['🛡️', '⚔️', '🧙‍♂️', '🧙‍♀️', '🤴', '👸', '🐉', '🦄', '🏹', '🦁', '🦊', '🐺'];

export default function PlayerProfile() {
  const { playerProfile, setProfile, clearProfile } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(playerProfile?.name ?? '');
  const [avatar, setAvatar] = useState(playerProfile?.avatar ?? AVATAR_CHOICES[0]);

  const startEdit = () => {
    setName(playerProfile?.name ?? '');
    setAvatar(playerProfile?.avatar ?? AVATAR_CHOICES[0]);
    setEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setProfile({ name: trimmed, avatar });
    setEditing(false);
  };

  // No profile yet → big welcoming create-card
  if (!playerProfile && !editing) {
    return (
      <div className={styles.card}>
        <div className={styles.welcomeRow}>
          <span className={styles.bigEmoji}>🧙‍♂️</span>
          <div>
            <h3 className={styles.title}>Welcome, brave traveler!</h3>
            <p className={styles.subtitle}>Create your knight profile to save your games and track your legend.</p>
          </div>
        </div>
        <button
          id="btn-create-profile"
          className={`btn btn-gold ${styles.createBtn}`}
          onClick={startEdit}
        >
          ✨ Create Profile
        </button>
      </div>
    );
  }

  // Edit / create form
  if (editing) {
    return (
      <form className={styles.card} onSubmit={handleSave}>
        <h3 className={styles.title}>
          {playerProfile ? '✏️ Edit Profile' : '✨ Create Profile'}
        </h3>

        <label className={styles.label}>
          <span>Knight Name</span>
          <input
            id="profile-name-input"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sir Lancelot the Brave"
            maxLength={24}
            autoFocus
          />
        </label>

        <div className={styles.label}>
          <span>Avatar</span>
          <div className={styles.avatarGrid}>
            {AVATAR_CHOICES.map((a) => (
              <button
                key={a}
                type="button"
                className={`${styles.avatarBtn} ${avatar === a ? styles.avatarBtnActive : ''}`}
                onClick={() => setAvatar(a)}
                aria-label={`Pick avatar ${a}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button
            id="btn-save-profile"
            type="submit"
            className="btn btn-gold"
            disabled={!name.trim()}
          >
            💾 Save
          </button>
        </div>
      </form>
    );
  }

  // Has profile — show summary
  return (
    <div className={styles.card}>
      <div className={styles.summaryRow}>
        <span className={styles.bigEmoji}>{playerProfile!.avatar}</span>
        <div className={styles.summaryInfo}>
          <h3 className={styles.title}>Hello, {playerProfile!.name}!</h3>
          <p className={styles.subtitle}>
            Knight since {new Date(playerProfile!.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={startEdit}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (confirm('Sign out and clear your profile? Your saved games will still be kept on this device.')) {
              clearProfile();
            }
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
