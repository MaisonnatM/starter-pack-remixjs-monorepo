import plugin from 'tailwindcss/plugin.js'
import { extendedTheme } from './extended-theme.ts'

export const shadcnPlugin = plugin(
	function ({ addBase }) {
		addBase({
			':root': {},
			'.dark': {},
		})

		addBase({
			'*': {},
			body: {
				'font-feature-settings': '"rlig" 1, "calt" 1',
			},
		})
	},
	{
		theme: {
			extend: extendedTheme,
		},
	},
)
