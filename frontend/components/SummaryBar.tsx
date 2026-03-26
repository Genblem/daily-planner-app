import type { DaySummary } from '../lib/api'
import styles from './SummaryBar.module.css'

const MOOD_EMOJI: Record<string, string> = {
  great: '😄', good: '🙂', okay: '😐', bad: '😕', terrible: '😞'
}

interface Props { summary: DaySummary }

export default function SummaryBar({ summary }: Props) {
  const medPct = summary.medications.total > 0
    ? Math.round((summary.medications.taken / summary.medications.total) * 100)
    : null

  return (
    <div className={styles.bar}>
      <Stat
        color="terracotta"
        label="Calories"
        value={summary.calories > 0 ? `${summary.calories}` : '—'}
        unit={summary.calories > 0 ? 'kcal' : ''}
      />
      <Stat
        color="sky"
        label="Water"
        value={summary.water_ml > 0 ? `${Math.round(summary.water_ml / 100) / 10}` : '—'}
        unit={summary.water_ml > 0 ? 'L' : ''}
      />
      <Stat
        color="sage"
        label="Exercise"
        value={summary.exercise_minutes > 0 ? `${summary.exercise_minutes}` : '—'}
        unit={summary.exercise_minutes > 0 ? 'min' : ''}
      />
      <Stat
        color="lavender"
        label="Meds"
        value={medPct !== null ? `${medPct}%` : '—'}
        unit={medPct !== null ? `${summary.medications.taken}/${summary.medications.total}` : ''}
      />
      <Stat
        color="slate"
        label="Sleep"
        value={summary.sleep_hours != null ? `${summary.sleep_hours}` : '—'}
        unit={summary.sleep_hours != null ? 'hrs' : ''}
      />
      <Stat
        color="goldenrod"
        label="Mood"
        value={summary.mood ? MOOD_EMOJI[summary.mood] : '—'}
        unit={summary.mood ?? ''}
      />
    </div>
  )
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className={`${styles.stat} ${styles[`stat_${color}`]}`}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {unit && <span className={styles.statUnit}>{unit}</span>}
    </div>
  )
}
