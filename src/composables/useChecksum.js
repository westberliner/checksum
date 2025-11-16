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
import { generateUrl } from "@nextcloud/router";
import { translate as t } from "@nextcloud/l10n";
import axios from "@nextcloud/axios";
import algorithms from "../Model/Algorithms";

/**
 * Composable for checksum calculation and validation
 */
export function useChecksum() {
  // State
  const loading = ref(false);
  const hash = ref("");
  const algorithm = ref(algorithms[0]);
  const fileInfo = ref(null);

  /**
   * Fetches the checksum from the server.
   * @param {string} algorithmType - The hash algorithm type.
   * @param {number|null} byteStart - Optional start byte offset.
   * @param {number|null} byteEnd - Optional end byte offset.
   * @returns {Promise<string|null>} The calculated hash or null on error.
   */
  const fetchChecksum = async (algorithmType, byteStart = null, byteEnd = null) => {
    loading.value = true;

    const url = generateUrl("/apps/checksum/check");
    const params = {
      source: `${fileInfo.value.path}/${fileInfo.value.name}`,
      type: algorithmType,
    };

    // Add byte range parameters if they are set
    if (byteStart !== null) {
      params.byteStart = byteStart;
    }
    if (byteEnd !== null) {
      params.byteEnd = byteEnd;
    }

    try {
      const response = await axios.get(url, { params });
      loading.value = false;
      hash.value = response.data.msg;
      return response.data.msg;
    } catch (err) {
      console.error(err);
      loading.value = false;
      const errorMsg = err.response?.data?.msg || t("checksum", "Error calculating checksum.");
      throw new Error(errorMsg);
    }
  };

  /**
   * Reset the checksum state.
   */
  const resetChecksum = () => {
    loading.value = false;
    algorithm.value = algorithms[0];
    hash.value = "";
  };

  /**
   * Update the file info.
   * @param {Object} info - The file info object.
   */
  const setFileInfo = (info) => {
    fileInfo.value = info;
  };

  return {
    loading,
    hash,
    algorithm,
    algorithms,
    fetchChecksum,
    resetChecksum,
    setFileInfo,
  };
}

