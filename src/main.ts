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


/// <reference types="@nextcloud/typings" />

declare var OC: Nextcloud.v20.OC
declare var window: Nextcloud.v20.WindowWithGlobals
declare var OCA: Checksum.OCA

import Vue from 'vue'
import { translate as t } from '@nextcloud/l10n'
import ChecksumTab from './views/ChecksumTab.vue'

let tabInstance: Checksum.VueElement | null = null

window.addEventListener('DOMContentLoaded', function() {
	if (OCA.Files && OCA.Files.Sidebar) {
		const checksumTab = new OCA.Files.Sidebar.Tab({
			id: 'checksum',
			name: t('checksum', 'Checksum'),
			icon: 'icon-category-auth',

			mount(el: HTMLElement, fileInfo: Checksum.FileInfo, context: any) {
				if (tabInstance) {
					tabInstance.$destroy()
				}
				tabInstance = new ChecksumTab({
					// Better integration with vue parent component
					parent: context,
				})
				// Only mount after we have all the info we need
				tabInstance.update(fileInfo)
				tabInstance.$mount(el)
			},
			update(fileInfo: Checksum.FileInfo) {
				tabInstance?.update(fileInfo)
			},
			destroy() {
				tabInstance?.$destroy()
				tabInstance = null
			},
			enabled(fileInfo: Checksum.FileInfo): boolean {
				return (fileInfo.type === 'file')
			},
		})
		OCA.Files.Sidebar.registerTab(checksumTab)
	}
})
