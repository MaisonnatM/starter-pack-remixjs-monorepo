import defaultTheme from 'tailwindcss/defaultTheme.js'
import plugin from 'tailwindcss/plugin.js'
import { extendedTheme } from './extended-theme.ts'

export const shadcnPlugin = plugin(
	function ({ addBase }) {
		addBase({
			':root': {
				colorScheme: 'light',
				'--background': '0 0% 100%',
				'--foreground': '222.2 47.4% 11.2%',
				'--muted': '210 40% 96.1%',
				'--muted-foreground': '215.4 16.3% 46.9%',
				'--popover': '0 0% 100%',
				'--popover-foreground': '222.2 47.4% 11.2%',
				'--border': '214.3 31.8% 91.4%',
				'--input': '214.3 31.8% 91.4%',
				'--card': '0 0% 100%',
				'--card-foreground': '222.2 47.4% 11.2%',
				'--primary': '222.2 47.4% 11.2%',
				'--primary-foreground': '210 40% 98%',
				'--secondary': '210 40% 96.1%',
				'--secondary-foreground': '222.2 47.4% 11.2%',
				'--accent': '210 40% 90%',
				'--accent-foreground': '222.2 47.4% 11.2%',
				'--destructive': '0 100% 50%',
				'--destructive-foreground': '210 40% 98%',
				'--ring': '215 20.2% 65.1%',
				'--radius': '0.5rem',
			},
			'.dark': {
				colorScheme: 'dark',
				'--background': '224 71% 4%',
				'--foreground': '213 31% 91%',
				'--muted': '223 47% 11%',
				'--muted-foreground': '215.4 16.3% 56.9%',
				'--popover': '224 71% 4%',
				'--popover-foreground': '215 20.2% 65.1%',
				'--card': '224 71% 4%',
				'--card-foreground': '213 31% 91%',
				'--border': '216 34% 17%',
				'--input': '216 34% 17%',
				'--primary': '210 40% 98%',
				'--primary-foreground': '222.2 47.4% 1.2%',
				'--secondary': '222.2 47.4% 11.2%',
				'--secondary-foreground': '210 40% 98%',
				'--accent': '217.2 32.6% 10%',
				'--accent-foreground': '210 40% 98%',
				'--destructive': '0 63% 31%',
				'--destructive-foreground': '210 40% 98%',
				'--ring': '216 34% 17%',
				'--radius': '0.5rem',
			},
		})

		addBase({
			'*': {
				'@apply border-border': {},
			},
			body: {
				'@apply bg-background text-foreground': {},
			},
		})
	},
	{
		theme: {
			container: {
				center: true,
				padding: '2rem',
				screens: {
					'2xl': '1400px',
				},
			},
			extend: {
				...extendedTheme,
				fontFamily: {
					sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
				},
			},
		},
	},
)
