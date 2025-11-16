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
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { createApp, type App } from 'vue'
import { translate as t } from '@nextcloud/l10n'
import ChecksumTab from './views/ChecksumTab.vue'
import type { FileInfo } from './types'

// Define the sidebar tab configuration
interface SidebarTabConfig {
	id: string
	name: string
	icon: string
	mount: (el: HTMLElement, fileInfo: FileInfo, context: unknown) => void
	update: (fileInfo: FileInfo) => void
	destroy: () => void
	enabled: (fileInfo: FileInfo) => boolean
}

// Define the sidebar tab interface
interface SidebarTab {
	id: string
	name: string
	icon: string
	mount: (el: HTMLElement, fileInfo: FileInfo, context: unknown) => void
	update: (fileInfo: FileInfo) => void
	destroy: () => void
	enabled: (fileInfo: FileInfo) => boolean
}

// Extend global Window interface
declare global {
	interface Window {
		OCA: {
			Files?: {
				Sidebar?: {
					Tab: new (config: SidebarTabConfig) => SidebarTab
					registerTab: (tab: SidebarTab) => void
				}
			}
		}
	}
}

// Define the ChecksumTab component instance type
interface ChecksumTabInstance {
	update: (fileInfo: FileInfo) => void
}

let tabApp: App<Element> | null = null
let tabVm: ChecksumTabInstance | null = null

window.addEventListener('DOMContentLoaded', () => {
	if (window.OCA?.Files?.Sidebar) {
		const checksumTab = new window.OCA.Files.Sidebar.Tab({
			id: 'checksum',
			name: t('checksum', 'Checksum'),
			icon: 'icon-category-auth',

			mount(el: HTMLElement, fileInfo: FileInfo): void {
				// Destroy old tab if present
				tabApp?.unmount()

				tabApp = createApp(ChecksumTab)
				const vm = tabApp.mount(el) as unknown as ChecksumTabInstance
				tabVm = vm
				tabVm.update(fileInfo)
			},
			update(fileInfo: FileInfo): void {
				tabVm?.update(fileInfo)
			},
			destroy(): void {
				tabApp?.unmount()
				tabApp = null
				tabVm = null
			},
			enabled(fileInfo: FileInfo): boolean {
				return fileInfo.type === 'file'
			},
		})
		window.OCA.Files.Sidebar.registerTab(checksumTab)
	}
})
