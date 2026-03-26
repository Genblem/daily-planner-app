export type Category = 'food' | 'medication' | 'exercise' | 'water' | 'sleep' | 'mood'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | ''
export type Intensity = 'low' | 'medium' | 'high' | ''
export type MoodValue = 'great' | 'good' | 'okay' | 'bad' | 'terrible' | ''

export interface Entry {
  id: number
  category: Category
  date: string
  time?: string
  title: string
  notes: string
  created_at: string
  updated_at: string
  // food
  calories?: number
  meal_type?: MealType
  // medication
  dosage?: string
  taken?: boolean
  // exercise
  duration_minutes?: number
  intensity?: Intensity
  // water
  amount_ml?: number
  // sleep
  sleep_hours?: number
  // mood
  mood?: MoodValue
}

export interface DaySummary {
  date: string
  calories: number
  water_ml: number
  exercise_minutes: number
  medications: { total: number; taken: number }
  sleep_hours: number | null
  mood: MoodValue | null
  entry_counts: Record<Category, number>
}

const BASE = '/api'

export async function getEntries(date: string, category?: Category): Promise<Entry[]> {
  const params = new URLSearchParams({ date })
  if (category) params.set('category', category)
  const res = await fetch(`${BASE}/entries/?${params}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch entries')
  const data = await res.json()
  return data.results ?? data
}

export async function getSummary(date: string): Promise<DaySummary> {
  const res = await fetch(`${BASE}/entries/summary/?date=${date}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}

export async function createEntry(data: Omit<Entry, 'id' | 'created_at' | 'updated_at'>): Promise<Entry> {
  const res = await fetch(`${BASE}/entries/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create entry')
  return res.json()
}

export async function updateEntry(id: number, data: Partial<Entry>): Promise<Entry> {
  const res = await fetch(`${BASE}/entries/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update entry')
  return res.json()
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${BASE}/entries/${id}/`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete entry')
}
