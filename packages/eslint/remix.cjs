const appFiles = ['app/**']

/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	extends: [
		'turbo',
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'prettier',
	],
	rules: {
		'turbo/no-undeclared-env-vars': 'off',
	},
	overrides: [
		{
			plugins: ['remix-react-routes'],
			files: appFiles,
			rules: {
				'remix-react-routes/use-link-for-routes': 'error',
				'remix-react-routes/require-valid-paths': 'error',
				// disable this one because it doesn't appear to work with our
				// route convention. Someone should dig deeper into this...
				'remix-react-routes/no-relative-paths': [
					'off',
					{ allowLinksToSelf: true },
				],
				'remix-react-routes/no-urls': 'error',
			},
		},
	],
}
