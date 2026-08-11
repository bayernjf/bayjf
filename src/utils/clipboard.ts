/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Copy text to the clipboard.
 *
 * Uses the async Clipboard API when available (secure contexts: HTTPS or
 * localhost). Falls back to a hidden textarea + `execCommand('copy')` for
 * non-secure contexts (plain HTTP) or browsers where `navigator.clipboard`
 * is undefined — calling `writeText` there throws synchronously, which the
 * Promise `.catch` would NOT catch.
 *
 * @returns true if the text was copied, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('Clipboard API unavailable');
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}
