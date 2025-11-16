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

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { translate as t } from '@nextcloud/l10n'

export interface UseByteRangeReturn {
  byteStart: Ref<string>;
  byteEnd: Ref<string>;
  rangeError: Ref<string>;
  showByteRange: Ref<boolean>;
  parsedByteStart: ComputedRef<number | null>;
  parsedByteEnd: ComputedRef<number | null>;
  hasByteRange: ComputedRef<boolean>;
  validateByteRange: () => boolean;
  toggleByteRange: () => void;
  resetByteRange: () => void;
  clearError: () => void;
}

/**
 * Composable for byte range management and validation
 */
export function useByteRange(): UseByteRangeReturn {
	// State
	const byteStart = ref<string>('')
	const byteEnd = ref<string>('')
	const rangeError = ref<string>('')
	const showByteRange = ref<boolean>(false)

	/**
	 * Validates the byte range inputs.
	 * @return True if valid, false otherwise.
	 */
	const validateByteRange = (): boolean => {
		const start = parseInt(byteStart.value, 10)
		const end = parseInt(byteEnd.value, 10)

		if (byteStart.value !== '' && isNaN(start)) {
			rangeError.value = t('checksum', 'Start byte must be a valid number.')
			return false
		}

		if (byteEnd.value !== '' && isNaN(end)) {
			rangeError.value = t('checksum', 'End byte must be a valid number.')
			return false
		}

		if (byteStart.value !== '' && byteEnd.value !== '' && start >= end) {
			rangeError.value = t(
				'checksum',
				'Start byte must be less than end byte.',
			)
			return false
		}

		if (byteStart.value !== '' && start < 0) {
			rangeError.value = t('checksum', 'Start byte must be 0 or greater.')
			return false
		}

		if (byteEnd.value !== '' && end < 0) {
			rangeError.value = t('checksum', 'End byte must be 0 or greater.')
			return false
		}

		rangeError.value = ''
		return true
	}

	/**
	 * Get the parsed byte start value.
	 */
	const parsedByteStart = computed<number | null>(() => {
		return byteStart.value !== '' ? parseInt(byteStart.value, 10) : null
	})

	/**
	 * Get the parsed byte end value.
	 */
	const parsedByteEnd = computed<number | null>(() => {
		return byteEnd.value !== '' ? parseInt(byteEnd.value, 10) : null
	})

	/**
	 * Check if byte range is active (at least one field filled).
	 */
	const hasByteRange = computed<boolean>(() => {
		return byteStart.value !== '' || byteEnd.value !== ''
	})

	/**
	 * Toggle the visibility of the byte range section.
	 */
	const toggleByteRange = (): void => {
		showByteRange.value = !showByteRange.value
	}

	/**
	 * Reset the byte range state.
	 */
	const resetByteRange = (): void => {
		byteStart.value = ''
		byteEnd.value = ''
		rangeError.value = ''
		showByteRange.value = false
	}

	/**
	 * Clear any existing error.
	 */
	const clearError = (): void => {
		rangeError.value = ''
	}

	return {
		// State
		byteStart,
		byteEnd,
		rangeError,
		showByteRange,

		// Computed
		parsedByteStart,
		parsedByteEnd,
		hasByteRange,

		// Methods
		validateByteRange,
		toggleByteRange,
		resetByteRange,
		clearError,
	}
}
