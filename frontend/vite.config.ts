import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	return {
		plugins: [react(), tailwindcss()],

		server: {
			host: mode === 'production',
		},

		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/setupTests.ts',
		},

		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
	} as UserConfig;
});
