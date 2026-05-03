import { DEPT_LOGOS, DEPT_COLORS, DEPT_SHORT } from '@/lib/constants'

interface Props {
  dept: string
  size?: number
  className?: string
}

export default function DeptLogo({ dept, size = 32, className }: Props) {
  const src = DEPT_LOGOS[dept]
  const color = DEPT_COLORS[dept] ?? '#6b7280'
  const label = DEPT_SHORT[dept] ?? dept

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
    )
  }

  // Fallback for DISPATCH (no logo)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.3,
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {label.slice(0, 2)}
    </div>
  )
}
