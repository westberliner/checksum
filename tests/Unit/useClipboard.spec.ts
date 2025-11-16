import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useClipboard } from '../../src/composables/useClipboard'

describe('useClipboard', () => {
	let originalClipboard: Clipboard | undefined

	beforeEach(() => {
		vi.useFakeTimers()
		originalClipboard = navigator.clipboard
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
		// Restore original clipboard
		Object.defineProperty(navigator, 'clipboard', {
			value: originalClipboard,
			writable: true,
			configurable: true,
		})
	})

	it('should initialize with correct default values', () => {
		const { copied } = useClipboard()

		expect(copied.value).toBe(false)
	})

	it('should copy text to clipboard using modern API', async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined)
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: mockWriteText,
			},
			writable: true,
			configurable: true,
		})

		const { copyToClipboard, copied } = useClipboard()

		await copyToClipboard('test text')

		expect(mockWriteText).toHaveBeenCalledWith('test text')
		expect(copied.value).toBe(true)
	})

	it('should auto-reset copied state after 3 seconds', async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined)
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: mockWriteText,
			},
			writable: true,
			configurable: true,
		})

		const { copyToClipboard, copied } = useClipboard()

		await copyToClipboard('test text')

		expect(copied.value).toBe(true)

		// Fast-forward time by 3 seconds
		vi.advanceTimersByTime(3000)

		expect(copied.value).toBe(false)
	})

	it('should reset copied state manually', async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined)
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: mockWriteText,
			},
			writable: true,
			configurable: true,
		})

		const { copyToClipboard, copied, resetCopied } = useClipboard()

		await copyToClipboard('test text')

		expect(copied.value).toBe(true)

		resetCopied()

		expect(copied.value).toBe(false)
	})

	it('should use fallback method when clipboard API is not available', async () => {
		// Mock document.execCommand
		const mockExecCommand = vi.fn()
		document.execCommand = mockExecCommand

		// Mock the input element
		const mockSelect = vi.fn()
		const mockElement = { select: mockSelect } as unknown as HTMLInputElement
		const mockQuerySelector = vi.spyOn(document, 'querySelector').mockReturnValue(mockElement)

		// Remove clipboard API
		Object.defineProperty(navigator, 'clipboard', {
			value: undefined,
			writable: true,
			configurable: true,
		})

		const { copyToClipboard, copied } = useClipboard()

		await copyToClipboard('test text', '#test-input')

		expect(mockQuerySelector).toHaveBeenCalledWith('#test-input')
		expect(mockSelect).toHaveBeenCalled()
		expect(mockExecCommand).toHaveBeenCalledWith('copy')
		expect(copied.value).toBe(true)

		mockQuerySelector.mockRestore()
	})

	it('should handle errors gracefully', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		const mockWriteText = vi.fn().mockRejectedValue(new Error('Copy failed'))
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: mockWriteText,
			},
			writable: true,
			configurable: true,
		})

		const { copyToClipboard } = useClipboard()

		await copyToClipboard('test text')

		expect(consoleError).toHaveBeenCalledWith(
			'Failed to copy to clipboard:',
			expect.any(Error)
		)

		consoleError.mockRestore()
	})

	it('should handle missing fallback element', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		const mockQuerySelector = vi.spyOn(document, 'querySelector').mockReturnValue(null)

		// Remove clipboard API
		Object.defineProperty(navigator, 'clipboard', {
			value: undefined,
			writable: true,
			configurable: true,
		})

		const { copyToClipboard, copied } = useClipboard()

		await copyToClipboard('test text', '#missing-element')

		// Should not throw, but copied should still be set to true
		expect(copied.value).toBe(true)

		mockQuerySelector.mockRestore()
		consoleError.mockRestore()
	})

	it('should use default fallback selector', async () => {
		const mockSelect = vi.fn()
		const mockElement = { select: mockSelect } as unknown as HTMLInputElement
		const mockQuerySelector = vi.spyOn(document, 'querySelector').mockReturnValue(mockElement)
		const mockExecCommand = vi.fn()
		document.execCommand = mockExecCommand

		// Remove clipboard API
		Object.defineProperty(navigator, 'clipboard', {
			value: undefined,
			writable: true,
			configurable: true,
		})

		const { copyToClipboard } = useClipboard()

		await copyToClipboard('test text')

		expect(mockQuerySelector).toHaveBeenCalledWith('#checksum-hash')

		mockQuerySelector.mockRestore()
	})
})
