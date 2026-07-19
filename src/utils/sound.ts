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
