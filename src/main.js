/**
 * @copyright Copyright (C) 2020 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import {translate as t} from '@nextcloud/l10n'
import ChecksumTab from './ChecksumTab'

let tabInstance = null
const checksumTab = new OCA.Files.Sidebar.Tab({
  id: 'checksumTabView',
  name: t('checksum', 'Checksum'),
  icon: 'icon-category-auth',

  enabled(fileInfo) {
    return fileInfo && !fileInfo.isDirectory()
  },

  mount(el, fileInfo, context) {
    if (!tabInstance) {
      tabInstance = new ChecksumTab(el)
    }
    tabInstance.render(fileInfo)
  },

  update(fileInfo) {
    tabInstance.render(fileInfo)
  },

  destroy() {
    tabInstance = null
  },
})

window.addEventListener('DOMContentLoaded', function() {
  if (OCA.Files && OCA.Files.Sidebar) {
    OCA.Files.Sidebar.registerTab(checksumTab)
  }
})
