import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChecksum } from '@/composables/useChecksum'
import axios from '@nextcloud/axios'

// Mock axios
vi.mock('@nextcloud/axios')

// Mock @nextcloud/router
vi.mock('@nextcloud/router', () => ({
	generateUrl: (url: string) => url,
}))

// Mock @nextcloud/l10n
vi.mock('@nextcloud/l10n', () => ({
	translate: (app: string, text: string) => text,
}))

describe('useChecksum', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should initialize with correct default values', () => {
		const { loading, hash, algorithm, algorithms } = useChecksum()

		expect(loading.value).toBe(false)
		expect(hash.value).toBe('')
		expect(algorithm.value).toBeTruthy()
		expect(algorithms).toBeInstanceOf(Array)
		expect(algorithms.length).toBeGreaterThan(0)
	})

	it('should fetch checksum successfully', async () => {
		const { fetchChecksum, setFileInfo, hash, loading } = useChecksum()
		
		const mockResponse = {
			data: {
				response: 'success',
				msg: 'abc123def456',
			},
		}

		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

		setFileInfo({ path: '/path/to', name: 'file.txt', mimetype: 'text/plain' })

		const result = await fetchChecksum('md5')

		expect(result).toBe('abc123def456')
		expect(hash.value).toBe('abc123def456')
		expect(loading.value).toBe(false)
		expect(axios.get).toHaveBeenCalledWith('/apps/checksum/check', {
			params: {
				source: '/path/to/file.txt',
				type: 'md5',
			},
		})
	})

	it('should fetch checksum with byte range', async () => {
		const { fetchChecksum, setFileInfo } = useChecksum()
		
		const mockResponse = {
			data: {
				response: 'success',
				msg: 'partial_hash',
			},
		}

		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

		setFileInfo({ path: '/path/to', name: 'file.txt', mimetype: 'text/plain' })

		await fetchChecksum('sha256', 100, 200)

		expect(axios.get).toHaveBeenCalledWith('/apps/checksum/check', {
			params: {
				source: '/path/to/file.txt',
				type: 'sha256',
				byteStart: 100,
				byteEnd: 200,
			},
		})
	})

	it('should handle fetch error', async () => {
		const { fetchChecksum, setFileInfo, loading } = useChecksum()
		
		const mockError = {
			response: {
				data: {
					msg: 'File not found',
				},
			},
		}

		vi.mocked(axios.get).mockRejectedValueOnce(mockError)

		setFileInfo({ path: '/path/to', name: 'file.txt', mimetype: 'text/plain' })

		await expect(fetchChecksum('md5')).rejects.toThrow('File not found')
		expect(loading.value).toBe(false)
	})

	it('should reset checksum state', () => {
		const { resetChecksum, hash, loading, algorithm } = useChecksum()

		// Simulate some state changes
		hash.value = 'some_hash'
		loading.value = true

		resetChecksum()

		expect(hash.value).toBe('')
		expect(loading.value).toBe(false)
		expect(algorithm.value).toBeTruthy()
	})

	it('should set file info', () => {
		const { setFileInfo, fetchChecksum } = useChecksum()
		
		const fileInfo = {
			path: '/test/path',
			name: 'testfile.doc',
			mimetype: 'application/msword',
		}

		setFileInfo(fileInfo)

		const mockResponse = {
			data: {
				response: 'success',
				msg: 'hash_value',
			},
		}

		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

		fetchChecksum('sha1')

		expect(axios.get).toHaveBeenCalledWith('/apps/checksum/check', {
			params: {
				source: '/test/path/testfile.doc',
				type: 'sha1',
			},
		})
	})

	it('should handle fetch with null byte range parameters', async () => {
		const { fetchChecksum, setFileInfo } = useChecksum()
		
		const mockResponse = {
			data: {
				response: 'success',
				msg: 'full_hash',
			},
		}

		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse)

		setFileInfo({ path: '/path', name: 'file.txt', mimetype: 'text/plain' })

		await fetchChecksum('crc32', null, null)

		expect(axios.get).toHaveBeenCalledWith('/apps/checksum/check', {
			params: {
				source: '/path/file.txt',
				type: 'crc32',
			},
		})
	})
})

