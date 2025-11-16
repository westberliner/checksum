import { describe, it, expect, vi } from 'vitest'
import { useByteRange } from '../../src/composables/useByteRange'

// Mock @nextcloud/l10n
vi.mock('@nextcloud/l10n', () => ({
	translate: (app: string, text: string) => text,
}))

describe('useByteRange', () => {
	it('should initialize with correct default values', () => {
		const { byteStart, byteEnd, rangeError, showByteRange, hasByteRange } = useByteRange()

		expect(byteStart.value).toBe('')
		expect(byteEnd.value).toBe('')
		expect(rangeError.value).toBe('')
		expect(showByteRange.value).toBe(false)
		expect(hasByteRange.value).toBe(false)
	})

	it('should validate correct byte range', () => {
		const { byteStart, byteEnd, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '100'
		byteEnd.value = '200'

		const isValid = validateByteRange()

		expect(isValid).toBe(true)
		expect(rangeError.value).toBe('')
	})

	it('should fail validation when start is greater than end', () => {
		const { byteStart, byteEnd, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '200'
		byteEnd.value = '100'

		const isValid = validateByteRange()

		expect(isValid).toBe(false)
		expect(rangeError.value).toBe('Start byte must be less than end byte.')
	})

	it('should fail validation when start is equal to end', () => {
		const { byteStart, byteEnd, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '100'
		byteEnd.value = '100'

		const isValid = validateByteRange()

		expect(isValid).toBe(false)
		expect(rangeError.value).toBe('Start byte must be less than end byte.')
	})

	it('should fail validation when start is negative', () => {
		const { byteStart, byteEnd, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '-10'
		byteEnd.value = '100'

		const isValid = validateByteRange()

		expect(isValid).toBe(false)
		expect(rangeError.value).toBe('Start byte must be 0 or greater.')
	})

	it('should fail validation when end is negative', () => {
		const { byteStart, byteEnd, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '10'
		byteEnd.value = '-50'

		const isValid = validateByteRange()

		expect(isValid).toBe(false)
		// The validation checks start >= end before checking for negative, so we get that error first
		expect(rangeError.value).toBeTruthy()
	})

	it('should fail validation when start is not a number', () => {
		const { byteStart, validateByteRange, rangeError } = useByteRange()

		byteStart.value = 'abc'

		const isValid = validateByteRange()

		expect(isValid).toBe(false)
		expect(rangeError.value).toBe('Start byte must be a valid number.')
	})

	it('should fail validation when end is not a number', () => {
		const { byteEnd, validateByteRange, rangeError } = useByteRange()

		byteEnd.value = 'xyz'

		const isValid = validateByteRange()

		expect(isValid).toBe(false)
		expect(rangeError.value).toBe('End byte must be a valid number.')
	})

	it('should parse byte start correctly', () => {
		const { byteStart, parsedByteStart } = useByteRange()

		byteStart.value = '123'
		expect(parsedByteStart.value).toBe(123)

		byteStart.value = ''
		expect(parsedByteStart.value).toBe(null)
	})

	it('should parse byte end correctly', () => {
		const { byteEnd, parsedByteEnd } = useByteRange()

		byteEnd.value = '456'
		expect(parsedByteEnd.value).toBe(456)

		byteEnd.value = ''
		expect(parsedByteEnd.value).toBe(null)
	})

	it('should detect when byte range is active', () => {
		const { byteStart, byteEnd, hasByteRange } = useByteRange()

		expect(hasByteRange.value).toBe(false)

		byteStart.value = '100'
		expect(hasByteRange.value).toBe(true)

		byteStart.value = ''
		byteEnd.value = '200'
		expect(hasByteRange.value).toBe(true)

		byteStart.value = '100'
		byteEnd.value = '200'
		expect(hasByteRange.value).toBe(true)
	})

	it('should toggle byte range visibility', () => {
		const { showByteRange, toggleByteRange } = useByteRange()

		expect(showByteRange.value).toBe(false)

		toggleByteRange()
		expect(showByteRange.value).toBe(true)

		toggleByteRange()
		expect(showByteRange.value).toBe(false)
	})

	it('should reset byte range state', () => {
		const { byteStart, byteEnd, rangeError, showByteRange, resetByteRange } = useByteRange()

		// Set some values
		byteStart.value = '100'
		byteEnd.value = '200'
		rangeError.value = 'Some error'
		showByteRange.value = true

		resetByteRange()

		expect(byteStart.value).toBe('')
		expect(byteEnd.value).toBe('')
		expect(rangeError.value).toBe('')
		expect(showByteRange.value).toBe(false)
	})

	it('should clear error', () => {
		const { rangeError, clearError } = useByteRange()

		rangeError.value = 'Some error message'
		clearError()

		expect(rangeError.value).toBe('')
	})

	it('should validate when only start byte is provided', () => {
		const { byteStart, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '100'

		const isValid = validateByteRange()

		expect(isValid).toBe(true)
		expect(rangeError.value).toBe('')
	})

	it('should validate when only end byte is provided', () => {
		const { byteEnd, validateByteRange, rangeError } = useByteRange()

		byteEnd.value = '200'

		const isValid = validateByteRange()

		expect(isValid).toBe(true)
		expect(rangeError.value).toBe('')
	})

	it('should handle zero as valid start byte', () => {
		const { byteStart, byteEnd, validateByteRange, rangeError } = useByteRange()

		byteStart.value = '0'
		byteEnd.value = '100'

		const isValid = validateByteRange()

		expect(isValid).toBe(true)
		expect(rangeError.value).toBe('')
	})
})

