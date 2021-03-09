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
		<Multiselect
			v-model="algorithm"
			:options="algorithms"
			track-by="id"
			label="label"
			@change="onAlgorithmChangeHandler" />
		<br>
		<br>
		<p :class="{ 'icon-loading': loading }" class="checksum-hash-result">
			<span v-if="!loading && algorithm.id !== ''"><strong>{{ algorithm.label }}:</strong>{{ hash }}</span>
		</p>
	</div>
</template>

<script>
import { generateUrl } from '@nextcloud/router'
import axios from '@nextcloud/axios'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
import algorithms from '../Model/Algorithms'

export default {
	name: 'ChecksumTab',

	components: {
		Multiselect,
	},

	mixins: [],

	data() {
		return {
			loading: false,
			algorithm: algorithms[0],
			algorithms,
			hash: '',
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
			if (algorithm.id.length) {
				this.loading = true
				this.getChecksum(algorithm.id)
			}
		},

		/**
		 * @param {string} algorithmType - The hasg algorithm type.
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
		 * Reset the current view to its default state
		 */
		resetState() {
			this.loading = false
			this.algorithm = algorithms[0]
			this.hash = ''
		},
	},
}
</script>

<style lang="scss" scoped>
	.checksum-hash-result {
		text-align: center;
		word-wrap: break-word;
	}
</style>
