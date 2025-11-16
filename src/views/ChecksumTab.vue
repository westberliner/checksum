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
            :value="byteStart"
            :label="byteStartLabel"
            :placeholder="byteStartPlaceholder"
            type="number"
            min="0"
            @update:value="updateByteStart"
          />
          <NcTextField
            :value="byteEnd"
            :label="byteEndLabel"
            :placeholder="byteEndPlaceholder"
            type="number"
            min="0"
            @update:value="updateByteEnd"
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

<script>
import { generateUrl } from "@nextcloud/router";
import axios from "@nextcloud/axios";
import { NcLoadingIcon, NcSelect, NcTextField, NcButton } from "@nextcloud/vue";
import algorithms from "../Model/Algorithms";

export default {
  name: "ChecksumTab",

  components: {
    NcLoadingIcon,
    NcSelect,
    NcTextField,
    NcButton,
  },

  mixins: [],

  data() {
    return {
      loading: false,
      copied: false,
      algorithm: algorithms[0],
      algorithms,
      hash: "",
      copyMessage: t("checksum", "Hash copied to clipboard."),
      byteStart: "",
      byteEnd: "",
      rangeError: "",
      showByteRange: false,
      byteRangeLabel: t("checksum", "Byte Range (Optional)"),
      byteStartLabel: t("checksum", "Start Byte"),
      byteEndLabel: t("checksum", "End Byte"),
      byteStartPlaceholder: t("checksum", "e.g., 0"),
      byteEndPlaceholder: t("checksum", "e.g., 1024"),
      showByteRangeLabel: t("checksum", "Advanced: Byte Range"),
      hideByteRangeLabel: t("checksum", "Hide Byte Range"),
    };
  },

  computed: {
    /**
     * Returns the current active tab.
     * Needed because AppSidebarTab also uses $parent.activeTab.
     *
     * @returns {string}
     */
    activeTab() {
      return this.$parent.activeTab;
    },
  },

  methods: {
    /**
     * Update current fileInfo and fetch new data.
     * @param {Object} fileInfo the current file FileInfo.
     */
    update(fileInfo) {
      this.resetState();
      this.fileInfo = fileInfo;
    },

    /**
     * Handles selection change event by triggering hash ajax call.
     *
     * @param {Object} algorithm - The selected algorithm object.
     * @param {string} algorithm.id - The selected algorithm id.
     * @param {string} algorithm.label - The selected algorithm label.
     */
    onAlgorithmChangeHandler(algorithm) {
      this.hash = "";
      this.copied = false;
      if (algorithm && algorithm.id.length) {
        this.loading = true;
        this.copied = false;
        this.getChecksum(algorithm.id);
      }
    },

    /**
     * Handles byte range input changes.
     */
    onByteRangeChange() {
      this.rangeError = "";
      this.validateByteRange();
      
      // Recalculate checksum if algorithm is selected
      if (this.algorithm && this.algorithm.id.length) {
        this.hash = "";
        this.copied = false;
        this.loading = true;
        this.getChecksum(this.algorithm.id);
      }
    },

    /**
     * Updates the byte start value.
     * @param {string} value - The new byte start value.
     */
    updateByteStart(value) {
      this.byteStart = value;
      this.onByteRangeChange();
    },

    /**
     * Updates the byte end value.
     * @param {string} value - The new byte end value.
     */
    updateByteEnd(value) {
      this.byteEnd = value;
      this.onByteRangeChange();
    },

    /**
     * Toggles the visibility of the byte range section.
     */
    toggleByteRange() {
      this.showByteRange = !this.showByteRange;
    },

    /**
     * Validates the byte range inputs.
     */
    validateByteRange() {
      const start = parseInt(this.byteStart, 10);
      const end = parseInt(this.byteEnd, 10);

      if (this.byteStart !== "" && isNaN(start)) {
        this.rangeError = t("checksum", "Start byte must be a valid number.");
        return false;
      }

      if (this.byteEnd !== "" && isNaN(end)) {
        this.rangeError = t("checksum", "End byte must be a valid number.");
        return false;
      }

      if (this.byteStart !== "" && this.byteEnd !== "" && start >= end) {
        this.rangeError = t("checksum", "Start byte must be less than end byte.");
        return false;
      }

      if (this.byteStart !== "" && start < 0) {
        this.rangeError = t("checksum", "Start byte must be 0 or greater.");
        return false;
      }

      if (this.byteEnd !== "" && end < 0) {
        this.rangeError = t("checksum", "End byte must be 0 or greater.");
        return false;
      }

      return true;
    },

    /**
     * @param {string} algorithmType - The hash algorithm type.
     */
    getChecksum(algorithmType) {
      // Validate byte range before making request
      if (!this.validateByteRange()) {
        this.loading = false;
        return;
      }

      const url = generateUrl("/apps/checksum/check");
      const params = {
        source: `${this.fileInfo.path}/${this.fileInfo.name}`,
        type: algorithmType,
      };
      
      // Add byte range parameters if they are set
      if (this.byteStart !== "") {
        params.byteStart = parseInt(this.byteStart, 10);
      }
      if (this.byteEnd !== "") {
        params.byteEnd = parseInt(this.byteEnd, 10);
      }

      axios
        .get(url, { params })
        .then((response) => {
          this.loading = false;
          this.hash = response.data.msg;
        })
        .catch((err) => {
          console.error(err);
          this.loading = false;
          this.rangeError = err.response?.data?.msg || t("checksum", "Error calculating checksum.");
        });
    },

    /**
     * @param {string} hash - The hash result.
     */
    async clipboard() {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.hash);
      } else {
        const copyText = document.querySelector("#checksum-hash");
        copyText.select();
        document.execCommand("copy");
      }

      this.copied = true;
    },

    /**
     * Reset the current view to its default state
     */
    resetState() {
      this.loading = false;
      this.copied = false;
      this.algorithm = algorithms[0];
      this.hash = "";
      this.byteStart = "";
      this.byteEnd = "";
      this.rangeError = "";
    },
  },
};
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
