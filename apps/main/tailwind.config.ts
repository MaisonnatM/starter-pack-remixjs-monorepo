import { Preset } from '@epic-stack-monorepo/ui/tailwind'
import { type Config } from 'tailwindcss'

export default {
	content: [
		'./app/**/*.{ts,tsx,jsx,js}',
		'./app/components/**/*.{ts,tsx,jsx,js}',
		'../../packages/**/*.{ts,tsx}',
	],
	presets: [Preset],
} satisfies Config
