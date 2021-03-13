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
	<Tab :id="id"
		:icon="icon"
		:name="name">
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
	</Tab>
</template>

<script>
import { generateUrl } from '@nextcloud/router'
import axios from '@nextcloud/axios'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
import Tab from '@nextcloud/vue/dist/Components/AppSidebarTab'
import Algorithms from '../model/Algorithms.ts'

export default {
	name: 'ChecksumTab20',

	components: {
		Tab,
		Multiselect,
	},

	mixins: [],

	props: {
		fileInfo: {
			type: Object,
			default: () => {},
			required: true,
		},
	},

	data() {
		return {
			// Enabled won't work as intended. This is a workaround for now.
			icon: (this.fileInfo.type === 'file') ? 'icon-category-auth' : '',
			name: t('checksum', 'Checksum'),
			loading: false,
			algorithm: Algorithms[0],
			algorithms: Algorithms,
			hash: '',
		}
	},

	computed: {
		/**
		 * Needed to differenciate the tabs
		 * pulled from the AppSidebarTab component.
		 *
		 * @returns {string}
		 */
		id() {
			return 'checksum'
		},

		/**
		 * Allow checksum only on files.
		 *
		 * @returns {boolean}
		 */
		enabled() {
			return (this.fileInfo.type === 'file')
		},

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
			this.algorithm = this.Algorithms[0]
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
