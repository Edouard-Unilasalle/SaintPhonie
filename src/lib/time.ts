export const HOUR = 3_600_000
export const DAY = 24 * HOUR

const pad = (n: number) => String(n).padStart(2, '0')

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, n: number): string {
  const d = parseYmd(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}

/** Timestamp (ms) of a date string plus a decimal hour, e.g. 10.5 = 10:30. */
export function at(date: string, hour: number): number {
  return parseYmd(date).getTime() + hour * HOUR
}

export function fmtHour(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${pad(hh)}:${pad(mm)}`
}

export function fmtRange(start: number, end: number): string {
  return `${fmtHour(start)} to ${fmtHour(end)}`
}

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtDay(s: string): string {
  const d = parseYmd(s)
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`
}

export function weekdayOf(s: string): number {
  return parseYmd(s).getDay()
}

export function nextDays(n: number, now: number): string[] {
  const today = ymd(new Date(now))
  return Array.from({ length: n }, (_, i) => addDays(today, i))
}

export function overlaps(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1
}

export function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h ${pad(m)}m`
  if (h > 0) return `${h}h ${pad(m)}m ${pad(sec)}s`
  return `${m}m ${pad(sec)}s`
}

export const euro = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)
