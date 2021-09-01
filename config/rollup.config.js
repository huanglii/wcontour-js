import babel from 'rollup-plugin-babel'
import common, { getCompiler } from './rollup'

export default {
  input: 'src/index.ts',
  output: {
    name: 'wcontour',
    file: 'dist/index.js',
    format: 'umd',
    banner: common.banner
  },
  plugins: [
    babel(),
    getCompiler()
  ]
}
