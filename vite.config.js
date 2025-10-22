import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'

export default defineConfig({
	root: '.',
	plugins: [
		babel({
			babelHelpers: 'bundled',
			extensions: ['.ts', '.js', '.tsx'],
			plugins: [
				['@babel/plugin-proposal-decorators', { version: '2023-05' }], // Modern decorators
				['@babel/plugin-transform-typescript', { isTS: true }],
			],
		}),
	],
	esbuild: {
		jsxFactory: 'h',         // Use `h()` instead of `React.createElement`
		jsxFragment: 'Fragment', // Optional: For `<>...</>` support
	},
	build: {
		outDir: 'dist',
		target: 'esnext',
		minify: false
	}
})
