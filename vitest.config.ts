import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	test: {
		globals: true,
		environment: 'happy-dom',
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'**/*.spec.ts',
				'**/*.test.ts',
			],
		},
	},
})

