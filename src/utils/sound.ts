/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Synthesizes a subtle, high-quality tactile sound effect using Web Audio API.
 * This guarantees zero external asset dependencies and works offline with no latency.
 */
export function playThemeToggleSound(targetTheme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    
    // Resume context if suspended (common browser security constraint)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (targetTheme === 'dark') {
      // Soft, warm, cozy descending "pop" or acoustic click for turning off the light
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Gentle, bright, ascending chime for turning on the light
      osc.type = 'triangle'; // triangle has soft harmonics
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      
      // Add a subtle second harmonic oscillator for a richer chime tone
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(1320, now); // 3rd harmonic of 440
      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      harmonicGain.gain.setValueAtTime(0.03, now);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + 0.15);
      harmonic.stop(now + 0.15);
    }
  } catch (error) {
    // Fail silently so the app remains fully robust
    console.warn('Audio synthesis failed:', error);
  }
}

/**
 * Synthesizes a playful "blind box opening" sound: a short rising
 * "click-pop" followed by a bright sparkle chime. Mirrors the style of
 * `playThemeToggleSound` so there are zero external audio assets.
 */
export function playBlindBoxOpenSound() {
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 1) A tiny "snap" transient — short noise-ish click via fast decay square.
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(180, now);
    snap.frequency.exponentialRampToValueAtTime(90, now + 0.05);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapGain.gain.setValueAtTime(0.06, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    snap.start(now);
    snap.stop(now + 0.06);

    // 2) Bright ascending sparkle chime.
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(660, now + 0.04);
    chime.frequency.exponentialRampToValueAtTime(1320, now + 0.22);
    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeGain.gain.setValueAtTime(0.0001, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.09, now + 0.08);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    chime.start(now + 0.04);
    chime.stop(now + 0.24);

    // 3) Soft high harmonic for a "magical" shimmer.
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(1760, now + 0.06);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmerGain.gain.setValueAtTime(0.0001, now + 0.06);
    shimmerGain.gain.exponentialRampToValueAtTime(0.035, now + 0.1);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    shimmer.start(now + 0.06);
    shimmer.stop(now + 0.28);

    // 4) A warm low "settle" note that lands as the lid finishes lifting,
    //    giving the reveal a sense of completion and weight.
    const settle = ctx.createOscillator();
    const settleGain = ctx.createGain();
    settle.type = 'sine';
    settle.frequency.setValueAtTime(196, now + 0.16);
    settle.frequency.exponentialRampToValueAtTime(262, now + 0.34);
    settle.connect(settleGain);
    settleGain.connect(ctx.destination);
    settleGain.gain.setValueAtTime(0.0001, now + 0.16);
    settleGain.gain.exponentialRampToValueAtTime(0.06, now + 0.22);
    settleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    settle.start(now + 0.16);
    settle.stop(now + 0.4);
  } catch (error) {
    console.warn('Audio synthesis failed:', error);
  }
}
