import { type Config } from 'tailwindcss'

import { Preset } from './src/tailwind/preset.ts'

export default {
	content: ['./src/**/*.{ts,tsx}'],
	presets: [Preset],
} satisfies Config
