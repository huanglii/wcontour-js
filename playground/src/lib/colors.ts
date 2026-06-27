// 预设配色方案：breaks 值 -> rgba 颜色
// 用于 MapLibre fill-color / line-color 的 match 表达式

export interface ColorScheme {
  name: string
  fill: Record<number, string>
  line: string
}

const schemes: ColorScheme[] = [
  {
    name: 'Spectral',
    line: '#f00',
    fill: {
      [-10]: 'rgba(0, 0, 255, 1)',
      0: 'rgba(70, 25, 165, 1)',
      10: 'rgba(204, 242, 102, 1)',
      20: 'rgba(250, 166, 38, 1)',
      30: 'rgba(247, 79, 20, 1)',
      40: 'rgba(56, 39, 42, 1)',
    },
  },
  {
    name: 'Viridis',
    line: '#222',
    fill: {
      [-10]: 'rgba(68, 1, 84, 1)',
      0: 'rgba(59, 82, 139, 1)',
      10: 'rgba(33, 145, 140, 1)',
      20: 'rgba(94, 201, 98, 1)',
      30: 'rgba(253, 231, 37, 1)',
      40: 'rgba(255, 255, 255, 1)',
    },
  },
  {
    name: 'Coolwarm',
    line: '#000',
    fill: {
      [-10]: 'rgba(59, 76, 192, 1)',
      0: 'rgba(98, 130, 234, 1)',
      10: 'rgba(141, 182, 203, 1)',
      20: 'rgba(227, 170, 167, 1)',
      30: 'rgba(221, 110, 83, 1)',
      40: 'rgba(180, 4, 38, 1)',
    },
  },
]

export default schemes

// 构建 MapLibre match 表达式
export function buildFillMatch(scheme: ColorScheme, fallback = '#000'): unknown[] {
  const match: unknown[] = ['match', ['get', 'value']]
  const entries = Object.entries(scheme.fill).sort((a, b) => Number(a[0]) - Number(b[0]))
  for (const [key, color] of entries) {
    match.push(Number(key), color)
  }
  match.push(fallback)
  return match
}
