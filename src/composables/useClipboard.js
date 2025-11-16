/**
 * @copyright Copyright (c) 2021 Patrick Herzberg <patrick@westberliner.net>
 *
 * @author Patrick Herzberg <patrick@westberliner.net>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { ref } from "vue";

/**
 * Composable for clipboard operations
 */
export function useClipboard() {
  const copied = ref(false);

  /**
   * Copy text to clipboard.
   * @param {string} text - The text to copy.
   * @param {string} fallbackSelector - DOM selector for fallback method.
   */
  const copyToClipboard = async (text, fallbackSelector = "#checksum-hash") => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const copyText = document.querySelector(fallbackSelector);
        if (copyText) {
          copyText.select();
          document.execCommand("copy");
        }
      }
      copied.value = true;
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        copied.value = false;
      }, 3000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  /**
   * Reset the copied state.
   */
  const resetCopied = () => {
    copied.value = false;
  };

  return {
    copied,
    copyToClipboard,
    resetCopied,
  };
}

