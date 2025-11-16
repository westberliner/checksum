import { createAppConfig } from '@nextcloud/vite-config'
import { join, resolve } from 'path'

const customConfig = {
	resolve: {
		alias: {
			'@': resolve('src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
			},
		},
	},
}
export default createAppConfig(
	{
		main: resolve(join('src', 'main.js')),
	},
	{
		inlineCSS: { relativeCSSInjection: true },
		config: customConfig,
	},
)