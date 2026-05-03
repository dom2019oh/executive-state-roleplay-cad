export const DEPT_LOGOS: Record<string, string> = {
  LSPD: '/logos/LSPD.png',
  SAST: '/logos/SAST.png',
  SAFD: '/logos/SAFD.png',
  SAMS: '/logos/SAEMS.png',
  DISPATCH: '/logos/DISPATCH.png',
}

export const DEPT_COLORS: Record<string, string> = {
  LSPD: '#2563eb',
  SAST: '#7c3aed',
  SAFD: '#dc2626',
  SAMS: '#16a34a',
  DISPATCH: '#d97706',
}

export const DEPT_LABELS: Record<string, string> = {
  LSPD: 'Los Santos Police Dept.',
  SAST: 'San Andreas State Troopers',
  SAFD: 'San Andreas Fire Dept.',
  SAMS: 'San Andreas Medical Services',
  DISPATCH: 'Dispatch',
}

export const DEPT_SHORT: Record<string, string> = {
  LSPD: 'LSPD',
  SAST: 'SAST',
  SAFD: 'SAFD',
  SAMS: 'SAMS',
  DISPATCH: 'DISPATCH',
}

export const PRIORITY_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#22c55e',
}

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Code 1 — Emergency',
  2: 'Code 2 — Urgent',
  3: 'Code 3 — Routine',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  active: '#3b82f6',
  on_scene: '#8b5cf6',
  closed: '#6b7280',
}

export const UNIT_STATUS_COLORS: Record<string, string> = {
  '10-8': '#22c55e',
  '10-41': '#22c55e',
  '10-6': '#f59e0b',
  '10-7': '#6b7280',
  '10-42': '#6b7280',
  '10-99': '#ef4444',
  '10-100': '#ef4444',
  '10-97': '#3b82f6',
  '10-23': '#8b5cf6',
}

export const TEN_CODES: { code: string; label: string }[] = [
  { code: '10-8', label: 'In Service' },
  { code: '10-6', label: 'Busy' },
  { code: '10-7', label: 'Out of Service' },
  { code: '10-41', label: 'Beginning Tour of Duty' },
  { code: '10-42', label: 'Ending Tour of Duty' },
  { code: '10-97', label: 'In Route (Call)' },
  { code: '10-23', label: 'Arrived on Scene' },
  { code: '10-24', label: 'Leaving Scene' },
  { code: '10-5', label: 'Meal Break' },
  { code: '10-99', label: 'Officer In Distress' },
  { code: '10-100', label: 'Officer Down' },
  { code: '10-11', label: 'Traffic Stop' },
  { code: '10-80', label: 'Vehicle Pursuit' },
  { code: '10-32', label: 'Request Backup' },
  { code: '10-52', label: 'Request EMS' },
  { code: '10-53', label: 'Request Fire Department' },
]

export const DEPARTMENTS = ['LSPD', 'SAST', 'SAFD', 'SAMS', 'DISPATCH'] as const
