import type { Entry } from '../lib/api'
import styles from './EntryCard.module.css'

const MOOD_EMOJI: Record<string, string> = {
  great: '😄', good: '🙂', okay: '😐', bad: '😕', terrible: '😞'
}

interface Props {
  entry: Entry
  color: string
  onEdit: () => void
  onDelete: () => void
}

export default function EntryCard({ entry, color, onEdit, onDelete }: Props) {
  return (
    <div className={`${styles.card} ${styles[`card_${color}`]}`}>
      <div className={styles.top}>
        <span className={styles.title}>{entry.title}</span>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={onEdit} title="Edit">✏️</button>
          <button className={styles.actionBtn} onClick={onDelete} title="Delete">🗑️</button>
        </div>
      </div>

      <div className={styles.chips}>
        {entry.time && <Chip label={entry.time.slice(0, 5)} />}
        {entry.meal_type && <Chip label={entry.meal_type} />}
        {entry.calories != null && <Chip label={`${entry.calories} kcal`} />}
        {entry.dosage && <Chip label={entry.dosage} />}
        {entry.taken != null && entry.category === 'medication' && (
          <Chip label={entry.taken ? '✓ Taken' : '✗ Not taken'} highlight={entry.taken} />
        )}
        {entry.duration_minutes != null && <Chip label={`${entry.duration_minutes} min`} />}
        {entry.intensity && <Chip label={entry.intensity} />}
        {entry.amount_ml != null && <Chip label={`${entry.amount_ml} ml`} />}
        {entry.sleep_hours != null && <Chip label={`${entry.sleep_hours} hrs`} />}
        {entry.mood && <Chip label={`${MOOD_EMOJI[entry.mood]} ${entry.mood}`} />}
      </div>

      {entry.notes && <p className={styles.notes}>{entry.notes}</p>}
    </div>
  )
}

function Chip({ label, highlight }: { label: string; highlight?: boolean }) {
  return <span className={`${styles.chip} ${highlight ? styles.chipHighlight : ''}`}>{label}</span>
}
