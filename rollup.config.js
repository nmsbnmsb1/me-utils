import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';

const node = {
	input: './src/index.ts',
	output: { format: 'cjs', file: pkg.main, sourcemap: true },
	external: [...Object.keys(pkg.dependencies || {})],
	plugins: [
		resolve(),
		commonjs(),
		typescript({
			typescript: require('typescript'),
			abortOnError: true,
			useTsconfigDeclarationDir: false,
			tsconfigOverride: {
				compilerOptions: { declarationDir: 'lib' },
				include: ['src/**/*.ts'],
				exclude: ['**/DomUtils.ts', '**/*.browser.ts'],
			},
		}),
	],
};
const browser = {
	input: './src/index.esm.browser.ts',
	output: { format: 'esm', file: pkg.module, sourcemap: true },
	external: [...Object.keys(pkg.dependencies || {})],
	plugins: [
		//replace({ './../node_modules/uuid/dist/esm-node/md5': `'blueimp-md5'`, delimiters: [`'`, `'`] }),
		resolve(),
		commonjs(),
		typescript({
			typescript: require('typescript'),
			abortOnError: true,
			useTsconfigDeclarationDir: false,
			tsconfigOverride: {
				compilerOptions: { declarationDir: 'lib/esm-browser' },
				include: ['src/**/*.ts'],
				exclude: ['**/FileUtils.ts', '**/NetUtils.ts', '**/ThreadUtils.ts', '**/FileUtils.ts', '**/index.ts', '**/index.cjs.ts'],
			},
		}),
	],
};

export default [node, browser];
