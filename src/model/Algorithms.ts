import { translate as t } from '@nextcloud/l10n'

export default [
	{ id: '', label: t('checksum', 'Choose Algorithm') },
	{ id: 'md5', label: 'MD5' },
	{ id: 'sha1', label: 'SHA1' },
	{ id: 'sha256', label: 'SHA256' },
	{ id: 'sha384', label: 'SHA384' },
	{ id: 'sha512', label: 'SHA512' },
	{ id: 'crc32', label: 'CRC32' },
	{ id: 'crc32b', label: 'CRC32b' },
]
