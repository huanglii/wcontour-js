// 预设配色方案：调色板数组，按 breaks 索引映射颜色
// 用于 MapLibre fill-color / line-color 的 match 表达式

export interface ColorScheme {
  name: string
  colors: string[]
  line: string
}

const schemes: ColorScheme[] = [
  {
    name: 'Spectral',
    line: '#f00',
    colors: [
      'rgba(0, 0, 255, 1)',
      'rgba(70, 25, 165, 1)',
      'rgba(204, 242, 102, 1)',
      'rgba(250, 166, 38, 1)',
      'rgba(247, 79, 20, 1)',
      'rgba(56, 39, 42, 1)',
      'rgba(120, 60, 80, 1)',
      'rgba(180, 90, 60, 1)',
      'rgba(220, 120, 50, 1)',
      'rgba(240, 150, 40, 1)',
    ],
  },
  {
    name: 'Viridis',
    line: '#222',
    colors: [
      'rgba(68, 1, 84, 1)',
      'rgba(59, 82, 139, 1)',
      'rgba(33, 145, 140, 1)',
      'rgba(94, 201, 98, 1)',
      'rgba(253, 231, 37, 1)',
      'rgba(255, 255, 255, 1)',
      'rgba(200, 220, 40, 1)',
      'rgba(150, 180, 60, 1)',
      'rgba(100, 140, 80, 1)',
      'rgba(60, 100, 100, 1)',
    ],
  },
  {
    name: 'Coolwarm',
    line: '#000',
    colors: [
      'rgba(59, 76, 192, 1)',
      'rgba(98, 130, 234, 1)',
      'rgba(141, 182, 203, 1)',
      'rgba(227, 170, 167, 1)',
      'rgba(221, 110, 83, 1)',
      'rgba(180, 4, 38, 1)',
      'rgba(200, 50, 50, 1)',
      'rgba(210, 80, 70, 1)',
      'rgba(220, 100, 90, 1)',
      'rgba(230, 130, 110, 1)',
    ],
  },
]

export default schemes

// 构建 MapLibre match 表达式：将 breaks 值按索引映射到调色板颜色
export function buildFillMatch(scheme: ColorScheme, breaks: number[], fallback = '#000'): unknown[] {
  const match: unknown[] = ['match', ['get', 'value']]
  for (let i = 0; i < breaks.length; i++) {
    const color = scheme.colors[i % scheme.colors.length]
    match.push(breaks[i], color)
  }
  match.push(fallback)
  return match
}
