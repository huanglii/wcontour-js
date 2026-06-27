import type { ContourResult } from '../lib/compute'

interface StatsBarProps {
  result: ContourResult | null
}

export default function StatsBar({ result }: StatsBarProps) {
  if (!result) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 text-sm text-gray-500 bg-gray-100 border-b border-gray-300">
        <span>等待计算...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-6 px-4 py-2 text-sm bg-gray-100 border-b border-gray-300">
      <span className="font-mono">
        <span className="text-gray-500">耗时</span>{' '}
        <span className="font-bold text-blue-600">{result.elapsed.toFixed(1)}</span> ms
      </span>
      <span className="font-mono">
        <span className="text-gray-500">等值线</span> <span className="font-bold">{result.lineCount}</span>
      </span>
      <span className="font-mono">
        <span className="text-gray-500">等值面</span> <span className="font-bold">{result.polyCount}</span>
      </span>
      <span className="font-mono">
        <span className="text-gray-500">点数</span> <span className="font-bold">{result.pointCount}</span>
      </span>
    </div>
  )
}
