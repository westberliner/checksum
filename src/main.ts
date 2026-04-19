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
import { getSidebar, FileType } from "@nextcloud/files";
import { defineCustomElement } from "vue";
import { translate as t } from "@nextcloud/l10n";
import ChecksumTabComponent from "./views/ChecksumTab.vue";

const HASH_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3L7.5 21H9.5L11.5 3H9.5M15.5 3L13.5 21H15.5L17.5 3H15.5M4 8V10H20V8H4M4 14V16H20V14H4Z"/></svg>';

getSidebar().registerTab({
  id: "checksum",
  displayName: t("checksum", "Checksum"),
  iconSvgInline: HASH_ICON,
  order: 50,
  tagName: "checksum-files-sidebar-tab",
  enabled: ({ node }) => node.type === FileType.File,
  onInit() {
    const ChecksumTabElement = defineCustomElement(ChecksumTabComponent, {
      shadowRoot: false,
    });
    customElements.define("checksum-files-sidebar-tab", ChecksumTabElement);
    return Promise.resolve();
  },
});
