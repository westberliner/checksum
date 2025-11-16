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
        type="tertiary"
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
    <p v-else class="checksum-hash-result" @click="clipboard">
      <span v-if="!loading && algorithm && algorithm.id !== ''">
        <strong>{{ algorithm.label }}:<br /></strong>
        <span>{{ hash }}</span>
      </span>
    </p>
    <input
      disabled="disabled"
      style="opacity: 0"
      id="checksum-hash"
      :value="hash"
    />
    <p v-if="copied">{{ copyMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { generateUrl } from "@nextcloud/router";
import { translate as t } from "@nextcloud/l10n";
import axios from "@nextcloud/axios";
import { NcLoadingIcon, NcSelect, NcTextField, NcButton } from "@nextcloud/vue";
import algorithms from "../Model/Algorithms";

defineOptions({
  name: "ChecksumTab",
});

const loading = ref(false);
const copied = ref(false);
const algorithm = ref(algorithms[0]);
const hash = ref("");
const byteStart = ref("");
const byteEnd = ref("");
const rangeError = ref("");
const showByteRange = ref(false);
const fileInfo = ref(null);

const copyMessage = t("checksum", "Hash copied to clipboard.");
const byteStartLabel = t("checksum", "Start Byte");
const byteEndLabel = t("checksum", "End Byte");
const byteStartPlaceholder = t("checksum", "e.g., 0");
const byteEndPlaceholder = t("checksum", "e.g., 1024");
const showByteRangeLabel = t("checksum", "Advanced: Byte Range");
const hideByteRangeLabel = t("checksum", "Hide Byte Range");

/**
 * @param {Object} info - The current file FileInfo.
 */
const update = (info) => {
  resetState();
  fileInfo.value = info;
};

/**
 * Handles selection change event by triggering hash ajax call.
 *
 * @param {Object} selectedAlgorithm - The selected algorithm object.
 * @param {string} selectedAlgorithm.id - The selected algorithm id.
 * @param {string} selectedAlgorithm.label - The selected algorithm label.
 */
const onAlgorithmChangeHandler = (selectedAlgorithm) => {
  hash.value = "";
  copied.value = false;
  if (selectedAlgorithm && selectedAlgorithm.id.length) {
    loading.value = true;
    copied.value = false;
    getChecksum(selectedAlgorithm.id);
  }
};

/**
 * Handles byte range input changes.
 */
const onByteRangeChange = () => {
  rangeError.value = "";
  validateByteRange();

  // Recalculate checksum if algorithm is selected
  if (algorithm.value && algorithm.value.id.length) {
    hash.value = "";
    copied.value = false;
    loading.value = true;
    getChecksum(algorithm.value.id);
  }
};

/**
 * Updates the byte start value.
 * @param {string} value - The new byte start value.
 */
const updateByteStart = (value) => {
  byteStart.value = value;
  onByteRangeChange();
};

/**
 * Updates the byte end value.
 * @param {string} value - The new byte end value.
 */
const updateByteEnd = (value) => {
  byteEnd.value = value;
  onByteRangeChange();
};

/**
 * Toggles the visibility of the byte range section.
 */
const toggleByteRange = () => {
  showByteRange.value = !showByteRange.value;
};

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

  return true;
};

/**
 * Fetches the checksum from the server.
 * @param {string} algorithmType - The hash algorithm type.
 */
const getChecksum = (algorithmType) => {
  // Validate byte range before making request
  if (!validateByteRange()) {
    loading.value = false;
    return;
  }

  const url = generateUrl("/apps/checksum/check");
  const params = {
    source: `${fileInfo.value.path}/${fileInfo.value.name}`,
    type: algorithmType,
  };

  // Add byte range parameters if they are set
  if (byteStart.value !== "") {
    params.byteStart = parseInt(byteStart.value, 10);
  }
  if (byteEnd.value !== "") {
    params.byteEnd = parseInt(byteEnd.value, 10);
  }

  axios
    .get(url, { params })
    .then((response) => {
      loading.value = false;
      hash.value = response.data.msg;
    })
    .catch((err) => {
      console.error(err);
      loading.value = false;
      rangeError.value =
        err.response?.data?.msg || t("checksum", "Error calculating checksum.");
    });
};

/**
 * Copies the hash to clipboard.
 */
const clipboard = async () => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(hash.value);
  } else {
    const copyText = document.querySelector("#checksum-hash");
    copyText.select();
    document.execCommand("copy");
  }

  copied.value = true;
};

/**
 * Reset the current view to its default state.
 */
const resetState = () => {
  loading.value = false;
  copied.value = false;
  algorithm.value = algorithms[0];
  hash.value = "";
  byteStart.value = "";
  byteEnd.value = "";
  rangeError.value = "";
};

// Expose methods for parent component to call
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
