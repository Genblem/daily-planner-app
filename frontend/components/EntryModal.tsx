'use client'
import { useState, useEffect } from 'react'
import type { Entry, Category, MealType, Intensity, MoodValue } from '../lib/api'
import { createEntry, updateEntry } from '../lib/api'
import styles from './EntryModal.module.css'

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'food',       label: 'Food',       emoji: '🍽️' },
  { key: 'medication', label: 'Medication',  emoji: '💊' },
  { key: 'exercise',   label: 'Exercise',    emoji: '🏃' },
  { key: 'water',      label: 'Water',       emoji: '💧' },
  { key: 'sleep',      label: 'Sleep',       emoji: '🌙' },
  { key: 'mood',       label: 'Mood',        emoji: '✨' },
]

const MOODS: { v: MoodValue; label: string; emoji: string }[] = [
  { v: 'great',    label: 'Great',    emoji: '😄' },
  { v: 'good',     label: 'Good',     emoji: '🙂' },
  { v: 'okay',     label: 'Okay',     emoji: '😐' },
  { v: 'bad',      label: 'Bad',      emoji: '😕' },
  { v: 'terrible', label: 'Terrible', emoji: '😞' },
]

interface Props {
  date: string
  defaultCategory: Category
  entry: Entry | null
  onClose: () => void
  onSaved: () => void
}

type FormData = {
  category: Category
  title: string
  time: string
  notes: string
  calories: string
  meal_type: MealType
  dosage: string
  taken: boolean
  duration_minutes: string
  intensity: Intensity
  amount_ml: string
  sleep_hours: string
  mood: MoodValue
}

const blank = (cat: Category): FormData => ({
  category: cat,
  title: '',
  time: '',
  notes: '',
  calories: '',
  meal_type: '',
  dosage: '',
  taken: false,
  duration_minutes: '',
  intensity: '',
  amount_ml: '',
  sleep_hours: '',
  mood: '',
})

export default function EntryModal({ date, defaultCategory, entry, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormData>(blank(defaultCategory))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (entry) {
      setForm({
        category: entry.category,
        title: entry.title,
        time: entry.time ?? '',
        notes: entry.notes ?? '',
        calories: entry.calories != null ? String(entry.calories) : '',
        meal_type: (entry.meal_type as MealType) ?? '',
        dosage: entry.dosage ?? '',
        taken: entry.taken ?? false,
        duration_minutes: entry.duration_minutes != null ? String(entry.duration_minutes) : '',
        intensity: (entry.intensity as Intensity) ?? '',
        amount_ml: entry.amount_ml != null ? String(entry.amount_ml) : '',
        sleep_hours: entry.sleep_hours != null ? String(entry.sleep_hours) : '',
        mood: (entry.mood as MoodValue) ?? '',
      })
    } else {
      setForm(blank(defaultCategory))
    }
  }, [entry, defaultCategory])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.title.trim() && form.category !== 'mood') {
      setError('Title is required.')
      return
    }
    if (form.category === 'mood' && !form.mood) {
      setError('Please select a mood.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload: Omit<Entry, 'id' | 'created_at' | 'updated_at'> = {
        category: form.category,
        date,
        title: form.title || form.mood || 'Mood entry',
        time: form.time || undefined,
        notes: form.notes,
        calories: form.calories ? parseInt(form.calories) : undefined,
        meal_type: form.meal_type || undefined,
        dosage: form.dosage || undefined,
        taken: form.category === 'medication' ? form.taken : undefined,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined,
        intensity: form.intensity || undefined,
        amount_ml: form.amount_ml ? parseInt(form.amount_ml) : undefined,
        sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : undefined,
        mood: form.mood || undefined,
      }
      if (entry) {
        await updateEntry(entry.id, payload)
      } else {
        await createEntry(payload)
      }
      onSaved()
    } catch (e) {
      setError('Failed to save. Is the Django server running?')
    } finally {
      setSaving(false)
    }
  }

  const cat = form.category

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{entry ? 'Edit entry' : 'New entry'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Category picker */}
        <div className={styles.catRow}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              className={`${styles.catBtn} ${form.category === c.key ? styles.catActive : ''}`}
              onClick={() => set('category', c.key)}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.fields}>
          {/* Mood picker */}
          {cat === 'mood' ? (
            <Field label="How are you feeling?">
              <div className={styles.moodRow}>
                {MOODS.map(m => (
                  <button
                    key={m.v}
                    className={`${styles.moodBtn} ${form.mood === m.v ? styles.moodActive : ''}`}
                    onClick={() => set('mood', m.v)}
                    title={m.label}
                  >
                    <span className={styles.moodEmoji}>{m.emoji}</span>
                    <span className={styles.moodLabel}>{m.label}</span>
                  </button>
                ))}
              </div>
            </Field>
          ) : (
            <Field label="Title *">
              <input
                className={styles.input}
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder={
                  cat === 'food' ? 'e.g. Oatmeal with banana' :
                  cat === 'medication' ? 'e.g. Vitamin D' :
                  cat === 'exercise' ? 'e.g. Morning jog' :
                  cat === 'water' ? 'e.g. Water' :
                  'e.g. Sleep'
                }
              />
            </Field>
          )}

          <div className={styles.row2}>
            <Field label="Date">{date}</Field>
            <Field label="Time">
              <input
                type="time"
                className={styles.input}
                value={form.time}
                onChange={e => set('time', e.target.value)}
              />
            </Field>
          </div>

          {/* Food fields */}
          {cat === 'food' && (
            <div className={styles.row2}>
              <Field label="Meal type">
                <select className={styles.select} value={form.meal_type} onChange={e => set('meal_type', e.target.value as MealType)}>
                  <option value="">—</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </Field>
              <Field label="Calories">
                <input
                  type="number"
                  className={styles.input}
                  value={form.calories}
                  onChange={e => set('calories', e.target.value)}
                  placeholder="kcal"
                  min={0}
                />
              </Field>
            </div>
          )}

          {/* Medication fields */}
          {cat === 'medication' && (
            <div className={styles.row2}>
              <Field label="Dosage">
                <input className={styles.input} value={form.dosage} onChange={e => set('dosage', e.target.value)} placeholder="e.g. 500mg" />
              </Field>
              <Field label="Status">
                <label className={styles.toggle}>
                  <input type="checkbox" checked={form.taken} onChange={e => set('taken', e.target.checked)} />
                  <span className={styles.toggleSlider} />
                  <span className={styles.toggleLabel}>{form.taken ? 'Taken ✓' : 'Not taken'}</span>
                </label>
              </Field>
            </div>
          )}

          {/* Exercise fields */}
          {cat === 'exercise' && (
            <div className={styles.row2}>
              <Field label="Duration (min)">
                <input type="number" className={styles.input} value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} placeholder="mins" min={0} />
              </Field>
              <Field label="Intensity">
                <select className={styles.select} value={form.intensity} onChange={e => set('intensity', e.target.value as Intensity)}>
                  <option value="">—</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
            </div>
          )}

          {/* Water */}
          {cat === 'water' && (
            <Field label="Amount (ml)">
              <input type="number" className={styles.input} value={form.amount_ml} onChange={e => set('amount_ml', e.target.value)} placeholder="ml" min={0} />
            </Field>
          )}

          {/* Sleep */}
          {cat === 'sleep' && (
            <Field label="Hours slept">
              <input type="number" step="0.5" className={styles.input} value={form.sleep_hours} onChange={e => set('sleep_hours', e.target.value)} placeholder="e.g. 7.5" min={0} max={24} />
            </Field>
          )}

          <Field label="Notes (optional)">
            <textarea className={styles.textarea} value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any additional notes…" />
          </Field>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : entry ? 'Update' : 'Save entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {typeof children === 'string' ? <span className={styles.staticValue}>{children}</span> : children}
    </div>
  )
}
