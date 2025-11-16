/**
 * @copyright Copyright (c) 2021 Patrick Herzberg <patrick@westberliner.net>
 *
 * @author Patrick Herzberg <patrick@westberliner.net>
 *
 * @license AGPL-3.0-or-later
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

import { ref, type Ref } from 'vue'

export interface UseClipboardReturn {
  copied: Ref<boolean>;
  copyToClipboard: (text: string, fallbackSelector?: string) => Promise<void>;
  resetCopied: () => void;
}

/**
 * Composable for clipboard operations
 */
export function useClipboard(): UseClipboardReturn {
	const copied = ref<boolean>(false)

	/**
	 * Copy text to clipboard.
	 * @param text - The text to copy.
	 * @param fallbackSelector - DOM selector for fallback method.
	 */
	const copyToClipboard = async (
		text: string,
		fallbackSelector: string = '#checksum-hash',
	): Promise<void> => {
		try {
			if (navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(text)
			} else {
				// Fallback for older browsers
				const copyText
          = document.querySelector<HTMLInputElement>(fallbackSelector)
				if (copyText) {
					copyText.select()
					document.execCommand('copy')
				}
			}
			copied.value = true

			// Auto-reset after 3 seconds
			setTimeout(() => {
				copied.value = false
			}, 3000)
		} catch (err) {
			console.error('Failed to copy to clipboard:', err)
		}
	}

	/**
	 * Reset the copied state.
	 */
	const resetCopied = (): void => {
		copied.value = false
	}

	return {
		copied,
		copyToClipboard,
		resetCopied,
	}
}
