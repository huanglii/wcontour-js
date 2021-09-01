import typescript from 'rollup-plugin-typescript2'
import pkg from '../package.json'

const banner = 
`/*
  * ${pkg.name} ${pkg.version} (https://github.com/huanglii/wcontour-js)
  * API https://github.com/huanglii/wcontour-js/blob/master/doc/api.md
  * Copyright 2021-${(new Date).getFullYear()} huanglii. All Rights Reserved
  * Licensed under ${pkg.license} (https://github.com/huanglii/wcontour-js/blob/master/LICENSE)
  */
`

export function getCompiler(opt) {
  opt = opt || {
    tsconfigOverride: { compilerOptions : { module: 'ES2015' } }
  }
  return typescript(opt)
}

export default {
  name: pkg.name,
  banner
}
