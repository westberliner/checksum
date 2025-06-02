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
		<br>
		<NcSelect
			v-model="algorithm"
			:options="algorithms"
			track-by="id"
			label="label"
			@update:modelValue="onAlgorithmChangeHandler" />
		<br>
		<br>
		<NcLoadingIcon v-if="loading" :size="40" />
		<p v-else class="checksum-hash-result" @click="clipboard">
			<span v-if="!loading && algorithm && algorithm.id !== ''">
				<strong>{{ algorithm.label }}:<br></strong>
				<span>{{ hash }}</span>
			</span>
		</p>
		<input disabled="disabled" style="opacity: 0;" id="checksum-hash" :value="hash" />
		<p v-if="copied">{{ copyMessage }}</p>
	</div>
</template>

<script>
import { generateUrl } from '@nextcloud/router'
import axios from '@nextcloud/axios'
import { NcLoadingIcon, NcSelect } from '@nextcloud/vue'
import algorithms from '../Model/Algorithms'

export default {
	name: 'ChecksumTab',

	components: {
		NcLoadingIcon,
		NcSelect,
	},

	mixins: [],

	data() {
		return {
			loading: false,
			copied: false,
			algorithm: algorithms[0],
			algorithms,
			hash: '',
			copyMessage: t('checksum', 'Hash copied to clipboard.')
		}
	},

	computed: {
		/**
		 * Returns the current active tab.
		 * Needed because AppSidebarTab also uses $parent.activeTab.
		 *
		 * @returns {string}
		 */
		activeTab() {
			return this.$parent.activeTab
		},

	},

	methods: {
		/**
     * Update current fileInfo and fetch new data.
     * @param {Object} fileInfo the current file FileInfo.
     */
		update(fileInfo) {
			this.resetState()
			this.fileInfo = fileInfo
		},

		/**
		 * Handles selection change event by triggering hash ajax call.
		 *
		 * @param {Object} algorithm - The selected algorithm object.
		 * @param {string} algorithm.id - The selected algorithm id.
		 * @param {string} algorithm.label - The selected algorithm label.
		 */
		onAlgorithmChangeHandler(algorithm) {
			this.hash = ''
			this.copied = false
			if (algorithm && algorithm.id.length) {
				this.loading = true
				this.copied = false
				this.getChecksum(algorithm.id)
			}
		},

		/**
		 * @param {string} algorithmType - The hash algorithm type.
		 */
		getChecksum(algorithmType) {
			const url = generateUrl('/apps/checksum/check')
			const params = { source: `${this.fileInfo.path}/${this.fileInfo.name}`, type: algorithmType }
			axios.get(url, { params }).then(response => {
				this.loading = false
				this.hash = response.data.msg
			}).catch(err => {
				console.error(err)
			})
		},

		/**
		 * @param {string} hash - The hash result.
		 */
		async clipboard() {
			if (navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(this.hash)
			} else {
				const copyText = document.querySelector('#checksum-hash')
				copyText.select()
				document.execCommand('copy')
			}

			this.copied = true
		},

		/**
		 * Reset the current view to its default state
		 */
		resetState() {
			this.loading = false
			this.copied = false
			this.algorithm = algorithms[0]
			this.hash = ''
		},
	},
}
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
</style>
