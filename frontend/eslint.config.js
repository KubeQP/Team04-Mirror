import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint
	.config([
		globalIgnores(['dist']),
		{
			files: ['**/*.{ts,tsx,js,jsx}'],
			extends: [
				js.configs.recommended,
				tseslint.configs.recommended,
				reactHooks.configs['recommended-latest'],
				reactRefresh.configs.vite,
			],
			languageOptions: {
				ecmaVersion: 2020,
				globals: globals.browser,
			},
			plugins: {
				'simple-import-sort': simpleImportSort,
			},
			rules: {
				'simple-import-sort/imports': 'error',
				'simple-import-sort/exports': 'error',
				'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			},
		},
	])
	.concat(eslintConfigPrettier);
