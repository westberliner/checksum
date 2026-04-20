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
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { ref, type Ref } from "vue";
import { generateUrl } from "@nextcloud/router";
import { translate as t } from "@nextcloud/l10n";
import axios, { type AxiosError } from "@nextcloud/axios";
import algorithms from "@/Model/Algorithms";
import type { Algorithm, ChecksumResponse, FileInfo } from "@/types";

export interface UseChecksumReturn {
  loading: Ref<boolean>;
  hash: Ref<string>;
  algorithm: Ref<Algorithm>;
  algorithms: Algorithm[];
  setFileInfo: (info: FileInfo) => void;
  fetchChecksum: (
    algorithmType: string,
    byteStart?: number | null,
    byteEnd?: number | null,
  ) => Promise<string>;
  resetChecksum: () => void;
}

/**
 *
 */
export function useChecksum(): UseChecksumReturn {
  const loading = ref<boolean>(false);
  const hash = ref<string>("");
  const algorithm = ref<Algorithm>(algorithms[0] as Algorithm);
  const fileInfo = ref<FileInfo | null>(null);

  const setFileInfo = (info: FileInfo): void => {
    fileInfo.value = info;
  };

  const fetchChecksum = async (
    algorithmType: string,
    byteStart: number | null = null,
    byteEnd: number | null = null,
  ): Promise<string> => {
    loading.value = true;

    const info = fileInfo.value;
    const source = info ? `${info.path}/${info.name}` : "";

    const url = generateUrl("/apps/checksum/check");
    const params: Record<string, string | number> = {
      source,
      type: algorithmType,
    };

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
        error.response?.data?.msg ||
        t("checksum", "Error calculating checksum.");
      throw new Error(errorMsg);
    }
  };

  const resetChecksum = (): void => {
    loading.value = false;
    algorithm.value = algorithms[0] as Algorithm;
    hash.value = "";
  };

  return {
    loading,
    hash,
    algorithm,
    algorithms,
    setFileInfo,
    fetchChecksum,
    resetChecksum,
  };
}
