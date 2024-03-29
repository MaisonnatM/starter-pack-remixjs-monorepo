// Setup heavily inspired by https://github.com/juliusmarminge/acme-corp
import { readFile, writeFile } from 'fs/promises'
import { defineConfig, type Options } from 'tsup'

const components = [
	'./src/button.tsx',
	'./src/icon.tsx',
	'./src/input.tsx',
	'./src/label.tsx',
	'./src/select.tsx',
	'./src/toast.tsx',
	'./src/tooltip.tsx',
	'./src/checkbox.tsx',
	'./src/switch.tsx',
	'./src/textarea.tsx',
	'./src/separator.tsx',
	'./src/scroll-area.tsx',
	'./src/badge.tsx',
	'./src/avatar.tsx',
	'./src/card.tsx',
	'./src/combobox.tsx',
	'./src/command.tsx',
	'./src/dialog.tsx',
	'./src/popover.tsx',
	'./src/navigation-menu.tsx',
]

export default defineConfig(opts => {
	const common = {
		clean: !opts.watch,
		dts: false,
		format: ['esm', 'cjs'],
		minify: true,
		outDir: 'dist',
	} satisfies Options

	return [
		{
			...common,
			entry: ['./src/index.ts', './src/tailwind/index.ts', ...components],
			async onSuccess() {
				const pkgJson = JSON.parse(
					await readFile('./package.json', {
						encoding: 'utf-8',
					}),
				) as PackageJson
				pkgJson.exports = {
					'./package.json': './package.json',
					'.': {
						import: './src/index.ts',
						types: './src/index.ts',
						default: './dist/index.js',
					},
					'./tailwind': {
						import: './src/tailwind/index.ts',
						types: './src/tailwind/index.ts',
						default: './dist/tailwind/index.js',
					},
				}
				;[...components]
					.filter(e => e.endsWith('.tsx'))
					.forEach(entry => {
						const file = entry.replace('./src/', '').replace('.tsx', '')
						pkgJson.exports['./' + file] = {
							import: './src/' + file + '.tsx',
							types: './src/' + file + '.tsx',
						}
						pkgJson.typesVersions['*'][file] = ['src/' + file + '.tsx']
					})

				await writeFile('./package.json', JSON.stringify(pkgJson, null, 2))
			},
		},
	]
})

type PackageJson = {
	name: string
	exports: Record<
		string,
		{ import: string; types: string; default?: string } | string
	>
	typesVersions: Record<'*', Record<string, string[]>>
	files: string[]
	dependencies: Record<string, string>
	pnpm: {
		overrides: Record<string, string>
	}
}
