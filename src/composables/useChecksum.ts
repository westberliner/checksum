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
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { ref, type Ref } from "vue";
import { generateUrl } from "@nextcloud/router";
import { translate as t } from "@nextcloud/l10n";
import axios, { type AxiosError } from "@nextcloud/axios";
import algorithms from "../Model/Algorithms";
import type { Algorithm, FileInfo, ChecksumResponse } from "../types";

export interface UseChecksumReturn {
  loading: Ref<boolean>;
  hash: Ref<string>;
  algorithm: Ref<Algorithm>;
  algorithms: Algorithm[];
  fetchChecksum: (
    algorithmType: string,
    byteStart?: number | null,
    byteEnd?: number | null
  ) => Promise<string>;
  resetChecksum: () => void;
  setFileInfo: (info: FileInfo) => void;
}

/**
 * Composable for checksum calculation and validation
 */
export function useChecksum(): UseChecksumReturn {
  // State
  const loading = ref<boolean>(false);
  const hash = ref<string>("");
  const algorithm = ref<Algorithm>(algorithms[0] as Algorithm);
  const fileInfo = ref<FileInfo | null>(null);

  /**
   * Fetches the checksum from the server.
   * @param algorithmType - The hash algorithm type.
   * @param byteStart - Optional start byte offset.
   * @param byteEnd - Optional end byte offset.
   * @returns The calculated hash.
   * @throws Error if the request fails.
   */
  const fetchChecksum = async (
    algorithmType: string,
    byteStart: number | null = null,
    byteEnd: number | null = null
  ): Promise<string> => {
    loading.value = true;

    const url = generateUrl("/apps/checksum/check");
    const params: Record<string, string | number> = {
      source: `${fileInfo.value?.path}/${fileInfo.value?.name}`,
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
      const response = await axios.get<ChecksumResponse>(url, { params });
      loading.value = false;
      hash.value = response.data.msg;
      return response.data.msg;
    } catch (err) {
      console.error(err);
      loading.value = false;
      const error = err as AxiosError<ChecksumResponse>;
      const errorMsg =
        error.response?.data?.msg || t("checksum", "Error calculating checksum.");
      throw new Error(errorMsg);
    }
  };

  /**
   * Reset the checksum state.
   */
  const resetChecksum = (): void => {
    loading.value = false;
    algorithm.value = algorithms[0] as Algorithm;
    hash.value = "";
  };

  /**
   * Update the file info.
   * @param info - The file info object.
   */
  const setFileInfo = (info: FileInfo): void => {
    fileInfo.value = info;
  };

  return {
    // State
    loading,
    hash,
    algorithm,
    algorithms,

    // Methods
    fetchChecksum,
    resetChecksum,
    setFileInfo,
  };
}

