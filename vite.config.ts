import { defineConfig, type Plugin } from 'vite'
import { transformSync } from '@babel/core'
import { babelPluginJsxReactive } from './src/babel-plugin-jsx-reactive'

export default defineConfig({
	root: '.',
	plugins: [
		{
			name: 'babel-jsx-transform',
			enforce: 'pre',
			async transform(code, id) {
				if (!/\.(tsx?|jsx?)$/.test(id)) return null
				
				console.log('🚀 Babel transforming:', id)
				
				const result = transformSync(code, {
					filename: id,
					babelrc: false,
					configFile: false,
					plugins: [
						babelPluginJsxReactive,
						['@babel/plugin-proposal-decorators', { version: '2023-05' }],
						['@babel/plugin-transform-react-jsx', { pragma: 'h', pragmaFrag: 'Fragment' }],
						['@babel/plugin-transform-typescript', { isTSX: true, allowDeclareFields: true }],
					],
					sourceMaps: true,
				})
				
				if (!result) return null
				return { code: result.code || '', map: result.map as any }
			},
		} as Plugin,
	],
	esbuild: false,
	build: {
		outDir: 'dist',
		target: 'esnext',
		minify: false
	}
})
