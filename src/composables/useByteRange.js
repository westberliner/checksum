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

import { ref, computed } from "vue";
import { translate as t } from "@nextcloud/l10n";

/**
 * Composable for byte range management and validation
 */
export function useByteRange() {
  const byteStart = ref("");
  const byteEnd = ref("");
  const rangeError = ref("");
  const showByteRange = ref(false);

  /**
   * Validates the byte range inputs.
   * @returns {boolean} True if valid, false otherwise.
   */
  const validateByteRange = () => {
    const start = parseInt(byteStart.value, 10);
    const end = parseInt(byteEnd.value, 10);

    if (byteStart.value !== "" && isNaN(start)) {
      rangeError.value = t("checksum", "Start byte must be a valid number.");
      return false;
    }

    if (byteEnd.value !== "" && isNaN(end)) {
      rangeError.value = t("checksum", "End byte must be a valid number.");
      return false;
    }

    if (byteStart.value !== "" && byteEnd.value !== "" && start >= end) {
      rangeError.value = t("checksum", "Start byte must be less than end byte.");
      return false;
    }

    if (byteStart.value !== "" && start < 0) {
      rangeError.value = t("checksum", "Start byte must be 0 or greater.");
      return false;
    }

    if (byteEnd.value !== "" && end < 0) {
      rangeError.value = t("checksum", "End byte must be 0 or greater.");
      return false;
    }

    rangeError.value = "";
    return true;
  };

  /**
   * Get the parsed byte start value.
   */
  const parsedByteStart = computed(() => {
    return byteStart.value !== "" ? parseInt(byteStart.value, 10) : null;
  });

  /**
   * Get the parsed byte end value.
   */
  const parsedByteEnd = computed(() => {
    return byteEnd.value !== "" ? parseInt(byteEnd.value, 10) : null;
  });

  /**
   * Check if byte range is active (at least one field filled).
   */
  const hasByteRange = computed(() => {
    return byteStart.value !== "" || byteEnd.value !== "";
  });

  /**
   * Toggle the visibility of the byte range section.
   */
  const toggleByteRange = () => {
    showByteRange.value = !showByteRange.value;
  };

  /**
   * Reset the byte range state.
   */
  const resetByteRange = () => {
    byteStart.value = "";
    byteEnd.value = "";
    rangeError.value = "";
    showByteRange.value = false;
  };

  /**
   * Clear any existing error.
   */
  const clearError = () => {
    rangeError.value = "";
  };

  return {
    byteStart,
    byteEnd,
    rangeError,
    showByteRange,
    parsedByteStart,
    parsedByteEnd,
    hasByteRange,
    validateByteRange,
    toggleByteRange,
    resetByteRange,
    clearError,
  };
}

