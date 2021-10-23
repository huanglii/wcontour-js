module.exports = {
  // 换行长度，默认80
  printWidth: 120,
  // tab缩进大小,默认为2
  tabWidth: 2,
  useTabs: false,
  // 每行末尾自动添加分号
  semi: false,
  // 字符串使用单引号
  singleQuote: true,
  proseWrap: 'preserve',
  // 箭头函数参数括号 默认avoid 可选 avoid| always
  // avoid 能省略括号的时候就省略 例如x => x
  // always 总是有括号
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'auto',
  eslintIntegration: false,
  htmlWhitespaceSensitivity: 'ignore',
  ignorePath: '.prettierignore',
  // 设置为true时,将多行JSX元素的 > 放在最后一行的末尾，而不是单独放在下一行
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  stylelintIntegration: false,
  trailingComma: 'es5',
}
