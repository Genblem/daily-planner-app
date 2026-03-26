'use client'
import styles from './DateNav.module.css'

interface Props {
  date: string
  onChange: (d: string) => void
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / 86400000
  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function DateNav({ date, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      <button className={styles.arrow} onClick={() => onChange(addDays(date, -1))}>‹</button>
      <div className={styles.center}>
        <span className={styles.label}>{fmtDate(date)}</span>
        <input
          type="date"
          className={styles.input}
          value={date}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      <button
        className={styles.arrow}
        onClick={() => onChange(addDays(date, 1))}
      >›</button>
    </div>
  )
}
