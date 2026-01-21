/** @type {import("prettier").Config} */
export default {
	// Core formatting
	printWidth: 120,
	tabWidth: 2,
	useTabs: true,
	semi: true,
	singleQuote: true,
	jsxSingleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	endOfLine: 'lf',

	// Object & JSX behavior
	quoteProps: 'as-needed',

	// File-specific overrides
	overrides: [
		{
			files: ['*.json', '*.yml', '*.yaml'],
			options: {
				printWidth: 80,
			},
		},
		{
			files: ['*.md'],
			options: {
				proseWrap: 'always',
				printWidth: 80,
			},
		},
	],
};
