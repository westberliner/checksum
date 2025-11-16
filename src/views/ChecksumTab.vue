<!--
  - @copyright Copyright (c) 2021 Patrick Herzberg <patrick@westberliner.net>
  -
  - @author Patrick Herzberg <patrick@westberliner.net>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->
<template>
  <div>
    <!-- checksum content -->
    <br />
    <NcSelect
      v-model="algorithm"
      :options="algorithms"
      track-by="id"
      label="label"
      @update:modelValue="onAlgorithmChangeHandler"
    />
    <br />
    <br />
    
    <div class="byte-range-section">
      <NcButton
        :aria-label="showByteRange ? hideByteRangeLabel : showByteRangeLabel"
        @click="toggleByteRange"
      >
        {{ showByteRange ? '▼ ' + hideByteRangeLabel : '▶ ' + showByteRangeLabel }}
      </NcButton>
      
      <div v-if="showByteRange" class="byte-range-container">
        <div class="byte-range-inputs">
          <NcTextField
            v-model="byteStart"
            :label="byteStartLabel"
            :placeholder="byteStartPlaceholder"
            type="number"
            min="0"
            @update:modelValue="updateByteStart"
          />
          <NcTextField
            v-model="byteEnd"
            :label="byteEndLabel"
            :placeholder="byteEndPlaceholder"
            type="number"
            min="0"
            @update:modelValue="updateByteEnd"
          />
        </div>
        <p v-if="rangeError" class="range-error">{{ rangeError }}</p>
      </div>
    </div>
    <br />
    
    <NcLoadingIcon v-if="loading" :size="40" />
    <p v-else class="checksum-hash-result" @click="copyToClipboard(hash)">
      <span v-if="!loading && algorithm && algorithm.id !== ''">
        <strong>{{ algorithm.label }}:<br /></strong>
        <span>{{ hash }}</span>
      </span>
    </p>
    <input
      :disabled="true"
      style="opacity: 0"
      id="checksum-hash"
      :value="hash"
    />
    <p v-if="copied">{{ copyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { translate as t } from "@nextcloud/l10n";
import { NcLoadingIcon, NcSelect, NcTextField, NcButton } from "@nextcloud/vue";
import { useChecksum } from "../composables/useChecksum";
import { useByteRange } from "../composables/useByteRange";
import { useClipboard } from "../composables/useClipboard";
import type { Algorithm, FileInfo } from "../types";

defineOptions({
  name: "ChecksumTab",
});

const {
  loading,
  hash,
  algorithm,
  algorithms,
  fetchChecksum,
  resetChecksum,
  setFileInfo,
} = useChecksum();

const {
  byteStart,
  byteEnd,
  rangeError,
  showByteRange,
  parsedByteStart,
  parsedByteEnd,
  validateByteRange,
  toggleByteRange,
  resetByteRange,
  clearError,
} = useByteRange();

const { copied, copyToClipboard, resetCopied } = useClipboard();

const copyMessage = t("checksum", "Hash copied to clipboard.");
const byteStartLabel = t("checksum", "Start Byte");
const byteEndLabel = t("checksum", "End Byte");
const byteStartPlaceholder = t("checksum", "e.g., 0");
const byteEndPlaceholder = t("checksum", "e.g., 1024");
const showByteRangeLabel = t("checksum", "Advanced: Byte Range");
const hideByteRangeLabel = t("checksum", "Hide Byte Range");

/**
 * Update current fileInfo and fetch new data.
 */
const update = (info: FileInfo): void => {
  resetState();
  setFileInfo(info);
};

/**
 * Handles selection change event by triggering hash ajax call.
 */
const onAlgorithmChangeHandler = async (selectedAlgorithm: Algorithm): Promise<void> => {
  hash.value = "";
  resetCopied();
  
  if (selectedAlgorithm && selectedAlgorithm.id.length) {
    await calculateChecksum(selectedAlgorithm.id);
  }
};

/**
 * Calculate the checksum with current byte range settings.
 */
const calculateChecksum = async (algorithmType: string): Promise<void> => {
  if (!validateByteRange()) {
    return;
  }

  try {
    await fetchChecksum(algorithmType, parsedByteStart.value, parsedByteEnd.value);
  } catch (err) {
    rangeError.value = (err as Error).message;
  }
};

/**
 * Updates the byte start value.
 */
const updateByteStart = (value: string | number): void => {
  byteStart.value = String(value);
  onByteRangeChange();
};

/**
 * Updates the byte end value.
 */
const updateByteEnd = (value: string | number): void => {
  byteEnd.value = String(value);
  onByteRangeChange();
};

/**
 * Handles byte range input changes.
 */
const onByteRangeChange = async (): Promise<void> => {
  clearError();
  
  if (algorithm.value && algorithm.value.id.length) {
    hash.value = "";
    resetCopied();
    await calculateChecksum(algorithm.value.id);
  }
};

/**
 * Reset the current view to its default state.
 */
const resetState = (): void => {
  resetChecksum();
  resetByteRange();
  resetCopied();
};

defineExpose({
  update,
});
</script>

<style lang="scss" scoped>
.checksum-hash-result {
  text-align: left;
  word-wrap: break-word;
  cursor: pointer;
  span {
    cursor: pointer;
  }
}
#checksum-hash {
  cursor: default;
}

.byte-range-section {
  margin: 8px 0;
}

.byte-range-container {
  margin: 16px 0;
  padding-left: 8px;
  
  .byte-range-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 12px;
  }
  
  .range-error {
    color: var(--color-error);
    margin-top: 8px;
    font-size: 14px;
  }
}
</style>
